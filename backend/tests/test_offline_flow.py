import pytest
import uuid
from unittest.mock import MagicMock
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import Batch, Item, IdempotencyKey
from app.models.event import Event, EventType
from app.services.batch_service import batch_service

def test_offline_sync_lifecycle_and_idempotency():
    """
    Mandatory Section 32 Offline Test:
    Simulates Collector creating a collection offline with a client_transaction_id (UUID),
    queuing items, photos, GPS, weight, and synchronizing once connectivity is restored.
    Ensures server ACK and prevents duplicate events on retry.
    """
    db = MagicMock()
    collector_id = 10
    pickup_id = 100
    client_tx_id = str(uuid.uuid4())

    pickup = PickupRequest(
        id=pickup_id,
        pr_id="PR-1024",
        collector_id=collector_id,
        status=PickupStatus.ASSIGNED
    )

    # 1. First sync attempt (Network restored)
    db.query.return_value.filter.return_value.first.side_effect = [
        None,   # IdempotencyKey -> Not yet present
        pickup, # PickupRequest -> ASSIGNED
    ]
    db.execute.return_value.scalar.side_effect = [71, 1, 2] # Batch CB-00071, RL-000001, RL-000002

    offline_items = [
        {
            "category": "Laptop",
            "declared_weight": 2.8,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "condition": "Used",
            "photo_url": "https://storage.reloop.org/photos/laptop.jpg",
            "photo_hash": "a1b2c3d4e5f6",
            "hazard_status": "no_hazard"
        },
        {
            "category": "Mobile",
            "declared_weight": 0.4,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "condition": "Damaged",
            "photo_url": "https://storage.reloop.org/photos/phone.jpg",
            "photo_hash": "f6e5d4c3b2a1",
            "hazard_status": "swollen_battery"
        }
    ]

    batch = batch_service.create_collection_and_batch(
        db,
        collector_id=collector_id,
        pickup_request_id=pickup_id,
        client_transaction_id=client_tx_id,
        items_data=offline_items
    )

    # Verification of first synchronization
    assert batch.cb_id == "CB-00071"
    assert pickup.status == PickupStatus.COLLECTED
    assert db.commit.called

    # 2. Network retry / re-send with same client_transaction_id (Idempotent replay)
    existing_idemp = IdempotencyKey(
        client_transaction_id=uuid.UUID(client_tx_id),
        resource_id=batch.id
    )
    db.query.return_value.filter.return_value.first.side_effect = [
        existing_idemp, # IdempotencyKey found!
        batch           # Returns existing batch directly without re-executing state transitions
    ]

    initial_commit_count = db.commit.call_count

    duplicate_batch = batch_service.create_collection_and_batch(
        db,
        collector_id=collector_id,
        pickup_request_id=pickup_id,
        client_transaction_id=client_tx_id,
        items_data=offline_items
    )

    # Server returns same resource ID without creating duplicates or duplicate events
    assert duplicate_batch.id == batch.id
    assert duplicate_batch.cb_id == batch.cb_id
    # Ensure no new commit was executed during idempotent duplicate replay
    assert db.commit.call_count == initial_commit_count
