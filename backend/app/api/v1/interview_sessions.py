from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.interview_session import (
    InterviewSessionCreate,
    InterviewSessionResponse,
)
from app.services.interview_session_service import (
    create_interview_session,
    get_interview_session,
    get_user_interview_sessions,
    delete_interview_session,
)


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

@router.get(
    "/",
    response_model=list[InterviewSessionResponse],
)
def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_interview_sessions(
        db=db,
        user_id=current_user.id,
    )

@router.get(
    "/{session_id}",
    response_model=InterviewSessionResponse,
)
def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = get_interview_session(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return session

@router.delete("/{session_id}")
def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_interview_session(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return {"message": "Interview session deleted successfully"}