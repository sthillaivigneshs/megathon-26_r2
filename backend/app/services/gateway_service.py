import logging
import uuid
import hashlib
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.batch import IdempotencyKey
from app.models.pickup import PickupRequest, PickupStatus
from app.core.security import get_password_hash
from app.services.pickup_service import pickup_service
from app.services.vision_verification_service import vision_service

logger = logging.getLogger(__name__)

# Shared conversational states across all external messaging gateways
GLOBAL_CONVERSATION_STATES: Dict[str, Dict[str, Any]] = {}

class GatewayResponse(dict):
    """
    Standard response contract for unified gateway channels.
    """
    def __init__(
        self,
        text: str,
        buttons: Optional[list[dict]] = None,
        state: Optional[str] = None,
        pickup_id: Optional[str] = None,
        error: Optional[str] = None
    ):
        super().__init__(
            text=text,
            buttons=buttons or [],
            state=state,
            pickup_id=pickup_id,
            error=error
        )

class UnifiedGatewayService:
    """
    Unified Citizen Gateway reconciling WhatsApp, Telegram, and Web messaging into
    the authoritative ReLoop business service layer.
    """
    @staticmethod
    def get_or_create_user(db: Session, channel: str, identifier: str, name: str = None) -> User:
        """
        Resolves or creates a citizen user idempotently.
        """
        email = f"{identifier}@{channel}.reloop.org"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                password_hash=get_password_hash(uuid.uuid4().hex),
                role=UserRole.CITIZEN
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def check_idempotency(db: Session, channel: str, message_id: str) -> bool:
        """
        Checks if inbound message has already been processed.
        """
        if not message_id:
            return False
        hashed_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"{channel}:{message_id}")
        existing = db.query(IdempotencyKey).filter(IdempotencyKey.client_transaction_id == hashed_uuid).first()
        if existing:
            return True
        return False

    @staticmethod
    def mark_idempotent(db: Session, channel: str, message_id: str, resource_id: int):
        if not message_id:
            return
        hashed_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, f"{channel}:{message_id}")
        key = IdempotencyKey(client_transaction_id=hashed_uuid, resource_id=resource_id)
        db.add(key)
        db.commit()

    @staticmethod
    def handle_inbound_message(
        db: Session,
        channel: str,
        sender_id: str,
        msg_type: str,
        text_content: Optional[str] = None,
        photo_url_or_id: Optional[str] = None,
        location: Optional[Tuple[float, float]] = None,
        user_name: Optional[str] = None
    ) -> GatewayResponse:
        """
        Central stateful message processor for all channels.
        """
        user = UnifiedGatewayService.get_or_create_user(db, channel, sender_id, user_name)
        session_key = f"{channel}:{sender_id}"
        state = GLOBAL_CONVERSATION_STATES.get(session_key, {"step": "START"})

        clean_text = (text_content or "").strip()
        lower_text = clean_text.lower()

        # Global command interrupts
        if lower_text in ["menu", "help", "restart", "/start", "/help"]:
            state = {"step": "START"}
            GLOBAL_CONVERSATION_STATES[session_key] = state

        if lower_text in ["status", "/status", "my pickups", "track"]:
            latest_pickup = db.query(PickupRequest).filter(
                PickupRequest.citizen_id == user.id
            ).order_by(PickupRequest.created_at.desc()).first()
            if not latest_pickup:
                return GatewayResponse(
                    text="You have no active pickup requests with ReLoop. Send 'menu' to request an e-waste pickup."
                )
            return GatewayResponse(
                text=f"📦 *Pickup Status for {latest_pickup.pr_id}*\n"
                     f"• Current Status: {latest_pickup.status.value}\n"
                     f"• Items: {latest_pickup.description or 'E-Waste Items'}\n"
                     f"• Coordinates: {latest_pickup.latitude:.4f}, {latest_pickup.longitude:.4f}\n"
                     f"• Track journey: https://reloop.org/track/{latest_pickup.pr_id}"
            )

        step = state.get("step", "START")

        # Step 1: Start
        if step == "START":
            GLOBAL_CONVERSATION_STATES[session_key] = {"step": "AWAITING_LANGUAGE"}
            return GatewayResponse(
                text="Welcome to ReLoop — India's verified circular e-waste platform!\nPlease select your preferred language:",
                buttons=[
                    {"id": "lang_en", "title": "English"},
                    {"id": "lang_hi", "title": "हिंदी (Hindi)"}
                ],
                state="AWAITING_LANGUAGE"
            )

        # Step 2: Language Selection
        if step == "AWAITING_LANGUAGE":
            lang = "hi" if "hi" in lower_text or "हिंदी" in clean_text else "en"
            state["language"] = lang
            state["step"] = "AWAITING_DESCRIPTION"
            GLOBAL_CONVERSATION_STATES[session_key] = state

            msg = (
                "बहुत बढ़िया! कृपया बताइए कि आप कौन सा ई-कचरा रीसायकल करना चाहते हैं? (उदा. 1 पुराना लैपटॉप, 2 मोबाइल)"
                if lang == "hi" else
                "Great! Please describe the e-waste items you want to recycle (e.g., 1 old laptop, 2 mobile phones, chargers):"
            )
            return GatewayResponse(text=msg, state="AWAITING_DESCRIPTION")

        # Step 3: Description Received -> Awaiting Photo
        if step == "AWAITING_DESCRIPTION":
            if not clean_text:
                return GatewayResponse(text="Please describe your e-waste items to proceed.")
            state["description"] = clean_text
            state["step"] = "AWAITING_PHOTO"
            GLOBAL_CONVERSATION_STATES[session_key] = state

            return GatewayResponse(
                text=f"Got it: \"{clean_text}\".\nNow please take and upload a clear photo of the e-waste items.",
                state="AWAITING_PHOTO"
            )

        # Step 4: Photo Received -> AI Verification Gate
        if step == "AWAITING_PHOTO":
            photo_target = photo_url_or_id or clean_text
            if not photo_target:
                return GatewayResponse(text="Please upload a photo of your e-waste items to continue.")

            # Perform AI verification gating
            verification = vision_service.classify_image(photo_target)

            if verification.decision == "REJECT":
                return GatewayResponse(
                    text=f"❌ *Verification Rejected*: The image provided was identified as {verification.item} ({verification.category}), which is not electronic waste.\n\nReason: {verification.reason}.\n\nPlease upload a photo of valid electronic waste (e.g. mobile, laptop, cable, monitor).",
                    state="AWAITING_PHOTO",
                    error="NOT_EWASTE"
                )

            state["photo_url"] = photo_target
            state["photo_hash"] = hashlib.sha256(photo_target.encode("utf-8")).hexdigest()
            state["ai_item"] = verification.item
            state["ai_confidence"] = verification.confidence
            state["step"] = "AWAITING_LOCATION"
            GLOBAL_CONVERSATION_STATES[session_key] = state

            review_note = ""
            if verification.decision == "MANUAL_REVIEW":
                review_note = "⚠️ Note: Image confidence is low. A collector will perform manual visual check.\n\n"

            return GatewayResponse(
                text=f"✅ *AI Verification Success*!\nIdentified: {verification.item} ({verification.category}) — Confidence: {int(verification.confidence * 100)}%\n\n{review_note}Please share your GPS location so our nearest certified collector can reach you.",
                state="AWAITING_LOCATION"
            )

        # Step 5: Location Received -> Confirmation
        if step == "AWAITING_LOCATION":
            lat, lon = None, None
            if location:
                lat, lon = location
            elif clean_text:
                try:
                    parts = clean_text.split(",")
                    lat, lon = float(parts[0].strip()), float(parts[1].strip())
                except Exception:
                    pass

            if lat is None or lon is None:
                return GatewayResponse(
                    text="Please share your GPS location via your messaging app or send 'latitude, longitude' (e.g. 12.9716, 77.5946)."
                )

            state["latitude"] = lat
            state["longitude"] = lon
            state["step"] = "AWAITING_CONFIRMATION"
            GLOBAL_CONVERSATION_STATES[session_key] = state

            return GatewayResponse(
                text=f"📋 *Confirm E-Waste Pickup Request*\n"
                     f"• Description: {state.get('description')}\n"
                     f"• Verified Device: {state.get('ai_item')}\n"
                     f"• Location: {lat:.4f}, {lon:.4f}\n\n"
                     f"Proceed to schedule pickup?",
                buttons=[
                    {"id": "confirm_yes", "title": "Confirm Pickup"},
                    {"id": "confirm_no", "title": "Cancel"}
                ],
                state="AWAITING_CONFIRMATION"
            )

        # Step 6: Confirmation
        if step == "AWAITING_CONFIRMATION":
            if "yes" in lower_text or "confirm" in lower_text:
                try:
                    pickup = pickup_service.create_pickup(
                        db,
                        citizen_id=user.id,
                        latitude=state["latitude"],
                        longitude=state["longitude"],
                        description=f"{state.get('description')} [AI: {state.get('ai_item')}]",
                        photo_url=state.get("photo_url")
                    )
                    GLOBAL_CONVERSATION_STATES[session_key] = {"step": "START"}
                    return GatewayResponse(
                        text=f"🎉 *Pickup Scheduled Successfully!*\n"
                             f"Your Request ID: *{pickup.pr_id}*\n"
                             f"A local informal collector has been notified.\n"
                             f"Track live updates anytime by sending 'status'.",
                        pickup_id=pickup.pr_id,
                        state="COMPLETED"
                    )
                except Exception as e:
                    logger.error(f"Error creating pickup via gateway: {e}")
                    return GatewayResponse(
                        text=f"Failed to create pickup: {str(e)}",
                        error=str(e)
                    )
            else:
                GLOBAL_CONVERSATION_STATES[session_key] = {"step": "START"}
                return GatewayResponse(
                    text="Pickup request cancelled. Send 'menu' anytime to schedule again.",
                    state="START"
                )

        # Fallback
        GLOBAL_CONVERSATION_STATES[session_key] = {"step": "START"}
        return GatewayResponse(text="Session reset. Send 'menu' to start.")

gateway_service = UnifiedGatewayService()
