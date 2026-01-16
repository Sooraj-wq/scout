from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.dyscalculia import router as dyscalculia_router

app = FastAPI(title="AI-Samasya Learning Screening Tools")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dyscalculia_router)


@app.get("/")
async def root():
    return {"message": "AI-Samasya Learning Screening Tools API"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
