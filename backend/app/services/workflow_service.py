from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.pickup import PickupRequest, PickupStatus
from app.models.event import Event, EventType

class WorkflowService:
    # State transition map enforcing authoritative business rules
    # Keys represent the current state, and values are a list of valid destination states
    VALID_TRANSITIONS = {
        PickupStatus.REQUESTED: [PickupStatus.ASSIGNED],
        PickupStatus.ASSIGNED: [PickupStatus.COLLECTED],
        PickupStatus.COLLECTED: ["AGGREGATOR_RECEIVED"],
        "AGGREGATOR_RECEIVED": ["WEIGHT_VERIFIED"],
        "WEIGHT_VERIFIED": ["SORTED"],
        "SORTED": ["RECYCLER_RECEIVED", "REFURBISHED", "COMPONENT_RECOVERY"],
        "RECYCLER_RECEIVED": ["PROCESSED"],
        "PROCESSED": ["EPR_ELIGIBLE"],
        "EPR_ELIGIBLE": ["EPR_CREDIT"],
    }

    @staticmethod
    def validate_transition(current_status: str, target_status: str):
        allowed = WorkflowService.VALID_TRANSITIONS.get(current_status, [])
        if target_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Invalid state transition: {current_status} -> {target_status}"
            )

    @staticmethod
    def log_event(
        db: Session,
        item_or_batch_id: int,
        event_type: EventType,
        actor_id: int,
        actor_role: str,
        latitude: float = None,
        longitude: float = None,
        metadata_json: str = None,
        client_transaction_id = None
    ) -> Event:
        # Append-only: No delete or update APIs exist for this ledger
        event = Event(
            item_or_batch_id=item_or_batch_id,
            event_type=event_type,
            actor_id=actor_id,
            actor_role=actor_role,
            latitude=latitude,
            longitude=longitude,
            metadata_json=metadata_json,
            client_transaction_id=client_transaction_id
        )
        db.add(event)
        # Flush is called by parent transaction to obtain event ID or let db handle it
        return event

workflow_service = WorkflowService()
