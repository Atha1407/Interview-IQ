from uuid import UUID
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume import Resume


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

    file_path = Path(resume.file_path)

    if file_path.exists():
        file_path.unlink()

    db.delete(resume)
    db.commit()

    return True