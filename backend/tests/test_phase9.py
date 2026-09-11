import pytest
from unittest.mock import MagicMock
from app.services.citizen_service import citizen_service
from app.services.risk_service import risk_service
from app.models.pickup import PickupRequest
from app.models.batch import Batch, Item
from app.models.risk import RiskStatus

def test_citizen_journey_retrieval():
    db = MagicMock()
    pickup = PickupRequest(id=1, citizen_id=1, pr_id="PR-1024")
    batch = Batch(id=10, pickup_request=pickup)
    
    db.query.return_value.filter.return_value.first.side_effect = [pickup, batch]
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
    
    journey = citizen_service.get_pickup_journey(db, citizen_id=1, pickup_id=1)
    assert journey["pickup"].pr_id == "PR-1024"

def test_risk_detection_duplicate_photo():
    db = MagicMock()
    # Mock items with duplicate photo hashes
    item1 = Item(photo_hash="hash123")
    item2 = Item(photo_hash="hash123")
    batch = Batch(items=[item1, item2])
    
    db.query.return_value.filter.return_value.count.return_value = 2
    
    risk_service.detect_anomalies(db, batch)
    assert db.add.call_count >= 1 # RiskFlag added
    
def test_risk_flag_review():
    db = MagicMock()
    flag = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = flag
    
    risk_service.review_risk(db, flag_id=1, new_status=RiskStatus.CLEARED)
    assert flag.status == RiskStatus.CLEARED
    db.commit.assert_called_once()
