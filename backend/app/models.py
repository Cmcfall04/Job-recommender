from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=False)
    skills = Column(Text, nullable=False)  # JSON array
    embedding = Column(LargeBinary, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    match_scores = relationship("MatchScore", back_populates="resume", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String, nullable=False, default="running")
    sources = Column(Text, nullable=False)  # JSON array
    search_terms = Column(Text, nullable=False)  # JSON array
    location = Column(String, nullable=True)
    remote_only = Column(Boolean, nullable=False, default=False)
    total_jobs = Column(Integer, nullable=False, default=0)
    errors = Column(Text, nullable=True)  # JSON array
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    jobs = relationship("Job", back_populates="scan")


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        UniqueConstraint("external_id", "source", name="uq_job_source"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=True)
    is_remote = Column(Boolean, nullable=False, default=False)
    source = Column(String, nullable=False)
    url = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    posted_date = Column(String, nullable=True)
    category = Column(String, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    embedding = Column(LargeBinary, nullable=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="jobs")
    match_scores = relationship("MatchScore", back_populates="job", cascade="all, delete-orphan")
    status_entry = relationship("JobStatus", back_populates="job", uselist=False, cascade="all, delete-orphan")


class MatchScore(Base):
    __tablename__ = "match_scores"
    __table_args__ = (
        UniqueConstraint("resume_id", "job_id", name="uq_resume_job"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    score = Column(Float, nullable=False)
    tier = Column(String, nullable=False)  # strong | medium | low
    skills_matched = Column(Text, nullable=True)  # JSON array
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="match_scores")
    job = relationship("Job", back_populates="match_scores")


class JobStatus(Base):
    __tablename__ = "job_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), unique=True, nullable=False)
    status = Column(String, nullable=False, default="new")  # new | saved | applied | hidden
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    job = relationship("Job", back_populates="status_entry")


class UserSettings(Base):
    __tablename__ = "settings"
    __table_args__ = (
        CheckConstraint("id = 1", name="singleton_settings"),
    )

    id = Column(Integer, primary_key=True, default=1)
    preferred_location = Column(String, nullable=True)
    remote_only = Column(Boolean, nullable=False, default=False)
    search_terms = Column(Text, nullable=True)  # JSON array
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
