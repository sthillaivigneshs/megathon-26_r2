import pytest
import uuid
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.services.telegram_service import telegram_service

from app.services.gateway_service import GLOBAL_CONVERSATION_STATES

client = TestClient(app)

def _make_test_db():
    """
    Creates a MagicMock db that correctly differentiates between model queries:
    - IdempotencyKey queries return None (no duplicates)
    - User queries return the test user
    - PickupRequest queries return None (no prior pickups)
    """
    from app.models.batch import IdempotencyKey
    db = MagicMock()
    user = User(id=88, email="987654321@telegram.reloop.org", role=UserRole.CITIZEN)

    def query_side_effect(model_cls):
        mock_query = MagicMock()
        if model_cls is IdempotencyKey:
            # No existing idempotency keys — not a duplicate
            mock_query.filter.return_value.first.return_value = None
        elif model_cls is User:
            mock_query.filter.return_value.first.return_value = user
        elif model_cls is PickupRequest:
            mock_query.filter.return_value.order_by.return_value.first.return_value = None
        else:
            mock_query.filter.return_value.first.return_value = None
        return mock_query

    db.query.side_effect = query_side_effect
    db.execute.return_value.scalar.return_value = 3050
    return db, user

def test_telegram_webhook_conversation_flow():
    # Clear conversation state from prior test runs
    GLOBAL_CONVERSATION_STATES.clear()
    db, user = _make_test_db()

    update_id = 991001

    # 1. /start command
    start_payload = {
        "update_id": update_id,
        "message": {
            "message_id": 1,
            "from": {"id": 987654321, "first_name": "Vikram"},
            "chat": {"id": 987654321},
            "text": "/start"
        }
    }
    res1 = telegram_service.process_incoming_update(db, start_payload)
    assert res1["status"] == "success"
    assert "Welcome to ReLoop" in res1["reply"]
    assert res1["state"] == "AWAITING_LANGUAGE"

    # 2. Language selection
    lang_payload = {
        "update_id": update_id + 1,
        "callback_query": {
            "id": "cb1",
            "from": {"id": 987654321, "first_name": "Vikram"},
            "data": "lang_en"
        }
    }
    res2 = telegram_service.process_incoming_update(db, lang_payload)
    assert res2["status"] == "success"
    assert res2["state"] == "AWAITING_DESCRIPTION"

    # 3. Description
    desc_payload = {
        "update_id": update_id + 2,
        "message": {
            "message_id": 2,
            "from": {"id": 987654321, "first_name": "Vikram"},
            "chat": {"id": 987654321},
            "text": "1 laptop, 1 monitor"
        }
    }
    res3 = telegram_service.process_incoming_update(db, desc_payload)
    assert res3["status"] == "success"
    assert res3["state"] == "AWAITING_PHOTO"

    # 4. Photo upload
    photo_payload = {
        "update_id": update_id + 3,
        "message": {
            "message_id": 3,
            "from": {"id": 987654321, "first_name": "Vikram"},
            "chat": {"id": 987654321},
            "photo": [{"file_id": "laptop_photo_file_123"}],
            "caption": "laptop"
        }
    }
    res4 = telegram_service.process_incoming_update(db, photo_payload)
    assert res4["status"] == "success"
    assert res4["state"] == "AWAITING_LOCATION"

    # 5. Location
    loc_payload = {
        "update_id": update_id + 4,
        "message": {
            "message_id": 4,
            "from": {"id": 987654321, "first_name": "Vikram"},
            "chat": {"id": 987654321},
            "location": {"latitude": 12.9716, "longitude": 77.5946}
        }
    }
    res5 = telegram_service.process_incoming_update(db, loc_payload)
    assert res5["status"] == "success"
    assert res5["state"] == "AWAITING_CONFIRMATION"

    # 6. Confirm
    confirm_payload = {
        "update_id": update_id + 5,
        "callback_query": {
            "id": "cb2",
            "from": {"id": 987654321, "first_name": "Vikram"},
            "data": "confirm_yes"
        }
    }
    res6 = telegram_service.process_incoming_update(db, confirm_payload)
    assert res6["status"] == "success"
    assert res6["state"] == "COMPLETED"
    assert res6["pickup_id"] == "PR-3050"

def test_telegram_webhook_endpoint_http():
    GLOBAL_CONVERSATION_STATES.clear()
    import time
    unique_update_id = int(time.time() * 1000)  # Unique to avoid idempotency collision
    payload = {
        "update_id": unique_update_id,
        "message": {
            "message_id": 1,
            "from": {"id": 11223344, "first_name": "Aarav"},
            "chat": {"id": 11223344},
            "text": "/start"
        }
    }
    response = client.post("/api/v1/integrations/telegram/webhook", json=payload)
    assert response.status_code == 200
    # Via the real DB, this should be 'success' for a fresh update_id
    assert response.json()["status"] in ["success", "ignored"]
