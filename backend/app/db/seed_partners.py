from sqlalchemy.orm import Session
from app.models.partner import Partner, PartnerStatus
from app.core.database import SessionLocal

def seed_demo_partners():
    db = SessionLocal()
    try:
        if db.query(Partner).first():
            return
        
        partners = [
            Partner(name="EcoRecycle Hub", latitude=12.97, longitude=77.59, capacity_score=0.9, accepted_materials="mobile,laptop,printer", status=PartnerStatus.ACTIVE),
            Partner(name="GreenTech Solutions", latitude=13.01, longitude=77.60, capacity_score=0.4, accepted_materials="mobile,laptop", status=PartnerStatus.ACTIVE),
        ]
        db.add_all(partners)
        db.commit()
        print("Demo partners seeded successfully")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_partners()
