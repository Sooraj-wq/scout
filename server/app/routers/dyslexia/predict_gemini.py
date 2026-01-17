import json
import time
import os
from google import genai
from PIL import Image
from pydantic import BaseModel


class FactorScores(BaseModel):
    letter_reversals: float
    spacing_inconsistency: float
    baseline_instability: float
    stroke_corrections: float
    letter_inconsistency: float


class WeightedContributions(BaseModel):
    letter_reversals: float
    spacing_inconsistency: float
    baseline_instability: float
    stroke_corrections: float
    letter_inconsistency: float


class DyslexiaAnalysisResult(BaseModel):
    factor_scores: FactorScores
    weighted_contributions: WeightedContributions
    final_risk_score: float
    risk_level: str
    explanation: str


class GeminiDyslexiaPredictor:
    def __init__(self):
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Initialize synchronous client for async wrapper
        self.client = genai.Client(api_key=api_key).aio
        
        self.system_instruction = """
You are an assistive handwriting analysis system.
You are NOT a medical professional and you MUST NOT diagnose dyslexia.
Your task is to analyze handwriting in an image and estimate a
"Dyslexia-Associated Handwriting Risk Score" based on visual patterns only.

You must follow this weighted rubric strictly:

1. Letter reversals (b/d, p/q, n/u, mirror forms)
   Weight: 0.30
2. Inconsistent spacing between letters or words
   Weight: 0.20
3. Baseline instability (words drifting up or down)
   Weight: 0.15
4. Stroke corrections (overwriting, retracing, erasures)
   Weight: 0.20
5. Letter formation inconsistency (same letter drawn differently)
   Weight: 0.15

For each factor:
- Assign a score from 0.0 (not present) to 1.0 (strongly present)
- Multiply by its weight

Then compute:
Final Risk Score = weighted sum (0.0 to 1.0)

Risk Interpretation:
- 0.00 – 0.30 → Low risk
- 0.31 – 0.60 → Moderate risk
- 0.61 – 1.00 → High risk

Be cautious and conservative in your scoring. Not all handwriting variations indicate dyslexia risk.
Children's handwriting naturally varies, so look for consistent, extreme patterns across the sample.

Do NOT mention medical certainty.
Do NOT diagnose dyslexia.
Be cautious, conservative, and explainable.
"""

    async def predict(self, image_path: str) -> DyslexiaAnalysisResult | None:
        try:
            start_time = time.time()
            
            # Open and validate image
            if not os.path.exists(image_path):
                print(f"Error: Image file not found at {image_path}")
                return None
                
            image = Image.open(image_path)
            print(f"Image loaded successfully: {image.size}")

            # Make API call
            response = await self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[image],
                config=genai.types.GenerateContentConfig(
                    temperature=0.2,
                    top_p=0.2,
                    top_k=20,
                    response_mime_type="application/json",
                    response_schema=DyslexiaAnalysisResult,
                    system_instruction=[self.system_instruction],
                ),
            )

            processing_time = time.time() - start_time
            print(f"Response received in {processing_time:.2f}s")
            
            if not response or not response.text:
                print("Error: Empty response from Gemini API")
                return None

            print(f"Raw response: {response.text}")

            # Parse and validate response
            try:
                json_response = DyslexiaAnalysisResult.model_validate_json(
                    response.text
                )
                print("Successfully parsed response")
                return json_response
            except Exception as parse_error:
                print(f"JSON parse error: {parse_error}")
                print(f"Response text: {response.text}")
                return None

        except Exception as e:
            print(f"Prediction error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None


class ReadingAnalysisResult(BaseModel):
    fluency_score: float  # 0-1
    accuracy_score: float # 0-1
    risk_level: str       # Low, Moderate, High
    detected_issues: list[str]
    recommendations: list[str]
    summary: str


class GeminiReadingPredictor:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        self.client = genai.Client(api_key=self.api_key).aio

        self.system_instruction = """
You are an expert Speech-Language Pathologist (SLP) AI assistant.
Your task is to analyze aggregated reading metrics from a web-based fluency test.
The user (a potential student) just read a known text snippet.
You are given:
- WPM (Words Per Minute)
- Accuracy %
- List of missed/mispronounced words
- Language (English or Malayalam)

Your Goal:
Generate a structured JSON assessment of their reading fluency.

Rubric:
- WPM < 60 (for simple text) is concerning.
- Accuracy < 90% is concerning.
- Look for patterns in missed words (e.g., are they complex words, phonetically similar, etc.?)

Output valid JSON only matching the schema.
Do NOT diagnose. Use terms like "potential indicators", "areas for improvement".
For Malayalam, ensure recommendations are culturally relevant if needed (e.g. "Practice Aksharamala").
"""

    async def predict(self, data: dict) -> ReadingAnalysisResult | None:
        try:
            start_time = time.time()
            prompt = f"""
            Analyze this reading session:
            Language: {data.get('language')}
            Text Snippet Read: "{data.get('target_text_snippet')}"
            
            Metrics:
            - WPM: {data.get('wpm')}
            - Accuracy: {data.get('accuracy')}%
            - Missed Words: {json.dumps(data.get('missed_words'))}
            
            Provide a compassionate but analytical summary suitable for a parent or teacher.
            """

            response = await self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt],
                config=genai.types.GenerateContentConfig(
                    temperature=0.3, # Low temp for consistent analysis
                    response_mime_type="application/json",
                    response_schema=ReadingAnalysisResult,
                    system_instruction=self.system_instruction,
                ),
            )
            
            print(f"Reading Analysis took {time.time() - start_time:.2f}s")
            
            if response.text:
                return ReadingAnalysisResult.model_validate_json(response.text)
            return None

        except Exception as e:
            print(f"Gemini Reading Error: {e}")
            import traceback
            traceback.print_exc()
            return None
