import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import UserRole

client = TestClient(app)

# Helper to get auth tokens
def get_auth_token(role: UserRole):
    # This requires a real user in the DB. We use the seed data or create temporary users.
    # For E2E in this slice, we'll assume demo users from seed.py exist.
    email = f"{role.value.lower()}@demo.com"
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password"})
    return response.json()["access_token"]

def test_full_e2e_workflow():
    # 1. Citizen Pickup
    citizen_token = get_auth_token(UserRole.CITIZEN)
    pickup_resp = client.post(
        "/api/v1/pickups",
        json={"latitude": 12.97, "longitude": 77.59, "description": "Old laptop"},
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert pickup_resp.status_code == 200
    pickup_id = pickup_resp.json()["id"]

    # 2. Assign to collector (Admin)
    admin_token = get_auth_token(UserRole.ADMIN)
    client.post(f"/api/v1/pickups/{pickup_id}/assign?collector_id=2", headers={"Authorization": f"Bearer {admin_token}"})

    # 3. Collection (Collector)
    collector_token = get_auth_token(UserRole.COLLECTOR)
    tx_id = str(uuid.uuid4())
    collection_resp = client.post(
        "/api/v1/collections/sync",
        json={
            "client_transaction_id": tx_id,
            "pickup_request_id": pickup_id,
            "items": [{"category": "laptop", "declared_weight": 2.0, "latitude": 12.97, "longitude": 77.59}]
        },
        headers={"Authorization": f"Bearer {collector_token}"}
    )
    assert collection_resp.status_code == 200
    batch_id = collection_resp.json()["id"]

    # 4. Aggregator Receive/Verify (Aggregator)
    agg_token = get_auth_token(UserRole.AGGREGATOR)
    client.post(f"/api/v1/batches/{batch_id}/receive", json={"latitude": 12.97, "longitude": 77.59}, headers={"Authorization": f"Bearer {agg_token}"})
    client.post(f"/api/v1/batches/{batch_id}/verify-weight", json={"items": [{"item_id": 1, "verified_weight": 1.9}], "latitude": 12.97, "longitude": 77.59}, headers={"Authorization": f"Bearer {agg_token}"})
    client.post(f"/api/v1/batches/{batch_id}/sort", json={"latitude": 12.97, "longitude": 77.59}, headers={"Authorization": f"Bearer {agg_token}"})

    # 5. Recycler Receive/Process (Recycler)
    rec_token = get_auth_token(UserRole.RECYCLER)
    client.post(f"/api/v1/batches/{batch_id}/recycler-receive", json={"items": [{"item_id": 1, "received_weight": 1.8}], "latitude": 12.97, "longitude": 77.59}, headers={"Authorization": f"Bearer {rec_token}"})
    client.post(f"/api/v1/batches/{batch_id}/process", json={"latitude": 12.97, "longitude": 77.59}, headers={"Authorization": f"Bearer {rec_token}"})

    # 6. Verify Citizen Journey
    journey_resp = client.get(f"/api/v1/citizens/me/pickups/{pickup_id}/journey", headers={"Authorization": f"Bearer {citizen_token}"})
    assert journey_resp.status_code == 200
    assert len(journey_resp.json()["events"]) > 0

    # 7. Verify Compliance Report
    compliance_resp = client.get("/api/v1/compliance/report", headers={"Authorization": f"Bearer {admin_token}"})
    assert compliance_resp.status_code == 200
    assert compliance_resp.json()["processed_count"] > 0
