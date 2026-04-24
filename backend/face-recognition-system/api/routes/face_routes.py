from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import shutil
import os
import uuid

from api.schemas import ComparisonResponse
from services.face_service import FaceService

router = APIRouter()
face_service = FaceService()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🔒 Configurações de segurança
MAX_FILE_SIZE_MB = 5
ALLOWED_TYPES = ["image/jpeg", "image/png"]


def validate_file(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")


def save_temp_file(file: UploadFile):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


@router.post("/compare-faces", response_model=ComparisonResponse)
async def compare_faces(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    case_id: str = Form(None)
):
    path1 = None
    path2 = None

    try:
        # 🔒 valida arquivos
        validate_file(image1)
        validate_file(image2)

        # 💾 salva temporário
        path1 = save_temp_file(image1)
        path2 = save_temp_file(image2)

        # 🧠 processamento
        result = face_service.compare(path1, path2)

        if not result:
            raise HTTPException(status_code=500, detail="Processing error")

        return {
            "similarity_score": result.get("similarity_score"),
            "confidence_level": result.get("confidence_level"),
            "warning": "Biometric similarity results are probabilistic and require human validation"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # 🧹 limpeza segura
        for path in [path1, path2]:
            if path and os.path.exists(path):
                os.remove(path)