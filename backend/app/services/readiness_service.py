import json

from sqlalchemy.orm import Session

from app.services.readiness_ai_service import (
    generate_personalized_action_plan,
)
from app.models.interview_answer import InterviewAnswer
from app.models.interview_question import InterviewQuestion
from app.models.answer_evaluation import AnswerEvaluation
from app.models.interview_evaluation import InterviewEvaluation


def analyze_readiness(
    db: Session,
    session_id,
):
    """
    Analyzes an interview's answer evaluations and
    identifies the candidate's readiness gaps.
    """

    evaluations = (
        db.query(AnswerEvaluation)
        .join(
            InterviewAnswer,
            AnswerEvaluation.answer_id == InterviewAnswer.id,
        )
        .join(
            InterviewQuestion,
            InterviewAnswer.question_id == InterviewQuestion.id,
        )
        .filter(
            InterviewQuestion.session_id == session_id,
        )
        .all()
    )

    if not evaluations:
        return None

    technical_accuracy = round(
        sum(e.technical_accuracy for e in evaluations)
        / len(evaluations)
    )

    relevance = round(
        sum(e.relevance for e in evaluations)
        / len(evaluations)
    )

    completeness = round(
        sum(e.completeness for e in evaluations)
        / len(evaluations)
    )

    communication = round(
        sum(e.communication for e in evaluations)
        / len(evaluations)
    )

    scores = {
        "technical_accuracy": technical_accuracy,
        "relevance": relevance,
        "completeness": completeness,
        "communication": communication,
    }

    gaps = []

    for area, score in scores.items():
        if score < 70:
            status = "Gap"
        elif score < 80:
            status = "Needs Improvement"
        else:
            status = "Strong"

        gaps.append(
            {
                "area": area,
                "score": score,
                "status": status,
                "recommendation": "",
            }
        )

    readiness_score = round(
        (
            technical_accuracy
            + relevance
            + completeness
            + communication
        )
        / 4
    )

    if readiness_score >= 80:
        readiness_status = "Ready"
    elif readiness_score >= 70:
        readiness_status = "Needs Improvement"
    else:
        readiness_status = "Not Ready"

    # Sort from weakest to strongest
    gaps.sort(key=lambda gap: gap["score"])

    # Identify strong areas
    strong_areas = [
        gap["area"]
        for gap in gaps
        if gap["status"] == "Strong"
    ]

    # Identify readiness gaps
    readiness_gaps = [
        gap
        for gap in gaps
        if gap["status"] != "Strong"
    ]

    # Primary gap = weakest non-strong area
    primary_gap = (
        readiness_gaps[0]
        if readiness_gaps
        else None
    )

    # Secondary gaps = next two non-strong areas
    secondary_gaps = readiness_gaps[1:3]

    # Get existing interview evaluation
    interview_evaluation = (
        db.query(InterviewEvaluation)
        .filter(
            InterviewEvaluation.session_id == session_id,
        )
        .first()
    )

    action_plan = []

    saved_action_plan = []

    if (
        interview_evaluation is not None
        and interview_evaluation.action_plan
    ):
        saved_action_plan = json.loads(
            interview_evaluation.action_plan
        )

    # Reuse saved action plan if it contains actual recommendations
    if saved_action_plan:
        action_plan = saved_action_plan

    else:
        evaluation_data = []

        for evaluation in evaluations:
            answer = (
                db.query(InterviewAnswer)
                .filter(
                    InterviewAnswer.id == evaluation.answer_id,
                )
                .first()
            )

            if answer is None:
                continue

            question = (
                db.query(InterviewQuestion)
                .filter(
                    InterviewQuestion.id == answer.question_id,
                )
                .first()
            )

            if question is None:
                continue

            evaluation_data.append(
                {
                    "question": question.question_text,
                    "answer": answer.answer_text,
                    "technical_accuracy": evaluation.technical_accuracy,
                    "relevance": evaluation.relevance,
                    "completeness": evaluation.completeness,
                    "communication": evaluation.communication,
                    "overall_score": evaluation.overall_score,
                    "weaknesses": evaluation.weaknesses,
                    "feedback": evaluation.feedback,
                }
            )

        action_plan = generate_personalized_action_plan(
            readiness_gaps=readiness_gaps[:3],
            evaluations=evaluation_data,
        )

        # Save the generated action plan
        if interview_evaluation is not None:
            interview_evaluation.action_plan = json.dumps(
                action_plan
            )

            db.commit()

    return {
        "readiness_score": readiness_score,
        "readiness_status": readiness_status,

        "scores": scores,

        "primary_gap": primary_gap,
        "secondary_gaps": secondary_gaps,

        "strong_areas": strong_areas,

        "action_plan": action_plan,

        "gaps": gaps,
    }