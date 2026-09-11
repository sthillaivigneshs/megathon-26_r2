from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import qrcode
from app.core.database import SessionLocal
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.batch import Batch
from app.schemas.batch import CollectionSyncRequest, BatchResponse
from app.services.batch_service import batch_service
from app.services.storage_service import storage_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/collections", response_model=BatchResponse)
@router.post("/collections/sync", response_model=BatchResponse)
def sync_collection(sync_in: CollectionSyncRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.COLLECTOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized operation: collectors only")
    try:
        items_data = [item.dict() for item in sync_in.items]
        return batch_service.create_collection_and_batch(
            db,
            collector_id=current_user.id,
            pickup_request_id=sync_in.pickup_request_id,
            client_transaction_id=str(sync_in.client_transaction_id),
            items_data=items_data,
            parent_batch_id=sync_in.parent_batch_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/batches/{id}", response_model=BatchResponse)
def get_batch(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    batch = db.query(Batch).filter(Batch.id == id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    # Authorization checks
    if current_user.role == UserRole.COLLECTOR and batch.collector_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized batch access")

    return batch

@router.get("/batches/{id}/qr")
def get_batch_qr(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # QR verification Lookup (authoritative)
    batch = db.query(Batch).filter(Batch.id == id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    # Generate real QR code of the deep link
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr_data = f"https://reloop.org/api/v1/batches/{id}"
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return StreamingResponse(img_byte_arr, media_type="image/png")

@router.post("/photos/upload")
def upload_photo(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Accepting secure physical photo file upload (calculates hash, avoids external URLs)
    try:
        url, sha_hash = storage_service.save_photo(file)
        return {"photo_url": url, "photo_hash": sha_hash}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
