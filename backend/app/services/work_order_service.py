from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.report import Report

DEPARTMENT_MAPPING = {
    "ACCESSIBILITY": "Office of Disability Access & Universal Mobility (ADA Division)",
    "SIDEWALK": "Bureau of Street Pedestrian Surfaces & Concrete Works",
    "POTHOLE": "Department of Public Works - Asphalt Maintenance Division",
    "ROAD_DAMAGE": "Division of Arterial Highways & Street Geometry",
    "GARBAGE": "Bureau of Urban Cleanliness, Sanitation & Waste Logistics",
    "SIGNAGE": "Municipal Traffic Signs, Signals & Visual Safety Division",
    "OTHER": "General Municipal Infrastructure Maintenance",
}

RECOMMENDED_ACTIONS = {
    "ACCESSIBILITY": "Inspect slope gradient, remove physical obstruction, and install ADA-compliant curb ramp with tactile truncated domes.",
    "SIDEWALK": "Level heaved concrete slab, mitigate tree root displacement, and pour high-durability pedestrian sidewalk section.",
    "POTHOLE": "Sawcut edges, clear loose debris, apply tack coat, and compact hot-mix asphalt to flush grade.",
    "ROAD_DAMAGE": "Route fissure, apply hot-pour rubberized crack sealant to prevent water infiltration and sub-base degradation.",
    "GARBAGE": "Dispatch rapid sanitation crew for debris clearance, sanitize pavement corridor, and audit dumpster capacity.",
    "SIGNAGE": "Re-anchor signpost to municipal specification with anti-tamper hardware; verify sightline retroreflectivity.",
    "OTHER": "Conduct on-site engineering survey and schedule specialized corrective maintenance.",
}

SLA_HOURS = {
    "CRITICAL": 24,
    "HIGH": 72,
    "MEDIUM": 168, # 7 days
    "LOW": 336,    # 14 days
}

class MunicipalWorkOrder(BaseModel):
    work_order_id: str
    generated_at: str
    target_sla_hours: int
    assigned_department: str
    issue_title: str
    category: str
    status: str
    priority: str
    human_impact_score: int
    severity: str
    accessibility_barrier: str
    location_summary: str
    latitude: Optional[float]
    longitude: Optional[float]
    description: str
    recommended_action: str
    equipment_needed: List[str]
    report_history_note: str
    evidence_urls: List[str]

class WorkOrderService:
    @classmethod
    def generate(cls, report: Report, repeat_count: int = 0) -> MunicipalWorkOrder:
        wo_id = f"WO-{datetime.utcnow().year}-{str(report.id).zfill(5)}"
        dept = DEPARTMENT_MAPPING.get(report.category, "Public Works Department")
        action = RECOMMENDED_ACTIONS.get(report.category, "Inspect and execute repair according to municipal code.")
        
        priority = getattr(report, "priority_level", None) or ("CRITICAL" if report.human_impact_score >= 80 else ("HIGH" if report.human_impact_score >= 60 else "MEDIUM"))
        sla = SLA_HOURS.get(priority, 72)

        # Equipment list
        equipment = ["Safety Cones & Pedestrian Barricades", "High-Visibility Protective Equipment"]
        if report.category in ["ACCESSIBILITY", "SIDEWALK"]:
            equipment.extend(["Concrete Breaker", "Tamper Compactor", "Level Gauge", "Tactile Paver Mats"])
        elif report.category in ["POTHOLE", "ROAD_DAMAGE"]:
            equipment.extend(["Hot-Mix Asphalt Hauler", "Plate Compactor", "Bituminous Tack Sprayer"])
        elif report.category == "GARBAGE":
            equipment.extend(["Sanitation Truck", "Industrial Sweeper", "Bio-wash Pressure Rig"])
        else:
            equipment.extend(["Post Anchor Driver", "Utility Tool Set"])

        history_note = "First documented incident at this spatial locus."
        if repeat_count > 0:
            history_note = f"Recurrence alert: {repeat_count} related community submissions logged in spatial perimeter."

        evidence_urls = [ev.file_path for ev in report.evidence] if report.evidence else []

        loc_sum = report.address or (
            f"GPS Coordinates: {report.latitude:.5f}, {report.longitude:.5f}" 
            if report.latitude is not None else "Unspecified civic coordinate"
        )

        acc_barrier = getattr(report, "accessibility_barrier", None) or (
            "Mobility impediment identified" if report.category == "ACCESSIBILITY" else "None logged"
        )

        return MunicipalWorkOrder(
            work_order_id=wo_id,
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            target_sla_hours=sla,
            assigned_department=dept,
            issue_title=report.title,
            category=report.category,
            status=report.status,
            priority=priority,
            human_impact_score=int(round(report.human_impact_score if report.human_impact_score > 10 else report.human_impact_score * 10)),
            severity=getattr(report, "severity", "MEDIUM") or "MEDIUM",
            accessibility_barrier=acc_barrier,
            location_summary=loc_sum,
            latitude=report.latitude,
            longitude=report.longitude,
            description=report.description,
            recommended_action=action,
            equipment_needed=equipment,
            report_history_note=history_note,
            evidence_urls=evidence_urls,
        )

work_order_service = WorkOrderService()
