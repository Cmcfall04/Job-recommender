import json
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Scan
from app.schemas.scan import (
    ScanHistoryResponse,
    ScanStartRequest,
    ScanStartResponse,
    ScanStatusResponse,
)
from app.services.scan_service import run_scan

router = APIRouter()


@router.post("/start", response_model=ScanStartResponse)
def start_scan(
    request: ScanStartRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    scan = Scan(
        status="running",
        sources=json.dumps(request.sources),
        search_terms=json.dumps(request.search_terms),
        location=request.location,
        remote_only=request.remote_only,
        started_at=datetime.utcnow(),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    background_tasks.add_task(run_scan, scan.id, request)
    return ScanStartResponse(scan_id=scan.id, status="running")


@router.get("/{scan_id}/status", response_model=ScanStatusResponse)
def get_scan_status(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanStatusResponse(
        scan_id=scan.id,
        status=scan.status,
        total_jobs=scan.total_jobs,
        sources_completed=json.loads(scan.sources) if scan.status == "completed" else [],
        errors=json.loads(scan.errors) if scan.errors else [],
        started_at=scan.started_at,
        completed_at=scan.completed_at,
    )


@router.get("/history", response_model=list[ScanHistoryResponse])
def get_scan_history(db: Session = Depends(get_db)):
    scans = db.query(Scan).order_by(Scan.started_at.desc()).limit(20).all()
    return [
        ScanHistoryResponse(
            scan_id=s.id,
            started_at=s.started_at,
            status=s.status,
            total_jobs=s.total_jobs,
        )
        for s in scans
    ]
