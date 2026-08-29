from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.interview_session import InterviewSession
from app.models.answer_evaluation import AnswerEvaluation
from app.models.interview_evaluation import InterviewEvaluation


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

        evaluation = None

        if answer is not None:
            evaluation = (
                db.query(AnswerEvaluation)
                .filter(
                    AnswerEvaluation.answer_id == answer.id,
                )
                .first()
            )

        result_questions.append(
            {
                "question_id": question.id,
                "question_text": question.question_text,
                "answer": answer.answer_text if answer else None,

                "technical_accuracy": (
                    evaluation.technical_accuracy
                    if evaluation else None
                ),
                "relevance": (
                    evaluation.relevance
                    if evaluation else None
                ),
                "completeness": (
                    evaluation.completeness
                    if evaluation else None
                ),
                "communication": (
                    evaluation.communication
                    if evaluation else None
                ),
                "overall_score": (
                    evaluation.overall_score
                    if evaluation else None
                ),
                "strengths": (
                    evaluation.strengths
                    if evaluation else None
                ),
                "weaknesses": (
                    evaluation.weaknesses
                    if evaluation else None
                ),
                "feedback": (
                    evaluation.feedback
                    if evaluation else None
                ),
            }
        )

    answered_count = sum(
        1
        for question in result_questions
        if question["answer"] is not None
    )

    interview_evaluation = (
        db.query(InterviewEvaluation)
        .filter(
            InterviewEvaluation.session_id == session_id,
        )
        .first()
    )

    return {
        "session_id": session.id,
        "status": session.status.value,
        "interview_type": session.interview_type.value,
        "difficulty": session.difficulty.value,
        "question_count": session.question_count,
        "answered_count": answered_count,

        "overall_score": (
            interview_evaluation.overall_score
            if interview_evaluation else None
        ),
        "strengths": (
            interview_evaluation.strengths
            if interview_evaluation else None
        ),
        "weaknesses": (
            interview_evaluation.weaknesses
            if interview_evaluation else None
        ),
        "feedback": (
            interview_evaluation.feedback
            if interview_evaluation else None
        ),

        "questions": result_questions,
    }