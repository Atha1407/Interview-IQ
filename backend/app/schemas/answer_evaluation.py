from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AnswerEvaluationResponse(BaseModel):
    id: UUID
    answer_id: UUID

    technical_accuracy: int = Field(ge=0, le=10)
    relevance: int = Field(ge=0, le=10)
    completeness: int = Field(ge=0, le=10)
    communication: int = Field(ge=0, le=10)
    overall_score: int = Field(ge=0, le=10)

    strengths: str
    weaknesses: str
    feedback: str

    created_at: datetime

    model_config = {
        "from_attributes": True
    }