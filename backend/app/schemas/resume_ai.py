from pydantic import BaseModel


class ResumeTopicsResponse(BaseModel):
    topics: list[str]