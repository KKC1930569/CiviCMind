import os
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
from PIL import Image

from app.config import settings
from app.services.ai.interface import (
    BaseAIAnalysisService,
    AIDetectionResponse,
    BoundingBox,
    AccessibilityFeatureDetection,
    YOLODetectionItem,
    BBoxDict
)

logger = logging.getLogger(__name__)

# Defect class mapping to CivicMind standard categories
CLASS_CATEGORY_MAP: Dict[str, str] = {
    "pothole": "POTHOLE",
    "longitudinal_crack": "ROAD_DAMAGE",
    "transverse_crack": "ROAD_DAMAGE",
    "alligator_crack": "ROAD_DAMAGE",
    "damaged_traffic_light": "SIGNAGE",
    "water_leak": "ROAD_DAMAGE",
}

# Base defect impact score (0 - 40 points)
DEFECT_BASE_IMPACT: Dict[str, int] = {
    "pothole": 35,              # Direct vehicular and pedestrian impact
    "alligator_crack": 30,       # Severe multi-directional structural degradation
    "damaged_traffic_light": 38, # Critical intersection safety hazard
    "water_leak": 28,            # Undermining subgrade and pavement subsidence
    "transverse_crack": 22,      # Perpendicular structural crack across roadway
    "longitudinal_crack": 18,    # Seam separation along travel corridor
}

