from app.api.v1 import interview_sessions
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
    start_interview_session,
)
from app.schemas.interview_question import InterviewQuestionResponse
from app.services.interview_question_service import (
    get_session_questions,
    generate_and_save_questions,
)

from app.schemas.interview_answer import (
    InterviewAnswerCreate,
    InterviewAnswerResponse,
    InterviewAnswerSubmitResponse,
)
from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.interview_session import InterviewStatus
from app.services.interview_answer_service import submit_answer
from app.schemas.interview_result import InterviewResultResponse
from app.services.interview_result_service import get_interview_result
from app.schemas.interview_evaluation import InterviewEvaluationResponse
from app.services.interview_evaluation_service import evaluate_interview


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
        difficulty=data.difficulty,
        question_count=data.question_count,
        topics=data.topics,
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

@router.get(
    "/{session_id}/questions",
    response_model=list[InterviewQuestionResponse],
)
def get_questions(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_session_questions(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

@router.post(
    "/{session_id}/generate",
    response_model=list[InterviewQuestionResponse],
)
def generate_questions_for_session(
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

    questions = generate_and_save_questions(
        db=db,
        session=session,
    )

    return questions

@router.post(
    "/{session_id}/start",
    response_model=InterviewQuestionResponse,
)
def start_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = start_interview_session(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    if session == "completed":
        raise HTTPException(
            status_code=400,
            detail="Interview session is already completed",
        )

    questions = get_session_questions(
        db=db,
        user_id=current_user.id,
        session_id=session.id,
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="No questions have been generated for this interview",
        )

    return questions[0]

@router.post(
    "/{session_id}/questions/{question_id}/answer",
    response_model=InterviewAnswerSubmitResponse,
)
def submit_interview_answer(
    session_id: UUID,
    question_id: UUID,
    data: InterviewAnswerCreate,
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

    if session.status != InterviewStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400,
            detail="Interview session is not in progress",
        )

    question = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.id == question_id,
            InterviewQuestion.session_id == session_id,
        )
        .first()
    )

    if question is None:
        raise HTTPException(
            status_code=404,
            detail="Interview question not found",
        )

    if question.question_order != session.current_question:
        raise HTTPException(
            status_code=400,
            detail="This is not the current interview question",
        )

    existing_answer = (
        db.query(InterviewAnswer)
        .filter(
            InterviewAnswer.question_id == question_id,
        )
        .first()
    )

    if existing_answer is not None:
        raise HTTPException(
            status_code=400,
            detail="An answer has already been submitted for this question",
        )

    answer = submit_answer(
        db=db,
        question_id=question_id,
        answer_text=data.answer_text,
    )

    if session.current_question >= session.question_count:
        session.status = InterviewStatus.COMPLETED
        db.commit()
        db.refresh(session)
    else:
        session.current_question += 1
        db.commit()
        db.refresh(session)

    next_question = None

    if session.status == InterviewStatus.IN_PROGRESS:
        next_question = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.session_id == session.id,
                InterviewQuestion.question_order == session.current_question,
            )
            .first()
        )

    return {
        "answer": answer,
        "current_question": session.current_question,
        "question_count": session.question_count,
        "status": session.status.value,
        "next_question": next_question,
    }

@router.get(
    "/{session_id}/result",
    response_model=InterviewResultResponse,
)
def get_result(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = get_interview_result(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    return result

@router.post(
    "/{session_id}/evaluate",
    response_model=InterviewEvaluationResponse,
)
def evaluate_interview_session(
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

    if session.status != InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Interview session is not completed",
        )

    evaluation = evaluate_interview(
        db=db,
        session=session,
    )

    if evaluation is None:
        raise HTTPException(
            status_code=400,
            detail="No answers available for evaluation",
        )

    return evaluation




