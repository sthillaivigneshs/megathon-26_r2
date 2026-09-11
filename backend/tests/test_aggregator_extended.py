import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(username, password="password"):
    res = client.post("/api/v1/auth/login", data={"username": username, "password": password})
    return res.json()["access_token"]

def test_aggregator_dashboard_and_inventory_access():
    aggregator_token = get_token("aggregator@demo.com")
    headers = {"Authorization": f"Bearer {aggregator_token}"}

    # 1. Aggregator Dashboard stats
    dash_res = client.get("/api/v1/aggregator/dashboard", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "incoming_batches_count" in data
    assert "in_hub_batches_count" in data
    assert "total_inventory_kg" in data

    # 2. Aggregator Inventory list
    inv_res = client.get("/api/v1/aggregator/inventory", headers=headers)
    assert inv_res.status_code == 200
    assert isinstance(inv_res.json(), list)

    # 3. Aggregator Incoming batches
    inc_res = client.get("/api/v1/aggregator/incoming", headers=headers)
    assert inc_res.status_code == 200
    assert isinstance(inc_res.json(), list)

def test_aggregator_endpoints_unauthorized_for_citizen():
    citizen_token = get_token("citizen@demo.com")
    headers = {"Authorization": f"Bearer {citizen_token}"}

    # Citizen cannot access aggregator dashboard
    res1 = client.get("/api/v1/aggregator/dashboard", headers=headers)
    assert res1.status_code == 403

    # Citizen cannot access aggregator inventory
    res2 = client.get("/api/v1/aggregator/inventory", headers=headers)
    assert res2.status_code == 403

    # Citizen cannot access aggregator incoming
    res3 = client.get("/api/v1/aggregator/incoming", headers=headers)
    assert res3.status_code == 403
