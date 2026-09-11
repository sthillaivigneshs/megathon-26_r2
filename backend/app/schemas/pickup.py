from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PickupCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    description: Optional[str] = None

class PickupResponse(BaseModel):
    id: int
    pr_id: str
    citizen_id: int
    collector_id: Optional[int] = None
    status: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
