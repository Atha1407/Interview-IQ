from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.interview_session import InterviewDifficulty
from app.models.interview_session import InterviewSession, InterviewStatus, InterviewType
from app.models.resume import Resume


def create_interview_session(
    db: Session,
    user_id: UUID,
    resume_id: UUID,
    interview_type: InterviewType,
    difficulty: InterviewDifficulty,
    question_count: int,
    topics: list[str],
) -> InterviewSession | None:
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )
    )

    if resume is None:
        return None

    session = InterviewSession(
        user_id=user_id,
        resume_id=resume_id,
        interview_type=interview_type,
        status=InterviewStatus.CREATED,
        difficulty=difficulty,
        question_count=question_count,
        topics=topics,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

def get_user_interview_sessions(
    db: Session,
    user_id: UUID,
) -> list[InterviewSession]:
    return list(
        db.scalars(
            select(InterviewSession)
            .where(InterviewSession.user_id == user_id)
            .order_by(InterviewSession.created_at.desc())
        ).all()
    )

def get_interview_session(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> InterviewSession | None:
    return db.scalar(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
    )

def delete_interview_session(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> bool:
    session = get_interview_session(
        db=db,
        user_id=user_id,
        session_id=session_id,
    )

    if session is None:
        return False

    db.delete(session)
    db.commit()

    return True

def start_interview_session(
    db: Session,
    user_id: UUID,
    session_id: UUID,
):
    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == user_id,
        )
        .first()
    )

    if session is None:
        return None

    if session.status == InterviewStatus.COMPLETED:
        return "completed"

    session.status = InterviewStatus.IN_PROGRESS
    session.current_question = 1

    db.commit()
    db.refresh(session)

    return session