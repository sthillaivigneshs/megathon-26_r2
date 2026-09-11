from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.batch import Batch, Item, IdempotencyKey
from app.models.pickup import PickupRequest, PickupStatus
from app.models.event import EventType
from app.services.workflow_service import workflow_service
import uuid

class BatchService:
    @staticmethod
    def create_collection_and_batch(
        db: Session,
        collector_id: int,
        pickup_request_id: int,
        client_transaction_id: str,
        items_data: list[dict],
        parent_batch_id: int = None
    ) -> Batch:
        tx_id = uuid.UUID(client_transaction_id)
        
        # Idempotency check: Return existing resource without duplication of records, events, or batches
        existing_key = db.query(IdempotencyKey).filter(IdempotencyKey.client_transaction_id == tx_id).first()
        if existing_key:
            return db.query(Batch).filter(Batch.id == existing_key.resource_id).first()

        pickup = db.query(PickupRequest).filter(PickupRequest.id == pickup_request_id).first()
        if not pickup:
            raise ValueError("Pickup request not found")

        # Collector authorization verification
        if pickup.collector_id != collector_id:
            raise ValueError("Unauthorized operation: collector not assigned to this pickup")

        # Enforce state transition rules (REQUESTED -> ASSIGNED -> COLLECTED)
        # Using WorkflowService to validate state transition
        workflow_service.validate_transition(pickup.status, PickupStatus.COLLECTED)

        # Atomic transaction boundary: collection, state transition, and event log commit together or fail together.
        try:
            next_cb_val = db.execute(text("SELECT nextval('batch_seq')")).scalar()
            cb_id = f"CB-{next_cb_val:05d}"

            batch = Batch(
                cb_id=cb_id,
                pickup_request_id=pickup_request_id,
                collector_id=collector_id,
                parent_batch_id=parent_batch_id
            )
            db.add(batch)
            db.flush()

            # Insert items and check for hazards
            has_hazards = False
            for item in items_data:
                # Backend-authoritative GPS validation
                lat, lon = item.get("latitude"), item.get("longitude")
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    raise ValueError("Invalid GPS coordinates in collection item")

                next_rl_val = db.execute(text("SELECT nextval('item_seq')")).scalar()
                rl_id = f"RL-{next_rl_val:06d}"

                db_item = Item(
                    rl_id=rl_id,
                    batch_id=batch.id,
                    category=item["category"],
                    subcategory=item.get("subcategory"),
                    quantity=item.get("quantity", 1),
                    declared_weight=item["declared_weight"],
                    verified_weight=None,
                    received_weight=None,
                    condition=item.get("condition"),
                    photo_url=item.get("photo_url"),
                    photo_hash=item.get("photo_hash"),
                    hazard_status=item.get("hazard_status", "no_hazard")
                )
                db.add(db_item)
                
                if db_item.hazard_status != "no_hazard":
                    has_hazards = True

            # Perform state transition
            pickup.status = PickupStatus.COLLECTED

            # Log events to the append-only ledger inside transaction
            workflow_service.log_event(
                db,
                item_or_batch_id=batch.id,
                event_type=EventType.COLLECTION_CREATED,
                actor_id=collector_id,
                actor_role="COLLECTOR",
                latitude=pickup.latitude,
                longitude=pickup.longitude,
                client_transaction_id=tx_id
            )

            if has_hazards:
                workflow_service.log_event(
                    db,
                    item_or_batch_id=batch.id,
                    event_type=EventType.HAZARD_REPORTED,
                    actor_id=collector_id,
                    actor_role="COLLECTOR",
                    latitude=pickup.latitude,
                    longitude=pickup.longitude,
                    client_transaction_id=tx_id
                )

            # Register idempotency key
            idemp_key = IdempotencyKey(
                client_transaction_id=tx_id,
                resource_id=batch.id
            )
            db.add(idemp_key)

            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

batch_service = BatchService()
