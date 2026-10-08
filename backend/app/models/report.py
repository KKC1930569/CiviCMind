import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class ReportCategory(str, enum.Enum):
    POTHOLE = "POTHOLE"
    ROAD_DAMAGE = "ROAD_DAMAGE"
    SIDEWALK = "SIDEWALK"
    GARBAGE = "GARBAGE"
    SIGNAGE = "SIGNAGE"
    ACCESSIBILITY = "ACCESSIBILITY"
    OTHER = "OTHER"

class ReportStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class PriorityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class LocationType(str, enum.Enum):
    GPS = "GPS"
    MAP = "MAP"
    NONE = "NONE"

class AccessibilityBarrierType(str, enum.Enum):
    STAIRS = "STAIRS"
    RAMP = "RAMP"
    ELEVATOR = "ELEVATOR"
    NARROW_DOOR = "NARROW_DOOR"
    BLOCKED_SIDEWALK = "BLOCKED_SIDEWALK"
    OBSTACLE = "OBSTACLE"
    INACCESSIBLE_ENTRANCE = "INACCESSIBLE_ENTRANCE"
    WHEELCHAIR_ROUTE_BARRIER = "WHEELCHAIR_ROUTE_BARRIER"
    NONE = "NONE"

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default=ReportCategory.OTHER.value)
    status = Column(String(50), nullable=False, default=ReportStatus.OPEN.value)
    location_type = Column(String(50), nullable=False, default=LocationType.NONE.value)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    
    # Human Impact & Intelligence Layer
    human_impact_score = Column(Float, nullable=False, default=50.0) # Normalized 0-100
    priority_level = Column(String(50), nullable=False, default=PriorityLevel.MEDIUM.value)
    severity = Column(String(50), nullable=False, default="MEDIUM") # LOW | MEDIUM | HIGH | CRITICAL
    impact_notes = Column(String(1000), nullable=True)
    factor_breakdown = Column(Text, nullable=True) # JSON serialized factor scores
    reasons = Column(Text, nullable=True) # JSON serialized list of reason strings

    # Accessibility Intelligence
    accessibility_barrier = Column(String(100), nullable=True, default="NONE")
    affects_mobility_impaired = Column(Boolean, default=False, nullable=False)
    location_context = Column(String(100), default="GENERAL", nullable=True)

    # Infrastructure Memory
    is_repeated_issue = Column(Boolean, default=False, nullable=False)
    repeat_count = Column(Integer, default=0, nullable=False)

    # Demo Mode Flag
    is_demo_data = Column(Boolean, default=False, nullable=False)

    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    reporter = relationship("User", back_populates="reports")
    evidence = relationship("Evidence", back_populates="report", cascade="all, delete-orphan")
