import hashlib
import hmac
import hmac as hmac_lib
import logging
import uuid
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.pickup import PickupRequest, PickupStatus
from app.models.batch import IdempotencyKey
from app.services.pickup_service import pickup_service
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

# In-memory dictionary for keeping track of active citizen conversation states
# Format: { phone_number: { "step": "awaiting_language", "language": "en", ... } }
CONVERSATION_STATES: Dict[str, Dict[str, Any]] = {}

class WhatsAppClient:
    """
    Production-grade Meta WhatsApp Cloud API client.
    Handles communication with Meta Graph API endpoints.
    """
    def __init__(self):
        self.enabled = settings.WHATSAPP_ENABLED
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.api_version = settings.WHATSAPP_API_VERSION
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"

    def _send_request(self, payload: Dict[str, Any]) -> bool:
        if not self.enabled or not self.phone_number_id or not self.access_token:
            logger.warning("WhatsApp client is disabled or missing credentials.")
            return False

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        try:
            response = httpx.post(self.base_url, json=payload, headers=headers, timeout=10.0)
            if response.status_code in [200, 201]:
                return True
            logger.error(f"Meta Cloud API returned error: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"Failed to send request to Meta Cloud API: {str(e)}")
            return False

    def send_text(self, to: str, text: str) -> bool:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"body": text}
        }
        return self._send_request(payload)

    def send_buttons(self, to: str, text: str, buttons: list[Dict[str, str]]) -> bool:
        """
        Sends interactive buttons using Meta's format.
        buttons: [{"id": "btn_1", "title": "English"}]
        """
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {"text": text},
                "action": {
                    "buttons": [
                        {"type": "reply", "reply": {"id": b["id"], "title": b["title"]}}
                        for b in buttons
                    ]
                }
            }
        }
        return self._send_request(payload)


