from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.answer_evaluation import AnswerEvaluationResponse


class InterviewEvaluationResponse(BaseModel):
    id: UUID
    session_id: UUID

    overall_score: int = Field(ge=0, le=10)

    strengths: str
    weaknesses: str
    feedback: str

    created_at: datetime

    answer_evaluations: list[AnswerEvaluationResponse] = []

    model_config = {
        "from_attributes": True
    }