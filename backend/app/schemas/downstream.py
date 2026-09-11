from pydantic import BaseModel, Field
from typing import Optional

class BatchReceiveRequest(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class WeightVerificationItem(BaseModel):
    item_id: int
    verified_weight: float = Field(..., gt=0)

class WeightVerificationRequest(BaseModel):
    items: list[WeightVerificationItem]
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class RecyclerReceiveItem(BaseModel):
    item_id: int
    received_weight: float = Field(..., gt=0)

class RecyclerReceiveRequest(BaseModel):
    items: list[RecyclerReceiveItem]
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class ProcessingConfirmationRequest(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
