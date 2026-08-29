from pydantic import BaseModel


class ReadinessScore(BaseModel):
    technical_accuracy: int
    relevance: int
    completeness: int
    communication: int


class ReadinessGap(BaseModel):
    area: str
    score: int
    status: str
    recommendation: str


class ReadinessAnalysis(BaseModel):
    readiness_score: int
    readiness_status: str

    scores: ReadinessScore

    primary_gap: ReadinessGap | None = None
    secondary_gaps: list[ReadinessGap] = []

    strong_areas: list[str] = []

    action_plan: list[str] = []

    gaps: list[ReadinessGap] = []

class PersonalizedActionPlan(BaseModel):
    action_plan: list[str]