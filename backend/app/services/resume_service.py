import json

from sqlalchemy.orm import Session

from app.matcher.embedder import get_embedder
from app.models import Resume
from app.parser.resume_parser import extract_skills, extract_text_from_pdf
from app.schemas.resume import ResumeUploadResponse


def process_resume_upload(db: Session, filename: str, pdf_bytes: bytes) -> ResumeUploadResponse:
    """Process a resume PDF: extract text, skills, and compute embedding."""
    # Extract text from PDF
    text = extract_text_from_pdf(pdf_bytes)
    if not text.strip():
        raise ValueError("Could not extract text from PDF. The file may be image-based.")

    # Extract skills
    skills = extract_skills(text)

    # Compute embedding
    embedder = get_embedder()
    embedding_bytes = embedder.encode_to_bytes(text)

    # Deactivate any existing active resumes
    db.query(Resume).filter(Resume.is_active == True).update({"is_active": False})

    # Create new resume record
    resume = Resume(
        filename=filename,
        extracted_text=text,
        skills=json.dumps(skills),
        embedding=embedding_bytes,
        is_active=True,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeUploadResponse(
        id=resume.id,
        filename=resume.filename,
        extracted_text_preview=text[:500] + ("..." if len(text) > 500 else ""),
        skills=skills,
        created_at=resume.created_at,
    )
