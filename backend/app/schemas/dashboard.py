from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_jobs: int
    strong_matches: int
    medium_matches: int
    low_matches: int
    sources: dict[str, int]
    latest_scan: dict | None


class ChartData(BaseModel):
    match_distribution: list[dict]
    by_source: list[dict]
    by_category: list[dict]


class SettingsResponse(BaseModel):
    preferred_location: str | None
    remote_only: bool
    search_terms: list[str]


class SettingsUpdateRequest(BaseModel):
    preferred_location: str | None = None
    remote_only: bool = False
    search_terms: list[str] = []
