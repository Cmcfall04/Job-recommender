import json
import logging

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.matcher.embedder import Embedder, get_embedder
from app.models import Job, MatchScore, Resume
from app.parser.resume_parser import extract_skills

logger = logging.getLogger(__name__)

STRONG_THRESHOLD = 0.55
MEDIUM_THRESHOLD = 0.35


def categorize_score(score: float) -> str:
    """Categorize a match score into a tier."""
    if score >= STRONG_THRESHOLD:
        return "strong"
    elif score >= MEDIUM_THRESHOLD:
        return "medium"
    return "low"


def compute_skill_overlap(resume_skills: list[str], job_text: str) -> list[str]:
    """Find skills from resume that appear in the job description."""
    job_skills = extract_skills(job_text)
    return sorted(set(resume_skills) & set(job_skills))


def score_jobs_against_resume(db: Session, resume_id: int, job_ids: list[int]):
    """Compute match scores for a set of jobs against a resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        logger.error(f"Resume {resume_id} not found")
        return

    embedder = get_embedder()
    resume_embedding = Embedder.bytes_to_numpy(resume.embedding).reshape(1, -1)
    resume_skills = json.loads(resume.skills)

    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()
    if not jobs:
        return

    # Batch compute similarities
    job_embeddings = []
    valid_jobs = []
    for job in jobs:
        if job.embedding:
            job_embeddings.append(Embedder.bytes_to_numpy(job.embedding))
            valid_jobs.append(job)

    if not valid_jobs:
        return

    job_matrix = np.vstack(job_embeddings)
    scores = cosine_similarity(resume_embedding, job_matrix)[0]

    for job, score in zip(valid_jobs, scores):
        score_val = float(score)
        tier = categorize_score(score_val)
        skills_matched = compute_skill_overlap(resume_skills, job.description)

        # Upsert match score
        existing = (
            db.query(MatchScore)
            .filter(MatchScore.resume_id == resume_id, MatchScore.job_id == job.id)
            .first()
        )
        if existing:
            existing.score = score_val
            existing.tier = tier
            existing.skills_matched = json.dumps(skills_matched)
        else:
            match_score = MatchScore(
                resume_id=resume_id,
                job_id=job.id,
                score=score_val,
                tier=tier,
                skills_matched=json.dumps(skills_matched),
            )
            db.add(match_score)

    db.commit()
    logger.info(f"Scored {len(valid_jobs)} jobs against resume {resume_id}")
