import hashlib
import os
from fastapi import UploadFile

class StorageService:
    def __init__(self, upload_dir: str = "static/uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_photo(self, file: UploadFile) -> tuple[str, str]:
        # Stream file and compute hash
        sha256 = hashlib.sha256()
        content = file.file.read()
        sha256.update(content)
        file_hash = sha256.hexdigest()

        # Reset file pointer
        file.file.seek(0)

        # Save file
        file_ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        filename = f"{file_hash}{file_ext}"
        file_path = os.path.join(self.upload_dir, filename)

        with open(file_path, "wb") as f:
            f.write(content)

        return f"/static/uploads/{filename}", file_hash

storage_service = StorageService()
