from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.batch import Batch, Item
from app.models.event import EventType
from app.services.workflow_service import workflow_service
from app.models.user import User

class DownstreamService:
    @staticmethod
    def aggregator_receive(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        # Current state is defined by the status of the related pickup or the items.
        # For simplicity in this vertical slice, we'll assume the batch state follows its items/pickup.
        # However, GEMINI.md says "AGGREGATOR_RECEIVED" is a lifecycle state.
        # We need a status field on Batch as well for clarity, but for now we'll use pickup status as proxy if items are not individually stateful.
        # Wait, GEMINI.md says: REQUESTED -> ASSIGNED -> COLLECTED -> AGGREGATOR_RECEIVED
        # This implies the state lives on the logical collection unit.
        
        workflow_service.validate_transition(batch.pickup_request.status, "AGGREGATOR_RECEIVED")
        
        try:
            batch.pickup_request.status = "AGGREGATOR_RECEIVED"
            workflow_service.log_event(
                db, batch.id, EventType.AGGREGATOR_RECEIVED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def aggregator_verify_weight(db: Session, batch_id: int, items_weights: list[dict], actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "WEIGHT_VERIFIED")

        try:
            for iw in items_weights:
                item = db.query(Item).filter(Item.id == iw["item_id"], Item.batch_id == batch.id).first()
                if item:
                    item.verified_weight = iw["verified_weight"]
            
            batch.pickup_request.status = "WEIGHT_VERIFIED"
            workflow_service.log_event(
                db, batch.id, EventType.WEIGHT_VERIFIED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def aggregator_sort(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "SORTED")

        try:
            batch.pickup_request.status = "SORTED"
            workflow_service.log_event(
                db, batch.id, EventType.SORTED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def recycler_receive(db: Session, batch_id: int, items_weights: list[dict], actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "RECYCLER_RECEIVED")

        try:
            for iw in items_weights:
                item = db.query(Item).filter(Item.id == iw["item_id"], Item.batch_id == batch.id).first()
                if item:
                    item.received_weight = iw["received_weight"]
            
            batch.pickup_request.status = "RECYCLER_RECEIVED"
            workflow_service.log_event(
                db, batch.id, EventType.RECYCLER_RECEIVED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def recycler_process(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "PROCESSED")

        try:
            batch.pickup_request.status = "PROCESSED"
            workflow_service.log_event(
                db, batch.id, EventType.PROCESSING_CONFIRMED, actor.id, actor.role.value, lat, lon
            )
            
            # EPR Gating Logic: Trigger Eligibility and Credit if chain is complete
            # Chain: Collector -> Aggregator -> Recycler -> Processing
            workflow_service.log_event(
                db, batch.id, EventType.EPR_ELIGIBILITY_CREATED, actor.id, actor.role.value, lat, lon
            )
            batch.pickup_request.status = "EPR_ELIGIBLE"
            
            workflow_service.log_event(
                db, batch.id, EventType.EPR_CREDIT_CREATED, actor.id, actor.role.value, lat, lon
            )
            batch.pickup_request.status = "EPR_CREDIT"

            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_aggregator_dashboard(db: Session) -> dict:
        from app.models.pickup import PickupRequest, PickupStatus
        from app.models.batch import Batch, Item

        incoming = db.query(Batch).join(Batch.pickup_request).filter(PickupRequest.status == PickupStatus.COLLECTED).all()
        in_hub = db.query(Batch).join(Batch.pickup_request).filter(
            PickupRequest.status.in_(["AGGREGATOR_RECEIVED", "WEIGHT_VERIFIED", "SORTED"])
        ).all()
        sorted_count = db.query(Batch).join(Batch.pickup_request).filter(PickupRequest.status == "SORTED").count()

        total_weight = 0.0
        for b in in_hub:
            for item in b.items:
                total_weight += (item.verified_weight or item.declared_weight or 0.0)

        return {
            "incoming_batches_count": len(incoming),
            "in_hub_batches_count": len(in_hub),
            "sorted_batches_count": sorted_count,
            "total_inventory_kg": round(total_weight, 2),
            "incoming_batches": [{"id": b.id, "cb_id": b.cb_id, "collector_id": b.collector_id} for b in incoming],
            "in_hub_batches": [{"id": b.id, "cb_id": b.cb_id, "status": b.pickup_request.status} for b in in_hub]
        }

    @staticmethod
    def get_aggregator_inventory(db: Session) -> list:
        from app.models.pickup import PickupRequest
        from app.models.batch import Batch

        batches = db.query(Batch).join(Batch.pickup_request).filter(
            PickupRequest.status.in_(["AGGREGATOR_RECEIVED", "WEIGHT_VERIFIED", "SORTED"])
        ).all()
        return batches

    @staticmethod
    def get_aggregator_incoming(db: Session) -> list:
        from app.models.pickup import PickupRequest, PickupStatus
        from app.models.batch import Batch

        return db.query(Batch).join(Batch.pickup_request).filter(PickupRequest.status == PickupStatus.COLLECTED).all()

    @staticmethod
    def get_recycler_incoming(db: Session) -> list:
        from app.models.pickup import PickupRequest
        from app.models.batch import Batch

        return db.query(Batch).join(Batch.pickup_request).filter(PickupRequest.status == "SORTED").all()

downstream_service = DownstreamService()
