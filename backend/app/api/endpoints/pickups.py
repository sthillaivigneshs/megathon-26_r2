from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest
from app.schemas.pickup import PickupCreate, PickupResponse
from app.services.pickup_service import pickup_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("", response_model=PickupResponse)
def create_pickup(pickup_in: PickupCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Citizens only
    if current_user.role != UserRole.CITIZEN and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only citizens can request pickups")
    try:
        return pickup_service.create_pickup(
            db,
            citizen_id=current_user.id,
            latitude=pickup_in.latitude,
            longitude=pickup_in.longitude,
            description=pickup_in.description
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

@router.get("/{id}", response_model=PickupResponse)
def get_pickup(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pickup = db.query(PickupRequest).filter(PickupRequest.id == id).first()
    if not pickup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pickup request not found")

    # Authoritative authorization: Citizens can only read their own pickups.
    # Collectors assigned to this pickup can read it.
    if current_user.role == UserRole.CITIZEN and pickup.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access")
    if current_user.role == UserRole.COLLECTOR and pickup.collector_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access")

    return pickup

@router.post("/{id}/assign", response_model=PickupResponse)
def assign_pickup(id: int, collector_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Server-side verification (only admins can assign)
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can assign pickups")
    try:
        return pickup_service.assign_pickup(db, pickup_id=id, collector_id=collector_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/collector/assigned", response_model=list[PickupResponse])
def get_assigned_pickups(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.COLLECTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized role")
    return db.query(PickupRequest).filter(PickupRequest.collector_id == current_user.id).all()
