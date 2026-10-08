import logging
from app.services.ai.interface import BaseAIAnalysisService, AIDetectionResponse

logger = logging.getLogger(__name__)

class PluggableAIService(BaseAIAnalysisService):
    """
    Default pluggable implementation of the AI Analysis Service.
    
    NOTE FOR AI/CV DEVELOPER:
    When attaching your trained YOLO model:
    1. Import ultralytics YOLO
    2. Run inference: results = model.predict(file_path)
    3. Return AIDetectionResponse with detected bounding_boxes and accessibility_features.
    """

    async def analyze_image(self, file_path: str) -> AIDetectionResponse:
        logger.info(f"[AI Integration Stub] Image received for future YOLO pipeline: {file_path}")
        return AIDetectionResponse(
            category="ACCESSIBILITY",
            confidence=0.92,
            severity="HIGH",
            bounding_boxes=[],
            accessibility_features=[]
        )

ai_service = PluggableAIService()
