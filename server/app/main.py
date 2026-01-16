import dotenv
from fastapi import FastAPI
<<<<<<< HEAD

from .routers.adhd import router as adhd_router
from .routers.discalculia import router as discalculia_router
=======
from fastapi.middleware.cors import CORSMiddleware
from .routers.adhd.router import router as adhd_router
>>>>>>> cf5ecb5 (Added ADHD Module)
from .routers.dysgraphia import router as dysgraphia_router
from .routers.dyslexia import router as dyslexia_router

dotenv.load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(adhd_router, tags=["adhd"])
app.include_router(dysgraphia_router, prefix="/api/dysgraphia", tags=["dysgraphia"])
app.include_router(dyslexia_router, prefix="/api/dyslexia", tags=["dyslexia"])
app.include_router(discalculia_router, prefix="/api/discalculia", tags=["discalculia"])


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
