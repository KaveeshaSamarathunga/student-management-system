from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()  # Leave this empty

class Admin(db.Model):
    __tablename__ = 'admins'
    admin_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Student(db.Model):
    __tablename__ = 'students'
    student_id = db.Column(db.String(20), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    nic = db.Column(db.String(15), unique=True, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text, nullable=False)
    mobile_number = db.Column(db.String(15), nullable=False)
    intake_id = db.Column(db.Integer, db.ForeignKey('intakes.intake_id'))

    # Optional profile details edited from the Student Profile page
    email = db.Column(db.String(120), nullable=True)
    department = db.Column(db.String(120), nullable=True)
    enrollment_date = db.Column(db.Date, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    guardian_name = db.Column(db.String(120), nullable=True)
    guardian_relationship = db.Column(db.String(60), nullable=True)
    guardian_occupation = db.Column(db.String(120), nullable=True)
    emergency_contact = db.Column(db.String(20), nullable=True)
    semester = db.Column(db.String(20), nullable=True)

class Intake(db.Model):
    __tablename__ = 'intakes'
    intake_id = db.Column(db.Integer, primary_key=True)
    intake_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    students = db.relationship('Student', backref='intake', lazy=True)
    description = db.Column(db.Text, nullable=True)

class Course(db.Model):
    tablename = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=True)


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    log_id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255), nullable=False)
    action_type = db.Column(db.String(50), nullable=False, default='SYSTEM')
    description = db.Column(db.Text)
    entity_type = db.Column(db.String(100))
    entity_id = db.Column(db.String(100))
    session_id = db.Column(db.String(100))
    endpoint = db.Column(db.String(255))
    method = db.Column(db.String(10))
    status = db.Column(db.String(20), nullable=False, default='SUCCESS')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    performed_by = db.Column(db.String(100))