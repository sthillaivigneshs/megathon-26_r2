import pytest
import uuid
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import Batch, Item, IdempotencyKey
from app.services.pickup_service import pickup_service
from app.services.batch_service import batch_service

def test_pickup_creation_gps_validation():
    db = MagicMock()
    # Mocking postgres sequence
    db.execute.return_value.scalar.return_value = 1024

    # Valid GPS
    pickup = pickup_service.create_pickup(db, citizen_id=1, latitude=12.9716, longitude=77.5946)
    assert pickup.pr_id == "PR-1024"
    assert pickup.status == PickupStatus.REQUESTED

    # Invalid GPS
    with pytest.raises(ValueError):
        pickup_service.create_pickup(db, citizen_id=1, latitude=95.0, longitude=77.5946)

def test_collector_assignment_unauthorized():
    db = MagicMock()
    
    # Non-collector assignment should fail
    non_collector = User(id=2, role=UserRole.CITIZEN)
    db.query.return_value.filter.return_value.first.return_value = non_collector
    
    with pytest.raises(ValueError, match="Invalid collector identity"):
        pickup_service.assign_pickup(db, pickup_id=1, collector_id=2)

def test_collection_idempotency_and_state_transition():
    db = MagicMock()
    
    # Set up mocks for verification
    pickup = PickupRequest(id=1, pr_id="PR-1024", collector_id=3, status=PickupStatus.ASSIGNED)
    
    # 1. Mock first call (not processed yet)
    db.query.return_value.filter.return_value.first.side_effect = [
        None,  # IdempotencyKey check -> None
        pickup,  # PickupRequest fetch -> pickup
    ]
    db.execute.return_value.scalar.side_effect = [71, 1]  # Batch CB-ID and Item RL-ID

    client_tx_id = str(uuid.uuid4())
    items = [{
        "category": "Mobile",
        "declared_weight": 1.5,
        "latitude": 12.9716,
        "longitude": 77.5946
    }]

    batch = batch_service.create_collection_and_batch(
        db,
        collector_id=3,
        pickup_request_id=1,
        client_transaction_id=client_tx_id,
        items_data=items
    )

    assert batch.cb_id == "CB-00071"
    assert pickup.status == PickupStatus.COLLECTED

    # 2. Mock second call (should trigger idempotency return)
    idemp_key = IdempotencyKey(client_transaction_id=uuid.UUID(client_tx_id), resource_id=batch.id)
    db.query.return_value.filter.return_value.first.side_effect = [
        idemp_key,  # IdempotencyKey check -> key exists
        batch,  # Batch fetch -> returns same batch
    ]

    duplicate_batch = batch_service.create_collection_and_batch(
        db,
        collector_id=3,
        pickup_request_id=1,
        client_transaction_id=client_tx_id,
        items_data=items
    )
    assert duplicate_batch.id == batch.id

def test_unauthorized_collector_access():
    db = MagicMock()
    pickup = PickupRequest(id=1, pr_id="PR-1024", collector_id=4, status=PickupStatus.ASSIGNED)
    db.query.return_value.filter.return_value.first.side_effect = [
        None,
        pickup
    ]

    # Collector 3 attempting to collect Collector 4's pickup
    with pytest.raises(ValueError, match="Unauthorized operation"):
        batch_service.create_collection_and_batch(
            db,
            collector_id=3,
            pickup_request_id=1,
            client_transaction_id=str(uuid.uuid4()),
            items_data=[]
        )
