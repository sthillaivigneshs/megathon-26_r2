from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.database import SessionLocal

def seed_demo_users():
    db = SessionLocal()
    try:
        # Check if demo users exist
        if db.query(User).filter(User.email == "citizen@demo.com").first():
            return
        
        users = [
            User(email="citizen@demo.com", password_hash=get_password_hash("password"), role=UserRole.CITIZEN),
            User(email="collector@demo.com", password_hash=get_password_hash("password"), role=UserRole.COLLECTOR),
            User(email="admin@demo.com", password_hash=get_password_hash("password"), role=UserRole.ADMIN),
        ]
        db.add_all(users)
        db.commit()
        print("Demo users seeded successfully")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_users()
