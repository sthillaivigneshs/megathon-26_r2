import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.vision_verification_service import vision_service
from app.services.pickup_service import pickup_service
from app.models.pickup import PickupRequest

client = TestClient(app)

def test_ai_positive_classification():
    positive_samples = [
        "old broken laptop",
        "samsung mobile phone",
        "dell display monitor",
        "usb keyboard",
        "phone charger and power adapter",
        "lithium battery pack",
        "motherboard pcb circuit"
    ]
    for sample in positive_samples:
        res = vision_service.classify_image(sample)
        assert res.is_ewaste is True, f"Failed for positive: {sample}"
        assert res.decision == "ACCEPT", f"Expected ACCEPT for: {sample}"
        assert res.confidence >= 0.75

def test_ai_negative_classification():
    negative_samples = [
        "empty plastic bottle",
        "half eaten apple fruit",
        "cotton clothing t-shirt",
        "wooden table furniture",
        "paper cardboard packaging"
    ]
    for sample in negative_samples:
        res = vision_service.classify_image(sample)
        assert res.is_ewaste is False, f"Failed for negative: {sample}"
        assert res.decision == "REJECT", f"Expected REJECT for: {sample}"

def test_ai_low_confidence_classification():
    low_conf_samples = [
        "blurry image of something dark",
        "unclear low_confidence shadow",
        "partial unknown object"
    ]
    for sample in low_conf_samples:
        res = vision_service.classify_image(sample)
        assert res.decision == "MANUAL_REVIEW"
        assert res.confidence < 0.75

def test_pickup_creation_gating():
    db = MagicMock()
    db.execute.return_value.scalar.return_value = 5001

    # 1. Non-e-waste should be rejected
    with pytest.raises(ValueError, match="not classified as e-waste"):
        pickup_service.create_pickup(
            db, citizen_id=1, latitude=12.9716, longitude=77.5946,
            description="plastic water bottle"
        )

    # 2. Valid e-waste should be allowed
    pickup = pickup_service.create_pickup(
        db, citizen_id=1, latitude=12.9716, longitude=77.5946,
        description="broken laptop and cables"
    )
    assert pickup.pr_id == "PR-5001"
    assert "laptop" in pickup.description

def test_vision_verify_image_endpoint():
    # Test through API endpoint with auth
    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": "citizen@demo.com", "password": "password"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify laptop
    res = client.post(
        "/api/v1/vision/verify-image",
        headers=headers,
        json={"image": "dell laptop"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["isEwaste"] is True
    assert data["decision"] == "ACCEPT"
    assert "Laptop" in data["item"]
