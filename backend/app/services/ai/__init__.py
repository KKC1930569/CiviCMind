from app.services.ai.interface import (
    BaseAIAnalysisService,
    AIDetectionResponse,
    BoundingBox,
    AccessibilityFeatureDetection,
    YOLODetectionItem,
    BBoxDict,
)
from app.services.ai.yolo_service import YOLOAnalysisService, yolo_service

ai_service = yolo_service

__all__ = [
    "BaseAIAnalysisService",
    "AIDetectionResponse",
    "BoundingBox",
    "AccessibilityFeatureDetection",
    "YOLODetectionItem",
    "BBoxDict",
    "YOLOAnalysisService",
    "yolo_service",
    "ai_service",
]

