import pytest
import uuid
from unittest.mock import MagicMock
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.services.gateway_service import gateway_service

def test_gateway_conversation_full_flow():
    db = MagicMock()
    # Mock sequence for PR-ID
    db.execute.return_value.scalar.return_value = 2048

    # Existing user mock
    user = User(id=42, email="user99@whatsapp.reloop.org", role=UserRole.CITIZEN)
    db.query.return_value.filter.return_value.first.return_value = user

    sender_id = f"test_user_{uuid.uuid4().hex[:6]}"

    # 1. Start / Menu
    res1 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="text", text_content="hello"
    )
    assert res1["state"] == "AWAITING_LANGUAGE"
    assert len(res1["buttons"]) >= 2

    # 2. Language selection
    res2 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="text", text_content="lang_en"
    )
    assert res2["state"] == "AWAITING_DESCRIPTION"

    # 3. Description
    res3 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="text", text_content="2 laptops and 3 smartphones"
    )
    assert res3["state"] == "AWAITING_PHOTO"

    # 4. Valid Photo
    res4 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="image", photo_url_or_id="laptop_and_phone_photo"
    )
    assert res4["state"] == "AWAITING_LOCATION"
    assert "AI Verification Success" in res4["text"]

    # 5. Location
    res5 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="location", location=(12.9716, 77.5946)
    )
    assert res5["state"] == "AWAITING_CONFIRMATION"

    # 6. Confirm Pickup
    res6 = gateway_service.handle_inbound_message(
        db, channel="whatsapp", sender_id=sender_id, msg_type="text", text_content="yes confirm"
    )
    assert res6["state"] == "COMPLETED"
    assert res6["pickup_id"] == "PR-2048"

def test_gateway_rejection_for_non_ewaste():
    db = MagicMock()
    user = User(id=42, email="user99@whatsapp.reloop.org", role=UserRole.CITIZEN)
    db.query.return_value.filter.return_value.first.return_value = user

    sender_id = f"test_user_neg_{uuid.uuid4().hex[:6]}"

    # Move to photo step
    gateway_service.handle_inbound_message(db, "telegram", sender_id, "text", "/start")
    gateway_service.handle_inbound_message(db, "telegram", sender_id, "text", "English")
    gateway_service.handle_inbound_message(db, "telegram", sender_id, "text", "Household scrap")

    # Send photo of plastic bottle (negative non-e-waste example)
    res = gateway_service.handle_inbound_message(
        db, "telegram", sender_id, "photo", photo_url_or_id="plastic_bottle.jpg"
    )
    assert res.get("error") == "NOT_EWASTE"
    assert "Verification Rejected" in res["text"]
    assert res["state"] == "AWAITING_PHOTO"
