import dotenv
from fastapi import FastAPI

from .routers.adhd import router as adhd_router
from .routers.discalculia import router as discalculia_router
from .routers.dysgraphia import router as dysgraphia_router
from .routers.dyslexia import router as dyslexia_router

dotenv.load_dotenv()

app = FastAPI()

app.include_router(adhd_router, prefix="/api/adhd", tags=["adhd"])
app.include_router(dysgraphia_router, prefix="/api/dysgraphia", tags=["dysgraphia"])
app.include_router(dyslexia_router, prefix="/api/dyslexia", tags=["dyslexia"])
app.include_router(discalculia_router, prefix="/api/discalculia", tags=["discalculia"])


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
