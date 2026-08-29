from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.interview_session import (
    InterviewStatus,
    InterviewType,
)

from app.models.enums import InterviewDifficulty


class InterviewSessionCreate(BaseModel):
    resume_id: UUID
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    question_count: int = Field(ge=1, le=20)
    topics: list[str] = Field(min_length=1, max_length=10)

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, value):
        if isinstance(value, str):
            return value.lower()

        return value

class InterviewSessionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    question_count: int
    current_question: int
    topics: list[str]
    status: InterviewStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }