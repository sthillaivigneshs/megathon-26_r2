from pydantic import BaseModel, Field, UUID4
from typing import Optional
from datetime import datetime

class ItemCreate(BaseModel):
    category: str
    subcategory: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    declared_weight: float = Field(..., gt=0)
    condition: Optional[str] = None
    photo_url: Optional[str] = None
    photo_hash: Optional[str] = None
    hazard_status: Optional[str] = "no_hazard"
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class CollectionSyncRequest(BaseModel):
    client_transaction_id: UUID4
    pickup_request_id: int
    items: list[ItemCreate]
    parent_batch_id: Optional[int] = None

class ItemResponse(BaseModel):
    id: int
    rl_id: str
    category: str
    subcategory: Optional[str] = None
    quantity: int
    declared_weight: float
    condition: Optional[str] = None
    photo_url: Optional[str] = None
    photo_hash: Optional[str] = None
    hazard_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class BatchResponse(BaseModel):
    id: int
    cb_id: str
    pickup_request_id: int
    collector_id: int
    parent_batch_id: Optional[int] = None
    created_at: datetime
    items: list[ItemResponse] = []

    class Config:
        from_attributes = True
