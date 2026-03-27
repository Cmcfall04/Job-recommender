import json
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserSettings
from app.schemas.dashboard import SettingsResponse, SettingsUpdateRequest

router = APIRouter()


def _get_or_create_settings(db: Session) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    return SettingsResponse(
        preferred_location=s.preferred_location,
        remote_only=s.remote_only,
        search_terms=json.loads(s.search_terms) if s.search_terms else [],
    )


@router.put("", response_model=SettingsResponse)
def update_settings(request: SettingsUpdateRequest, db: Session = Depends(get_db)):
    s = _get_or_create_settings(db)
    s.preferred_location = request.preferred_location
    s.remote_only = request.remote_only
    s.search_terms = json.dumps(request.search_terms)
    s.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(s)
    return SettingsResponse(
        preferred_location=s.preferred_location,
        remote_only=s.remote_only,
        search_terms=json.loads(s.search_terms) if s.search_terms else [],
    )
