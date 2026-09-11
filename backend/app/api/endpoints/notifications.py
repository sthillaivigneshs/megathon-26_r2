from fastapi import APIRouter, Depends
from typing import List
from app.core.deps import get_current_user
from app.models.user import User
from app.services.notification_service import notification_service, NotificationItem

router = APIRouter()

@router.get("/me", response_model=List[NotificationItem])
def get_my_notifications(current_user: User = Depends(get_current_user)):
    return notification_service.get_notifications(current_user.id)

@router.post("/me/read")
def mark_notifications_read(current_user: User = Depends(get_current_user)):
    notification_service.mark_all_read(current_user.id)
    return {"status": "success"}
