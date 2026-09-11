import enum
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class RiskStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    FLAGGED = "FLAGGED"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    CLEARED = "CLEARED"
    REJECTED = "REJECTED"

class RiskFlag(Base):
    __tablename__ = "risk_flags"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    reason = Column(String, nullable=False)
    status = Column(Enum(RiskStatus), default=RiskStatus.FLAGGED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
