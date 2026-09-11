from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.reward import RewardTransactionResponse, RedemptionRequest, RedemptionResponse
from app.services.reward_service import reward_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/wallet", response_model=float)
def get_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return reward_service.get_wallet_balance(db, current_user.id)

@router.post("/redeem", response_model=RedemptionResponse)
def request_redemption(req: RedemptionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return reward_service.request_redemption(db, current_user.id, req.amount, req.upi_id)
