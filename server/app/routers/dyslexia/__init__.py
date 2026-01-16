import os
import uuid
import traceback
import tempfile
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from .predict_gemini import GeminiDyslexiaPredictor

router = APIRouter()

tmpdir = tempfile.TemporaryDirectory()
UPLOAD_DIR = os.path.join(tmpdir.name, "uploads/dyslexia")
os.makedirs(UPLOAD_DIR, exist_ok=True)

predictor = None


@router.get("/")
async def get_dyslexia():
    return {"message": "Dyslexia endpoint"}


@router.post("/analyze")
async def analyze_dyslexia(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid file type. Please upload an image file."}
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename or "")[1]
        if not file_extension:
            file_extension = '.jpg'
        filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        print(f"Saving file to: {file_path}")

        # Save uploaded file
        try:
            with open(file_path, "wb") as buffer:
                content = await file.read()
                if not content:
                    return JSONResponse(
                        status_code=400,
                        content={"error": "Empty file received"}
                    )
                buffer.write(content)
            print(f"File saved successfully. Size: {len(content)} bytes")
        except Exception as save_error:
            print(f"Error saving file: {save_error}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to save file: {str(save_error)}"}
            )

        # Process file
        print("Starting analysis...")
        result = await process_file(file_path)

        if result is None:
            print("Analysis returned None")
            return JSONResponse(
                status_code=500,
                content={"error": "Failed to analyze handwriting sample. Please check server logs."},
            )

        print("Analysis completed successfully")
        return {
            "file_id": file_id,
            "filename": filename,
            "analysis": result.model_dump(),
            "status": "completed",
        }

    except Exception as e:
        print(f"Error in analyze_dyslexia: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500, 
            content={"error": f"Failed to process file: {str(e)}"}
        )


async def process_file(file_path: str):
    global predictor
    try:
        if not predictor:
            print("Initializing GeminiDyslexiaPredictor...")
            predictor = GeminiDyslexiaPredictor()
            print("Predictor initialized successfully")
        
        result = await predictor.predict(file_path)
        return result
    except Exception as e:
        print(f"Error in process_file: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return None