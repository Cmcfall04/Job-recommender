import logging
import traceback

from jobspy import scrape_jobs

from app.scraper.base import BaseScraper, RawJobListing

logger = logging.getLogger(__name__)


class JobSpyScraper(BaseScraper):
    """Scraper using python-jobspy for Indeed, LinkedIn, Glassdoor, and Google Jobs."""

    def __init__(self, sites: list[str] | None = None):
        self.sites = sites or ["indeed", "google"]

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
            try:
                logger.info(f"Scraping '{term}' from {self.sites} in '{location}'")

                kwargs = {
                    "site_name": self.sites,
                    "search_term": term,
                    "results_wanted": results_wanted,
                    "country_indeed": "USA",
                }

                if location:
                    kwargs["location"] = location

                if remote_only:
                    kwargs["is_remote"] = True

                jobs_df = scrape_jobs(**kwargs)

                if jobs_df is None or jobs_df.empty:
                    logger.info(f"No results for '{term}'")
                    continue

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
                            all_jobs.append(job)
                    except Exception as e:
                        logger.warning(f"Failed to parse job row: {e}")
                        continue

                logger.info(f"Got {len(jobs_df)} results for '{term}'")

            except Exception as e:
                logger.error(f"Scraping failed for '{term}': {e}\n{traceback.format_exc()}")
                continue

        return all_jobs


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
