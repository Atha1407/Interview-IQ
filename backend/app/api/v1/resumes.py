from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.cloudinary_service import upload_resume
from app.services.resume_service import (
    create_resume,
    delete_resume,
    get_user_resumes,
)


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
def upload_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    extension = file.filename.rsplit(".", 1)[-1].lower()

    if extension not in {"pdf", "docx"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed",
        )

    stored_filename = f"{uuid4()}.{extension}"

    try:
        file_url = upload_resume(
            file=file.file,
            filename=stored_filename,
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to upload resume",
        )

    return create_resume(
        db=db,
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_url,
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