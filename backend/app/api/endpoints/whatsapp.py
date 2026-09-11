import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.whatsapp_service import whatsapp_service

logger = logging.getLogger(__name__)
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/webhook")
def whatsapp_webhook_verification(request: Request):
    """
    Handles Meta's Webhook verification challenge.
    """
    hub_mode = request.query_params.get("hub.mode")
    hub_verify_token = request.query_params.get("hub.verify_token")
    hub_challenge = request.query_params.get("hub.challenge")

    if hub_mode == "subscribe":
        if hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
            logger.info("WhatsApp Webhook verified successfully!")
            return Response(content=hub_challenge, media_type="text/plain")
        else:
            logger.warning("WhatsApp Webhook verify token mismatch.")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verification token mismatch")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid hub.mode")

@router.post("/webhook")
async def whatsapp_webhook_processing(request: Request, db: Session = Depends(get_db)):
    """
    Receives events from the Meta WhatsApp Cloud API.
    Uses HMAC-SHA256 verification and idempotency protections.
    """
    body_bytes = await request.body()
    signature_header = request.headers.get("X-Hub-Signature-256", "")

    # Webhook signature verification (strict security)
    if not whatsapp_service.verify_webhook_signature(body_bytes, signature_header):
        logger.warning("Inbound WhatsApp signature verification failed.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    try:
        body_json = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload")

    # Idempotent webhook processing
    processed = whatsapp_service.process_incoming_webhook(db, body_json)
    if processed:
        return {"status": "success"}
    return {"status": "ignored"}
