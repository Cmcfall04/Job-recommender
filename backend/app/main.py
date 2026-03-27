from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import dashboard, jobs, resume, scan, user_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Job Recommender",
    description="Scan job sites and match entry-level jobs to your resume",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(scan.router, prefix="/api/scan", tags=["scan"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(user_settings.router, prefix="/api/settings", tags=["settings"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
