from uuid import UUID

from pydantic import BaseModel

from app.schemas.readiness import ReadinessAnalysis


class InterviewResultQuestion(BaseModel):
    question_id: UUID
    question_text: str
    answer: str | None

    technical_accuracy: int | None = None
    relevance: int | None = None
    completeness: int | None = None
    communication: int | None = None
    overall_score: int | None = None

    strengths: str | None = None
    weaknesses: str | None = None
    feedback: str | None = None


class InterviewResultResponse(BaseModel):
    session_id: UUID
    status: str
    interview_type: str
    difficulty: str
    question_count: int
    answered_count: int

    overall_score: int | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    feedback: str | None = None

    readiness: ReadinessAnalysis | None = None

    questions: list[InterviewResultQuestion]