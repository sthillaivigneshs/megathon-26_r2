import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Sequence, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class HazardStatus(str, enum.Enum):
    NO_HAZARD = "no_hazard"
    SWOLLEN_BATTERY = "swollen_battery"
    DAMAGED_BATTERY = "damaged_battery"
    LEAKAGE = "leakage"
    UNKNOWN = "unknown"

# Concurrency-safe PostgreSQL sequences
batch_seq = Sequence('batch_seq', start=70)
item_seq = Sequence('item_seq', start=1)

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    cb_id = Column(String, unique=True, index=True, nullable=False)
    pickup_request_id = Column(Integer, ForeignKey("pickup_requests.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    pickup_request = relationship("PickupRequest")
    collector = relationship("User")
    items = relationship("Item", back_populates="batch", cascade="all, delete-orphan")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    rl_id = Column(String, unique=True, index=True, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    declared_weight = Column(Float, nullable=False)
    verified_weight = Column(Float, nullable=True)
    received_weight = Column(Float, nullable=True)
    condition = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    photo_hash = Column(String, nullable=True)
    hazard_status = Column(Enum(HazardStatus), default=HazardStatus.NO_HAZARD, nullable=False)
    # Verification fields
    verified_is_ewaste = Column(Boolean, nullable=True)
    verified_confidence = Column(Float, nullable=True)
    verified_category = Column(String, nullable=True)
    verified_decision = Column(String, nullable=True)
    verified_provider = Column(String, nullable=True)
    verified_reason = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    batch = relationship("Batch", back_populates="items")

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    client_transaction_id = Column(UUID(as_uuid=True), primary_key=True)
    resource_id = Column(Integer, nullable=False)  # references Batch or other resource ID
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
