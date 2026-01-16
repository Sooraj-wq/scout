from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_discalculia():
    return {"message": "Discalculia endpoint"}
