from sqlalchemy.orm import Session
from app.models.reward import RewardTransaction, RewardType, Redemption, RedemptionStatus
from app.models.batch import Batch
from app.models.event import EventType
from app.services.workflow_service import workflow_service
from fastapi import HTTPException, status

class RewardService:
    @staticmethod
    def calculate_and_add_reward(db: Session, user_id: int, batch_id: int, amount: float, r_type: RewardType, desc: str):
        # Prevent duplicate rewards for the same event (idempotency check)
        existing = db.query(RewardTransaction).filter(
            RewardTransaction.user_id == user_id,
            RewardTransaction.batch_id == batch_id,
            RewardTransaction.transaction_type == r_type
        ).first()
        
        if existing:
            return existing

        reward = RewardTransaction(
            user_id=user_id,
            batch_id=batch_id,
            transaction_type=r_type,
            amount=amount,
            description=desc
        )
        db.add(reward)
        workflow_service.log_event(db, batch_id, EventType.REWARD_CREATED, user_id, "SYSTEM", metadata_json=f"Reward: {amount}")
        return reward

    @staticmethod
    def get_wallet_balance(db: Session, user_id: int) -> float:
        transactions = db.query(RewardTransaction).filter(RewardTransaction.user_id == user_id).all()
        redemptions = db.query(Redemption).filter(Redemption.user_id == user_id, Redemption.status != RedemptionStatus.FAILED).all()
        
        balance = sum(t.amount for t in transactions)
        balance -= sum(r.amount for r in redemptions)
        return balance

    @staticmethod
    def request_redemption(db: Session, user_id: int, amount: float, upi_id: str = None) -> Redemption:
        balance = RewardService.get_wallet_balance(db, user_id)
        if amount > balance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient funds")

        import uuid
        ref = f"UPI-PAY-{uuid.uuid4().hex[:8].upper()}" if upi_id else None
        redemption = Redemption(
            user_id=user_id,
            amount=amount,
            upi_id=upi_id,
            status=RedemptionStatus.COMPLETED if upi_id else RedemptionStatus.PENDING,
            payment_reference=ref
        )
        db.add(redemption)
        db.commit()
        db.refresh(redemption)
        return redemption

reward_service = RewardService()
