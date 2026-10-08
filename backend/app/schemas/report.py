from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.report import ReportCategory, ReportStatus, PriorityLevel, LocationType, AccessibilityBarrierType
from app.schemas.auth import UserResponse

class EvidenceResponse(BaseModel):
    id: int
    report_id: int
    file_path: str
    filename: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    confidence: Optional[float] = 1.0
    capture_source: Optional[str] = "UPLOAD"
    file_hash: Optional[str] = None
    evidence_confidence: Optional[str] = "MEDIUM"
    confidence_reasons: Optional[str] = None
    ai_detections: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    category: ReportCategory = ReportCategory.OTHER
    location_type: LocationType = LocationType.NONE
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    severity: str = "MEDIUM"
    accessibility_barrier: Optional[AccessibilityBarrierType] = AccessibilityBarrierType.NONE
    affects_mobility_impaired: bool = False
    location_context: Optional[str] = "GENERAL"

class ReportUpdateStatus(BaseModel):
    status: ReportStatus
    impact_notes: Optional[str] = None
    human_impact_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    priority_level: Optional[PriorityLevel] = None

class ReportResponse(BaseModel):
    id: int
    case_id: Optional[str] = None
    defect_type: Optional[str] = None
    ai_confidence: Optional[float] = None
    title: str
    description: str
    category: ReportCategory
    status: ReportStatus
    location_type: LocationType
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    
    # Intelligence Layer
    human_impact_score: float # 0 - 100
    priority_level: PriorityLevel
    severity: str
    impact_notes: Optional[str] = None
    factor_breakdown: Optional[str] = None
    reasons: Optional[str] = None
    
    # Accessibility & Context
    accessibility_barrier: Optional[str] = None
    affects_mobility_impaired: bool = False
    location_context: Optional[str] = "GENERAL"

    # Infrastructure Memory
    is_repeated_issue: bool = False
    repeat_count: int = 0
    is_demo_data: bool = False

    reporter_id: int
    created_at: datetime
    updated_at: datetime
    reporter: Optional[UserResponse] = None
    evidence: List[EvidenceResponse] = []

    model_config = ConfigDict(from_attributes=True)

class HighImpactLocationItem(BaseModel):
    id: int
    title: str
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    impact_score: int
    priority: str
    category: str

class DashboardStats(BaseModel):
    total_reports: int
    open_reports: int
    under_review_reports: int
    assigned_reports: int
    in_progress_reports: int
    resolved_reports: int
    rejected_reports: int
    critical_reports: int
    high_impact_count: int
    average_impact_score: float
    accessibility_issue_count: int
    repeated_issue_count: int
    category_breakdown: Dict[str, int]
    status_breakdown: Dict[str, int]
    priority_breakdown: Dict[str, int]
    high_impact_locations: List[HighImpactLocationItem] = []
