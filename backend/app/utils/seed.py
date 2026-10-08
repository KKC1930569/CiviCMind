import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine, ensure_sqlite_columns
from app.models.user import User, UserRole
from app.models.report import Report, ReportCategory, ReportStatus, LocationType, PriorityLevel
from app.models.evidence import Evidence
from app.auth.security import hash_password

def seed_database():
    """
    Seeds initial system accounts and realistic benchmark infrastructure reports.
    """
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns()
    db: Session = SessionLocal()

    try:
        # 1. Accounts
        for auth_email in ["authority@civicmind.org", "authority@urbaneye.org"]:
            if not db.query(User).filter(User.email == auth_email).first():
                db.add(User(
                    email=auth_email,
                    full_name="Metro Works Authority",
                    hashed_password=hash_password("Authority123!"),
                    role=UserRole.AUTHORITY.value,
                    is_active=True
                ))

        for admin_email in ["admin@civicmind.org", "admin@urbaneye.org"]:
            if not db.query(User).filter(User.email == admin_email).first():
                db.add(User(
                    email=admin_email,
                    full_name="System Administrator",
                    hashed_password=hash_password("Admin123!"),
                    role=UserRole.ADMIN.value,
                    is_active=True
                ))

        for cit_email in ["citizen@civicmind.org", "citizen@urbaneye.org"]:
            if not db.query(User).filter(User.email == cit_email).first():
                db.add(User(
                    email=cit_email,
                    full_name="Sarah Jenkins",
                    hashed_password=hash_password("Citizen123!"),
                    role=UserRole.CITIZEN.value,
                    is_active=True
                ))

        db.commit()
        citizen = db.query(User).filter(User.email.in_(["citizen@civicmind.org", "citizen@urbaneye.org"])).first()
        db.refresh(citizen)

        # 2. Check if reports need initial seeding or updating
        report_count = db.query(Report).count()
        if report_count == 0:
            sample_reports = [
                {
                    "title": "Broken Curb Ramp Blocking Wheelchair Transit",
                    "description": "The pedestrian curb ramp is severely cracked and blocked by concrete rubble, forcing wheelchairs into active traffic lanes near the T. Nagar bus terminal.",
                    "category": ReportCategory.ACCESSIBILITY.value,
                    "status": ReportStatus.OPEN.value,
                    "location_type": LocationType.GPS.value,
                    "latitude": 13.0418,
                    "longitude": 80.2341,
                    "address": "Anna Salai & Usman Road, T. Nagar",
                    "human_impact_score": 94.0,
                    "priority_level": "CRITICAL",
                    "severity": "CRITICAL",
                    "impact_notes": "Critical infrastructure damage; Severe accessibility impediment blocking wheelchair transit corridor; Located within healthcare/transit arterial.",
                    "accessibility_barrier": "RAMP",
                    "affects_mobility_impaired": True,
                    "location_context": "TRANSIT_HUB",
                    "is_repeated_issue": True,
                    "repeat_count": 2,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 28, "pedestrian_impact": 24, "accessibility_impact": 25, "location_context": 12, "history": 5}),
                    "reasons": json.dumps([
                        "Critical infrastructure damage posing direct physical danger",
                        "Severe accessibility impediment blocking wheelchair transit corridor",
                        "Directly adjacent to primary public transit arterial or stop",
                        "Repeated incident cluster identified near this location"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(hours=3)
                },
                {
                    "title": "Severe Pothole on Primary Bus Arterial",
                    "description": "Deep 8-inch pothole in right transit lane causing heavy wheel rim strikes and abrupt vehicle swerving near the DAV School crosswalk.",
                    "category": ReportCategory.POTHOLE.value,
                    "status": ReportStatus.IN_PROGRESS.value,
                    "location_type": LocationType.GPS.value,
                    "latitude": 12.9756,
                    "longitude": 80.2207,
                    "address": "Velachery Main Road & 100 Feet Bypass, Velachery",
                    "human_impact_score": 87.0,
                    "priority_level": "CRITICAL",
                    "severity": "CRITICAL",
                    "impact_notes": "Deep cavity hazard; Active transit lane with heavy pedestrian crosswalk; High volume school zone corridor.",
                    "accessibility_barrier": "NONE",
                    "affects_mobility_impaired": False,
                    "location_context": "SCHOOL_ZONE",
                    "is_repeated_issue": False,
                    "repeat_count": 0,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 28, "pedestrian_impact": 22, "accessibility_impact": 15, "location_context": 14, "history": 8}),
                    "reasons": json.dumps([
                        "Critical infrastructure damage posing direct physical danger",
                        "Hazard affecting crosswalks, micro-mobility, and roadway crossings",
                        "Situated inside active school zone or child pedestrian corridor"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(days=1)
                },
                {
                    "title": "Uprooted Sidewalk Slab Outside Cancer Institute",
                    "description": "Tree roots have heaved concrete slabs upwards by 4 inches. Outpatient visitors have tripped and fallen outside the hospital entrance.",
                    "category": ReportCategory.SIDEWALK.value,
                    "status": ReportStatus.UNDER_REVIEW.value,
                    "location_type": LocationType.MAP.value,
                    "latitude": 13.0033,
                    "longitude": 80.2550,
                    "address": "Sardar Patel Road, Adyar (near Cancer Institute)",
                    "human_impact_score": 89.0,
                    "priority_level": "CRITICAL",
                    "severity": "HIGH",
                    "impact_notes": "Tripping hazard outside medical clinic; Concrete heave exceeds accessibility limit; Multiple falls reported.",
                    "accessibility_barrier": "BLOCKED_SIDEWALK",
                    "affects_mobility_impaired": True,
                    "location_context": "HOSPITAL_CLINIC",
                    "is_repeated_issue": True,
                    "repeat_count": 1,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 24, "pedestrian_impact": 22, "accessibility_impact": 24, "location_context": 15, "history": 4}),
                    "reasons": json.dumps([
                        "High structural degradation requiring near-term intervention",
                        "Directly disrupts active pedestrian right-of-way",
                        "Located within healthcare or medical clinic transit zone",
                        "Prior report documented at adjacent coordinates"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(days=2)
                },
                {
                    "title": "Overflowing Commercial Trash Bin Obstructing Pathway",
                    "description": "Commercial refuse overflow has spilled waste and broken glass across the sidewalk corridor, blocking pedestrian flow in this dense market.",
                    "category": ReportCategory.GARBAGE.value,
                    "status": ReportStatus.OPEN.value,
                    "location_type": LocationType.GPS.value,
                    "latitude": 13.0402,
                    "longitude": 80.2335,
                    "address": "Ranganathan Street & Natesan Park, T. Nagar",
                    "human_impact_score": 68.0,
                    "priority_level": "HIGH",
                    "severity": "MEDIUM",
                    "impact_notes": "Hazardous glass debris obstructing pedestrian walkway; Commercial foot-traffic impact.",
                    "accessibility_barrier": "OBSTACLE",
                    "affects_mobility_impaired": True,
                    "location_context": "COMMERCIAL",
                    "is_repeated_issue": False,
                    "repeat_count": 0,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 16, "pedestrian_impact": 20, "accessibility_impact": 16, "location_context": 10, "history": 6}),
                    "reasons": json.dumps([
                        "Sidewalk obstruction and public sanitation impediment",
                        "Corridor is blocked or forces pedestrian street diversions",
                        "High-density commercial pedestrian zone"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(hours=14)
                },
                {
                    "title": "Fallen Traffic Sign at School Intersection",
                    "description": "Speed restriction and pedestrian warning sign knocked down, lying on sidewalk. Cross-traffic is not slowing near Kendriya Vidyalaya campus.",
                    "category": ReportCategory.SIGNAGE.value,
                    "status": ReportStatus.ASSIGNED.value,
                    "location_type": LocationType.GPS.value,
                    "latitude": 13.0067,
                    "longitude": 80.2025,
                    "address": "Gandhi Mandapam Road & Sardar Patel Rd, Guindy",
                    "human_impact_score": 82.0,
                    "priority_level": "CRITICAL",
                    "severity": "HIGH",
                    "impact_notes": "Immediate vehicular & pedestrian collision risk; Adjacent to school crossing.",
                    "accessibility_barrier": "NONE",
                    "affects_mobility_impaired": False,
                    "location_context": "SCHOOL_ZONE",
                    "is_repeated_issue": False,
                    "repeat_count": 0,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 25, "pedestrian_impact": 20, "accessibility_impact": 10, "location_context": 15, "history": 12}),
                    "reasons": json.dumps([
                        "Critical traffic safety and pedestrian navigation hazard",
                        "Situated inside active school zone or child pedestrian corridor"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(days=3)
                },
                {
                    "title": "Longitudinal Asphalt Fissure on IT Corridor Service Lane",
                    "description": "Road crack running 30 meters along designated two-wheeler / cycle lane. Traps narrow tires on the OMR tech corridor.",
                    "category": ReportCategory.ROAD_DAMAGE.value,
                    "status": ReportStatus.RESOLVED.value,
                    "location_type": LocationType.MAP.value,
                    "latitude": 12.9698,
                    "longitude": 80.2452,
                    "address": "Rajiv Gandhi Salai (OMR IT Corridor), Kandanchavadi",
                    "human_impact_score": 70.0,
                    "priority_level": "HIGH",
                    "severity": "MEDIUM",
                    "impact_notes": "Micro-mobility hazard on primary bicycle and commuter corridor.",
                    "accessibility_barrier": "NONE",
                    "affects_mobility_impaired": False,
                    "location_context": "COMMERCIAL",
                    "is_repeated_issue": False,
                    "repeat_count": 0,
                    "is_demo_data": True,
                    "factor_breakdown": json.dumps({"severity": 18, "pedestrian_impact": 18, "accessibility_impact": 12, "location_context": 12, "history": 10}),
                    "reasons": json.dumps([
                        "Hazard affecting crosswalks, micro-mobility, and roadway crossings"
                    ]),
                    "reporter_id": citizen.id,
                    "created_at": datetime.utcnow() - timedelta(days=5)
                }
            ]

            for r_data in sample_reports:
                r = Report(**r_data)
                db.add(r)
            
            db.commit()
            print("[CivicMind] Database successfully seeded with demo accounts and intelligence layer benchmark reports in Chennai, India.")
        else:
            # Update existing reports to ensure Chennai coordinates, 0-100 normalization and priority levels
            chennai_locations = [
                {"addr": "Anna Salai & Usman Road, T. Nagar", "lat": 13.0418, "lng": 80.2341},
                {"addr": "Velachery Main Road & 100 Feet Bypass, Velachery", "lat": 12.9756, "lng": 80.2207},
                {"addr": "Sardar Patel Road, Adyar (near Cancer Institute)", "lat": 13.0033, "lng": 80.2550},
                {"addr": "Ranganathan Street & Natesan Park, T. Nagar", "lat": 13.0402, "lng": 80.2335},
                {"addr": "Gandhi Mandapam Road & Sardar Patel Rd, Guindy", "lat": 13.0067, "lng": 80.2025},
                {"addr": "Rajiv Gandhi Salai (OMR IT Corridor), Kandanchavadi", "lat": 12.9698, "lng": 80.2452},
                {"addr": "2nd Avenue, Shanthi Colony, Anna Nagar", "lat": 13.0878, "lng": 80.2144},
                {"addr": "GST Road near Tambaram Sanatorium Station, Tambaram", "lat": 12.9249, "lng": 80.1275},
            ]
            existing = db.query(Report).all()
            for idx, r in enumerate(existing):
                # Migrate any non-Indian / SF coordinates (lat > 25 or lng < 70) to Chennai
                if r.latitude is None or r.latitude > 25.0 or r.longitude is None or r.longitude < 70.0:
                    loc = chennai_locations[idx % len(chennai_locations)]
                    r.latitude = loc["lat"]
                    r.longitude = loc["lng"]
                    if not r.address or "Market St" in r.address or "Castro" in r.address or "Van Ness" in r.address or "Mission St" in r.address or "Fillmore" in r.address or "Folsom" in r.address:
                        r.address = loc["addr"]

                if r.human_impact_score <= 10.0 and r.human_impact_score > 0:
                    r.human_impact_score = r.human_impact_score * 10.0
                if not r.priority_level or r.priority_level == "MEDIUM":
                    if r.human_impact_score >= 80:
                        r.priority_level = "CRITICAL"
                    elif r.human_impact_score >= 60:
                        r.priority_level = "HIGH"
                    elif r.human_impact_score >= 30:
                        r.priority_level = "MEDIUM"
                    else:
                        r.priority_level = "LOW"
            db.commit()

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
