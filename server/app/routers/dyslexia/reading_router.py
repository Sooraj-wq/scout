from fastapi import APIRouter
from pydantic import BaseModel
from .predict_gemini import GeminiReadingPredictor
import traceback

router = APIRouter()
predictor = GeminiReadingPredictor()

class ReadingTestData(BaseModel):
    wpm: int
    accuracy: float
    missed_words: list[str]
    total_words: int
    duration_seconds: float
    pauses_count: int = 0  # Optional, can be 0 initially
    language: str # 'en' or 'ml'
    target_text_snippet: str

@router.post("/analyze_reading")
async def analyze_reading(data: ReadingTestData):
    try:
        print(f"Received reading data: {data}")
        result = await predictor.predict(data.dict())
        return result
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}
