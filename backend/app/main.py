from fastapi import FastAPI
from app.api.endpoints.health import router as health_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.pickups import router as pickups_router
from app.api.endpoints.batches import router as batches_router
from app.api.endpoints.downstream import router as downstream_router
from app.api.endpoints.whatsapp import router as whatsapp_router
from app.api.endpoints.rewards import router as rewards_router
from app.api.endpoints.smart_route import router as smart_route_router
from app.api.endpoints.compliance import router as compliance_router
from app.api.endpoints.citizen import router as citizen_router
from app.api.endpoints.risk import router as risk_router
from app.api.endpoints.vision import router as vision_router
from app.api.endpoints.telegram import router as telegram_router
from app.api.endpoints.notifications import router as notifications_router
from app.api.endpoints.voice import router as voice_router

app = FastAPI(title="ReLoop Backend")

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(pickups_router, prefix="/api/v1/pickups", tags=["pickups"])
app.include_router(batches_router, prefix="/api/v1", tags=["batches/collections"])
app.include_router(downstream_router, prefix="/api/v1", tags=["downstream"])
app.include_router(whatsapp_router, prefix="/api/v1/integrations/whatsapp", tags=["whatsapp"])
app.include_router(telegram_router, prefix="/api/v1/integrations/telegram", tags=["telegram"])
app.include_router(rewards_router, prefix="/api/v1/rewards", tags=["rewards"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(smart_route_router, prefix="/api/v1", tags=["smart-route"])
app.include_router(compliance_router, prefix="/api/v1/compliance", tags=["compliance"])
app.include_router(citizen_router, prefix="/api/v1/citizens", tags=["citizens"])
app.include_router(risk_router, prefix="/api/v1/risk", tags=["risk"])
app.include_router(vision_router, prefix="/api/v1/vision", tags=["vision"])
app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])

@app.on_event("startup")
async def startup_event():
    # Setup logging / DB connection verification here
    pass

@app.on_event("shutdown")
async def shutdown_event():
    pass
