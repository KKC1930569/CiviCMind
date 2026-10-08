from typing import Tuple
from app.models.report import ReportCategory, LocationType

CATEGORY_BASE_IMPACT = {
    ReportCategory.ACCESSIBILITY.value: 8.0,
    ReportCategory.SIDEWALK.value: 7.0,
    ReportCategory.POTHOLE.value: 6.5,
    ReportCategory.ROAD_DAMAGE.value: 6.5,
    ReportCategory.GARBAGE.value: 5.0,
    ReportCategory.SIGNAGE.value: 4.5,
    ReportCategory.OTHER.value: 4.0,
}

VULNERABLE_KEYWORDS = [
    "wheelchair", "ramp", "crutch", "blind", "disabled", "elderly", "senior", 
    "stroller", "child", "school", "hospital", "clinic", "transit", "bus stop",
    "station", "crosswalk", "pedestrian", "tripped", "injury", "fell", "danger",
    "hazard", "blocked", "impassable", "deep", "flooded"
]

def calculate_human_impact(
    category: str,
    description: str,
    location_type: str
) -> Tuple[float, str]:
    """
    Calculates Human Impact Score (1.0 to 10.0) based on category, vulnerable population proximity,
    and transit risk factors. This embodies CivicMind's core thesis:
    DETECT -> UNDERSTAND -> IMPACT -> PREDICT -> PRIORITIZE.
    """
    base = CATEGORY_BASE_IMPACT.get(category, 5.0)
    score = base
    reasons = []

    if category == ReportCategory.ACCESSIBILITY.value:
        reasons.append("Critical accessibility impediment affecting universal mobility.")
    elif category in [ReportCategory.SIDEWALK.value, ReportCategory.POTHOLE.value]:
        reasons.append("Direct physical hazard to pedestrians and commuters.")

    desc_lower = description.lower()
    matched_keywords = [kw for kw in VULNERABLE_KEYWORDS if kw in desc_lower]
    if matched_keywords:
        boost = min(len(matched_keywords) * 0.5, 2.0)
        score += boost
        reasons.append(f"Elevated urgency keywords identified ({', '.join(matched_keywords[:3])}).")

    if location_type == LocationType.GPS.value:
        score += 0.2
        reasons.append("High-confidence GPS telemetry coordinates provided.")

    final_score = round(min(max(score, 1.0), 10.0), 1)
    impact_notes = " ".join(reasons) if reasons else "Standard community infrastructure report."

    return final_score, impact_notes
