import pytest
import uuid
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import Batch, Item
from app.models.event import EventType
from app.services.workflow_service import workflow_service
from app.services.batch_service import batch_service

def test_workflow_valid_transitions():
    # REQUESTED -> ASSIGNED
    workflow_service.validate_transition(PickupStatus.REQUESTED, PickupStatus.ASSIGNED)
    # ASSIGNED -> COLLECTED
    workflow_service.validate_transition(PickupStatus.ASSIGNED, PickupStatus.COLLECTED)
    # COLLECTED -> AGGREGATOR_RECEIVED
    workflow_service.validate_transition(PickupStatus.COLLECTED, "AGGREGATOR_RECEIVED")

def test_workflow_invalid_transitions():
    # REQUESTED -> COLLECTED (invalid, must be ASSIGNED first)
    with pytest.raises(HTTPException) as excinfo:
        workflow_service.validate_transition(PickupStatus.REQUESTED, PickupStatus.COLLECTED)
    assert excinfo.value.status_code == 409

def test_event_logging():
    db = MagicMock()
    event = workflow_service.log_event(
        db,
        item_or_batch_id=1,
        event_type=EventType.COLLECTION_CREATED,
        actor_id=1,
        actor_role="COLLECTOR"
    )
    assert event.event_type == EventType.COLLECTION_CREATED
    assert event.actor_role == "COLLECTOR"
    db.add.assert_called_once()

def test_collection_creates_events():
    db = MagicMock()
    pickup = PickupRequest(id=1, pr_id="PR-1024", collector_id=3, status=PickupStatus.ASSIGNED, latitude=12.0, longitude=77.0)
    
    db.query.return_value.filter.return_value.first.side_effect = [
        None,  # Idempotency check
        pickup,  # PickupRequest fetch
    ]
    db.execute.return_value.scalar.side_effect = [71, 1] # Batch and Item IDs

    client_tx_id = str(uuid.uuid4())
    items = [{
        "category": "Mobile",
        "declared_weight": 1.5,
        "latitude": 12.0,
        "longitude": 77.0,
        "hazard_status": "swollen_battery"
    }]

    batch = batch_service.create_collection_and_batch(
        db,
        collector_id=3,
        pickup_request_id=1,
        client_transaction_id=client_tx_id,
        items_data=items
    )

    # Verify transition
    assert pickup.status == PickupStatus.COLLECTED
    
    # Verify events (COLLECTION_CREATED and HAZARD_REPORTED)
    # db.add is called for: batch, item, event1, event2, idempotency_key
    assert db.add.call_count == 5
