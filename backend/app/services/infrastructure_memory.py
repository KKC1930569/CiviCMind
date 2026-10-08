import math
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.report import Report

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in meters.
    """
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class InfrastructureMemoryService:
    @staticmethod
    def query_nearby_cluster(
        db: Session,
        latitude: Optional[float],
        longitude: Optional[float],
        radius_meters: float = 120.0,
        exclude_report_id: Optional[int] = None
    ) -> Tuple[List[Report], int]:
        """
        Locates historical/concurrent reports within spatial proximity radius.
        Returns: (nearby_reports_list, repeat_count)
        """
        if latitude is None or longitude is None:
            return [], 0

        # Approximate bounding box for efficient query filtering (~0.002 degrees ~ 220 meters)
        delta_deg = radius_meters / 111000.0
        query = db.query(Report).filter(
            Report.latitude.isnot(None),
            Report.longitude.isnot(None),
            Report.latitude.between(latitude - delta_deg, latitude + delta_deg),
            Report.longitude.between(longitude - delta_deg, longitude + delta_deg)
        )

        if exclude_report_id:
            query = query.filter(Report.id != exclude_report_id)

        candidates = query.all()
        cluster: List[Report] = []

        for candidate in candidates:
            if candidate.latitude is not None and candidate.longitude is not None:
                dist = haversine_distance_meters(latitude, longitude, candidate.latitude, candidate.longitude)
                if dist <= radius_meters:
                    cluster.append(candidate)

        return cluster, len(cluster)

memory_service = InfrastructureMemoryService()
