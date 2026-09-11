from sqlalchemy.orm import Session
from app.models.batch import Batch
from app.models.event import Event, EventType
from app.models.risk import RiskFlag, RiskStatus
from app.models.pickup import PickupRequest, PickupStatus

from sqlalchemy.orm import Session
from app.models.batch import Batch
from app.models.event import Event, EventType
from app.models.risk import RiskFlag, RiskStatus
from app.models.pickup import PickupStatus

class ComplianceService:
    @staticmethod
    def get_compliance_report(db: Session):
        total_batches = db.query(Batch).count()
        processed_batches = db.query(Batch).join(Batch.pickup_request).filter(PickupRequest.status == "EPR_CREDIT").count()

        # Pathway breakdown from the Event Ledger using ONLY existing EventType values
        # Alternative pathways are currently 'unavailable'
        pathways = {
            "recycle": db.query(Event).filter(Event.event_type == EventType.PROCESSING_CONFIRMED).count(),
            "refurbish": "unavailable",
            "reuse": "unavailable",
            "component_recovery": "unavailable"
        }

        return {
            "total_batches": total_batches,
            "processed_count": processed_batches,
            "fulfillment_percentage": (processed_batches / total_batches * 100) if total_batches > 0 else 0,
            "pathway_breakdown": pathways,
            "attribution": "unavailable"
        }


compliance_service = ComplianceService()
