from sqlalchemy.orm import Session
from app.models.partner import Partner, PartnerStatus

class SmartRouteService:
    @staticmethod
    def recommend_destination(db: Session, batch_id: int):
        # Query real partners from PostgreSQL
        partners = db.query(Partner).filter(Partner.status == PartnerStatus.ACTIVE).all()
        
        best_partner = None
        highest_score = -1.0
        
        for p in partners:
            # Deterministic score calculation
            # Capacity_score is persisted. Distance is a mock factor for this slice.
            # Assume constant location (0,0) for collection for demo simplicity
            distance = 10.0 
            
            score = (p.capacity_score * 0.5) + ((100 - distance) * 0.5)
            if score > highest_score:
                highest_score = score
                best_partner = p.id
                
        return {"partner_id": best_partner, "score": highest_score}

smart_route_service = SmartRouteService()
