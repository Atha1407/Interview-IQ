from types import SimpleNamespace
from unittest.mock import patch

from app.services.readiness_service import analyze_readiness


def create_fake_db(evaluations):
    answers = [
        SimpleNamespace(
            id=f"answer-{index}",
            question_id=f"question-{index}",
            answer_text=f"Sample answer {index}",
        )
        for index, _ in enumerate(evaluations)
    ]

    questions = [
        SimpleNamespace(
            id=f"question-{index}",
            question_text=f"Sample question {index}",
        )
        for index, _ in enumerate(evaluations)
    ]

    class FakeQuery:
        def __init__(self, result=None):
            self.result = result

        def join(self, *args, **kwargs):
            return self

        def filter(self, *args, **kwargs):
            return self

        def all(self):
            return evaluations

        def first(self):
            return self.result

    class FakeDB:
        def query(self, model):
            model_name = model.__name__

            if model_name == "AnswerEvaluation":
                return FakeQuery(evaluations)

            if model_name == "InterviewAnswer":
                return FakeQuery(answers[0])

            if model_name == "InterviewQuestion":
                return FakeQuery(questions[0])

            return FakeQuery()

    return FakeDB()


@patch(
    "app.services.readiness_service.generate_personalized_action_plan"
)
def test_readiness_identifies_primary_gap(
    mock_action_plan,
):
    evaluations = [
        SimpleNamespace(
            answer_id="answer-1",
            technical_accuracy=85,
            relevance=75,
            completeness=55,
            communication=80,
            overall_score=74,
            weaknesses="Needs more detail.",
            feedback="Explain your reasoning.",
        ),
        SimpleNamespace(
            answer_id="answer-2",
            technical_accuracy=90,
            relevance=70,
            completeness=60,
            communication=82,
            overall_score=76,
            weaknesses="Limited explanation.",
            feedback="Provide examples.",
        ),
    ]

    mock_action_plan.return_value = [
        "Practice explaining your reasoning.",
        "Include practical examples.",
    ]

    result = analyze_readiness(
        db=create_fake_db(evaluations),
        session_id="test-session",
    )

    assert result["readiness_score"] == 75
    assert result["readiness_status"] == "Needs Improvement"

    assert result["primary_gap"]["area"] == "completeness"
    assert result["primary_gap"]["score"] == 58
    assert result["primary_gap"]["status"] == "Gap"

    assert "technical_accuracy" in result["strong_areas"]

    assert len(result["secondary_gaps"]) == 1

    assert result["action_plan"] == [
        "Practice explaining your reasoning.",
        "Include practical examples.",
    ]

    mock_action_plan.assert_called_once()


@patch(
    "app.services.readiness_service.generate_personalized_action_plan"
)
def test_readiness_returns_ready_when_scores_are_strong(
    mock_action_plan,
):
    evaluations = [
        SimpleNamespace(
            answer_id="answer-1",
            technical_accuracy=85,
            relevance=90,
            completeness=82,
            communication=88,
            overall_score=86,
            weaknesses="None.",
            feedback="Good answer.",
        ),
        SimpleNamespace(
            answer_id="answer-2",
            technical_accuracy=90,
            relevance=85,
            completeness=86,
            communication=92,
            overall_score=88,
            weaknesses="None.",
            feedback="Good answer.",
        ),
    ]

    mock_action_plan.return_value = []

    result = analyze_readiness(
        db=create_fake_db(evaluations),
        session_id="test-session",
    )

    assert result["readiness_score"] == 88
    assert result["readiness_status"] == "Ready"

    assert result["primary_gap"] is None
    assert result["secondary_gaps"] == []
    assert len(result["strong_areas"]) == 4

    assert result["action_plan"] == []

    mock_action_plan.assert_called_once()


@patch(
    "app.services.readiness_service.generate_personalized_action_plan"
)
def test_readiness_returns_not_ready_when_scores_are_low(
    mock_action_plan,
):
    evaluations = [
        SimpleNamespace(
            answer_id="answer-1",
            technical_accuracy=55,
            relevance=60,
            completeness=50,
            communication=58,
            overall_score=56,
            weaknesses="Weak explanation.",
            feedback="Explain your reasoning.",
        ),
        SimpleNamespace(
            answer_id="answer-2",
            technical_accuracy=60,
            relevance=55,
            completeness=54,
            communication=62,
            overall_score=58,
            weaknesses="Lacks detail.",
            feedback="Add examples.",
        ),
    ]

    mock_action_plan.return_value = [
        "Strengthen your explanations.",
        "Add practical examples.",
    ]

    result = analyze_readiness(
        db=create_fake_db(evaluations),
        session_id="test-session",
    )

    assert result["readiness_score"] == 57
    assert result["readiness_status"] == "Not Ready"

    assert result["primary_gap"]["area"] == "completeness"
    assert result["primary_gap"]["score"] == 52

    assert len(result["strong_areas"]) == 0
    assert len(result["secondary_gaps"]) == 2

    assert result["action_plan"] == [
        "Strengthen your explanations.",
        "Add practical examples.",
    ]

    mock_action_plan.assert_called_once()