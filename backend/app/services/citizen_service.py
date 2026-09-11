from sqlalchemy.orm import Session
from app.models.pickup import PickupRequest
from app.models.batch import Batch, Item
from app.models.event import Event
from app.models.reward import RewardTransaction
from sqlalchemy import desc

class CitizenService:
    @staticmethod
    def get_citizen_pickups(db: Session, citizen_id: int):
        return db.query(PickupRequest).filter(PickupRequest.citizen_id == citizen_id).all()

    @staticmethod
    def get_pickup_journey(db: Session, citizen_id: int, pickup_id: int):
        pickup = db.query(PickupRequest).filter(
            PickupRequest.id == pickup_id, PickupRequest.citizen_id == citizen_id
        ).first()
        if not pickup:
            raise ValueError("Pickup not found or unauthorized")
        
        batch = db.query(Batch).filter(Batch.pickup_request_id == pickup_id).first()
        if not batch:
            return {"pickup": pickup, "events": []}
            
        events = db.query(Event).filter(Event.item_or_batch_id == batch.id).order_by(Event.timestamp).all()
        return {"pickup": pickup, "events": events}

    @staticmethod
    def get_impact_receipt(db: Session, citizen_id: int):
        pickups = db.query(PickupRequest).filter(PickupRequest.citizen_id == citizen_id).all()
        
        receipts = []
        for pickup in pickups:
            batch = db.query(Batch).filter(Batch.pickup_request_id == pickup.id).first()
            if not batch:
                continue
                
            rewards = db.query(RewardTransaction).filter(RewardTransaction.batch_id == batch.id).all()
            
            # Determine pathway from latest event
            from app.models.event import Event
            from sqlalchemy import desc
            last_event = db.query(Event).filter(Event.item_or_batch_id == batch.id).order_by(desc(Event.timestamp)).first()
            pathway = last_event.event_type if last_event else None
            
            receipts.append({
                "pickup_id": pickup.pr_id,
                "items": [
                    {
                        "category": item.category,
                        "declared_weight": item.declared_weight,
                        "verified_weight": item.verified_weight,
                        "received_weight": item.received_weight
                    } for item in batch.items
                ],
                "total_declared_weight": sum(item.declared_weight for item in batch.items),
                "total_verified_weight": sum(item.verified_weight or 0 for item in batch.items),
                "total_received_weight": sum(item.received_weight or 0 for item in batch.items),
                "final_pathway": pathway,
                "rewards_earned": sum(r.amount for r in rewards)
            })
            
        return receipts

citizen_service = CitizenService()