class YOLOAnalysisService(BaseAIAnalysisService):
    """
    Production YOLO inference service for CivicMind.
    Loads the trained model once during application startup and keeps it in memory.
    """

    def __init__(self):
        self.model = None
        self.class_names: Dict[int, str] = {}
        self.model_path: Optional[str] = None
        self.device: str = "cpu"
        self._is_initialized = False

    def initialize(self):
        """
        Loads the trained YOLO model into memory once.
        Checks configured model path and fallbacks.
        """
        if self._is_initialized and self.model is not None:
            return

        import torch
        from ultralytics import YOLO

        # Select hardware accelerator
        if torch.cuda.is_available():
            self.device = "cuda"
            logger.info("[YOLO] CUDA GPU detected - running inference on GPU")
        else:
            self.device = "cpu"
            logger.info("[YOLO] CUDA GPU not detected - running inference on CPU")

        # Resolve model path dynamically without hardcoded OS paths
        candidate_paths: List[Path] = []
        
        env_model_path = os.getenv("YOLO_MODEL_PATH")
        if env_model_path:
            candidate_paths.append(Path(env_model_path))

        current_file = Path(__file__).resolve()
        # current_file: .../backend/app/services/ai/yolo_service.py
        # parents[2] is .../backend/app, parents[3] is .../backend
        app_models_path = current_file.parents[2] / "models" / "best.pt"
        backend_models_path = current_file.parents[3] / "models" / "best.pt"

        candidate_paths.extend([
            app_models_path,
            backend_models_path,
            settings.BASE_DIR / "app" / "models" / "best.pt",
            settings.BASE_DIR / "models" / "best.pt",
            Path(settings.YOLO_MODEL_PATH),
        ])

        # Deduplicate paths while preserving priority order
        unique_candidates: List[Path] = []
        for cand in candidate_paths:
            resolved_c = cand.resolve() if cand.is_absolute() else cand
            if resolved_c not in unique_candidates:
                unique_candidates.append(resolved_c)

        resolved_path = None
        for cand in unique_candidates:
            if cand.exists() and cand.is_file():
                resolved_path = cand
                break

        if not resolved_path:
            logger.warning(
                f"[YOLO] Trained model weights not found at candidate paths: {[str(p) for p in unique_candidates]}. "
                f"YOLO inference will return explicit 'model_unavailable' status. "
                f"Trained weights 'best.pt' must be supplied."
            )
            self._is_initialized = True
            self.model = None
            return

        logger.info(f"[YOLO] Loading trained weights from: {resolved_path}")
        try:
            self.model = YOLO(str(resolved_path))
            # Extract actual class names from the model metadata
            self.class_names = dict(self.model.names) if hasattr(self.model, "names") else {}
            self.model_path = str(resolved_path)
            self._is_initialized = True
            logger.info(
                f"[YOLO] Model successfully loaded into memory! "
                f"Path: {resolved_path} | Classes ({len(self.class_names)}): {self.class_names}"
            )
        except Exception as e:
            logger.error(f"[YOLO] Failed to load YOLO model: {e}", exc_info=True)
            self.model = None

    def calculate_severity(
        self,
        primary_defect: str,
        confidence: float,
        detections: List[YOLODetectionItem],
        max_area_ratio: float,
    ) -> Tuple[int, str, List[str]]:
        """
        Calculates explainable defect severity based on measurable YOLO detections:
        - Defect type impact (0-40)
        - Affected image area ratio (0-25)
        - AI Detection confidence (0-20)
        - Multi-defect compounding (0-15)

        Returns: (severity_score: 0-100, severity_level: LOW|MEDIUM|HIGH|CRITICAL, reasons)
        """
        reasons: List[str] = []

        # 1. Defect Type Base Impact (0 - 40)
        base_impact = DEFECT_BASE_IMPACT.get(primary_defect.lower(), 20)
        reasons.append(f"Defect type '{primary_defect}' contributes {base_impact}/40 structural hazard points")

        # 2. Affected Area Coverage (0 - 25)
        # Ratio of bounding box pixels to total image pixels
        if max_area_ratio >= 0.20:
            area_points = 25
            reasons.append(f"Significant affected area ({max_area_ratio*100:.1f}% of image) indicating large-scale defect (25/25 pts)")
        elif max_area_ratio >= 0.10:
            area_points = 18
            reasons.append(f"Moderate surface coverage ({max_area_ratio*100:.1f}% of image) (18/25 pts)")
        elif max_area_ratio >= 0.04:
            area_points = 12
            reasons.append(f"Localized defect area ({max_area_ratio*100:.1f}% of image) (12/25 pts)")
        else:
            area_points = 6
            reasons.append(f"Minor focal defect ({max_area_ratio*100:.1f}% of image) (6/25 pts)")

        # 3. Detection Confidence Factor (0 - 20)
        conf_points = int(round(confidence * 20))
        reasons.append(f"AI detection confidence {confidence*100:.1f}% ({conf_points}/20 pts)")

        # 4. Multi-defect compounding factor (0 - 15)
        defect_count = len(detections)
        if defect_count >= 4:
            count_points = 15
            reasons.append(f"Multiple clustered defects detected ({defect_count} count) compounding degradation (+15 pts)")
        elif defect_count >= 2:
            count_points = 10
            reasons.append(f"Multiple defects detected ({defect_count} count) (+10 pts)")
        else:
            count_points = 0

        # Total 0 - 100
        total_score = min(100, max(0, base_impact + area_points + conf_points + count_points))

        if total_score >= 70:
            sev_level = "CRITICAL"
        elif total_score >= 50:
            sev_level = "HIGH"
        elif total_score >= 30:
            sev_level = "MEDIUM"
        else:
            sev_level = "LOW"

        return total_score, sev_level, reasons

    async def analyze_image(
        self,
        file_path: str,
        confidence_threshold: Optional[float] = None
    ) -> AIDetectionResponse:
        """
        Runs real YOLO inference on an uploaded infrastructure image.
        Returns real bounding boxes, confidence, defect classification, and severity.
        """
        # Ensure model is initialized
        if not self._is_initialized or self.model is None:
            self.initialize()

        if self.model is None:
            logger.warning("[YOLO] Model not available for inference, returning fallback response")
            return AIDetectionResponse(
                success=False,
                category="OTHER",
                defect=None,
                confidence=0.0,
                severity="LOW",
                severity_score=10,
                message="AI model weights are currently loading or unavailable.",
                bounding_boxes=[],
                detections=[]
            )

        threshold = confidence_threshold or settings.YOLO_CONFIDENCE_THRESHOLD
        p = Path(file_path)
        if not p.exists() or not p.is_file():
            return AIDetectionResponse(
                success=False,
                category="OTHER",
                defect=None,
                confidence=0.0,
                severity="LOW",
                severity_score=0,
                message="Specified image file does not exist on disk.",
                bounding_boxes=[],
                detections=[]
            )

        # Read image dimensions
        try:
            with Image.open(str(p)) as img:
                img_w, img_h = img.size
        except Exception as e:
            logger.warning(f"[YOLO] Could not read image dimensions: {e}")
            img_w, img_h = 640, 640

        # Run YOLO prediction
        try:
            results = self.model.predict(
                source=str(p),
                conf=threshold,
                device=self.device,
                verbose=False
            )
        except Exception as e:
            logger.error(f"[YOLO] Prediction error: {e}", exc_info=True)
            return AIDetectionResponse(
                success=False,
                category="OTHER",
                defect=None,
                confidence=0.0,
                severity="LOW",
                severity_score=0,
                message=f"YOLO inference failed: {str(e)}",
                bounding_boxes=[],
                detections=[]
            )

        raw_boxes = results[0].boxes if len(results) > 0 else []
        detections: List[YOLODetectionItem] = []
        bounding_boxes: List[BoundingBox] = []
        max_area_ratio = 0.0

        for b in raw_boxes:
            cls_id = int(b.cls[0].item())
            class_name = self.class_names.get(cls_id, f"class_{cls_id}")
            conf = float(b.conf[0].item())
            coords = [float(x.item()) for x in b.xyxy[0]]
            x1, y1, x2, y2 = coords[0], coords[1], coords[2], coords[3]

            # Calculate box area ratio
            box_w = max(0.0, x2 - x1)
            box_h = max(0.0, y2 - y1)
            box_area = box_w * box_h
            total_img_area = max(1.0, float(img_w * img_h))
            area_ratio = round(box_area / total_img_area, 4)
            if area_ratio > max_area_ratio:
                max_area_ratio = area_ratio

            detection_item = YOLODetectionItem(
                class_name=class_name,
                confidence=round(conf, 4),
                bbox=BBoxDict(
                    x1=round(x1, 1),
                    y1=round(y1, 1),
                    x2=round(x2, 1),
                    y2=round(y2, 1)
                ),
                area_ratio=area_ratio
            )
            detections.append(detection_item)

            bounding_boxes.append(BoundingBox(
                x_min=round(x1, 1),
                y_min=round(y1, 1),
                x_max=round(x2, 1),
                y_max=round(y2, 1),
                label=class_name,
                confidence=round(conf, 4)
            ))

        # Handle case when no detections pass the threshold
        if not detections:
            return AIDetectionResponse(
                success=True,
                category="OTHER",
                defect=None,
                confidence=0.0,
                severity="LOW",
                severity_score=10,
                severity_reasons=["No infrastructure defect was detected above confidence threshold."],
                image_width=img_w,
                image_height=img_h,
                detections=[],
                bounding_boxes=[],
                accessibility_features=[],
                message="No infrastructure defect was confidently detected. Please upload a clearer image."
            )

        # Determine dominant / primary defect (highest confidence)
        primary_det = max(detections, key=lambda d: d.confidence)
        primary_defect = primary_det.class_name
        primary_confidence = primary_det.confidence
        mapped_category = CLASS_CATEGORY_MAP.get(primary_defect.lower(), "OTHER")

        # Calculate severity with transparent explainable formula
        sev_score, sev_level, sev_reasons = self.calculate_severity(
            primary_defect=primary_defect,
            confidence=primary_confidence,
            detections=detections,
            max_area_ratio=max_area_ratio
        )

        # Accessibility feature deduction
        accessibility_features: List[AccessibilityFeatureDetection] = []
        if primary_defect in ["pothole", "alligator_crack", "transverse_crack"]:
            accessibility_features.append(AccessibilityFeatureDetection(
                feature_type="pavement_surface_hazard",
                is_barrier=True,
                confidence=primary_confidence,
                notes=f"{primary_defect.replace('_', ' ').capitalize()} presents high tripping and wheelchair entrapment risk"
            ))

        return AIDetectionResponse(
            success=True,
            category=mapped_category,
            defect=primary_defect,
            confidence=round(primary_confidence, 4),
            severity=sev_level,
            severity_score=sev_score,
            severity_reasons=sev_reasons,
            image_width=img_w,
            image_height=img_h,
            detections=detections,
            bounding_boxes=bounding_boxes,
            accessibility_features=accessibility_features,
            message=f"AI detected {len(detections)} defect(s): primary '{primary_defect}' with {primary_confidence*100:.1f}% confidence."
        )

# Global singleton service instance
yolo_service = YOLOAnalysisService()
