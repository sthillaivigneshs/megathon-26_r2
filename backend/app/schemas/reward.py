from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.reward import RewardType, RedemptionStatus

class RewardTransactionResponse(BaseModel):
    id: int
    user_id: int
    batch_id: Optional[int]
    transaction_type: RewardType
    amount: float
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RedemptionRequest(BaseModel):
    amount: float = Field(..., gt=0)
    upi_id: Optional[str] = None

class RedemptionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    upi_id: Optional[str] = None
    status: RedemptionStatus
    payment_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
