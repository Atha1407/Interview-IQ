from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.interview_session import InterviewSession


def get_interview_result(
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

    questions = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.session_id == session_id,
        )
        .order_by(InterviewQuestion.question_order)
        .all()
    )

    result_questions = []

    for question in questions:
        answer = (
            db.query(InterviewAnswer)
            .filter(
                InterviewAnswer.question_id == question.id,
            )
            .first()
        )

        result_questions.append(
            {
                "question_id": question.id,
                "question_text": question.question_text,
                "answer": answer.answer_text if answer else None,
            }
        )

    answered_count = sum(
        1 for question in result_questions
        if question["answer"] is not None
    )

    return {
        "session_id": session.id,
        "status": session.status.value,
        "interview_type": session.interview_type.value,
        "difficulty": session.difficulty.value,
        "question_count": session.question_count,
        "answered_count": answered_count,
        "questions": result_questions,
    }