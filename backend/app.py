import csv
import io
import os
import urllib.parse
import uuid
from datetime import datetime, timedelta

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request,
)
from sqlalchemy import or_, text

from models import AuditLog, Course, Intake, Student, db
from utils import generate_student_id
from werkzeug.security import generate_password_hash, check_password_hash

password = urllib.parse.quote_plus("Samarew@19")

app = Flask(__name__)
CORS(app)

# Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://postgres:{password}@localhost:5432/sms_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-me')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

# LINK THE DB TO THE APP
db.init_app(app)
jwt = JWTManager(app)

PUBLIC_ENDPOINTS = {
    '/',
    '/login',
    '/auth/refresh',
}


@app.before_request
def require_authentication():
    if request.method == 'OPTIONS':
        return None

    if request.path in PUBLIC_ENDPOINTS or request.path.startswith('/static/'):
        return None

    try:
        verify_jwt_in_request()
    except Exception:
        return jsonify({"error": "Unauthorized"}), 401

    return None


def get_jwt_context():
    try:
        verify_jwt_in_request(optional=True)
        return get_jwt_identity(), get_jwt()
    except Exception:
        return None, {}


def ensure_audit_log_columns():
    required_columns = {
        "action_type": "ALTER TABLE audit_logs ADD COLUMN action_type VARCHAR(50) DEFAULT 'SYSTEM' NOT NULL",
        "description": "ALTER TABLE audit_logs ADD COLUMN description TEXT",
        "entity_type": "ALTER TABLE audit_logs ADD COLUMN entity_type VARCHAR(100)",
        "entity_id": "ALTER TABLE audit_logs ADD COLUMN entity_id VARCHAR(100)",
        "session_id": "ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(100)",
        "endpoint": "ALTER TABLE audit_logs ADD COLUMN endpoint VARCHAR(255)",
        "method": "ALTER TABLE audit_logs ADD COLUMN method VARCHAR(10)",
        "status": "ALTER TABLE audit_logs ADD COLUMN status VARCHAR(20) DEFAULT 'SUCCESS' NOT NULL",
    }

    existing = {
        row[0]
        for row in db.session.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_logs'")
        )
    }

    for col_name, ddl in required_columns.items():
        if col_name not in existing:
            db.session.execute(text(ddl))
    db.session.commit()


def ensure_student_profile_columns():
    required_columns = {
        "email": "ALTER TABLE students ADD COLUMN email VARCHAR(120)",
        "department": "ALTER TABLE students ADD COLUMN department VARCHAR(120)",
        "enrollment_date": "ALTER TABLE students ADD COLUMN enrollment_date DATE",
        "city": "ALTER TABLE students ADD COLUMN city VARCHAR(100)",
        "postal_code": "ALTER TABLE students ADD COLUMN postal_code VARCHAR(20)",
        "guardian_name": "ALTER TABLE students ADD COLUMN guardian_name VARCHAR(120)",
        "guardian_relationship": "ALTER TABLE students ADD COLUMN guardian_relationship VARCHAR(60)",
        "guardian_occupation": "ALTER TABLE students ADD COLUMN guardian_occupation VARCHAR(120)",
        "emergency_contact": "ALTER TABLE students ADD COLUMN emergency_contact VARCHAR(20)",
        "semester": "ALTER TABLE students ADD COLUMN semester VARCHAR(20)",
    }

    existing = {
        row[0]
        for row in db.session.execute(
            text("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'")
        )
    }

    for col_name, ddl in required_columns.items():
        if col_name not in existing:
            db.session.execute(text(ddl))
    db.session.commit()


