# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Job-recommender

Scan multiple job sites and recommend the best **entry-level** jobs based on a resume using NLP/semantic matching.

## Target Audience
New graduates entering the workforce. Focus exclusively on **entry-level positions** in CS fields: SWE/SDE, IT (sysadmin, helpdesk, network), AI/ML, and Cybersecurity (analyst, SOC, pentest).

## Tech Stack
- **Backend**: Python 3.13 + FastAPI + SQLAlchemy + SQLite
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Matching**: sentence-transformers (all-MiniLM-L6-v2, local CPU)
- **Scraping**: python-jobspy (Indeed, LinkedIn, Glassdoor, Google) + Playwright (Handshake)

## Commands

### Backend
```bash
cd backend
source venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # Vite dev server on :5173, proxies /api → :8001
npm run build  # Production build to frontend/dist/
```

## Architecture

```
backend/app/
  config.py          — pydantic-settings (reads .env); singleton `settings` object
  database.py        — SQLAlchemy engine + SessionLocal + Base
  models.py          — ORM models: Resume, Scan, Job, MatchScore, JobStatus, UserSettings
  schemas/           — Pydantic request/response models (one file per router)
  routers/           — FastAPI route handlers: resume, scan, jobs, dashboard, user_settings
  services/          — Orchestration: scan_service, resume_service, dashboard_service
  scraper/           — BaseScraper ABC + RawJobListing dataclass; JobSpyScraper, HandshakeScraper
  parser/            — resume_parser (PDF→text+skills), job_parser (classify, detect_remote, salary)
  matcher/           — Embedder singleton (sentence-transformers), scorer (cosine similarity)

frontend/src/
  api/client.ts      — axios instance, baseURL "/api"
  types/index.ts     — all TypeScript interfaces mirroring backend Pydantic schemas
  hooks/             — React Query hooks (one per resource: useJobs, useScan, useResume, useDashboard)
  pages/             — Route-level components (Dashboard, Jobs, JobDetail, ResumeUpload, Settings)
  components/        — Reusable UI (Layout, JobTable, FilterBar, MatchBadge, StatsCards, charts)
```

## Key Design Decisions

**Scan pipeline** (`services/scan_service.py:run_scan`): runs as a FastAPI `BackgroundTask` with its own `SessionLocal()` (not the request DB session). Steps: scrape → parse/deduplicate → embed → score → update scan record.

**Deduplication**: `Job` has `UniqueConstraint("external_id", "source")`. `IntegrityError` on insert = duplicate, silently skipped.

**Embedder**: lazy-loaded module-level singleton in `matcher/embedder.py`. First call to `get_embedder()` downloads the model and holds it in memory for the process lifetime.

**JSON fields in SQLite**: `Scan.sources`, `Scan.search_terms`, `Scan.errors`, `Resume.skills`, `UserSettings.search_terms`, `MatchScore.skills_matched` are all stored as JSON strings — serialize/deserialize manually.

**UserSettings singleton**: enforced by `CheckConstraint("id = 1")`. Always upsert with `id=1`.

**Match score tiers**: Strong > 0.55, Medium 0.35–0.55, Low < 0.35. Stored in `MatchScore.tier`.

**Handshake scraper**: Phase 2 stub — needs university SSO automation via Playwright.

## Environment Setup
```bash
cp .env.example .env
# Required for Handshake: HANDSHAKE_EMAIL, HANDSHAKE_PASSWORD
# Optional: SERPAPI_KEY, RAPIDAPI_KEY
# Default DB: sqlite:///./jobs.db (created in backend/ at startup)
```

## Code Style
- Python: type hints, Pydantic models for validation, SQLAlchemy ORM
- TypeScript: strict mode, interfaces in `types/index.ts`, React Query for server state
- CSS: Tailwind utility classes, minimal Notion-style design

## Workflow
- Feature branches from `main`: use `feat/` or `fix/` prefixes
- Scrapers use rate limiting and rotating user agents — don't bypass these
- Consult user before adding paid API integrations (SerpAPI, RapidAPI)
