from sqlalchemy.orm import Session
from app.models.event import Event, EventType
from app.models.batch import Batch, Item
from app.models.user import User

class TrustScoreService:
    @staticmethod
    def calculate_score(db: Session, user_id: int) -> float:
        # Signals: verified collections, successful handovers, weight accuracy, risk flags
        # Base score 80
        score = 80.0
        
        # Verify collections and handovers from events
        verified_collections = db.query(Event).filter(
            Event.actor_id == user_id,
            Event.event_type == EventType.WEIGHT_VERIFIED
        ).count()
        
        risk_flags = db.query(Event).filter(
            Event.actor_id == user_id,
            Event.event_type == EventType.RISK_FLAGGED
        ).count()

        # Deterministic formula: +2 per verified, -10 per risk flag
        score += (verified_collections * 2)
        score -= (risk_flags * 10)
        
        return max(0.0, min(100.0, score))

trust_score_service = TrustScoreService()
