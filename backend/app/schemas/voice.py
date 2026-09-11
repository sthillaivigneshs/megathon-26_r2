from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class VoiceItem(BaseModel):
    category: str
    subcategory: Optional[str] = None
    quantity: int = Field(default=1, ge=1)
    declared_weight: Optional[float] = Field(default=None, gt=0)
    hazard_status: Optional[str] = "no_hazard"
    condition: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class VoiceCommandRequest(BaseModel):
    command_text: Optional[str] = None
    audio_base64: Optional[str] = None
    mime_type: Optional[str] = None
    language: Optional[str] = None

class VoiceCommandResponse(BaseModel):
    intent: str
    items: List[VoiceItem] = []
    total_weight_kg: Optional[float] = None
    hazard_status: Optional[str] = "no_hazard"
    notes: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    requires_confirmation: bool = False
    spoken_feedback: str
    raw_transcript: Optional[str] = None
    language: str = "en"
    provider: str = "demo"

    model_config = ConfigDict(from_attributes=True)
