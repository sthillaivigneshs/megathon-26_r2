from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.pickup import PickupRequest, PickupStatus
from app.models.user import User

class PickupService:
    @staticmethod
    def create_pickup(db: Session, citizen_id: int, latitude: float, longitude: float, description: str = None, photo_url: str = None) -> PickupRequest:
        # Validate GPS range on backend (authoritative)
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            raise ValueError("Invalid GPS coordinates")

        # E-Waste verification check if photo or description provided
        check_input = photo_url or description
        if check_input:
            from app.services.vision_verification_service import vision_service
            res = vision_service.classify_image(check_input)
            if res.decision == "REJECT":
                raise ValueError(f"Pickup request rejected: Item is not classified as e-waste ({res.reason})")

        # Concurrency-safe sequence retrieval
        next_val = db.execute(text("SELECT nextval('pickup_request_seq')")).scalar()
        pr_id = f"PR-{next_val:04d}"

        pickup = PickupRequest(
            pr_id=pr_id,
            citizen_id=citizen_id,
            status=PickupStatus.REQUESTED,
            latitude=latitude,
            longitude=longitude,
            description=description
        )
        db.add(pickup)
        db.commit()
        db.refresh(pickup)
        return pickup

    @staticmethod
    def assign_pickup(db: Session, pickup_id: int, collector_id: int) -> PickupRequest:
        # Validate collector identity
        collector = db.query(User).filter(User.id == collector_id).first()
        if not collector or collector.role.value != "COLLECTOR":
            raise ValueError("Invalid collector identity")

        pickup = db.query(PickupRequest).filter(PickupRequest.id == pickup_id).first()
        if not pickup:
            raise ValueError("Pickup request not found")

        # Strict state transitions validation
        if pickup.status != PickupStatus.REQUESTED:
            raise ValueError("Invalid state transition")

        pickup.collector_id = collector_id
        pickup.status = PickupStatus.ASSIGNED
        db.commit()
        db.refresh(pickup)
        return pickup

pickup_service = PickupService()
