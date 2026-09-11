from sqlalchemy import Column, String, Integer, Enum
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    COLLECTOR = "COLLECTOR"
    AGGREGATOR = "AGGREGATOR"
    RECYCLER = "RECYCLER"
    BRAND = "BRAND"
    PRO = "PRO"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN, nullable=False)
