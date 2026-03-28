import logging
import traceback

import pandas as pd
from jobspy import scrape_jobs

from app.scraper.base import BaseScraper, RawJobListing

logger = logging.getLogger(__name__)


class JobSpyScraper(BaseScraper):
    """Scraper using python-jobspy for Indeed, LinkedIn, Glassdoor, and Google Jobs."""

    def __init__(self, sites: list[str] | None = None):
        effective_sites = sites or ["indeed", "google"]
        self.non_glassdoor_sites = [s for s in effective_sites if s != "glassdoor"]
        self.include_glassdoor = "glassdoor" in effective_sites

    @property
    def source_name(self) -> str:
        return "jobspy"

    def scrape(
        self,
        search_terms: list[str],
        location: str = "",
        remote_only: bool = False,
        results_wanted: int = 50,
    ) -> list[RawJobListing]:
        all_jobs: list[RawJobListing] = []

        for term in search_terms:
            # Call A: non-Glassdoor sites (with location)
            if self.non_glassdoor_sites:
                try:
                    logger.info(f"Scraping '{term}' from {self.non_glassdoor_sites} in '{location}'")
                    kwargs: dict = {
                        "site_name": self.non_glassdoor_sites,
                        "search_term": term,
                        "results_wanted": results_wanted,
                        "country_indeed": "USA",
                    }
                    if location:
                        kwargs["location"] = location
                    if remote_only:
                        kwargs["is_remote"] = True

                    jobs_df = scrape_jobs(**kwargs)
                    parsed = self._parse_jobs_df(jobs_df, term)
                    all_jobs.extend(parsed)
                except Exception as e:
                    logger.error(f"Scraping failed for '{term}' (non-Glassdoor): {e}\n{traceback.format_exc()}")

            # Call B: Glassdoor only — always is_remote=True to bypass broken location lookup
            if self.include_glassdoor:
                try:
                    logger.info(f"Scraping '{term}' from glassdoor (remote, bypassing location lookup)")
                    kwargs_gd: dict = {
                        "site_name": ["glassdoor"],
                        "search_term": term,
                        "results_wanted": results_wanted,
                        "is_remote": True,
                    }
                    jobs_df_gd = scrape_jobs(**kwargs_gd)
                    parsed_gd = self._parse_jobs_df(jobs_df_gd, term)
                    all_jobs.extend(parsed_gd)
                except Exception as e:
                    logger.error(f"Scraping failed for '{term}' (Glassdoor): {e}\n{traceback.format_exc()}")

        return all_jobs

    def _parse_jobs_df(self, jobs_df: pd.DataFrame | None, term: str) -> list[RawJobListing]:
        """Parse a jobspy DataFrame into RawJobListing objects and log per-source counts."""
        if jobs_df is None or jobs_df.empty:
            logger.info(f"No results for '{term}'")
            return []

        # Log per-source breakdown
        if "site" in jobs_df.columns:
            for site, count in jobs_df.groupby("site").size().items():
                logger.info(f"  {site}: {count} results for '{term}'")
        else:
            logger.info(f"Got {len(jobs_df)} results for '{term}'")

        parsed: list[RawJobListing] = []
        for _, row in jobs_df.iterrows():
            try:
                job = RawJobListing(
                    title=str(row.get("title", "Unknown")),
                    company=str(row.get("company", "Unknown")),
                    location=str(row.get("location", "")) or None,
                    url=str(row.get("job_url", "")),
                    description=str(row.get("description", "")),
                    source=str(row.get("site", "unknown")),
                    posted_date=str(row.get("date_posted", "")) or None,
                    salary_min=_parse_salary(row.get("min_amount")),
                    salary_max=_parse_salary(row.get("max_amount")),
                    is_remote=bool(row.get("is_remote", False)),
                    external_id=str(row.get("id", "")) or None,
                )
                if job.url and job.description:
                    parsed.append(job)
            except Exception as e:
                logger.warning(f"Failed to parse job row: {e}")
                continue
        return parsed


def _parse_salary(value) -> int | None:
    """Parse salary value from jobspy dataframe."""
    if value is None:
        return None
    try:
        val = float(value)
        if val > 0:
            return int(val)
    except (ValueError, TypeError):
        pass
    return None
