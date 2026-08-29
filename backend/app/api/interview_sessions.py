from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.interview_session import (
    InterviewSessionCreate,
    InterviewSessionResponse,
)
from app.services.interview_session_service import create_interview_session


router = APIRouter(
    prefix="/interview-sessions",
    tags=["Interview Sessions"],
)


@router.post(
    "/",
    response_model=InterviewSessionResponse,
)
def create_session(
    data: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = create_interview_session(
        db=db,
        user_id=current_user.id,
        resume_id=data.resume_id,
        interview_type=data.interview_type,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    return session