class WhatsAppService:
    """
    Manages conversational flows, state machine, and integration with ReLoop services.
    """
    def __init__(self):
        self.client = WhatsAppClient()

    def verify_webhook_signature(self, payload: bytes, signature_header: str) -> bool:
        if not settings.WHATSAPP_APP_SECRET:
            return True # If not configured, bypass for local testing
        if not signature_header or not signature_header.startswith("sha256="):
            return False
        expected_sig = signature_header.split("sha256=")[1]
        computed_sig = hmac.new(
            settings.WHATSAPP_APP_SECRET.encode("utf-8"),
            payload,
            hashlib.sha256
        ).hexdigest()
        return hmac_lib.compare_digest(expected_sig, computed_sig)

    def process_incoming_webhook(self, db: Session, body: Dict[str, Any]) -> bool:
        """
        Parses inbound payload, checks idempotency, and executes handlers.
        """
        entry = body.get("entry", [])
        if not entry:
            return False
        
        changes = entry[0].get("changes", [])
        if not changes:
            return False
        
        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            return False

        message = messages[0]
        message_id = message.get("id")
        from_number = message.get("from")

        if not message_id or not from_number:
            return False

        # Idempotency Protection: Hash message ID into UUID to reuse existing idempotency_keys schema
        hashed_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, message_id)
        existing_key = db.query(IdempotencyKey).filter(IdempotencyKey.client_transaction_id == hashed_uuid).first()
        if existing_key:
            logger.info(f"Duplicate WhatsApp webhook message_id {message_id} ignored idempotently.")
            return True

        # Resolve or Onboard User dynamically (Citizen Flow)
        user_email = f"{from_number}@whatsapp.reloop.org"
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(
                email=user_email,
                password_hash=get_password_hash(uuid.uuid4().hex),
                role=UserRole.CITIZEN
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Handle user conversation state and response flow
        self.handle_citizen_message(db, from_number, user, message)

        # Persist Idempotency
        idemp = IdempotencyKey(client_transaction_id=hashed_uuid, resource_id=user.id)
        db.add(idemp)
        db.commit()
        return True

    def handle_citizen_message(self, db: Session, phone: str, user: User, message: Dict[str, Any]):
        msg_type = message.get("type")
        state = CONVERSATION_STATES.get(phone, {"step": "START"})

        # Common user inputs or menu choices
        text_body = ""
        button_id = None

        if msg_type == "text":
            text_body = message.get("text", {}).get("body", "").strip().lower()
        elif msg_type == "interactive":
            interactive = message.get("interactive", {})
            if interactive.get("type") == "button_reply":
                button_id = interactive.get("button_reply", {}).get("id")
                text_body = button_id

        # Globally accessible command redirects
        if text_body in ["menu", "help", "restart"]:
            state = {"step": "START"}

        step = state.get("step")

        if step == "START":
            self.client.send_buttons(
                phone,
                "Welcome to ReLoop! Please select your language.\nreloop.org",
                [{"id": "lang_en", "title": "English"}, {"id": "lang_hi", "title": "Hindi"}]
            )
            CONVERSATION_STATES[phone] = {"step": "AWAITING_LANGUAGE"}

        elif step == "AWAITING_LANGUAGE":
            lang = "en" if text_body == "lang_en" else "hi"
            state["language"] = lang
            text_greeting = "Let's schedule your e-waste pickup request! Please describe the e-waste items you want to recycle (e.g., 2 phones, 1 laptop)."
            self.client.send_text(phone, text_greeting)
            CONVERSATION_STATES[phone] = {"step": "AWAITING_DESCRIPTION", "language": lang}

        elif step == "AWAITING_DESCRIPTION":
            state["description"] = text_body
            self.client.send_text(phone, "Excellent! Please send/upload a photo of your e-waste items.")
            state["step"] = "AWAITING_PHOTO"
            CONVERSATION_STATES[phone] = state

        elif step == "AWAITING_PHOTO":
            photo_url = None
            if msg_type == "image":
                photo_url = message.get("image", {}).get("id") # Meta photo media ID
            
            # Allow fallback if text description or dummy link is supplied in tests
            if text_body:
                photo_url = text_body

            if not photo_url:
                self.client.send_text(phone, "Please upload a photo of your e-waste to continue.")
                return

            state["photo_url"] = f"https://whatsapp.media/{photo_url}"
            state["photo_hash"] = hashlib.sha256(photo_url.encode("utf-8")).hexdigest()
            self.client.send_text(phone, "Now please share your device GPS location so our collector can reach you.")
            state["step"] = "AWAITING_LOCATION"
            CONVERSATION_STATES[phone] = state

        elif step == "AWAITING_LOCATION":
            lat, lon = None, None
            if msg_type == "location":
                loc = message.get("location", {})
                lat, lon = loc.get("latitude"), loc.get("longitude")
            elif text_body:
                # Fallback parsed coordinates for testing
                try:
                    parts = text_body.split(",")
                    lat, lon = float(parts[0]), float(parts[1])
                except ValueError:
                    pass

            if lat is None or lon is None:
                self.client.send_text(phone, "Please send a valid location to proceed.")
                return

            state["latitude"] = lat
            state["longitude"] = lon

            self.client.send_buttons(
                phone,
                f"Confirm Pickup Request?\nItems: {state.get('description')}\nLocation: {lat}, {lon}",
                [{"id": "confirm_yes", "title": "Confirm"}, {"id": "confirm_no", "title": "Cancel"}]
            )
            state["step"] = "AWAITING_CONFIRMATION"
            CONVERSATION_STATES[phone] = state

        elif step == "AWAITING_CONFIRMATION":
            if text_body == "confirm_yes":
                try:
                    pickup = pickup_service.create_pickup(
                        db,
                        citizen_id=user.id,
                        latitude=state["latitude"],
                        longitude=state["longitude"],
                        description=state["description"]
                    )
                    self.client.send_text(
                        phone,
                        f"Your pickup request has been successfully created!\nRequest ID: {pickup.pr_id}\nThank you for choosing ReLoop!"
                    )
                except Exception as e:
                    self.client.send_text(phone, "Sorry, we could not process your pickup request at this moment.")
            else:
                self.client.send_text(phone, "Pickup request cancelled. Send 'menu' anytime to restart.")
            CONVERSATION_STATES[phone] = {"step": "START"}

whatsapp_service = WhatsAppService()
