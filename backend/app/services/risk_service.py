from sqlalchemy.orm import Session
from app.models.risk import RiskFlag, RiskStatus
from app.models.batch import Batch, Item
from app.models.event import EventType
from app.services.workflow_service import workflow_service
from fastapi import HTTPException, status

class RiskService:
    @staticmethod
    def flag_risk(db: Session, batch_id: int, reason: str):
        flag = RiskFlag(batch_id=batch_id, reason=reason, status=RiskStatus.FLAGGED)
        db.add(flag)
        workflow_service.log_event(db, batch_id, EventType.RISK_FLAGGED, 0, "SYSTEM", metadata_json=reason)
        db.commit()
        return flag

    @staticmethod
    def review_risk(db: Session, flag_id: int, new_status: RiskStatus):
        flag = db.query(RiskFlag).filter(RiskFlag.id == flag_id).first()
        if not flag:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk flag not found")
        flag.status = new_status
        db.commit()
        db.refresh(flag)
        return flag

    @staticmethod
    def detect_anomalies(db: Session, batch: Batch):
        # Rule: Duplicate Photo Hash
        for item in batch.items:
            if item.photo_hash:
                count = db.query(Item).filter(Item.photo_hash == item.photo_hash).count()
                if count > 1:
                    risk_service.flag_risk(db, batch.id, "Duplicate photo hash detected")
                    break

        # Rule: Weight Anomaly (if verified weight exists)
        for item in batch.items:
            if item.verified_weight and abs(item.declared_weight - item.verified_weight) > (item.declared_weight * 0.2):
                risk_service.flag_risk(db, batch.id, "Weight anomaly detected")
                break

risk_service = RiskService()
