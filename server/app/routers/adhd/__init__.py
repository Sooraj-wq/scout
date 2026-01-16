from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_adhd():
    return {"message": "ADHD endpoint"}
