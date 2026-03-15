import os
from datetime import date

os.environ["DATABASE_URL"] = "sqlite:///test_sms.db"

import pytest
from werkzeug.security import generate_password_hash

from app import app, ensure_intake_course_assignments_table
from models import Admin, Intake, Student, db


@pytest.fixture()
def client():
    app.config.update(
        TESTING=True,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="test-secret",
    )

    with app.app_context():
        db.drop_all()
        db.create_all()
        ensure_intake_course_assignments_table()

        admin = Admin(
            name="Test Admin",
            email="admin@test.com",
            password_hash=generate_password_hash("admin123"),
        )
        intake = Intake(
            intake_name="SE-2026-Jan",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            is_active=True,
        )
        student = Student(
            student_id="STU-2026-001",
            first_name="Kavi",
            last_name="Perera",
            dob=date(2003, 5, 10),
            nic="200312300123",
            gender="Male",
            address="No 1, Main Street",
            mobile_number="0771234567",
            intake=intake,
            email="kavi@example.com",
            department="Computing",
            semester="2",
        )

        db.session.add_all([admin, intake, student])
        db.session.commit()

        test_client = app.test_client()

        yield test_client

        db.session.remove()
        db.drop_all()

    if os.path.exists("test_sms.db"):
        os.remove("test_sms.db")
