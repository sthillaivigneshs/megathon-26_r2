import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.core.database import Base

class EventType(str, enum.Enum):
    COLLECTION_CREATED = "COLLECTION_CREATED"
    AGGREGATOR_RECEIVED = "AGGREGATOR_RECEIVED"
    WEIGHT_VERIFIED = "WEIGHT_VERIFIED"
    SORTED = "SORTED"
    RECYCLER_RECEIVED = "RECYCLER_RECEIVED"
    PROCESSING_CONFIRMED = "PROCESSING_CONFIRMED"
    EPR_ELIGIBILITY_CREATED = "EPR_ELIGIBILITY_CREATED"
    EPR_CREDIT_CREATED = "EPR_CREDIT_CREATED"
    REWARD_CREATED = "REWARD_CREATED"
    RISK_FLAGGED = "RISK_FLAGGED"
    HAZARD_REPORTED = "HAZARD_REPORTED"

class Event(Base):
    __tablename__ = "events"

    event_id = Column(Integer, primary_key=True, index=True)
    item_or_batch_id = Column(Integer, nullable=False)  # ID of batch or item
    event_type = Column(Enum(EventType), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    actor_role = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    metadata_json = Column(String, nullable=True)
    client_transaction_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
