from datetime import datetime

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str | None
    is_remote: bool
    source: str
    url: str
    posted_date: str | None
    category: str | None
    salary_min: int | None
    salary_max: int | None
    match_score: float | None = None
    match_tier: str | None = None
    skills_matched: list[str] | None = None
    status: str = "new"
    created_at: datetime

    model_config = {"from_attributes": True}


class JobDetailResponse(JobResponse):
    description: str


class JobListResponse(BaseModel):
    jobs: list[JobResponse]
    total: int
    page: int
    per_page: int


class JobUpdateRequest(BaseModel):
    status: str  # saved | applied | hidden
