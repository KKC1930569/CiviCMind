"""
CivicMind AI Integration Interface Contract
============================================
Standardized contract schemas and base classes for Computer Vision & YOLO models.
"""

from app.services.ai.interface import (
    BoundingBox,
    AccessibilityFeatureDetection,
    BBoxDict,
    YOLODetectionItem,
    AIDetectionResponse,
    BaseAIAnalysisService,
)

__all__ = [
    "BoundingBox",
    "AccessibilityFeatureDetection",
    "BBoxDict",
    "YOLODetectionItem",
    "AIDetectionResponse",
    "BaseAIAnalysisService",
]
