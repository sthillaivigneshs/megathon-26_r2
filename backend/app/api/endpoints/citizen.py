from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.services.citizen_service import citizen_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me/pickups")
def get_pickups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.CITIZEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    return citizen_service.get_citizen_pickups(db, current_user.id)

@router.get("/me/pickups/{id}/journey")
def get_journey(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return citizen_service.get_pickup_journey(db, current_user.id, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/me/impact-receipt")
def get_receipt(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return citizen_service.get_impact_receipt(db, current_user.id)
