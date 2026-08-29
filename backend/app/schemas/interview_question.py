from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import InterviewDifficulty


class InterviewQuestionResponse(BaseModel):
    id: UUID
    session_id: UUID
    question_text: str
    difficulty: InterviewDifficulty
    topic: str
    question_order: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }