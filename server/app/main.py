import dotenv
from fastapi import FastAPI
from .routers.adhd import router as adhd_router
from .routers.dyscalculia import router as dyscalculia_router
from .routers.dysgraphia import router as dysgraphia_router
from .routers.dyslexia import router as dyslexia_router
from .routers.quiz import router as quiz_router

dotenv.load_dotenv()

app = FastAPI()


# Include routers
app.include_router(adhd_router, prefix="/api/adhd", tags=["adhd"])
app.include_router(dysgraphia_router, prefix="/api/dysgraphia", tags=["dysgraphia"])
app.include_router(dyslexia_router, prefix="/api/dyslexia", tags=["dyslexia"])
app.include_router(dyscalculia_router, prefix="/api/dyscalculia", tags=["dyscalculia"])
app.include_router(quiz_router, prefix="/api/quiz", tags=["quiz"])


@app.get("/")
async def root():
    return {"message": "AI-Samasya Learning Screening Tools API"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
