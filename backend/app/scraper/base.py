from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RawJobListing:
    """Normalized job listing from any scraper source."""
    title: str
    company: str
    location: str | None
    url: str
    description: str
    source: str
    posted_date: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    is_remote: bool = False
    external_id: str | None = None


class BaseScraper(ABC):
    @abstractmethod
    def scrape(
        self,
        search_terms: list[str],
        location: str = "",
        remote_only: bool = False,
        results_wanted: int = 50,
    ) -> list[RawJobListing]:
        """Scrape job listings and return normalized results."""
        ...

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Return the name of this scraping source."""
        ...
