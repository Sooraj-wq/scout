import os
import tempfile
import uuid

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

from .predict_gemini import GeminiPredictor, PredictionResult

router = APIRouter()

tmpdir = tempfile.TemporaryDirectory()
UPLOAD_DIR = os.path.join(tmpdir.name, "uploads/dysgraphia")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
async def get_dysgraphia():
    return {"message": "Dysgraphia endpoint"}


@router.post("/analyze")
async def analyze_dysgraphia(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename or "")[1]
        filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        result = await process_file(file_path)

        if result:
            return {
                "status": "success",
                "result": result,
            }
        else:
            return {"status": "failure", "result": None}
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500, content={"error": f"Failed to process file: {str(e)}"}
        )


predictor = None


async def process_file(file_path: str) -> PredictionResult | None:
    global predictor
    if not predictor:
        predictor = GeminiPredictor()

    return await predictor.predict(file_path)
    # file_size = os.path.getsize(file_path)
    #
    # return {
    #     "file_size_bytes": file_size,
    #     "confidence_score": 0.85,
    #     "detected_issues": [
    #         {"type": "letter_formation", "severity": "moderate"},
    #         {"type": "spacing", "severity": "mild"},
    #         {"type": "line_alignment", "severity": "moderate"},
    #     ],
    #     "recommendations": [
    #         "Practice letter formation exercises",
    #         "Use lined paper for better alignment",
    #         "Consider occupational therapy evaluation",
    #     ],
    #     "processing_time_ms": 150,
    # }
