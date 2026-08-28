from pathlib import Path
from uuid import uuid4
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.resume_service import (
    create_resume,
    delete_resume,
    get_user_resumes,
)

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


@router.get("/", response_model=list[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_resumes(
        db=db,
        user_id=current_user.id,
    )


@router.post("/upload", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in {".pdf", ".docx"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed",
        )

    stored_filename = f"{uuid4()}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    with file_path.open("wb") as buffer:
        buffer.write(file.file.read())

    return create_resume(
        db=db,
        user_id=current_user.id,
        file_name=file.filename,
        file_path=str(file_path),
    )

@router.delete("/{resume_id}")
def remove_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_resume(
        db=db,
        user_id=current_user.id,
        resume_id=resume_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    return {"message": "Resume deleted successfully"}