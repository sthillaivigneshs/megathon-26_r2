import pytest
from unittest.mock import MagicMock
from app.models.reward import RewardTransaction, RewardType, Redemption, RedemptionStatus
from app.services.reward_service import reward_service
from fastapi import HTTPException

def test_wallet_balance_and_upi_redemption():
    db = MagicMock()

    # User starts with 500 earned points, 0 redemptions
    tx = RewardTransaction(id=1, user_id=10, batch_id=1, transaction_type=RewardType.COLLECTION, amount=500.0)
    
    # Query returns transactions then redemptions
    db.query.return_value.filter.return_value.all.side_effect = [
        [tx],  # transactions
        [],    # redemptions
        [tx],  # transactions for redemption check
        [],    # redemptions for redemption check
    ]

    balance = reward_service.get_wallet_balance(db, 10)
    assert balance == 500.0

    # Request redemption via UPI
    redemption = reward_service.request_redemption(db, user_id=10, amount=200.0, upi_id="user@upi")
    assert redemption.amount == 200.0
    assert redemption.upi_id == "user@upi"
    assert redemption.status == RedemptionStatus.COMPLETED
    assert redemption.payment_reference.startswith("UPI-PAY-")
    assert db.add.called
    assert db.commit.called

def test_redemption_insufficient_funds():
    db = MagicMock()
    # User has 100 points
    tx = RewardTransaction(id=1, user_id=10, batch_id=1, transaction_type=RewardType.COLLECTION, amount=100.0)
    db.query.return_value.filter.return_value.all.side_effect = [
        [tx], # transactions
        []    # redemptions
    ]

    with pytest.raises(HTTPException) as exc:
        reward_service.request_redemption(db, user_id=10, amount=250.0, upi_id="user@upi")
    assert exc.value.status_code == 400
    assert "Insufficient funds" in exc.value.detail
