from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.cloudinary_service import upload_resume
from app.services.resume_parser import extract_resume_text
from app.services.resume_ai_service import extract_resume_topics
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
    print("1. Upload request received")

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
        print("2. Reading file")

        file_bytes = file.file.read()

        print("3. Extracting resume text")

        resume_text = extract_resume_text(
            file_bytes=file_bytes,
            extension=extension,
        )

        print("4. Resume text extracted")

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from resume",
            )

        print("5. Sending resume to Gemini")

        extracted_topics = extract_resume_topics(
            resume_text=resume_text,
        )

        print("6. Gemini returned topics")
        print(extracted_topics)

        file.file.seek(0)

        print("7. Uploading to Cloudinary")

        file_url = upload_resume(
            file=file.file,
            filename=stored_filename,
        )

        print("8. Cloudinary upload complete")

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to process resume",
        )

    print("9. Saving resume to database")

    return create_resume(
        db=db,
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_url,
        extracted_topics=extracted_topics,
    )