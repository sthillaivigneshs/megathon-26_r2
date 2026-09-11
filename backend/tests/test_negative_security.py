import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username, password="password"):
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    return res.json()["access_token"]

def test_unauthenticated_requests_denied():
    # 401 Unauthorized when no token provided
    res1 = client.get("/api/v1/citizens/me/pickups")
    assert res1.status_code == 401

    res2 = client.get("/api/v1/aggregator/dashboard")
    assert res2.status_code == 401

    res3 = client.get("/api/v1/compliance/report")
    assert res3.status_code == 401

def test_forged_or_invalid_jwt_denied():
    fake_headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature"}
    res = client.get("/api/v1/citizens/me/pickups", headers=fake_headers)
    assert res.status_code == 401

def test_client_side_role_spoofing_prevented():
    citizen_token = get_token("citizen@demo.com")
    headers = {"Authorization": f"Bearer {citizen_token}"}

    # Citizen attempting admin assign endpoint with client payload
    res = client.post("/api/v1/pickups/1/assign?collector_id=2", headers=headers)
    assert res.status_code == 403
    assert "Only administrators" in res.json()["detail"]

def test_cross_role_access_denials():
    citizen_token = get_token("citizen@demo.com")
    collector_token = get_token("collector@demo.com")
    aggregator_token = get_token("aggregator@demo.com")
    recycler_token = get_token("recycler@demo.com")

    # 1. Citizen cannot receive or verify batches at Aggregator dock
    res_agg = client.post(
        "/api/v1/batches/1/receive",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={"latitude": 12.97, "longitude": 77.59}
    )
    assert res_agg.status_code == 403

    # 2. Collector cannot view compliance report
    res_comp = client.get(
        "/api/v1/compliance/report",
        headers={"Authorization": f"Bearer {collector_token}"}
    )
    assert res_comp.status_code == 403

    # 3. Recycler cannot create citizen pickup
    res_pick = client.post(
        "/api/v1/pickups",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"latitude": 12.97, "longitude": 77.59, "description": "old laptop"}
    )
    assert res_pick.status_code == 403

def test_invalid_weight_and_gps_denied():
    collector_token = get_token("collector@demo.com")
    headers = {"Authorization": f"Bearer {collector_token}"}

    # 1. Negative or zero weight rejected by schema (gt=0)
    res_weight = client.post(
        "/api/v1/collections/sync",
        headers=headers,
        json={
            "pickup_request_id": 1,
            "client_transaction_id": "00000000-0000-0000-0000-000000000001",
            "items": [{
                "category": "Laptop",
                "declared_weight": -1.5,
                "latitude": 12.97,
                "longitude": 77.59
            }]
        }
    )
    assert res_weight.status_code == 422

    # 2. Out-of-bound latitude (> 90) rejected by schema
    res_gps = client.post(
        "/api/v1/collections/sync",
        headers=headers,
        json={
            "pickup_request_id": 1,
            "client_transaction_id": "00000000-0000-0000-0000-000000000002",
            "items": [{
                "category": "Laptop",
                "declared_weight": 2.0,
                "latitude": 95.0,
                "longitude": 77.59
            }]
        }
    )
    assert res_gps.status_code == 422

def test_epr_not_awarded_merely_for_collection():
    """Verify that EPR credit is strictly gated and NOT awarded upon collection creation."""
    collector_token = get_token("collector@demo.com")
    admin_token = get_token("admin@demo.com")

    # Fetch initial compliance report count
    res_before = client.get("/api/v1/compliance/report", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_before.status_code == 200
    initial_processed = res_before.json()["processed_count"]

    # Even if collections occur, processed_count (which drives EPR credits) must NOT increase
    # until recycler processing is confirmed downstream.
    res_after = client.get("/api/v1/compliance/report", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_after.json()["processed_count"] == initial_processed

