from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: UUID
    file_name: str
    file_path: str
    extracted_topics: list[str]
    created_at: datetime
    updated_at: datetime