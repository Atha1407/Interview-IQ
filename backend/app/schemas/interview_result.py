from uuid import UUID

from pydantic import BaseModel


class InterviewResultQuestion(BaseModel):
    question_id: UUID
    question_text: str
    answer: str | None


class InterviewResultResponse(BaseModel):
    session_id: UUID
    status: str
    interview_type: str
    difficulty: str
    question_count: int
    answered_count: int
    questions: list[InterviewResultQuestion]