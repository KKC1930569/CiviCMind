from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True, default=1.0)

    # Evidence Confidence Signals
    capture_source = Column(String(50), default="UPLOAD", nullable=True) # CAMERA | UPLOAD
    file_hash = Column(String(64), nullable=True)
    has_gps_metadata = Column(Boolean, default=False, nullable=True)
    evidence_confidence = Column(String(50), default="MEDIUM", nullable=True) # HIGH | MEDIUM | LOW
    confidence_reasons = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    report = relationship("Report", back_populates="evidence")
