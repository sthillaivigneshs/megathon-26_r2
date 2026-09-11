import pytest
from unittest.mock import MagicMock
from app.services.trust_score_service import trust_score_service
from app.services.smart_route_service import smart_route_service
from app.models.partner import Partner

def test_trust_score_calculation():
    db = MagicMock()
    # Mock return values for verified collections (2) and risk flags (1)
    # Score = 80 + (2 * 2) - (1 * 10) = 80 + 4 - 10 = 74
    db.query.return_value.filter.return_value.count.side_effect = [2, 1]
    
    score = trust_score_service.calculate_score(db, user_id=1)
    assert score == 74.0

def test_smart_route_recommendation():
    db = MagicMock()
    # Mock real partner records
    p1 = Partner(id=101, capacity_score=0.9)
    p2 = Partner(id=102, capacity_score=0.4)
    db.query.return_value.filter.return_value.all.return_value = [p1, p2]
    
    # Test batch 10
    result = smart_route_service.recommend_destination(db, batch_id=10)
    
    assert "partner_id" in result
    assert result["partner_id"] == 101 # p1 has higher capacity_score (0.9 vs 0.4)
