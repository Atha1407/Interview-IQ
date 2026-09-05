from datetime import datetime
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.interview_question import InterviewQuestionResponse

class InterviewAnswerCreate(BaseModel):
    answer_text: str = Field(min_length=1)

    @field_validator("answer_text")
    @classmethod
    def validate_answer_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Answer text cannot be empty or whitespace only")
        return cleaned


class InterviewAnswerResponse(BaseModel):
    id: UUID
    question_id: UUID
    answer_text: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class InterviewAnswerSubmitResponse(BaseModel):
    answer: InterviewAnswerResponse
    current_question: int
    question_count: int
    status: str
    next_question: Optional["InterviewQuestionResponse"] = None