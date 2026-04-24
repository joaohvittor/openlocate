from pydantic import BaseModel


class ComparisonResponse(BaseModel):
    similarity_score: float | None
    confidence_level: str | None
    warning: str