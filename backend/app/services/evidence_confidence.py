import hashlib
from typing import Tuple, List, Optional
from pathlib import Path

class EvidenceConfidenceEvaluator:
    """
    Evaluates evidence quality signals:
    - Camera capture vs existing file upload
    - GPS coordinate attachment
    - SHA-256 file hashing
    - Duplicate detection
    - Metadata freshness
    
    IMPORTANT NOTE:
    This is an evidence-quality and telemetry verification signal.
    It is NOT absolute cryptographic proof of authenticity.
    It does NOT directly alter the Human Impact Score.
    """

    @staticmethod
    def calculate_file_hash(file_path: Path) -> str:
        """Computes SHA-256 hash of evidence file."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def evaluate(
        cls,
        file_path: Path,
        is_camera_capture: bool,
        has_gps: bool,
        is_duplicate_hash: bool
    ) -> Tuple[str, float, List[str], str]:
        """
        Returns: (confidence_level, confidence_score, reasons, file_hash)
        confidence_level: HIGH | MEDIUM | LOW
        """
        file_hash = cls.calculate_file_hash(file_path)
        reasons: List[str] = []
        score = 0.50

        if is_duplicate_hash:
            reasons.append("Identical image hash detected across prior submissions (Potential Duplicate)")
            return "LOW", 0.35, reasons, file_hash

        if is_camera_capture:
            score += 0.30
            reasons.append("Real-time device optical sensor capture")
        else:
            reasons.append("Imported from local device media library")

        if has_gps:
            score += 0.20
            reasons.append("Corroborated with active GPS geolocation telemetry")
        else:
            reasons.append("No automated geospatial telemetry coordinates embedded")

        if score >= 0.80:
            level = "HIGH"
        elif score >= 0.50:
            level = "MEDIUM"
        else:
            level = "LOW"

        return level, round(score, 2), reasons, file_hash

evidence_evaluator = EvidenceConfidenceEvaluator()
