import json

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, MatchScore, Scan
from app.schemas.dashboard import ChartData, DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total_jobs = db.query(func.count(Job.id)).scalar() or 0

    strong = db.query(func.count(MatchScore.id)).filter(MatchScore.tier == "strong").scalar() or 0
    medium = db.query(func.count(MatchScore.id)).filter(MatchScore.tier == "medium").scalar() or 0
    low = db.query(func.count(MatchScore.id)).filter(MatchScore.tier == "low").scalar() or 0

    # Jobs per source
    source_counts = db.query(Job.source, func.count(Job.id)).group_by(Job.source).all()
    sources = {source: count for source, count in source_counts}

    # Latest scan
    latest_scan = db.query(Scan).order_by(Scan.started_at.desc()).first()
    latest_scan_dict = None
    if latest_scan:
        latest_scan_dict = {
            "scan_id": latest_scan.id,
            "status": latest_scan.status,
            "total_jobs": latest_scan.total_jobs,
            "started_at": latest_scan.started_at.isoformat(),
        }

    return DashboardStats(
        total_jobs=total_jobs,
        strong_matches=strong,
        medium_matches=medium,
        low_matches=low,
        sources=sources,
        latest_scan=latest_scan_dict,
    )


@router.get("/charts", response_model=ChartData)
def get_charts(db: Session = Depends(get_db)):
    # Match distribution
    tier_counts = (
        db.query(MatchScore.tier, func.count(MatchScore.id))
        .group_by(MatchScore.tier)
        .all()
    )
    match_distribution = [{"tier": tier, "count": count} for tier, count in tier_counts]

    # By source
    source_counts = db.query(Job.source, func.count(Job.id)).group_by(Job.source).all()
    by_source = [{"source": source, "count": count} for source, count in source_counts]

    # By category
    category_counts = (
        db.query(Job.category, func.count(Job.id))
        .filter(Job.category.isnot(None))
        .group_by(Job.category)
        .all()
    )
    by_category = [{"category": cat, "count": count} for cat, count in category_counts]

    return ChartData(
        match_distribution=match_distribution,
        by_source=by_source,
        by_category=by_category,
    )