def ensure_intake_course_assignments_table():
    db.session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS intake_course_assignments (
                intake_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                PRIMARY KEY (intake_id, course_id)
            )
            """
        )
    )
    db.session.commit()


def get_actor():
    _, claims = get_jwt_context()
    return claims.get('admin_name') or request.headers.get("X-Admin-Name") or "System"


def get_session_id():
    _, claims = get_jwt_context()
    return claims.get('sid') or request.headers.get("X-Session-Id")


def create_audit_log(
    action,
    action_type="SYSTEM",
    description=None,
    entity_type=None,
    entity_id=None,
    status="SUCCESS",
    performed_by=None,
    session_id=None,
):
    log = AuditLog(
        action=action,
        action_type=action_type,
        description=description,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        status=status,
        performed_by=performed_by or get_actor(),
        session_id=session_id or get_session_id(),
        endpoint=request.path,
        method=request.method,
    )
    db.session.add(log)
    return log


def serialize_log(log):
    return {
        "id": log.log_id,
        "action": log.action,
        "action_type": log.action_type,
        "description": log.description,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "status": log.status,
        "user": log.performed_by,
        "session_id": log.session_id,
        "endpoint": log.endpoint,
        "method": log.method,
        "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
    }


def get_intake_assigned_courses(intake_id):
    if not intake_id:
        return []

    rows = db.session.execute(
        text(
            """
            SELECT course_id
            FROM intake_course_assignments
            WHERE intake_id = :intake_id
            """
        ),
        {"intake_id": intake_id},
    ).fetchall()

    course_ids = [row[0] for row in rows]
    if not course_ids:
        return []

    courses = Course.query.filter(Course.id.in_(course_ids)).order_by(Course.code.asc()).all()
    return [
        {
            "id": course.id,
            "code": course.code,
            "name": course.name,
            "credits": course.credits,
        }
        for course in courses
    ]


def serialize_student_profile(student):
    assigned_courses = get_intake_assigned_courses(student.intake_id)

    return {
        "id": student.student_id,
        "student_id": student.student_id,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "name": f"{student.first_name} {student.last_name}",
        "dob": student.dob.strftime("%Y-%m-%d") if student.dob else None,
        "nic": student.nic,
        "gender": student.gender,
        "address": student.address,
        "mobile_number": student.mobile_number,
        "intake_id": student.intake_id,
        "intake_name": student.intake.intake_name if student.intake else None,
        "email": student.email,
        "department": student.department,
        "enrollment_date": student.enrollment_date.strftime("%Y-%m-%d") if student.enrollment_date else None,
        "city": student.city,
        "postal_code": student.postal_code,
        "guardian_name": student.guardian_name,
        "guardian_relationship": student.guardian_relationship,
        "guardian_occupation": student.guardian_occupation,
        "emergency_contact": student.emergency_contact,
        "semester": student.semester,
        "assigned_courses": assigned_courses,
    }


def build_logs_query(args):
    q = args.get("q", "").strip()
    admin = args.get("admin", "").strip()
    action_type = args.get("action", "").strip().upper()
    session_id = args.get("session_id", "").strip()
    start_date = args.get("start_date", "").strip()
    end_date = args.get("end_date", "").strip()

    query = AuditLog.query

    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                AuditLog.action.ilike(pattern),
                AuditLog.description.ilike(pattern),
                AuditLog.entity_type.ilike(pattern),
                AuditLog.entity_id.ilike(pattern),
                AuditLog.performed_by.ilike(pattern),
            )
        )

    if admin and admin != "ALL":
        query = query.filter(AuditLog.performed_by == admin)

    if action_type and action_type != "ALL":
        query = query.filter(AuditLog.action_type == action_type)

    if session_id:
        query = query.filter(AuditLog.session_id == session_id)

    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(AuditLog.timestamp >= start_dt)

    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        query = query.filter(AuditLog.timestamp < end_dt)

    return query

@app.route('/')
def index():
    return {"message": "SMS Backend is Running"}

@app.route('/login', methods=['POST'])
def login():
    from models import Admin
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    user_password = data.get('password')

    admin = Admin.query.filter_by(email=email).first()

    # Simple check for now
    if admin and check_password_hash(admin.password_hash, user_password):
        session_id = uuid.uuid4().hex
        jwt_claims = {
            "admin_name": admin.name,
            "sid": session_id,
            "role": "admin",
        }
        access_token = create_access_token(identity=str(admin.admin_id), additional_claims=jwt_claims)
        refresh_token = create_refresh_token(identity=str(admin.admin_id), additional_claims=jwt_claims)
        create_audit_log(
            action="Admin Login",
            action_type="LOGIN",
            description=f"{admin.name} logged into the system",
            entity_type="Session",
            entity_id=session_id,
            performed_by=admin.name,
            session_id=session_id,
        )
        db.session.commit()
        return jsonify({
            "message": "Login Successful",
            "admin_name": admin.name,
            "session_id": session_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "status": "authenticated"
        }), 200

    create_audit_log(
        action="Admin Login Failed",
        action_type="LOGIN",
        description=f"Failed login attempt for {email or 'unknown email'}",
        entity_type="Session",
        status="FAILED",
        performed_by=email or "Unknown",
    )
    db.session.commit()
    
    return jsonify({"error": "Invalid email or password"}), 401


@app.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    identity = get_jwt_identity()
    claims = get_jwt()

    new_access_token = create_access_token(
        identity=identity,
        additional_claims={
            "admin_name": claims.get("admin_name"),
            "sid": claims.get("sid"),
            "role": claims.get("role", "admin"),
        },
    )

    return jsonify({"access_token": new_access_token}), 200


@app.route('/logout', methods=['POST'])
def logout():
    actor = get_actor()
    session_id = get_session_id()
    create_audit_log(
        action="Admin Logout",
        action_type="LOGOUT",
        description=f"{actor} logged out",
        entity_type="Session",
        entity_id=session_id,
        performed_by=actor,
        session_id=session_id,
    )
    db.session.commit()
    return jsonify({"message": "Logout logged"}), 200

@app.route('/register-student', methods=['POST'])
def register_student():
    data = request.get_json(silent=True) or {}
    try:
        new_id = generate_student_id()
        
        new_student = Student(
            student_id=new_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            dob=data['dob'],
            nic=data['nic'],
            gender=data['gender'],
            address=data['address'],
            mobile_number=data['mobile_number'],
            intake_id=data.get('intake_id')
        )
        
        db.session.add(new_student)
        create_audit_log(
            action="Register Student",
            action_type="CREATE",
            description=f"Registered student {new_id} ({data.get('first_name', '')} {data.get('last_name', '')})",
            entity_type="Student",
            entity_id=new_id,
        )
        db.session.commit()
        
        return jsonify({"message": "Success", "student_id": new_id}), 201

    except Exception as e:
        db.session.rollback()
        try:
            create_audit_log(
                action="Register Student",
                action_type="CREATE",
                description=f"Failed to register student: {str(e)}",
                entity_type="Student",
                status="FAILED",
            )
            db.session.commit()
        except Exception:
            db.session.rollback()
        print(f"Error: {e}") # This helps you see the error in terminal
        return jsonify({"error": str(e)}), 400



@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    from models import Student, Intake, Course
    # 1. Count total students
    total_students = Student.query.count()
    
    # 2. Count active intakes/batches
    active_batches = Intake.query.count() # You can filter by status='Active' later
    
    # 3. Count total courses from the database
    total_courses = Course.query.count()
    
    return jsonify({
        "total_students": total_students,
        "active_batches": active_batches,
        "total_courses": total_courses,
        "student_trend": "+12% from last month"
    }), 200


@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    page = max(int(request.args.get("page", 1)), 1)
    page_size = min(max(int(request.args.get("page_size", 10)), 1), 100)

    query = build_logs_query(request.args).order_by(AuditLog.timestamp.desc())
    total = query.count()
    logs = query.offset((page - 1) * page_size).limit(page_size).all()

    admins = [
        row[0]
        for row in db.session.query(AuditLog.performed_by)
        .filter(AuditLog.performed_by.isnot(None))
        .distinct()
        .order_by(AuditLog.performed_by.asc())
        .all()
    ]
    actions = [
        row[0]
        for row in db.session.query(AuditLog.action_type)
        .filter(AuditLog.action_type.isnot(None))
        .distinct()
        .order_by(AuditLog.action_type.asc())
        .all()
    ]

    return jsonify(
        {
            "items": [serialize_log(log) for log in logs],
            "total": total,
            "page": page,
            "page_size": page_size,
            "admins": admins,
            "actions": actions,
        }
    ), 200


@app.route('/api/audit-logs/export', methods=['GET'])
def export_audit_logs():
    logs = build_logs_query(request.args).order_by(AuditLog.timestamp.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Timestamp",
        "User",
        "Action Type",
        "Action",
        "Description",
        "Entity Type",
        "Entity ID",
        "Status",
        "Session ID",
        "Endpoint",
        "Method",
    ])

    for log in logs:
        writer.writerow(
            [
                log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                log.performed_by or "",
                log.action_type or "",
                log.action or "",
                log.description or "",
                log.entity_type or "",
                log.entity_id or "",
                log.status or "",
                log.session_id or "",
                log.endpoint or "",
                log.method or "",
            ]
        )

    filename = f"audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.route('/api/audit-logs/event', methods=['POST'])
def create_audit_event():
    data = request.get_json(silent=True) or {}
    create_audit_log(
        action=data.get("action", "UI Event"),
        action_type=data.get("action_type", "SYSTEM"),
        description=data.get("description"),
        entity_type=data.get("entity_type"),
        entity_id=data.get("entity_id"),
        status=data.get("status", "SUCCESS"),
    )
    db.session.commit()
    return jsonify({"message": "Event logged"}), 201



@app.route('/api/students', methods=['GET'])
def get_students():
    from models import Student
    # Fetch all students ordered by ID
    students_list = Student.query.order_by(Student.student_id.desc()).all()
    
    output = []
    for s in students_list:
        output.append({
            "id": s.student_id,
            "student_id": s.student_id, # e.g., STU-2022-001
            "name": f"{s.first_name} {s.last_name}",
            "intake": s.intake.intake_name if s.intake else "Not Assigned"
        })

    
    return jsonify(output), 200


@app.route('/api/students/<string:student_id>', methods=['GET'])
def get_student_profile(student_id):
    student = Student.query.filter_by(student_id=student_id).first()

    if not student:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(serialize_student_profile(student)), 200


@app.route('/api/students/<string:student_id>', methods=['PUT'])
def update_student_profile(student_id):
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({"error": "Student not found"}), 404

    data = request.get_json(silent=True) or {}

    editable_fields = [
        "email",
        "department",
        "city",
        "postal_code",
        "guardian_name",
        "guardian_relationship",
        "guardian_occupation",
        "emergency_contact",
        "semester",
        "address",
        "mobile_number",
    ]

    try:
        for field in editable_fields:
            if field in data:
                setattr(student, field, data.get(field))

        if "enrollment_date" in data:
            enrollment_date = data.get("enrollment_date")
            if enrollment_date:
                student.enrollment_date = datetime.strptime(enrollment_date, "%Y-%m-%d").date()
            else:
                student.enrollment_date = None

        create_audit_log(
            action="Update Student Profile",
            action_type="UPDATE",
            description=f"Updated profile for student {student.student_id}",
            entity_type="Student",
            entity_id=student.student_id,
        )

        db.session.commit()
        return jsonify(serialize_student_profile(student)), 200
    except Exception as e:
        db.session.rollback()
        try:
            create_audit_log(
                action="Update Student Profile",
                action_type="UPDATE",
                description=f"Failed to update profile for {student_id}: {str(e)}",
                entity_type="Student",
                entity_id=student_id,
                status="FAILED",
            )
            db.session.commit()
        except Exception:
            db.session.rollback()

        return jsonify({"error": str(e)}), 400

@app.route('/api/intakes', methods=['GET'])
def get_intakes():
    intakes = Intake.query.order_by(Intake.start_date.desc()).all()

    output = []
    for intake in intakes:
        output.append({
            "id": intake.intake_id,
            "name": intake.intake_name,
            "start_date": intake.start_date.strftime("%Y-%m-%d"),
            "description": intake.description,
            "status": "Ongoing" if intake.is_active else "Inactive",
            "enrolled": len(intake.students),
            "capacity": 100
        })

    return jsonify(output), 200


@app.route('/api/intakes/<int:intake_id>/students', methods=['GET'])
def get_intake_students(intake_id):
    intake = Intake.query.get(intake_id)
    if not intake:
        return jsonify({"error": "Intake not found"}), 404

    students_list = (
        Student.query
        .filter_by(intake_id=intake_id)
        .order_by(Student.student_id.desc())
        .all()
    )

    output = []
    for student in students_list:
        output.append({
            "id": student.student_id,
            "student_id": student.student_id,
            "name": f"{student.first_name} {student.last_name}",
            "email": student.email,
            "mobile_number": student.mobile_number,
            "intake_id": intake.intake_id,
            "intake_name": intake.intake_name,
        })

    return jsonify({
        "intake": {
            "id": intake.intake_id,
            "name": intake.intake_name,
            "start_date": intake.start_date.strftime("%Y-%m-%d"),
            "status": "Ongoing" if intake.is_active else "Inactive",
        },
        "students": output,
    }), 200



@app.route('/api/intakes', methods=['POST'])
def create_intake():
    from models import db, Intake
    data = request.get_json(silent=True) or {}
    try:
        new_intake = Intake(
            intake_name=data['intakeName'],
            start_date=datetime.strptime(data['startDate'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['endDate'], '%Y-%m-%d').date(),
            description=data.get('description', ''),
            is_active=data.get('isActive', False)
        )
        db.session.add(new_intake)
        db.session.flush()
        create_audit_log(
            action="Create Intake",
            action_type="CREATE",
            description=f"Created intake {new_intake.intake_name}",
            entity_type="Intake",
            entity_id=new_intake.intake_id,
        )
        db.session.commit()
        return jsonify({"message": "Intake created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        try:
            create_audit_log(
                action="Create Intake",
                action_type="CREATE",
                description=f"Failed to create intake: {str(e)}",
                entity_type="Intake",
                status="FAILED",
            )
            db.session.commit()
        except Exception:
            db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/intakes/<int:intake_id>/courses', methods=['GET'])
def get_intake_courses(intake_id):
    intake = Intake.query.get(intake_id)
    if not intake:
        return jsonify({"error": "Intake not found"}), 404

    rows = db.session.execute(
        text(
            """
            SELECT course_id
            FROM intake_course_assignments
            WHERE intake_id = :intake_id
            ORDER BY course_id
            """
        ),
        {"intake_id": intake_id},
    ).fetchall()

    course_ids = [row[0] for row in rows]
    return jsonify({"intake_id": intake_id, "course_ids": course_ids}), 200


@app.route('/api/intakes/<int:intake_id>/courses', methods=['PUT'])
def assign_courses_to_intake(intake_id):
    intake = Intake.query.get(intake_id)
    if not intake:
        return jsonify({"error": "Intake not found"}), 404

    data = request.get_json(silent=True) or {}
    course_ids = data.get("course_ids", [])

    if not isinstance(course_ids, list):
        return jsonify({"error": "course_ids must be an array"}), 400

    try:
        normalized_ids = sorted({int(course_id) for course_id in course_ids})
    except (TypeError, ValueError):
        return jsonify({"error": "course_ids must contain integers"}), 400

    if normalized_ids:
        existing_ids = {
            c.id for c in Course.query.filter(Course.id.in_(normalized_ids)).all()
        }
        missing_ids = [course_id for course_id in normalized_ids if course_id not in existing_ids]
        if missing_ids:
            return jsonify({"error": "Some courses do not exist", "missing_ids": missing_ids}), 400

    try:
        db.session.execute(
            text("DELETE FROM intake_course_assignments WHERE intake_id = :intake_id"),
            {"intake_id": intake_id},
        )

        for course_id in normalized_ids:
            db.session.execute(
                text(
                    """
                    INSERT INTO intake_course_assignments (intake_id, course_id)
                    VALUES (:intake_id, :course_id)
                    """
                ),
                {"intake_id": intake_id, "course_id": course_id},
            )

        create_audit_log(
            action="Assign Courses to Intake",
            action_type="UPDATE",
            description=f"Assigned {len(normalized_ids)} courses to intake {intake.intake_name}",
            entity_type="Intake",
            entity_id=intake_id,
        )
        db.session.commit()
        return jsonify({"message": "Courses assigned successfully", "course_ids": normalized_ids}), 200
    except Exception as e:
        db.session.rollback()
        try:
            create_audit_log(
                action="Assign Courses to Intake",
                action_type="UPDATE",
                description=f"Failed assigning courses for intake {intake_id}: {str(e)}",
                entity_type="Intake",
                entity_id=intake_id,
                status="FAILED",
            )
            db.session.commit()
        except Exception:
            db.session.rollback()
        return jsonify({"error": str(e)}), 400
    

@app.route('/api/courses', methods=['POST'])
def add_course():
    from models import db, Course
    data = request.get_json(silent=True) or {}
    # Check if code already exists
    if Course.query.filter_by(code=data['code']).first():
        create_audit_log(
            action="Create Course",
            action_type="CREATE",
            description=f"Duplicate course code {data.get('code')}",
            entity_type="Course",
            entity_id=data.get('code'),
            status="FAILED",
        )
        db.session.commit()
        return jsonify({"message": "Duplicate code"}), 400
    
    new_course = Course(
        code=data['code'],
        name=data['name'],
        credits=data['credits'],
        description=data.get('description', '')
    )
    db.session.add(new_course)
    db.session.flush()
    create_audit_log(
        action="Create Course",
        action_type="CREATE",
        description=f"Created course {new_course.code} - {new_course.name}",
        entity_type="Course",
        entity_id=new_course.id,
    )
    db.session.commit()
    return jsonify({"message": "Course added"}), 201

@app.route('/api/courses', methods=['GET'])
def get_courses():
    from models import Course
    courses = Course.query.all()
    return jsonify([{"id": c.id, "code": c.code, "name": c.name, "credits": c.credits} for c in courses])

@app.route('/api/courses/<int:id>', methods=['DELETE'])
def delete_course(id):
    from models import db, Course
    course = Course.query.get(id)
    if course:
        course_code = course.code
        course_name = course.name
        db.session.delete(course)
        create_audit_log(
            action="Delete Course",
            action_type="DELETE",
            description=f"Deleted course {course_code} - {course_name}",
            entity_type="Course",
            entity_id=id,
        )
        db.session.commit()
    else:
        create_audit_log(
            action="Delete Course",
            action_type="DELETE",
            description=f"Attempted to delete missing course id={id}",
            entity_type="Course",
            entity_id=id,
            status="FAILED",
        )
        db.session.commit()
    return jsonify({"message": "Deleted"}), 200


if __name__ == '__main__':
    # Create tables automatically if they don't exist
    with app.app_context():
        db.create_all()
        ensure_audit_log_columns()
        ensure_student_profile_columns()
        ensure_intake_course_assignments_table()
    app.run(debug=True)