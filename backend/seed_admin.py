from app import app, db
from models import Admin
from werkzeug.security import generate_password_hash

def seed_data():
    with app.app_context():
        # Check if an admin already exists so we don't create duplicates
        existing_admin = Admin.query.filter_by(email="admin@sms.com").first()
        
        if not existing_admin:
            # Hash the password for security
            hashed_password = generate_password_hash("admin123")
            
            new_admin = Admin(
                name="System Administrator",
                email="admin@sms.com",
                password_hash=hashed_password
            )
            
            db.session.add(new_admin)
            db.session.commit()
            print("✅ Success: Admin user created!")
            print("Email: admin@sms.com")
            print("Password: admin123")
        else:
            print("ℹ️ Admin already exists in the database.")

if __name__ == "__main__":
    seed_data()