import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.report import Report, ReportCategory, ReportStatus, PriorityLevel, LocationType
from app.models.evidence import Evidence
from app.schemas.report import (
    ReportResponse,
    ReportUpdateStatus,
    DashboardStats,
    HighImpactLocationItem,
)
from app.auth.dependencies import get_current_user, require_authority
from app.services.storage_service import storage_service
from app.services.impact_engine import impact_engine, ImpactForecast, RepairSimulationResult
from app.services.evidence_confidence import evidence_evaluator
from app.services.infrastructure_memory import memory_service
from app.services.work_order_service import work_order_service, MunicipalWorkOrder
from app.services.ai import ai_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    title: str = Form(..., min_length=3, max_length=255),
    description: str = Form(..., min_length=5),
    category: str = Form(ReportCategory.OTHER.value),
    location_type: str = Form(LocationType.NONE.value),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    severity: str = Form("MEDIUM"),
    accessibility_barrier: Optional[str] = Form("NONE"),
    affects_mobility_impaired: bool = Form(False),
    location_context: Optional[str] = Form("GENERAL"),
    capture_source: Optional[str] = Form("UPLOAD"),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates an infrastructure report with Human Impact intelligence.
    Computes 0-100 impact score, priority level, accessibility flags, and historical recurrence.
    """
    if category not in [c.value for c in ReportCategory]:
        category = ReportCategory.OTHER.value
    if location_type not in [l.value for l in LocationType]:
        location_type = LocationType.NONE.value

    # 1. Spatial Memory: Detect historical / repeated reports near coordinates
    nearby_reports, repeat_count = memory_service.query_nearby_cluster(db, latitude, longitude)
    is_repeated = repeat_count > 0

    # 2. Human Impact Engine: Calculate explainable 0-100 score & priority
    eval_result = impact_engine.evaluate(
        category=category,
        description=description,
        severity=severity,
        accessibility_barrier=accessibility_barrier,
        affects_mobility_impaired=affects_mobility_impaired,
        location_context=location_context,
        repeat_count=repeat_count,
        has_gps=(location_type == LocationType.GPS.value)
    )

    report = Report(
        title=title.strip(),
        description=description.strip(),
        category=category,
        status=ReportStatus.OPEN.value,
        location_type=location_type,
        latitude=latitude,
        longitude=longitude,
        address=address.strip() if address else None,
        
        # Intelligence Layer
        human_impact_score=float(eval_result.impact_score),
        priority_level=eval_result.priority,
        severity=severity.upper(),
        impact_notes="; ".join(eval_result.reasons),
        factor_breakdown=eval_result.factors.model_dump_json(),
        reasons=json.dumps(eval_result.reasons),

        # Accessibility & Context
        accessibility_barrier=accessibility_barrier or "NONE",
        affects_mobility_impaired=affects_mobility_impaired,
        location_context=location_context or "GENERAL",

        # Spatial Memory
        is_repeated_issue=is_repeated,
        repeat_count=repeat_count,
        is_demo_data=False,

        reporter_id=current_user.id
    )
    db.add(report)
    db.flush()

    # 3. Evidence Handling & Confidence Analysis
    if image and image.filename:
        file_url, stored_filename, file_size, content_type = await storage_service.save_upload_file(image)
        file_path_on_disk = settings.UPLOAD_DIR / stored_filename

        # Evidence Confidence evaluation
        # Check if identical hash exists in prior evidence
        raw_hash = evidence_evaluator.calculate_file_hash(file_path_on_disk)
        dup_exists = db.query(Evidence).filter(Evidence.file_hash == raw_hash).first() is not None

        conf_level, conf_score, conf_reasons, f_hash = evidence_evaluator.evaluate(
            file_path=file_path_on_disk,
            is_camera_capture=(capture_source == "CAMERA"),
            has_gps=(latitude is not None and longitude is not None),
            is_duplicate_hash=dup_exists
        )

        # AI Detection Layer Stub
        ai_res = await ai_service.analyze_image(str(file_path_on_disk))

        evidence = Evidence(
            report_id=report.id,
            file_path=file_url,
            filename=stored_filename,
            file_size=file_size,
            mime_type=content_type,
            confidence=ai_res.confidence,
            capture_source=capture_source or "UPLOAD",
            file_hash=f_hash,
            has_gps_metadata=(latitude is not None and longitude is not None),
            evidence_confidence=conf_level,
            confidence_reasons="; ".join(conf_reasons)
        )
        db.add(evidence)

    db.commit()
    db.refresh(report)
    return report

@router.get("", response_model=List[ReportResponse])
def get_reports(
    mine_only: bool = Query(False, description="Filter for current user submissions"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    accessibility_only: bool = Query(False, description="Filter for accessibility-related issues"),
    sort_by: str = Query("impact", description="Sort by: 'impact' (default), 'priority', 'severity', 'created_at'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch reports with smart prioritization filtering.
    Default ordering is Human Impact Score (Highest impact first).
    """
    query = db.query(Report)

    if mine_only:
        query = query.filter(Report.reporter_id == current_user.id)
    if category and category in [c.value for c in ReportCategory]:
        query = query.filter(Report.category == category)
    if status and status in [s.value for s in ReportStatus]:
        query = query.filter(Report.status == status)
    if priority and priority in [p.value for p in PriorityLevel]:
        query = query.filter(Report.priority_level == priority)
    if accessibility_only:
        query = query.filter(
            (Report.category == ReportCategory.ACCESSIBILITY.value) |
            (Report.affects_mobility_impaired == True) |
            (Report.accessibility_barrier != "NONE")
        )

    # Smart Sorting Mechanisms
    if sort_by == "priority":
        # Order by priority weight then score
        query = query.order_by(Report.human_impact_score.desc())
    elif sort_by == "severity":
        query = query.order_by(Report.severity.desc(), Report.human_impact_score.desc())
    elif sort_by == "created_at":
        query = query.order_by(Report.created_at.desc())
    else: # Default: Highest Human Impact First
        query = query.order_by(Report.human_impact_score.desc(), Report.created_at.desc())

    return query.all()

