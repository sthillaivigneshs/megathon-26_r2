import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.models.user import User
from app.models.reward import RewardType, RedemptionStatus
from app.services.reward_service import reward_service

def test_reward_calculation_and_idempotency():
    db = MagicMock()
    # Mock no existing reward
    db.query.return_value.filter.return_value.first.return_value = None
    
    # Calculate reward
    reward = reward_service.calculate_and_add_reward(
        db, user_id=1, batch_id=10, amount=100.0, r_type=RewardType.COLLECTION, desc="Collection reward"
    )
    
    assert reward.amount == 100.0
    assert db.add.call_count == 2 # 1 for RewardTransaction, WorkflowService.log_event adds another Event

    # Simulate existing reward for idempotency check
    db.query.return_value.filter.return_value.first.return_value = reward
    duplicate = reward_service.calculate_and_add_reward(
        db, user_id=1, batch_id=10, amount=100.0, r_type=RewardType.COLLECTION, desc="Collection reward"
    )
    assert duplicate.id == reward.id

def test_wallet_balance_calculation():
    db = MagicMock()
    # Mock transactions and redemptions
    t1 = MagicMock(amount=100.0)
    t2 = MagicMock(amount=50.0)
    r1 = MagicMock(amount=30.0)
    
    db.query.return_value.filter.return_value.all.side_effect = [[t1, t2], [r1]]
    
    balance = reward_service.get_wallet_balance(db, user_id=1)
    assert balance == 120.0 # (100 + 50) - 30

def test_redemption_insufficient_funds():
    db = MagicMock()
    # Balance 120
    t1 = MagicMock(amount=100.0)
    db.query.return_value.filter.return_value.all.side_effect = [[t1], []]
    
    with pytest.raises(HTTPException) as excinfo:
        reward_service.request_redemption(db, user_id=1, amount=200.0)
    assert excinfo.value.status_code == 400
