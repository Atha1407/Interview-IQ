from uuid import UUID

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