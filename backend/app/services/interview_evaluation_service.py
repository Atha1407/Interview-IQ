from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_session import InterviewSession
from app.models.interview_evaluation import InterviewEvaluation
from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.answer_evaluation import AnswerEvaluation

from app.services.ai_evaluator import evaluate_answer_with_ai


def evaluate_answer(
    db: Session,
    answer: InterviewAnswer,
    question: InterviewQuestion,
) -> AnswerEvaluation:
    """
    Evaluates an interview answer using Gemini AI.
    """

    ai_result = evaluate_answer_with_ai(
        question=question.question_text,
        answer=answer.answer_text,
    )

    overall_score = round(
        (
            ai_result.technical_accuracy
            + ai_result.relevance
            + ai_result.completeness
            + ai_result.communication
        )
        / 4
    )

    evaluation = AnswerEvaluation(
        answer_id=answer.id,
        technical_accuracy=ai_result.technical_accuracy,
        relevance=ai_result.relevance,
        completeness=ai_result.completeness,
        communication=ai_result.communication,
        overall_score=overall_score,
        strengths=ai_result.strengths,
        weaknesses=ai_result.weaknesses,
        feedback=ai_result.feedback,
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation


def evaluate_interview(
    db: Session,
    session: InterviewSession,
):
    """
    Evaluates all answers in an interview and creates
    the overall interview evaluation.
    """

    answers = (
        db.query(InterviewAnswer)
        .join(
            InterviewQuestion,
            InterviewAnswer.question_id == InterviewQuestion.id,
        )
        .filter(
            InterviewQuestion.session_id == session.id,
        )
        .all()
    )

    if not answers:
        return None

    answer_evaluations = []

    for answer in answers:
        question = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.id == answer.question_id,
            )
            .first()
        )

        if question is None:
            continue

        existing_evaluation = (
            db.query(AnswerEvaluation)
            .filter(
                AnswerEvaluation.answer_id == answer.id,
            )
            .first()
        )

        if existing_evaluation is not None:
            answer_evaluations.append(existing_evaluation)
            continue

        evaluation = evaluate_answer(
            db=db,
            answer=answer,
            question=question,
        )

        answer_evaluations.append(evaluation)

    if not answer_evaluations:
        return None

    overall_score = round(
        sum(
            evaluation.overall_score
            for evaluation in answer_evaluations
        )
        / len(answer_evaluations)
    )

    interview_evaluation = (
        db.query(InterviewEvaluation)
        .filter(
            InterviewEvaluation.session_id == session.id,
        )
        .first()
    )

    if interview_evaluation is not None:
        return interview_evaluation

    interview_evaluation = InterviewEvaluation(
        session_id=session.id,
        overall_score=overall_score,
        strengths="The interview was evaluated using AI.",
        weaknesses="Review the individual answer evaluations for detailed weaknesses.",
        feedback="Review the answer-level feedback to understand how to improve your interview performance.",
    )

    db.add(interview_evaluation)
    db.commit()
    db.refresh(interview_evaluation)

    return interview_evaluation