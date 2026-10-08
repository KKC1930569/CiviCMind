from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    label: str
    confidence: float

class AccessibilityFeatureDetection(BaseModel):
    feature_type: str = Field(..., description="e.g. ramp, stairs, elevator, curb_cut, obstacle")
    is_barrier: bool = Field(True, description="Whether this feature presents a barrier or mobility obstacle")
    confidence: float = 0.90
    notes: Optional[str] = None

class AIDetectionResponse(BaseModel):
    """
    Standardized AI/Computer Vision detection contract for future YOLO integration.
    Allows YOLOv8/v11, DETR, or multimodal vision models to plug into CivicMind
    without modifying core application logic.
    """
    category: str = Field(..., description="Detected category e.g. POTHOLE, ROAD_DAMAGE, SIDEWALK, ACCESSIBILITY")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    severity: str = Field("MEDIUM", description="LOW | MEDIUM | HIGH | CRITICAL")
    bounding_boxes: List[BoundingBox] = Field(default_factory=list)
    accessibility_features: List[AccessibilityFeatureDetection] = Field(default_factory=list)

class BaseAIAnalysisService(ABC):
    """
    Abstract Interface for the AI/CV layer.
    """
    @abstractmethod
    async def analyze_image(self, file_path: str) -> AIDetectionResponse:
        """
        Analyze an infrastructure evidence image.
        :param file_path: Path on disk to the image
        :return: AIDetectionResponse conforming to future YOLO pipeline
        """
        pass
