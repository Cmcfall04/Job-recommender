import json
import logging
from datetime import datetime

from sqlalchemy.exc import IntegrityError

from app.database import SessionLocal
from app.matcher.embedder import get_embedder
from app.matcher.scorer import score_jobs_against_resume
from app.models import Job, Resume, Scan
from app.parser.job_parser import (
    classify_job_category,
    detect_remote,
    extract_salary_range,
    generate_external_id,
)
from app.schemas.scan import ScanStartRequest
from app.scraper.base import RawJobListing
from app.scraper.handshake import HandshakeScraper
from app.scraper.jobspy_scraper import JobSpyScraper

logger = logging.getLogger(__name__)


def run_scan(scan_id: int, request: ScanStartRequest):
    """Run a full scan: scrape -> parse -> embed -> match. Runs in background."""
    db = SessionLocal()
    errors: list[str] = []
    new_job_ids: list[int] = []

    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            logger.error(f"Scan {scan_id} not found")
            return

        # --- Step 1: Scrape jobs from all sources ---
        all_raw_jobs: list[RawJobListing] = []

        # JobSpy sources (Indeed, Google, LinkedIn, Glassdoor)
        jobspy_sites = [s for s in request.sources if s in ("indeed", "google", "linkedin", "glassdoor")]
        if jobspy_sites:
            try:
                scraper = JobSpyScraper(sites=jobspy_sites)
                jobs = scraper.scrape(
                    search_terms=request.search_terms,
                    location=request.location,
                    remote_only=request.remote_only,
                )
                all_raw_jobs.extend(jobs)
                logger.info(f"JobSpy returned {len(jobs)} jobs")
            except Exception as e:
                error_msg = f"JobSpy scraping failed: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # Handshake
        if "handshake" in request.sources:
            try:
                scraper = HandshakeScraper()
                jobs = scraper.scrape(
                    search_terms=request.search_terms,
                    location=request.location,
                    remote_only=request.remote_only,
                )
                all_raw_jobs.extend(jobs)
            except Exception as e:
                error_msg = f"Handshake scraping failed: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # --- Step 2: Parse and store jobs ---
        for raw_job in all_raw_jobs:
            try:
                external_id = raw_job.external_id or generate_external_id(raw_job.url, raw_job.source)
                is_remote = raw_job.is_remote or detect_remote(
                    raw_job.title, raw_job.location, raw_job.description
                )
                category = classify_job_category(raw_job.title, raw_job.description)

                salary_min = raw_job.salary_min
                salary_max = raw_job.salary_max
                if not salary_min and not salary_max:
                    salary_min, salary_max = extract_salary_range(raw_job.description)

                job = Job(
                    external_id=external_id,
                    title=raw_job.title,
                    company=raw_job.company,
                    location=raw_job.location,
                    is_remote=is_remote,
                    source=raw_job.source,
                    url=raw_job.url,
                    description=raw_job.description,
                    posted_date=raw_job.posted_date,
                    category=category,
                    salary_min=salary_min,
                    salary_max=salary_max,
                    scan_id=scan_id,
                )
                db.add(job)
                db.flush()  # Get the ID
                new_job_ids.append(job.id)

            except IntegrityError:
                db.rollback()
                logger.debug(f"Duplicate job skipped: {raw_job.title} at {raw_job.company}")
                continue
            except Exception as e:
                db.rollback()
                logger.warning(f"Failed to store job: {e}")
                continue

        db.commit()

        # --- Step 3: Compute embeddings for new jobs ---
        if new_job_ids:
            try:
                embedder = get_embedder()
                jobs_to_embed = db.query(Job).filter(Job.id.in_(new_job_ids)).all()

                texts = [f"{j.title} at {j.company}. {j.description}" for j in jobs_to_embed]
                embedding_bytes_list = embedder.encode_batch_to_bytes(texts)

                for job, emb_bytes in zip(jobs_to_embed, embedding_bytes_list):
                    job.embedding = emb_bytes

                db.commit()
                logger.info(f"Embedded {len(jobs_to_embed)} jobs")
            except Exception as e:
                error_msg = f"Embedding failed: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)

        # --- Step 4: Score against active resume ---
        active_resume = db.query(Resume).filter(Resume.is_active == True).first()
        if active_resume and new_job_ids:
            try:
                score_jobs_against_resume(db, active_resume.id, new_job_ids)
            except Exception as e:
                error_msg = f"Scoring failed: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
        elif not active_resume:
            logger.warning("No active resume found — skipping scoring")

        # --- Step 5: Update scan record ---
        scan.status = "completed"
        scan.total_jobs = len(new_job_ids)
        scan.errors = json.dumps(errors) if errors else None
        scan.completed_at = datetime.utcnow()
        db.commit()

        logger.info(f"Scan {scan_id} completed: {len(new_job_ids)} new jobs")

    except Exception as e:
        logger.error(f"Scan {scan_id} failed: {e}")
        try:
            scan = db.query(Scan).filter(Scan.id == scan_id).first()
            if scan:
                scan.status = "failed"
                scan.errors = json.dumps(errors + [str(e)])
                scan.completed_at = datetime.utcnow()
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
