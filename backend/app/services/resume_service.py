from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.services.cloudinary_service import delete_resume as delete_cloudinary_resume


def get_user_resumes(
    db: Session,
    user_id: UUID,
) -> list[Resume]:
    return list(
        db.scalars(
            select(Resume)
            .where(Resume.user_id == user_id)
            .order_by(Resume.created_at.desc())
        )
    )


def create_resume(
    db: Session,
    user_id: UUID,
    file_name: str,
    file_path: str,
) -> Resume:
    resume = Resume(
        user_id=user_id,
        file_name=file_name,
        file_path=file_path,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


def delete_resume(
    db: Session,
    user_id: UUID,
    resume_id: UUID,
) -> bool:
    resume = db.scalar(
        select(Resume)
        .where(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )
    )

    if resume is None:
        return False

    try:
        delete_cloudinary_resume(resume.file_path)
    except Exception:
        # We don't want a storage failure to leave
        # the database transaction half-completed.
        raise

    db.delete(resume)
    db.commit()

    return True