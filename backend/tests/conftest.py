import pytest
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest
from app.models.batch import Batch, Item
from app.core.security import get_password_hash

@pytest.fixture(scope="session", autouse=True)
def setup_test_data():
    db = SessionLocal()
    try:
        # Ensure demo users exist
        roles = {
            "citizen@demo.com": UserRole.CITIZEN,
            "collector@demo.com": UserRole.COLLECTOR,
            "aggregator@demo.com": UserRole.AGGREGATOR,
            "recycler@demo.com": UserRole.RECYCLER,
            "admin@demo.com": UserRole.ADMIN,
        }
        
        for email, role in roles.items():
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    password_hash=get_password_hash("password"),
                    role=role
                )
                db.add(user)
        db.commit()
    finally:
        db.close()
