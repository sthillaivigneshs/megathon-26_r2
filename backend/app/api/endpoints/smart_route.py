from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.models.user import User
from app.services.trust_score_service import trust_score_service
from app.services.smart_route_service import smart_route_service
from app.api.endpoints.pickups import get_db

router = APIRouter()

@router.get("/trust/{user_id}")
def get_trust_score(user_id: int, db=Depends(get_db)):
    return {"user_id": user_id, "score": trust_score_service.calculate_score(db, user_id)}

@router.post("/routes/recommend")
def recommend_route(batch_id: int, db=Depends(get_db)):
    return smart_route_service.recommend_destination(db, batch_id)
