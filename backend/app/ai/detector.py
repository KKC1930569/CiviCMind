"""
CivicMind AI Detector Interface
================================
Clean, modular computer-vision service interface for the AI team.
Wraps the loaded trained YOLOv8 model and returns structured detection results.
"""

import io
import os
from pathlib import Path
from typing import Dict, Any, Union, Optional, List
from PIL import Image

from app.config import settings
from app.services.ai.yolo_service import yolo_service, YOLODetectionItem, CLASS_CATEGORY_MAP
from app.services.ai.interface import (
    AIDetectionResponse,
    BoundingBox,
    AccessibilityFeatureDetection,
    BBoxDict
)

# Dynamic Model Path Resolution via pathlib (No hardcoded Windows/OS paths)
CURRENT_FILE = Path(__file__).resolve()
# CURRENT_FILE: .../backend/app/ai/detector.py
# parents[0]: .../backend/app/ai
# parents[1]: .../backend/app
# parents[2]: .../backend
APP_MODELS_PATH = CURRENT_FILE.parents[1] / "models" / "best.pt"
BACKEND_MODELS_PATH = CURRENT_FILE.parents[2] / "models" / "best.pt"

def resolve_model_path() -> Optional[Path]:
    """
    Dynamically resolve the YOLO best.pt weights file path across
    both local environments (Windows/macOS/Linux) and Render deployment.
    
    Candidate search priority:
    1. YOLO_MODEL_PATH environment variable (if explicitly set and file exists)
    2. backend/app/models/best.pt (application models directory)
    3. backend/models/best.pt (backend models directory)
    4. settings.BASE_DIR / "app" / "models" / "best.pt"
    5. settings.BASE_DIR / "models" / "best.pt"
    """
    env_path = os.getenv("YOLO_MODEL_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists() and p.is_file():
            return p.resolve()

    candidates = [
        APP_MODELS_PATH,
        BACKEND_MODELS_PATH,
        settings.BASE_DIR / "app" / "models" / "best.pt",
        settings.BASE_DIR / "models" / "best.pt",
    ]

    for cand in candidates:
        resolved = cand.resolve() if cand.is_absolute() else cand
        if resolved.exists() and resolved.is_file():
            return resolved

    return None

MODEL_PATH: Optional[Path] = resolve_model_path()

def detect_issue(
    image: Union[str, Path, bytes, Any],
    confidence_threshold: Optional[float] = None
) -> Dict[str, Any]:
    """
    Modular detector function.
    
    Accepts an image path (str or Path), raw bytes, or a PIL Image,
    and runs real YOLO inference using the model loaded in memory.
    
    Returns structured data:
    {
        "issue_type": "pothole",
        "defect": "pothole",
        "category": "POTHOLE",
        "confidence": 0.5967,
        "detections": [...],
        "severity": "HIGH",
        "severity_score": 68,
        "severity_reasons": [...],
        "status": "success",
        "success": True,
        "message": "AI detected 7 defect(s)..."
    }
    """
    # Ensure model is initialized
    if not yolo_service._is_initialized or yolo_service.model is None:
        yolo_service.initialize()
        
    if yolo_service.model is None:
        return {
            "issue_type": "unknown",
            "defect": None,
            "category": "OTHER",
            "confidence": 0.0,
            "detections": [],
            "severity": "LOW",
            "severity_score": 10,
            "severity_reasons": ["AI model weights are currently unavailable."],
            "status": "model_unavailable",
            "success": False,
            "message": "AI model weights could not be loaded. Trained weights 'best.pt' must be supplied."
        }
        
    # Support Path, str, bytes, PIL.Image
    source_to_predict = image
    img_w, img_h = 640, 640

    if isinstance(image, (str, Path)):
        p = Path(image)
        if not p.exists() or not p.is_file():
            return {
                "issue_type": "none",
                "defect": None,
                "category": "OTHER",
                "confidence": 0.0,
                "detections": [],
                "severity": "LOW",
                "severity_score": 0,
                "severity_reasons": ["Image file not found on disk."],
                "status": "file_not_found",
                "success": False,
                "message": f"Image file not found at: {image}"
            }
        source_to_predict = str(p)
        try:
            with Image.open(str(p)) as img:
                img_w, img_h = img.size
        except Exception:
            img_w, img_h = 640, 640
    elif isinstance(image, bytes):
        try:
            img = Image.open(io.BytesIO(image))
            img_w, img_h = img.size
            source_to_predict = img
        except Exception as e:
            return {
                "issue_type": "error",
                "defect": None,
                "category": "OTHER",
                "confidence": 0.0,
                "detections": [],
                "severity": "LOW",
                "severity_score": 0,
                "severity_reasons": ["Invalid image bytes."],
                "status": "invalid_bytes",
                "success": False,
                "message": f"Could not decode image bytes: {str(e)}"
            }
    elif hasattr(image, "size"):  # PIL Image
        img_w, img_h = image.size
        source_to_predict = image

    threshold = confidence_threshold or yolo_service.model.overrides.get("conf", 0.25)
    
    try:
        results = yolo_service.model.predict(
            source=source_to_predict,
            conf=threshold,
            device=yolo_service.device,
            verbose=False
        )
    except Exception as e:
        return {
            "issue_type": "error",
            "defect": None,
            "category": "OTHER",
            "confidence": 0.0,
            "detections": [],
            "severity": "LOW",
            "severity_score": 0,
            "severity_reasons": [f"YOLO prediction error: {str(e)}"],
            "status": "error",
            "success": False,
            "message": f"YOLO prediction error: {str(e)}"
        }

    raw_boxes = results[0].boxes if len(results) > 0 else []
    detections: List[Dict[str, Any]] = []
    max_area_ratio = 0.0

    for b in raw_boxes:
        cls_id = int(b.cls[0].item())
        class_name = yolo_service.class_names.get(cls_id, f"class_{cls_id}")
        conf = float(b.conf[0].item())
        coords = [float(x.item()) for x in b.xyxy[0]]
        x1, y1, x2, y2 = coords[0], coords[1], coords[2], coords[3]

        box_w = max(0.0, x2 - x1)
        box_h = max(0.0, y2 - y1)
        box_area = box_w * box_h
        total_img_area = max(1.0, float(img_w * img_h))
        area_ratio = round(box_area / total_img_area, 4)
        if area_ratio > max_area_ratio:
            max_area_ratio = area_ratio

        detections.append({
            "class_name": class_name,
            "confidence": round(conf, 4),
            "bbox": {
                "x1": round(x1, 1),
                "y1": round(y1, 1),
                "x2": round(x2, 1),
                "y2": round(y2, 1)
            },
            "area_ratio": area_ratio
        })

    if not detections:
        return {
            "issue_type": "none",
            "defect": None,
            "category": "OTHER",
            "confidence": 0.0,
            "detections": [],
            "severity": "LOW",
            "severity_score": 10,
            "severity_reasons": ["No infrastructure defect detected above confidence threshold."],
            "status": "no_detection",
            "success": True,
            "message": "No infrastructure defect detected above confidence threshold."
        }

    primary_det = max(detections, key=lambda d: d["confidence"])
    primary_defect = primary_det["class_name"]
    primary_confidence = primary_det["confidence"]
    mapped_category = CLASS_CATEGORY_MAP.get(primary_defect.lower(), "OTHER")

    det_items = [
        YOLODetectionItem(
            class_name=d["class_name"],
            confidence=d["confidence"],
            bbox=BBoxDict(**d["bbox"]),
            area_ratio=d["area_ratio"]
        ) for d in detections
    ]

    total_score, sev_level, reasons = yolo_service.calculate_severity(
        primary_defect=primary_defect,
        confidence=primary_confidence,
        detections=det_items,
        max_area_ratio=max_area_ratio
    )

    return {
        "issue_type": primary_defect,
        "defect": primary_defect,
        "category": mapped_category,
        "confidence": round(primary_confidence, 4),
        "detections": detections,
        "severity": sev_level,
        "severity_score": total_score,
        "severity_reasons": reasons,
        "image_width": img_w,
        "image_height": img_h,
        "status": "success",
        "success": True,
        "message": f"AI detected {len(detections)} defect(s): primary '{primary_defect}' with {primary_confidence*100:.1f}% confidence."
    }

def detect_issue_response(
    image: Union[str, Path, bytes, Any],
    confidence_threshold: Optional[float] = None
) -> AIDetectionResponse:
    """
    Convenience wrapper around detect_issue() that returns a strongly-typed
    AIDetectionResponse object conforming to the API contract.
    """
    raw = detect_issue(image, confidence_threshold=confidence_threshold)
    
    det_items = [
        YOLODetectionItem(
            class_name=d["class_name"],
            confidence=d["confidence"],
            bbox=BBoxDict(**d["bbox"]),
            area_ratio=d.get("area_ratio")
        ) for d in raw.get("detections", [])
    ]
    
    bboxes = [
        BoundingBox(
            x_min=d["bbox"]["x1"],
            y_min=d["bbox"]["y1"],
            x_max=d["bbox"]["x2"],
            y_max=d["bbox"]["y2"],
            label=d["class_name"],
            confidence=d["confidence"]
        ) for d in raw.get("detections", [])
    ]
    
    accessibility_features = []
    defect = raw.get("defect")
    if defect in ["pothole", "alligator_crack", "transverse_crack"]:
        accessibility_features.append(AccessibilityFeatureDetection(
            feature_type="pavement_surface_hazard",
            is_barrier=True,
            confidence=raw.get("confidence", 0.9),
            notes=f"{defect.replace('_', ' ').capitalize()} presents high tripping and wheelchair entrapment risk"
        ))

    return AIDetectionResponse(
        success=raw.get("success", False),
        category=raw.get("category", "OTHER"),
        defect=raw.get("defect"),
        confidence=raw.get("confidence", 0.0),
        severity=raw.get("severity", "LOW"),
        severity_score=raw.get("severity_score", 10),
        severity_reasons=raw.get("severity_reasons", []),
        image_width=raw.get("image_width"),
        image_height=raw.get("image_height"),
        detections=det_items,
        bounding_boxes=bboxes,
        accessibility_features=accessibility_features,
        message=raw.get("message")
    )
