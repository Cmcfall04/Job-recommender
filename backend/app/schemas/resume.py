from datetime import datetime

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    filename: str
    skills: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    extracted_text_preview: str
    skills: list[str]
    created_at: datetime
