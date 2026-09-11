import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import Batch, Item
from app.models.event import EventType
from app.services.downstream_service import downstream_service

def test_aggregator_receive_flow():
    db = MagicMock()
    # Mocking chain: Collector -> Aggregator
    pickup = PickupRequest(id=1, status=PickupStatus.COLLECTED)
    batch = Batch(id=10, pickup_request=pickup)
    
    db.query.return_value.filter.return_value.first.return_value = batch
    actor = User(id=5, role=UserRole.AGGREGATOR)

    # 1. Receive
    downstream_service.aggregator_receive(db, 10, actor)
    assert pickup.status == "AGGREGATOR_RECEIVED"
    
    # 2. Verify Weight
    db.query.return_value.filter.return_value.first.side_effect = [batch, Item(id=1, batch_id=10)]
    downstream_service.aggregator_verify_weight(db, 10, [{"item_id": 1, "verified_weight": 1.4}], actor)
    assert pickup.status == "WEIGHT_VERIFIED"

def test_epr_gating_flow():
    db = MagicMock()
    pickup = PickupRequest(id=1, status="RECYCLER_RECEIVED")
    batch = Batch(id=10, pickup_request=pickup)
    db.query.return_value.filter.return_value.first.return_value = batch
    actor = User(id=6, role=UserRole.RECYCLER)

    # Recycler confirms processing
    downstream_service.recycler_process(db, 10, actor)
    
    # Verify the state machine reached the end of the chain
    assert pickup.status == "EPR_CREDIT"
    
    # Verify events created for the gating chain
    # log_event called for: PROCESSING_CONFIRMED, EPR_ELIGIBILITY_CREATED, EPR_CREDIT_CREATED
    # (Since we mock log_event in the test context or check db.add)
    # Inside the service, we call log_event 3 times in recycler_process
    assert db.add.call_count >= 3

def test_invalid_downstream_transition():
    db = MagicMock()
    # Attempting to process directly from COLLECTED (bypassing Aggregator and Recycler Receipt)
    pickup = PickupRequest(id=1, status=PickupStatus.COLLECTED)
    batch = Batch(id=10, pickup_request=pickup)
    db.query.return_value.filter.return_value.first.return_value = batch
    actor = User(id=6, role=UserRole.RECYCLER)

    with pytest.raises(HTTPException) as excinfo:
        downstream_service.recycler_process(db, 10, actor)
    assert excinfo.value.status_code == 409
