from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class ImpactFactors(BaseModel):
    severity: int = Field(..., ge=0, le=30, description="Infrastructure defect severity points (0-30)")
    pedestrian_impact: int = Field(..., ge=0, le=25, description="Pedestrian volume and corridor exposure (0-25)")
    accessibility_impact: int = Field(..., ge=0, le=25, description="Impediment to wheelchairs, elderly, mobility (0-25)")
    location_context: int = Field(..., ge=0, le=15, description="Proximity to hospitals, schools, transit (0-15)")
    history: int = Field(..., ge=0, le=10, description="Repeated reports and unresolved recurrence (0-10)")

class ImpactEvaluationResult(BaseModel):
    impact_score: int = Field(..., ge=0, le=100, description="Normalized Human Impact Score (0-100)")
    priority: str = Field(..., description="CRITICAL | HIGH | MEDIUM | LOW")
    factors: ImpactFactors
    reasons: List[str] = Field(default_factory=list, description="Deterministic algorithmic justifications")

class ImpactForecastTimeline(BaseModel):
    timeframe: str
    impact_description: str
    disruption_level: str

class ImpactForecast(BaseModel):
    title: str = "Impact Forecast"
    disclaimer: str = "Algorithmic simulation model (Not a scientifically guaranteed prediction)"
    current_affected_estimate: str
    timeline: List[ImpactForecastTimeline]
    compounding_risks: List[str]

class RepairSimulationResult(BaseModel):
    current_impact_score: int
    current_priority: str
    current_factors: ImpactFactors
    simulated_impact_score: int
    simulated_priority: str
    simulated_factors: ImpactFactors
    impact_reduction_points: int
    percentage_improvement: float
    accessibility_restored: bool
    summary_message: str
    disclaimer: str = "This is an algorithmic simulation, not a real-world guarantee."

