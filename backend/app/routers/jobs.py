import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job, JobStatus, MatchScore
from app.schemas.job import JobDetailResponse, JobListResponse, JobResponse, JobUpdateRequest

router = APIRouter()


def _build_job_response(job: Job, db: Session) -> dict:
    """Build a job response dict with match score and status info."""
    match = db.query(MatchScore).filter(MatchScore.job_id == job.id).first()
    status_entry = db.query(JobStatus).filter(JobStatus.job_id == job.id).first()

    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "is_remote": job.is_remote,
        "source": job.source,
        "url": job.url,
        "description": job.description,
        "posted_date": job.posted_date,
        "category": job.category,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "match_score": match.score if match else None,
        "match_tier": match.tier if match else None,
        "skills_matched": json.loads(match.skills_matched) if match and match.skills_matched else None,
        "status": status_entry.status if status_entry else "new",
        "created_at": job.created_at,
    }


@router.get("", response_model=JobListResponse)
def list_jobs(
    match_tier: str | None = None,
    source: str | None = None,
    location: str | None = None,
    remote: bool | None = None,
    category: str | None = None,
    status: str | None = None,
    sort: str = "match_score",
    order: str = "desc",
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Job)

    # Join match scores for filtering/sorting
    query = query.outerjoin(MatchScore, MatchScore.job_id == Job.id)
    query = query.outerjoin(JobStatus, JobStatus.job_id == Job.id)

    if match_tier:
        query = query.filter(MatchScore.tier == match_tier)
    if source:
        query = query.filter(Job.source == source)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if remote is not None:
        query = query.filter(Job.is_remote == remote)
    if category:
        query = query.filter(Job.category == category)
    if status:
        query = query.filter(JobStatus.status == status)

    # Sorting
    if sort == "match_score":
        sort_col = MatchScore.score
    elif sort == "date":
        sort_col = Job.created_at
    elif sort == "company":
        sort_col = Job.company
    else:
        sort_col = MatchScore.score

    if order == "asc":
        query = query.order_by(sort_col.asc().nullslast())
    else:
        query = query.order_by(sort_col.desc().nullsfirst())

    total = query.count()
    jobs = query.offset((page - 1) * per_page).limit(per_page).all()

    job_responses = [JobResponse(**_build_job_response(j, db)) for j in jobs]
    return JobListResponse(jobs=job_responses, total=total, page=page, per_page=per_page)


@router.get("/{job_id}", response_model=JobDetailResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobDetailResponse(**_build_job_response(job, db))


@router.patch("/{job_id}", response_model=JobResponse)
def update_job_status(job_id: int, request: JobUpdateRequest, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    status_entry = db.query(JobStatus).filter(JobStatus.job_id == job_id).first()
    if status_entry:
        status_entry.status = request.status
    else:
        status_entry = JobStatus(job_id=job_id, status=request.status)
        db.add(status_entry)

    db.commit()
    return JobResponse(**_build_job_response(job, db))
