import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume
from app.schemas.resume import ResumeResponse, ResumeUploadResponse
from app.services.resume_service import process_resume_upload

router = APIRouter()


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    result = process_resume_upload(db, file.filename, content)
    return result


@router.get("/current", response_model=ResumeResponse | None)
def get_current_resume(db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.is_active == True).order_by(Resume.created_at.desc()).first()
    if not resume:
        return None
    return ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        skills=json.loads(resume.skills),
        created_at=resume.created_at,
    )


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
