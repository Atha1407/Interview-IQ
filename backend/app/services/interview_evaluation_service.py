from uuid import UUID

from sqlalchemy.orm import Session

from app.models.interview_session import InterviewSession
from app.models.interview_evaluation import InterviewEvaluation
from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.answer_evaluation import AnswerEvaluation

from app.services.ai_evaluator import evaluate_interview_with_ai


def evaluate_interview(
    db: Session,
    session: InterviewSession,
):
    """
    Evaluates all answers in an interview using a single Gemini request.
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

    # Get all questions in one query instead of querying inside the loop.
    questions = (
        db.query(InterviewQuestion)
        .filter(
            InterviewQuestion.session_id == session.id,
        )
        .all()
    )

    questions_by_id = {
        question.id: question
        for question in questions
    }

    answer_evaluations = []

    answers_for_ai = []

    for answer in answers:
        question = questions_by_id.get(answer.question_id)

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

        answers_for_ai.append(
            {
                "answer_id": str(answer.id),
                "question": question.question_text,
                "answer": answer.answer_text,
            }
        )

    # Only call Gemini if there are answers that still need evaluation.
    if answers_for_ai:
        batch_result = evaluate_interview_with_ai(
            questions_and_answers=answers_for_ai,
        )

        evaluations_by_answer_id = {
            item.answer_id: item
            for item in batch_result.evaluations
        }

        for answer_data in answers_for_ai:
            answer_id = answer_data["answer_id"]

            ai_result = evaluations_by_answer_id.get(answer_id)

            if ai_result is None:
                continue

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
                answer_id=UUID(answer_id),
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
            answer_evaluations.append(evaluation)

        db.commit()

        # Refresh newly-created evaluations so their database fields
        # are available to the rest of the application.
        for evaluation in answer_evaluations:
            db.refresh(evaluation)

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