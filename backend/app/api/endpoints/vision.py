from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.batch import Item
from app.services.vision_verification_service import vision_service
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class VerificationResponse(BaseModel):
    item_id: int
    is_ewaste: bool
    confidence: float
    category: str
    decision: str
    provider: str
    reason: str
    verified_at: str

@router.post("/items/{item_id}/verify-photo")
def verify_item_photo(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in [UserRole.COLLECTOR, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
    
    # Simple check: verify item belongs to a batch collected by this collector
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item or (current_user.role == UserRole.COLLECTOR and item.batch.collector_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found or unauthorized")

    try:
        item = vision_service.verify_item_photo(db, item_id)
        return {
            "item_id": item.id,
            "is_ewaste": item.verified_is_ewaste,
            "confidence": item.verified_confidence,
            "category": item.verified_category,
            "decision": item.verified_decision,
            "provider": item.verified_provider,
            "reason": item.verified_reason,
            "verified_at": item.verified_at.isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

class DirectImageVerifyRequest(BaseModel):
    image: str

@router.post("/verify-image")
def verify_image(req: DirectImageVerifyRequest, current_user: User = Depends(get_current_user)):
    """
    Direct endpoint for Citizens, Collectors, and Integrations to classify e-waste images.
    Returns standard AI verification contract.
    """
    result = vision_service.classify_image(req.image)
    return result.to_contract_dict()
