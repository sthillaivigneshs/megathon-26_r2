import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import json
import urllib.request
from app.core.config import settings
from app.services.gateway_service import gateway_service, GatewayResponse

logger = logging.getLogger(__name__)

class TelegramClient:
    def __init__(self):
        self.token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
        self.api_url = f"https://api.telegram.org/bot{self.token}" if self.token else None

    def send_message(self, chat_id: int, text: str, reply_markup: Optional[Dict[str, Any]] = None) -> bool:
        if not self.token or not self.api_url:
            logger.info(f"[SIMULATED TELEGRAM OUTBOUND] To {chat_id}: {text}")
            return True

        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup

        try:
            req = urllib.request.Request(
                f"{self.api_url}/sendMessage",
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                return resp.status == 200
        except Exception as e:
            logger.error(f"Error sending Telegram message: {e}")
            return False

class TelegramService:
    def __init__(self):
        self.client = TelegramClient()

    def process_incoming_update(self, db: Session, update: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses Telegram webhook Update, executes gateway logic, and sends response.
        """
        update_id = str(update.get("update_id", ""))
        message = update.get("message") or update.get("edited_message")
        callback_query = update.get("callback_query")

        chat_id = None
        sender_name = None
        text_content = None
        photo_id = None
        location = None
        msg_type = "text"

        if callback_query:
            from_user = callback_query.get("from", {})
            chat_id = from_user.get("id")
            sender_name = from_user.get("first_name")
            text_content = callback_query.get("data")
            msg_type = "callback"
        elif message:
            from_user = message.get("from", {})
            chat = message.get("chat", {})
            chat_id = chat.get("id") or from_user.get("id")
            sender_name = from_user.get("first_name")

            if "text" in message:
                text_content = message.get("text")
                msg_type = "text"
            elif "photo" in message:
                photos = message.get("photo", [])
                if photos:
                    photo_id = photos[-1].get("file_id")
                    text_content = message.get("caption") or "photo_uploaded"
                    msg_type = "photo"
            elif "location" in message:
                loc = message.get("location", {})
                location = (loc.get("latitude"), loc.get("longitude"))
                msg_type = "location"

        if not chat_id:
            return {"status": "ignored", "reason": "No chat_id"}

        sender_id_str = str(chat_id)

        # Idempotency
        if update_id and gateway_service.check_idempotency(db, "telegram", update_id):
            logger.info(f"Duplicate Telegram update {update_id} skipped.")
            return {"status": "ignored", "reason": "duplicate"}

        # Process through Unified Gateway
        gw_res = gateway_service.handle_inbound_message(
            db=db,
            channel="telegram",
            sender_id=sender_id_str,
            msg_type=msg_type,
            text_content=text_content,
            photo_url_or_id=photo_id,
            location=location,
            user_name=sender_name
        )

        # Format Telegram inline buttons if provided
        reply_markup = None
        if gw_res.get("buttons"):
            inline_keyboard = [
                [{"text": b["title"], "callback_data": b["id"]} for b in gw_res["buttons"]]
            ]
            reply_markup = {"inline_keyboard": inline_keyboard}

        # Send Telegram Outbound
        self.client.send_message(chat_id, gw_res.get("text", ""), reply_markup=reply_markup)

        if update_id:
            user = gateway_service.get_or_create_user(db, "telegram", sender_id_str, sender_name)
            gateway_service.mark_idempotent(db, "telegram", update_id, user.id)

        return {
            "status": "success",
            "reply": gw_res.get("text"),
            "state": gw_res.get("state"),
            "pickup_id": gw_res.get("pickup_id")
        }

telegram_service = TelegramService()
