from datetime import datetime

from pydantic import BaseModel


class ScanStartRequest(BaseModel):
    sources: list[str] = ["indeed", "google"]
    search_terms: list[str] = ["entry level software engineer", "entry level IT"]
    location: str = ""
    remote_only: bool = False


class ScanStartResponse(BaseModel):
    scan_id: int
    status: str


class ScanStatusResponse(BaseModel):
    scan_id: int
    status: str
    total_jobs: int
    sources_completed: list[str]
    errors: list[str]
    started_at: datetime
    completed_at: datetime | None


class ScanHistoryResponse(BaseModel):
    scan_id: int
    started_at: datetime
    status: str
    total_jobs: int
