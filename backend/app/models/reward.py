import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class RewardType(str, enum.Enum):
    COLLECTION = "COLLECTION"
    VERIFICATION_BONUS = "VERIFICATION_BONUS"
    ACCURACY_BONUS = "ACCURACY_BONUS"
    DOWNSTREAM_BONUS = "DOWNSTREAM_BONUS"
    REDEEM = "REDEEM"

class RewardTransaction(Base):
    __tablename__ = "reward_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    transaction_type = Column(Enum(RewardType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class RedemptionStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    upi_id = Column(String, nullable=True)
    status = Column(Enum(RedemptionStatus), default=RedemptionStatus.PENDING, nullable=False)
    payment_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
