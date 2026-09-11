import hashlib
import hmac
import uuid
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import IdempotencyKey
from app.services.whatsapp_service import CONVERSATION_STATES, whatsapp_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_conversation_states():
    CONVERSATION_STATES.clear()

def test_whatsapp_webhook_verification():
    # Setup test verify token
    original_token = settings.WHATSAPP_VERIFY_TOKEN
    settings.WHATSAPP_VERIFY_TOKEN = "test_verify_token"

    # Successful verification
    response = client.get(
        "/api/v1/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test_verify_token&hub.challenge=test_challenge"
    )
    assert response.status_code == 200
    assert response.text == "test_challenge"

    # Failed verification (verify token mismatch)
    response = client.get(
        "/api/v1/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge"
    )
    assert response.status_code == 403

    # Reset
    settings.WHATSAPP_VERIFY_TOKEN = original_token

def test_whatsapp_webhook_signature_verification():
    # Setup test app secret
    original_secret = settings.WHATSAPP_APP_SECRET
    settings.WHATSAPP_APP_SECRET = "test_app_secret"

    payload = b'{"test": "payload"}'
    
    # Valid Signature
    sig = hmac.new(b"test_app_secret", payload, hashlib.sha256).hexdigest()
    headers = {"X-Hub-Signature-256": f"sha256={sig}"}
    
    # We patch process_incoming_webhook so it doesn't try to access database / process
    with patch("app.services.whatsapp_service.whatsapp_service.process_incoming_webhook", return_value=True):
        response = client.post(
            "/api/v1/integrations/whatsapp/webhook",
            content=payload,
            headers=headers
        )
        assert response.status_code == 200

    # Invalid Signature
    headers = {"X-Hub-Signature-256": "sha256=invalid_signature"}
    response = client.post(
        "/api/v1/integrations/whatsapp/webhook",
        content=payload,
        headers=headers
    )
    assert response.status_code == 401

    # Reset
    settings.WHATSAPP_APP_SECRET = original_secret

def test_whatsapp_idempotency_and_conversation_flow():
    db = MagicMock()
    # Mocking that user doesn't exist initially, then exists
    user_email = "919999999999@whatsapp.reloop.org"
    user = User(id=123, email=user_email, role=UserRole.CITIZEN)

    def mock_query(model):
        q = MagicMock()
        if model == IdempotencyKey:
            q.filter.return_value.first.return_value = None # Message never processed before
        elif model == User:
            q.filter.return_value.first.return_value = user # User always exists
        elif model == PickupRequest:
            q.filter.return_value.first.return_value = MagicMock(id=1, pr_id="PR-1024")
        return q

    db.query.side_effect = mock_query

    # Mock sequences for PR-ID creation
    db.execute.return_value.scalar.return_value = 1024

    webhook_payload = {
        "entry": [{
            "changes": [{
                "value": {
                    "messages": [{
                        "id": "wamid.12345",
                        "from": "919999999999",
                        "type": "text",
                        "text": {"body": "hello"}
                    }]
                }
            }]
        }]
    }

    # First incoming hello message
    with patch.object(whatsapp_service.client, "_send_request", return_value=True) as mock_send:
        with patch.object(whatsapp_service, "verify_webhook_signature", return_value=True):
            success = whatsapp_service.process_incoming_webhook(db, webhook_payload)
            assert success is True
            assert mock_send.call_count == 1 # Sends buttons for English/Hindi selection
            assert CONVERSATION_STATES["919999999999"]["step"] == "AWAITING_LANGUAGE"

    # Second incoming selection (lang_en)
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["id"] = "wamid.12346"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["type"] = "interactive"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["interactive"] = {
        "type": "button_reply",
        "button_reply": {"id": "lang_en"}
    }
    with patch.object(whatsapp_service.client, "_send_request", return_value=True) as mock_send:
        with patch.object(whatsapp_service, "verify_webhook_signature", return_value=True):
            success = whatsapp_service.process_incoming_webhook(db, webhook_payload)
            assert success is True
            assert mock_send.call_count == 1 # Sends description request
            assert CONVERSATION_STATES["919999999999"]["step"] == "AWAITING_DESCRIPTION"

    # Third incoming description
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["id"] = "wamid.12347"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["type"] = "text"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["text"] = {"body": "1 laptop, 2 phones"}
    with patch.object(whatsapp_service.client, "_send_request", return_value=True) as mock_send:
        with patch.object(whatsapp_service, "verify_webhook_signature", return_value=True):
            success = whatsapp_service.process_incoming_webhook(db, webhook_payload)
            assert success is True
            assert mock_send.call_count == 1 # Sends photo request
            assert CONVERSATION_STATES["919999999999"]["step"] == "AWAITING_PHOTO"

    # Fourth incoming photo (mock image type payload)
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["id"] = "wamid.12348"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["type"] = "image"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["image"] = {"id": "media_id_777"}
    with patch.object(whatsapp_service.client, "_send_request", return_value=True) as mock_send:
        with patch.object(whatsapp_service, "verify_webhook_signature", return_value=True):
            success = whatsapp_service.process_incoming_webhook(db, webhook_payload)
            assert success is True
            assert mock_send.call_count == 1 # Sends GPS request
            assert CONVERSATION_STATES["919999999999"]["step"] == "AWAITING_LOCATION"

    # Fifth incoming GPS location
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["id"] = "wamid.12349"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["type"] = "location"
    webhook_payload["entry"][0]["changes"][0]["value"]["messages"][0]["location"] = {"latitude": 12.9716, "longitude": 77.5946}
    with patch.object(whatsapp_service.client, "_send_request", return_value=True) as mock_send:
        with patch.object(whatsapp_service, "verify_webhook_signature", return_value=True):
            success = whatsapp_service.process_incoming_webhook(db, webhook_payload)
            assert success is True
            assert mock_send.call_count == 1 # Sends confirm/cancel buttons
            assert CONVERSATION_STATES["919999999999"]["step"] == "AWAITING_CONFIRMATION"