class ImpactEngine:
    """
    Deterministic, explainable Human Impact scoring engine.
    Core Thesis: Cities should prioritize infrastructure problems by HUMAN IMPACT,
    not merely by visual defect size or reporting noise.
    """

    @classmethod
    def evaluate(
        cls,
        category: str,
        description: str,
        severity: str = "MEDIUM",
        accessibility_barrier: Optional[str] = None,
        affects_mobility_impaired: bool = False,
        location_context: Optional[str] = None,
        repeat_count: int = 0,
        has_gps: bool = False,
        ai_defect: Optional[str] = None,
        ai_confidence: Optional[float] = None,
        affected_area_ratio: Optional[float] = None
    ) -> ImpactEvaluationResult:
        desc_lower = description.lower()
        reasons: List[str] = []

        # 0. YOLO AI Evidence Integration
        if ai_defect and ai_confidence is not None and ai_confidence > 0:
            reasons.append(f"Real YOLO AI detected '{ai_defect.replace('_', ' ')}' with {ai_confidence*100:.1f}% confidence")
            if affected_area_ratio and affected_area_ratio >= 0.10:
                reasons.append(f"Significant visual footprint ({affected_area_ratio*100:.1f}% of frame) indicates prominent physical hazard")
            elif ai_confidence >= 0.60:
                reasons.append(f"High AI verification confidence ({ai_confidence*100:.1f}%) confirms defect integrity")

        # 1. Infrastructure Severity (0 - 30 points)
        sev_upper = (severity or "MEDIUM").upper()
        if sev_upper == "CRITICAL":
            sev_points = 28
            reasons.append("Critical infrastructure damage posing direct physical danger")
        elif sev_upper == "HIGH":
            sev_points = 22
            reasons.append("High structural degradation requiring near-term intervention")
        elif sev_upper == "MEDIUM":
            sev_points = 15
            reasons.append("Moderate defect with progressive deterioration risk")
        else: # LOW
            sev_points = 8
            reasons.append("Minor cosmetic or low-risk defect")

        # 2. Pedestrian Impact (0 - 25 points)
        # Category base & keyword evaluation
        ped_points = 10
        if category in ["SIDEWALK", "ACCESSIBILITY"]:
            ped_points = 18
            reasons.append("Directly disrupts active pedestrian right-of-way")
        elif category in ["POTHOLE", "ROAD_DAMAGE"]:
            ped_points = 14
            reasons.append("Hazard affecting roadway travel and pedestrian crosswalks")
        elif category == "GARBAGE":
            ped_points = 12
            reasons.append("Sidewalk obstruction and public sanitation impediment")
        elif category == "SIGNAGE":
            ped_points = 11
            reasons.append("Traffic safety and pedestrian navigation hazard")

        if any(w in desc_lower for w in ["blocked", "impassable", "crowded", "arterial", "crosswalk", "crossing", "detour"]):
            ped_points = min(25, ped_points + 6)
            reasons.append("Corridor is blocked or forces pedestrian street diversions")

        # 3. Accessibility Impact (0 - 25 points)
        acc_points = 5
        barrier_upper = (accessibility_barrier or "").upper()

        is_acc_category = category == "ACCESSIBILITY"
        has_barrier = barrier_upper in [
            "STAIRS", "RAMP", "ELEVATOR", "NARROW_DOOR", "BLOCKED_SIDEWALK",
            "OBSTACLE", "INACCESSIBLE_ENTRANCE", "WHEELCHAIR_ROUTE_BARRIER"
        ]
        has_acc_keywords = any(w in desc_lower for w in [
            "wheelchair", "ramp", "curb cut", "stroller", "blind", "cane", "crutch",
            "disabled", "mobility", "elderly", "senior", "step-only"
        ])

        if is_acc_category or has_barrier or affects_mobility_impaired or has_acc_keywords:
            acc_points = 21
            if barrier_upper in ["WHEELCHAIR_ROUTE_BARRIER", "RAMP", "BLOCKED_SIDEWALK", "ELEVATOR"]:
                acc_points = 25
                reasons.append("Severe accessibility impediment blocking wheelchair transit corridor")
            else:
                reasons.append("Impediment to accessible mobility and ADA compliance")
        else:
            if any(w in desc_lower for w in ["trip", "fall", "stumble", "uneven"]):
                acc_points = 12
                reasons.append("Tripping hazard affecting seniors and vulnerable walkers")

        # 4. Location / Context Impact (0 - 15 points)
        loc_points = 4
        loc_upper = (location_context or "").upper()

        if loc_upper == "HOSPITAL_CLINIC" or any(w in desc_lower for w in ["hospital", "clinic", "health", "doctor", "medical"]):
            loc_points = 15
            reasons.append("Located within healthcare or medical clinic transit zone")
        elif loc_upper == "TRANSIT_HUB" or any(w in desc_lower for w in ["transit", "bus stop", "subway", "train", "metro", "station"]):
            loc_points = 13
            reasons.append("Directly adjacent to primary public transit arterial or stop")
        elif loc_upper == "SCHOOL_ZONE" or any(w in desc_lower for w in ["school", "child", "daycare", "playground", "park"]):
            loc_points = 12
            reasons.append("Situated inside active school zone or child pedestrian corridor")
        elif loc_upper == "COMMERCIAL" or any(w in desc_lower for w in ["commercial", "market", "downtown", "shops"]):
            loc_points = 8
            reasons.append("High-density commercial pedestrian zone")
        elif has_gps:
            loc_points = 6
            reasons.append("Verified municipal spatial telemetry via GPS")
        else:
            reasons.append("General municipal zone (no immediate critical facility cluster specified)")

        # 5. Historical / Repeat Impact (0 - 10 points)
        if repeat_count >= 3:
            hist_points = 10
            reasons.append(f"Chronic recurring hazard ({repeat_count}+ related community reports recorded nearby)")
        elif repeat_count == 2:
            hist_points = 7
            reasons.append("Repeated incident cluster identified near this location (2 prior reports)")
        elif repeat_count == 1:
            hist_points = 4
            reasons.append("Prior report documented at adjacent coordinates")
        else:
            hist_points = 0
            reasons.append("No prior incident history recorded in this spatial sector")

        # Total Human Impact Score (Normalized 0 - 100)
        # Integrates Severity (up to 28), Pedestrian (up to 25), Accessibility (up to 25),
        # Location Context (up to 15), and History (up to 10)
        base_score = sev_points + ped_points + acc_points + loc_points + hist_points
        if ai_confidence and ai_confidence >= 0.60:
            # AI high confidence confirms objective physical defect
            base_score = min(100, base_score + 2)
        total_score = min(100, max(0, base_score))

        # Priority Level
        if total_score >= 80:
            priority = "CRITICAL"
        elif total_score >= 60:
            priority = "HIGH"
        elif total_score >= 30:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        factors = ImpactFactors(
            severity=sev_points,
            pedestrian_impact=ped_points,
            accessibility_impact=acc_points,
            location_context=loc_points,
            history=hist_points
        )

        return ImpactEvaluationResult(
            impact_score=total_score,
            priority=priority,
            factors=factors,
            reasons=reasons
        )

    @classmethod
    def forecast_ripple(cls, evaluation: ImpactEvaluationResult, category: str) -> ImpactForecast:
        """
        Estimates the progressive civic ripple effect if an issue remains unaddressed.
        """
        score = evaluation.impact_score
        is_acc = evaluation.factors.accessibility_impact >= 18

        if score >= 80:
            est_affected = "1,200 - 3,500 daily pedestrians (including 150+ mobility-impaired residents)"
        elif score >= 60:
            est_affected = "600 - 1,400 daily pedestrians"
        else:
            est_affected = "150 - 500 daily passersby"

        timeline = [
            ImpactForecastTimeline(
                timeframe="Immediate (Days 1–7)",
                impact_description="Direct localized blockage; elderly and wheelchair users must reroute or encounter hazards.",
                disruption_level="High Disruption" if is_acc else "Moderate Disruption"
            ),
            ImpactForecastTimeline(
                timeframe="Medium-Term (Days 8–30)",
                impact_description="Diverted pedestrian flow congests parallel routes; weather and traffic expand defect perimeter by ~20-35%.",
                disruption_level="Compounding Hazard"
            ),
            ImpactForecastTimeline(
                timeframe="Long-Term (Day 30+)",
                impact_description="Sub-base structural damage quadruples municipal repair cost; heightened liability from trip-and-fall injuries.",
                disruption_level="Severe Public Impact"
            )
        ]

        compounding = [
            "Increased detour distance (+250m to +500m) for individuals using assistive devices.",
            "Water ponding acceleration leading to deeper subgrade erosion.",
            "Escalating commercial foot-traffic avoidance for nearby businesses."
        ]

        return ImpactForecast(
            current_affected_estimate=est_affected,
            timeline=timeline,
            compounding_risks=compounding
        )

    @classmethod
    def simulate_repair(cls, current_eval: ImpactEvaluationResult) -> RepairSimulationResult:
        """
        What-If Simulator: Estimates the quantitative reduction in human impact upon repair.
        """
        # Post-repair state:
        # Severity drops to minimal (2-4), Pedestrian hazard clears (2-4),
        # Accessibility barrier resolved (0-2), Location retains minimal baseline context,
        # History is mitigated.
        sim_sev = 3
        sim_ped = 4
        sim_acc = 2
        sim_loc = min(current_eval.factors.location_context, 5)
        sim_hist = 0

        sim_score = sim_sev + sim_ped + sim_acc + sim_loc + sim_hist
        sim_score = min(100, max(5, sim_score))

        sim_priority = "LOW"
        if sim_score >= 30:
            sim_priority = "MEDIUM"

        reduction = current_eval.impact_score - sim_score
        pct = round((reduction / max(1, current_eval.impact_score)) * 100, 1)

        sim_factors = ImpactFactors(
            severity=sim_sev,
            pedestrian_impact=sim_ped,
            accessibility_impact=sim_acc,
            location_context=sim_loc,
            history=sim_hist
        )

        acc_was_high = current_eval.factors.accessibility_impact >= 15

        return RepairSimulationResult(
            current_impact_score=current_eval.impact_score,
            current_priority=current_eval.priority,
            current_factors=current_eval.factors,
            simulated_impact_score=sim_score,
            simulated_priority=sim_priority,
            simulated_factors=sim_factors,
            impact_reduction_points=reduction,
            percentage_improvement=pct,
            accessibility_restored=acc_was_high,
            summary_message=(
                f"Repairing this issue eliminates {reduction} points of human impact "
                f"({pct}% civic relief) and restores universal mobility."
            )
        )

impact_engine = ImpactEngine()
