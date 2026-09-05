import pytest
from uuid import uuid4
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.interview_answer import InterviewAnswerCreate
from app.models.interview_session import InterviewStatus
from app.models.interview_answer import InterviewAnswer
from app.api.v1.interview_sessions import submit_interview_answer


def test_valid_answer_text():
    data = InterviewAnswerCreate(answer_text="This is my spoken answer about React state.")
    assert data.answer_text == "This is my spoken answer about React state."


def test_answer_text_strips_whitespace():
    data = InterviewAnswerCreate(answer_text="   Spoken answer with leading and trailing spaces.   ")
    assert data.answer_text == "Spoken answer with leading and trailing spaces."


def test_empty_answer_text_rejected():
    with pytest.raises(ValidationError):
        InterviewAnswerCreate(answer_text="")


def test_whitespace_only_answer_text_rejected():
    with pytest.raises(ValidationError):
        InterviewAnswerCreate(answer_text="    \n\t   ")


@patch("app.api.v1.interview_sessions.get_interview_session")
def test_duplicate_answer_rejected(mock_get_session):
    session_id = uuid4()
    question_id = uuid4()
    user_id = uuid4()

    mock_user = MagicMock(id=user_id)
    mock_session = MagicMock()
    mock_session.id = session_id
    mock_session.status = InterviewStatus.IN_PROGRESS
    mock_session.current_question = 1
    mock_session.question_count = 3
    mock_get_session.return_value = mock_session

    mock_question = MagicMock()
    mock_question.id = question_id
    mock_question.session_id = session_id
    mock_question.question_order = 1

    existing_answer = MagicMock()
    existing_answer.id = uuid4()
    existing_answer.question_id = question_id

    mock_db = MagicMock()
    # Query return values: first question query, then existing_answer query
    mock_db.query().filter().first.side_effect = [mock_question, existing_answer]

    data = InterviewAnswerCreate(answer_text="Duplicate spoken response.")

    with pytest.raises(HTTPException) as exc_info:
        submit_interview_answer(
            session_id=session_id,
            question_id=question_id,
            data=data,
            current_user=mock_user,
            db=mock_db,
        )

    assert exc_info.value.status_code == 400
    assert "already been submitted" in exc_info.value.detail
