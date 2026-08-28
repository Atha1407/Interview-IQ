from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.interview_session import InterviewStatus, InterviewType


class InterviewSessionCreate(BaseModel):
    resume_id: UUID
    interview_type: InterviewType


class InterviewSessionResponse(BaseModel):
    id: UUID
    resume_id: UUID
    interview_type: InterviewType
    status: InterviewStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }