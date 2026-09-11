import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Sequence
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class PickupStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ASSIGNED = "ASSIGNED"
    COLLECTED = "COLLECTED"
    AGGREGATOR_RECEIVED = "AGGREGATOR_RECEIVED"
    WEIGHT_VERIFIED = "WEIGHT_VERIFIED"
    SORTED = "SORTED"
    RECYCLER_RECEIVED = "RECYCLER_RECEIVED"
    PROCESSED = "PROCESSED"
    EPR_ELIGIBLE = "EPR_ELIGIBLE"
    EPR_CREDIT = "EPR_CREDIT"

# Concurrency-safe PostgreSQL sequences
pickup_request_seq = Sequence('pickup_request_seq', start=1000)

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(String, unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(PickupStatus), default=PickupStatus.REQUESTED, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    citizen = relationship("User", foreign_keys=[citizen_id])
    collector = relationship("User", foreign_keys=[collector_id])
