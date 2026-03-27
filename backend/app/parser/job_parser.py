import hashlib
import re

# Category keywords for classifying jobs
CATEGORY_KEYWORDS = {
    "SWE": [
        "software engineer", "software developer", "sde", "swe", "web developer",
        "frontend", "front-end", "backend", "back-end", "full stack", "fullstack",
        "application developer", "mobile developer", "ios developer", "android developer",
    ],
    "IT": [
        "it support", "it specialist", "help desk", "helpdesk", "system administrator",
        "sysadmin", "network engineer", "network administrator", "desktop support",
        "technical support", "it analyst", "it technician", "infrastructure",
    ],
    "AI/ML": [
        "machine learning", "ml engineer", "ai engineer", "artificial intelligence",
        "data scientist", "data engineer", "deep learning", "nlp", "computer vision",
        "research engineer", "research scientist",
    ],
    "Cybersecurity": [
        "cybersecurity", "security analyst", "security engineer", "soc analyst",
        "penetration test", "pen test", "information security", "infosec",
        "threat", "vulnerability", "incident response", "security operations",
    ],
}


def classify_job_category(title: str, description: str) -> str | None:
    """Classify a job into a category based on title and description."""
    text = f"{title} {description}".lower()

    # Check title first (more reliable)
    title_lower = title.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return category

    # Fall back to description
    for category, keywords in CATEGORY_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text)
        if matches >= 2:
            return category

    return "Other"


def generate_external_id(url: str, source: str) -> str:
    """Generate a unique external ID for deduplication."""
    return hashlib.md5(f"{source}:{url}".encode()).hexdigest()


def detect_remote(title: str, location: str | None, description: str) -> bool:
    """Detect if a job is remote based on title, location, and description."""
    text = f"{title} {location or ''} {description[:500]}".lower()
    remote_patterns = ["remote", "work from home", "wfh", "telecommute", "distributed"]
    return any(pattern in text for pattern in remote_patterns)


def extract_salary_range(description: str) -> tuple[int | None, int | None]:
    """Try to extract salary range from job description."""
    # Match patterns like "$60,000 - $80,000" or "$60k-$80k"
    patterns = [
        r"\$(\d{2,3}),?(\d{3})\s*[-–to]+\s*\$(\d{2,3}),?(\d{3})",
        r"\$(\d{2,3})k\s*[-–to]+\s*\$(\d{2,3})k",
    ]

    for pattern in patterns:
        match = re.search(pattern, description, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 4:
                salary_min = int(groups[0] + groups[1])
                salary_max = int(groups[2] + groups[3])
                return salary_min, salary_max
            elif len(groups) == 2:
                return int(groups[0]) * 1000, int(groups[1]) * 1000

    return None, None
