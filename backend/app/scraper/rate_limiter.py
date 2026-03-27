import asyncio
import time


class RateLimiter:
    """Simple token-bucket rate limiter."""

    def __init__(self, requests_per_minute: int = 10):
        self.min_interval = 60.0 / requests_per_minute
        self._last_request = 0.0

    def wait(self):
        """Block until we can make the next request."""
        now = time.time()
        elapsed = now - self._last_request
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self._last_request = time.time()
