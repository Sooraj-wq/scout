import json
import time

from google import genai
from PIL import Image
from pydantic import BaseModel


class PredictionResult(BaseModel):
    confidence: float
    message: str


class GeminiPredictor:
    def __init__(self):
        self.client = genai.Client().aio

    async def predict(
        self, image_path: str, prompt: str | None = None
    ) -> PredictionResult | None:
        if prompt is None:
            prompt = """
            Analyze this handwriting sample for signs of dysgraphia. 
            Please note that children generally have slightly inconsistent handwriting, therefore
            not every case may be a case of dysgraphia. Check for higher inconsistencies.
            Please provide:
            1. A confidence score (0-1) indicating the likelihood of dysgraphia
            2. Specific issues detected (letter formation, spacing, line alignment, etc.)
            3. Severity levels for each issue (mild, moderate, severe)
            4. Recommendations for improvement

            Please avoid:
            1. Annotating your response with any (`) ticks or other formatting.
            
            Return your response in JSON format with the following structure:
            {
                "confidence_score": 0.85,
                "detected_issues": [
                    {"type": "letter_formation", "severity": "moderate"},
                    {"type": "spacing", "severity": "mild"}
                ],
                "recommendations": [
                    "Practice letter formation exercises",
                    "Use lined paper for better alignment"
                ]
            }
            {
                "confidence_score": 0.85,
                "detected_issues": [
                    {"type": "letter_formation", "severity": "moderate"},
                    {"type": "spacing", "severity": "mild"}
                ],
                "recommendations": [
                    "Practice letter formation exercises",
                    "Use lined paper for better alignment"
                ]
            }
            """

        try:
            start_time = time.time()

            image = Image.open(image_path)

            response = await self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[image],
                config=genai.types.GenerateContentConfig(
                    temperature=0.2,
                    top_p=0.2,
                    top_k=20,
                    response_mime_type="application/json",
                    response_schema=PredictionResult,
                    system_instruction=[
                        """Analyze this handwriting sample for signs of dysgraphia. Please note that children generally have slightly inconsistent handwriting, therefore not every case may be a case of dysgraphia. Check for extreme inconsistencies. Also ensure that the confidence is kept low for slight inconsistencies. We're looking for extreme cases."""
                    ],
                ),
            )
            print(response)
            print(response.text)
            processing_time = time.time() - start_time

            result = {
                "raw_response": response.text,
                "processing_time_seconds": processing_time,
                "timestamp": time.time(),
            }

            if not response:
                return None

            try:
                json_response = PredictionResult.model_validate_json(response.text)
                return json_response
                result["analysis"] = json_response
                result["status"] = "success"
            except json.JSONDecodeError:
                result["analysis"] = None
                result["status"] = "raw_text"
                result["error"] = "Response was not valid JSON"

            return None

        except Exception:
            return None
