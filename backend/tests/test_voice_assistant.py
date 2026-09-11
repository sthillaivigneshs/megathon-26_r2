import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.core.config import settings
from app.services.voice_assistant_service import (
    voice_assistant_service,
    DemoVoiceProvider,
    LocalVoiceProvider,
    GeminiVoiceProvider
)
from app.schemas.voice import VoiceCommandResponse, VoiceItem

client = TestClient(app)

def get_token(username="collector@demo.com", password="password"):
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    assert res.status_code == 200, f"Login failed: {res.text}"
    return res.json()["access_token"]

def test_demo_voice_english_collection():
    provider = DemoVoiceProvider()
    res = provider.parse_command("Collect 3 laptops")
    assert res.intent == "create_collection"
    assert len(res.items) == 1
    assert res.items[0].category == "Laptop"
    assert res.items[0].quantity == 3
    assert res.confidence >= 0.90
    assert "Recorded 3 Laptop" in res.spoken_feedback

def test_demo_voice_english_with_weight():
    provider = DemoVoiceProvider()
    res = provider.parse_command("Collected 2 phones weighing 4 kilograms")
    assert res.intent == "create_collection"
    assert len(res.items) == 1
    assert res.items[0].category == "Mobile"
    assert res.items[0].quantity == 2
    assert res.total_weight_kg == 4.0
    assert res.items[0].declared_weight == 4.0

def test_demo_voice_hindi_hinglish_collection():
    provider = DemoVoiceProvider()
    res = provider.parse_command("3 laptop collect kiya hai")
    assert res.intent == "create_collection"
    assert res.language == "hi"
    assert len(res.items) == 1
    assert res.items[0].category == "Laptop"
    assert res.items[0].quantity == 3
    assert "दर्ज किया गया" in res.spoken_feedback

def test_demo_voice_hindi_weight():
    provider = DemoVoiceProvider()
    res = provider.parse_command("Weight 12 kilo hai")
    assert res.intent == "update_weight"
    assert res.total_weight_kg == 12.0
    assert res.language == "hi"

def test_demo_voice_hazard_swollen_battery():
    provider = DemoVoiceProvider()
    res1 = provider.parse_command("The battery is swollen")
    assert res1.intent == "report_hazard"
    assert res1.hazard_status == "swollen_battery"

    res2 = provider.parse_command("Battery swollen hai")
    assert res2.intent == "report_hazard"
    assert res2.hazard_status == "swollen_battery"

def test_demo_voice_hazard_leaking():
    provider = DemoVoiceProvider()
    res = provider.parse_command("The battery is leaking")
    assert res.intent == "report_hazard"
    assert res.hazard_status == "leakage"

def test_demo_voice_confirmation_safety():
    provider = DemoVoiceProvider()
    # 1. "Save this collection" must require explicit confirmation
    res_save = provider.parse_command("Save this collection")
    assert res_save.intent == "save_collection"
    assert res_save.requires_confirmation is True
    assert "Do you want me to save" in res_save.spoken_feedback

    # 2. Hindi save command also requires confirmation
    res_save_hi = provider.parse_command("Is collection ko save karo")
    assert res_save_hi.intent == "save_collection"
    assert res_save_hi.requires_confirmation is True

    # 3. Explicit "Yes" or "Confirm" marks confirmation complete
    res_confirmed = provider.parse_command("Yes")
    assert res_confirmed.intent == "save_collection"
    assert res_confirmed.requires_confirmation is False

def test_demo_voice_cancel():
    provider = DemoVoiceProvider()
    res = provider.parse_command("Cancel")
    assert res.intent == "cancel"
    assert res.requires_confirmation is False
    assert "cancelled" in res.spoken_feedback.lower()

def test_demo_voice_sync_commands():
    provider = DemoVoiceProvider()
    res_retry = provider.parse_command("Retry sync")
    assert res_retry.intent == "retry_sync"

    res_queue = provider.parse_command("Sync pending collections")
    assert res_queue.intent == "sync_queue"

def test_local_voice_provider():
    provider = LocalVoiceProvider()
    res = provider.parse_command("Collect 1 printer")
    assert res.intent == "create_collection"
    assert res.provider == "local"
    assert res.items[0].category == "Printer"

def test_gemini_provider_missing_api_key():
    provider = GeminiVoiceProvider()
    provider.api_key = None
    with pytest.raises(ValueError, match="GEMINI_API_KEY is not configured"):
        provider.parse_command("Collect 2 phones")

def test_gemini_provider_with_key():
    provider = GeminiVoiceProvider()
    provider.api_key = "fake_test_key"
    res = provider.parse_command("Collect 2 phones")
    assert res.intent == "create_collection"
    assert res.provider == "gemini"

def test_audio_empty_and_oversized():
    # Empty audio
    res_empty = voice_assistant_service.parse_audio_command(b"", "audio/wav")
    assert res_empty.intent == "unknown"
    assert res_empty.confidence == 0.0

    # Oversized audio (> 10MB)
    oversized = b"0" * (11 * 1024 * 1024)
    with pytest.raises(ValueError, match="exceeds maximum allowed size"):
        voice_assistant_service.parse_audio_command(oversized, "audio/wav")

def test_unsupported_audio_mime():
    with pytest.raises(ValueError, match="Unsupported audio MIME type"):
        voice_assistant_service.parse_audio_command(b"test audio data", "audio/flac")

def test_api_parse_command_unauthenticated():
    res = client.post("/api/v1/voice/parse-command", json={"command_text": "Collect 1 laptop"})
    assert res.status_code == 401

def test_api_parse_command_authenticated():
    token = get_token("collector@demo.com")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/voice/parse-command",
        headers=headers,
        json={"command_text": "Collect 3 laptops"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "create_collection"
    assert data["items"][0]["category"] == "Laptop"
    assert data["items"][0]["quantity"] == 3
    assert data["confidence"] >= 0.90

def test_api_parse_command_base64_audio():
    token = get_token("collector@demo.com")
    headers = {"Authorization": f"Bearer {token}"}
    import base64

    audio_bytes = "Collect 2 phones weighing 1 kg".encode("utf-8")
    b64_str = base64.b64encode(audio_bytes).decode("utf-8")

    res = client.post(
        "/api/v1/voice/parse-command",
        headers=headers,
        json={"audio_base64": b64_str, "mime_type": "audio/wav"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "create_collection"
    assert data["items"][0]["category"] == "Mobile"
    assert data["items"][0]["quantity"] == 2

def test_voice_service_does_not_mutate_database():
    """Verify that calling the voice endpoint never directly writes to batches, items, or pickups."""
    token = get_token("collector@demo.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch initial pickups count
    res_pickups = client.get("/api/v1/pickups/collector/assigned", headers=headers)
    initial_assigned = len(res_pickups.json())

    # Voice command attempting to save
    res = client.post(
        "/api/v1/voice/parse-command",
        headers=headers,
        json={"command_text": "Save this collection"}
    )
    assert res.status_code == 200

    # Assigned pickups must remain unchanged
    res_after = client.get("/api/v1/pickups/collector/assigned", headers=headers)
    assert len(res_after.json()) == initial_assigned
