import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class NotificationItem(BaseModel):
    id: str
    user_id: int
    title: str
    message: str
    event_type: str
    created_at: str
    is_read: bool = False

# Thread-safe in-memory notification store
_USER_NOTIFICATIONS: Dict[int, List[NotificationItem]] = {}

class NotificationService:
    @staticmethod
    def send_notification(
        user_id: int,
        title: str,
        message: str,
        event_type: str
    ) -> NotificationItem:
        import uuid
        item = NotificationItem(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            message=message,
            event_type=event_type,
            created_at=datetime.utcnow().isoformat(),
            is_read=False
        )
        if user_id not in _USER_NOTIFICATIONS:
            _USER_NOTIFICATIONS[user_id] = []
        _USER_NOTIFICATIONS[user_id].insert(0, item)
        logger.info(f"Notification sent to user {user_id}: [{event_type}] {title}")
        return item

    @staticmethod
    def get_notifications(user_id: int) -> List[NotificationItem]:
        return _USER_NOTIFICATIONS.get(user_id, [])

    @staticmethod
    def mark_all_read(user_id: int):
        for item in _USER_NOTIFICATIONS.get(user_id, []):
            item.is_read = True

notification_service = NotificationService()
