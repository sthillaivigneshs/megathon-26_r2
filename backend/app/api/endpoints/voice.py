import base64
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.voice import VoiceCommandRequest, VoiceCommandResponse
from app.services.voice_assistant_service import voice_assistant_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/parse-command", response_model=VoiceCommandResponse)
async def parse_voice_command(
    req: VoiceCommandRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Parses a textual voice transcription or base64 audio string into a validated structured intent.
    Requires authenticated user (Collector, Citizen, Admin).
    Does NOT mutate database records directly.
    """
    try:
        if req.audio_base64:
            try:
                audio_bytes = base64.b64decode(req.audio_base64)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid base64 encoding in audio payload."
                )
            mime = req.mime_type or "audio/wav"
            return voice_assistant_service.parse_audio_command(audio_bytes, mime)
        elif req.command_text:
            return voice_assistant_service.parse_text_command(req.command_text)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'command_text' or 'audio_base64' must be provided."
            )
    except ValueError as e:
        logger.warning(f"Voice processing validation error: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected voice processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Voice processing encountered an internal error."
        )


@router.post("/parse-audio", response_model=VoiceCommandResponse)
async def parse_audio_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts multipart/form-data audio file uploads for voice parsing.
    Requires authenticated user.
    """
    try:
        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty."
            )
        mime = file.content_type or "audio/wav"
        return voice_assistant_service.parse_audio_command(content, mime)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing audio upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Audio processing failed."
        )
