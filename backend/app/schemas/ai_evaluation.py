from pydantic import BaseModel, Field


class AIEvaluationResponse(BaseModel):
    technical_accuracy: int = Field(ge=0, le=10)
    relevance: int = Field(ge=0, le=10)
    completeness: int = Field(ge=0, le=10)
    communication: int = Field(ge=0, le=10)

    strengths: str
    weaknesses: str
    feedback: str


class BatchAIEvaluationItem(BaseModel):
    answer_id: str

    technical_accuracy: int = Field(ge=0, le=10)
    relevance: int = Field(ge=0, le=10)
    completeness: int = Field(ge=0, le=10)
    communication: int = Field(ge=0, le=10)

    strengths: str
    weaknesses: str
    feedback: str


class BatchAIEvaluationResponse(BaseModel):
    evaluations: list[BatchAIEvaluationItem]