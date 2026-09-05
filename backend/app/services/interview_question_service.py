from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_question import InterviewQuestion
from app.models.interview_session import InterviewSession
from app.services.question_generator import generate_questions

def get_session_questions(
    db: Session,
    user_id: UUID,
    session_id: UUID,
) -> list[InterviewQuestion]:

    questions = (
        db.query(InterviewQuestion)
        .join(
            InterviewSession,
            InterviewQuestion.session_id == InterviewSession.id,
        )
        .filter(
            InterviewQuestion.session_id == session_id,
            InterviewSession.user_id == user_id,
        )
        .order_by(
            InterviewQuestion.question_order
        )
        .all()
    )

    return questions

def generate_and_save_questions(
    db: Session,
    session: InterviewSession,
) -> list[InterviewQuestion]:

    existing_questions = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.session_id == session.id
        )
        .order_by(
            InterviewQuestion.question_order
        )
        .all()
    )

    if existing_questions:
        return existing_questions

    generated_questions = generate_questions(session)

    questions = []

    for question_data in generated_questions:
        question = InterviewQuestion(
            session_id=session.id,
            question_text=question_data["question_text"],
            difficulty=question_data["difficulty"],
            topic=question_data["topic"],
            question_order=question_data["question_order"],
        )

        db.add(question)

    db.commit()

    return (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.session_id == session.id)
        .order_by(InterviewQuestion.question_order)
        .all()
    )