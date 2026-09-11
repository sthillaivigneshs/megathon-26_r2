import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from app.core.database import Base

class PartnerStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_score = Column(Float, nullable=False) # 0.0 to 1.0
    accepted_materials = Column(String, nullable=False) # e.g., "mobile,laptop"
    status = Column(Enum(PartnerStatus), default=PartnerStatus.ACTIVE, nullable=False)
