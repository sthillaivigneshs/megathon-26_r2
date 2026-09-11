import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username, password="password"):
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    assert res.status_code == 200, f"Login failed for {username}: {res.text}"
    return res.json()["access_token"]

def test_complete_end_to_end_circular_lifecycle():
    """
    Mandatory Section 35 Complete End-To-End Test:
    Executes the entire ReLoop circular lifecycle without manual database editing:
    Citizen (AI verify + pickup) -> Admin (assign) -> Collector (offline collection sync + QR) ->
    Aggregator (receive + scale verify + sort + inventory) -> Smart Route (recommendation) ->
    Recycler (receive + process) -> EPR Credit -> Brand Compliance -> Citizen Waste Journey & Impact Receipt ->
    Rewards/Wallet -> Trust Score.
    """
    # 1. Authenticate all roles
    citizen_token = get_token("citizen@demo.com")
    collector_token = get_token("collector@demo.com")
    aggregator_token = get_token("aggregator@demo.com")
    recycler_token = get_token("recycler@demo.com")
    admin_token = get_token("admin@demo.com")

    # 2. Citizen AI Image Verification
    ai_res = client.post(
        "/api/v1/vision/verify-image",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={"image": "old thinkpad laptop"}
    )
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert ai_data["isEwaste"] is True
    assert ai_data["decision"] == "ACCEPT"

    # 3. Citizen schedules Pickup
    pickup_res = client.post(
        "/api/v1/pickups",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={
            "latitude": 12.9716,
            "longitude": 77.5946,
            "description": "1 old thinkpad laptop with charger"
        }
    )
    assert pickup_res.status_code == 200
    pickup_data = pickup_res.json()
    pickup_id = pickup_data["id"]
    pr_id = pickup_data["pr_id"]
    assert pickup_data["status"] == "REQUESTED"

    # 4. Admin Assigns Pickup to Collector (Collector id 2 in seed)
    # Fetch collector ID
    assign_res = client.post(
        f"/api/v1/pickups/{pickup_id}/assign?collector_id=2",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["status"] == "ASSIGNED"

    # 5. Collector records Collection and Synchronizes Batch
    client_tx_id = str(uuid.uuid4())
    sync_payload = {
        "pickup_request_id": pickup_id,
        "client_transaction_id": client_tx_id,
        "items": [
            {
                "category": "Laptop",
                "declared_weight": 2.5,
                "latitude": 12.9716,
                "longitude": 77.5946,
                "condition": "Non-working",
                "photo_url": "https://storage.reloop.org/laptop.jpg",
                "photo_hash": "abcd1234ef",
                "hazard_status": "no_hazard"
            }
        ]
    }
    sync_res = client.post(
        "/api/v1/collections/sync",
        headers={"Authorization": f"Bearer {collector_token}"},
        json=sync_payload
    )
    assert sync_res.status_code == 200
    batch_data = sync_res.json()
    batch_id = batch_data["id"]
    cb_id = batch_data["cb_id"]
    item_id = batch_data["items"][0]["id"]
    assert cb_id.startswith("CB-")

    # 6. Verify QR Code generation
    qr_res = client.get(
        f"/api/v1/batches/{batch_id}/qr",
        headers={"Authorization": f"Bearer {collector_token}"}
    )
    assert qr_res.status_code == 200
    assert qr_res.headers["content-type"] == "image/png"

    # 7. Aggregator Receives Batch at Dock
    agg_recv_res = client.post(
        f"/api/v1/batches/{batch_id}/receive",
        headers={"Authorization": f"Bearer {aggregator_token}"},
        json={"latitude": 12.9800, "longitude": 77.6000}
    )
    assert agg_recv_res.status_code == 200

    # 8. Aggregator Verifies Weight on Scale
    agg_weight_res = client.post(
        f"/api/v1/batches/{batch_id}/verify-weight",
        headers={"Authorization": f"Bearer {aggregator_token}"},
        json={
            "items": [{"item_id": item_id, "verified_weight": 2.45}],
            "latitude": 12.9800,
            "longitude": 77.6000
        }
    )
    assert agg_weight_res.status_code == 200

    # 9. Aggregator Sorts for Circularity Pathway
    agg_sort_res = client.post(
        f"/api/v1/batches/{batch_id}/sort",
        headers={"Authorization": f"Bearer {aggregator_token}"},
        json={"latitude": 12.9800, "longitude": 77.6000}
    )
    assert agg_sort_res.status_code == 200

    # 10. Aggregator Inventory Check
    inv_res = client.get(
        "/api/v1/aggregator/inventory",
        headers={"Authorization": f"Bearer {aggregator_token}"}
    )
    assert inv_res.status_code == 200

    # 11. Smart Route Recommendation
    route_res = client.post(
        f"/api/v1/routes/recommend?batch_id={batch_id}",
        headers={"Authorization": f"Bearer {aggregator_token}"}
    )
    assert route_res.status_code == 200
    assert "score" in route_res.json()

    # 12. Recycler Receives Batch
    rec_recv_res = client.post(
        f"/api/v1/batches/{batch_id}/recycler-receive",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={
            "items": [{"item_id": item_id, "received_weight": 2.42}],
            "latitude": 13.0100,
            "longitude": 77.6100
        }
    )
    assert rec_recv_res.status_code == 200

    # 13. Recycler Confirms Processing -> Unlocks EPR Eligibility & Credit
    rec_proc_res = client.post(
        f"/api/v1/batches/{batch_id}/process",
        headers={"Authorization": f"Bearer {recycler_token}"},
        json={"latitude": 13.0100, "longitude": 77.6100}
    )
    assert rec_proc_res.status_code == 200

    # 14. Brand / CPCB Compliance Verification
    comp_res = client.get(
        "/api/v1/compliance/report",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["processed_count"] >= 1

    # 15. Citizen Waste Journey and Impact Receipt Verification
    journey_res = client.get(
        f"/api/v1/citizens/me/pickups/{pickup_id}/journey",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert journey_res.status_code == 200
    journey_data = journey_res.json()
    assert len(journey_data["events"]) >= 4

    impact_res = client.get(
        "/api/v1/citizens/me/impact-receipt",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert impact_res.status_code == 200

    # 16. Wallet & UPI Redemption Check
    wallet_res = client.get(
        "/api/v1/rewards/wallet",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert wallet_res.status_code == 200

    # 17. Collector Trust Score Check
    trust_res = client.get(
        "/api/v1/trust/2",
        headers={"Authorization": f"Bearer {collector_token}"}
    )
    assert trust_res.status_code == 200
    assert trust_res.json()["score"] >= 80.0