@router.get("/stats/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Authority Command Center metrics computed from live database records.
    """
    total = db.query(Report).count()
    open_count = db.query(Report).filter(Report.status == ReportStatus.OPEN.value).count()
    under_review = db.query(Report).filter(Report.status == ReportStatus.UNDER_REVIEW.value).count()
    assigned = db.query(Report).filter(Report.status == ReportStatus.ASSIGNED.value).count()
    in_progress = db.query(Report).filter(Report.status == ReportStatus.IN_PROGRESS.value).count()
    resolved = db.query(Report).filter(Report.status == ReportStatus.RESOLVED.value).count()
    rejected = db.query(Report).filter(Report.status == ReportStatus.REJECTED.value).count()
    
    # Intelligence Metrics
    critical_count = db.query(Report).filter(Report.priority_level == "CRITICAL").count()
    high_impact_count = db.query(Report).filter(Report.human_impact_score >= 70.0).count()
    avg_score_res = db.query(func.avg(Report.human_impact_score)).scalar() or 0.0
    avg_impact = round(float(avg_score_res), 1)

    acc_count = db.query(Report).filter(
        (Report.category == ReportCategory.ACCESSIBILITY.value) |
        (Report.affects_mobility_impaired == True) |
        (Report.accessibility_barrier != "NONE")
    ).count()

    repeat_count = db.query(Report).filter(Report.is_repeated_issue == True).count()

    # Category breakdown
    cat_counts = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    category_breakdown = {c.value: 0 for c in ReportCategory}
    for cat, count in cat_counts:
        category_breakdown[cat] = count

    # Status breakdown
    stat_counts = db.query(Report.status, func.count(Report.id)).group_by(Report.status).all()
    status_breakdown = {s.value: 0 for s in ReportStatus}
    for st, count in stat_counts:
        status_breakdown[st] = count

    # Priority breakdown
    prio_counts = db.query(Report.priority_level, func.count(Report.id)).group_by(Report.priority_level).all()
    priority_breakdown = {p.value: 0 for p in PriorityLevel}
    for pr, count in prio_counts:
        priority_breakdown[pr] = count

    # High impact locations list (top 6 highest score incidents with coordinates)
    top_locs = (
        db.query(Report)
        .filter(Report.latitude.isnot(None), Report.longitude.isnot(None))
        .order_by(Report.human_impact_score.desc())
        .limit(6)
        .all()
    )
    high_impact_locations = [
        HighImpactLocationItem(
            id=r.id,
            title=r.title,
            address=r.address,
            latitude=r.latitude,
            longitude=r.longitude,
            impact_score=int(round(r.human_impact_score)),
            priority=r.priority_level,
            category=r.category
        )
        for r in top_locs
    ]

    return DashboardStats(
        total_reports=total,
        open_reports=open_count,
        under_review_reports=under_review,
        assigned_reports=assigned,
        in_progress_reports=in_progress,
        resolved_reports=resolved,
        rejected_reports=rejected,
        critical_reports=critical_count,
        high_impact_count=high_impact_count,
        average_impact_score=avg_impact,
        accessibility_issue_count=acc_count,
        repeated_issue_count=repeat_count,
        category_breakdown=category_breakdown,
        status_breakdown=status_breakdown,
        priority_breakdown=priority_breakdown,
        high_impact_locations=high_impact_locations
    )

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )
    return report

@router.get("/{report_id}/forecast", response_model=ImpactForecast)
def get_report_impact_forecast(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Requirement 4: Impact Ripple / Forecast
    Estimates progression if issue remains unaddressed.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Evaluate factors
    eval_result = impact_engine.evaluate(
        category=report.category,
        description=report.description,
        severity=report.severity,
        accessibility_barrier=report.accessibility_barrier,
        affects_mobility_impaired=report.affects_mobility_impaired,
        location_context=report.location_context,
        repeat_count=report.repeat_count,
        has_gps=(report.location_type == LocationType.GPS.value)
    )

    return impact_engine.forecast_ripple(eval_result, report.category)

@router.post("/{report_id}/simulate-repair", response_model=RepairSimulationResult)
def simulate_repair_impact(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Requirement 5: What-If Repair Simulator
    Simulates quantitative reduction in human impact points after repair.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    eval_result = impact_engine.evaluate(
        category=report.category,
        description=report.description,
        severity=report.severity,
        accessibility_barrier=report.accessibility_barrier,
        affects_mobility_impaired=report.affects_mobility_impaired,
        location_context=report.location_context,
        repeat_count=report.repeat_count,
        has_gps=(report.location_type == LocationType.GPS.value)
    )

    return impact_engine.simulate_repair(eval_result)

@router.get("/{report_id}/work-order", response_model=MunicipalWorkOrder)
def generate_work_order(
    report_id: int,
    current_user: User = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """
    Requirement 9: Municipal Work Order Generator
    Produces structured work order package for public works crews.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return work_order_service.generate(report, repeat_count=report.repeat_count)

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    update_data: ReportUpdateStatus,
    current_user: User = Depends(require_authority),
    db: Session = Depends(get_db)
):
    """
    Authority triage update for workflow status and priority overrides.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )

    report.status = update_data.status.value
    if update_data.impact_notes is not None:
        report.impact_notes = update_data.impact_notes
    if update_data.human_impact_score is not None:
        report.human_impact_score = update_data.human_impact_score
    if update_data.priority_level is not None:
        report.priority_level = update_data.priority_level.value

    db.commit()
    db.refresh(report)
    return report
