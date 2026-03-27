import io
import re

import pdfplumber

# Curated list of tech skills for CS/IT/AI/Cybersecurity entry-level roles
TECH_SKILLS = {
    # Programming languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "html", "css", "sql", "bash", "shell", "powershell",
    # Frameworks & libraries
    "react", "angular", "vue", "vue.js", "next.js", "nextjs", "node.js", "nodejs",
    "express", "django", "flask", "fastapi", "spring", "spring boot",
    ".net", "asp.net", "rails", "ruby on rails", "laravel", "svelte",
    "tailwind", "tailwindcss", "bootstrap", "jquery", "redux",
    # Data / ML
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "seaborn", "jupyter", "spark", "hadoop", "kafka",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "data science", "data analysis", "data engineering",
    "neural networks", "reinforcement learning",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "oracle", "sql server", "dynamodb", "cassandra", "elasticsearch",
    "firebase", "supabase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "ci/cd", "github actions",
    "gitlab ci", "circleci", "heroku", "vercel", "netlify",
    # Tools
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "linux", "unix", "windows server", "macos",
    "vs code", "vim", "intellij", "eclipse",
    "postman", "swagger", "rest", "restful", "graphql", "grpc",
    "api", "microservices", "websockets",
    # Cybersecurity
    "cybersecurity", "penetration testing", "pen testing", "ethical hacking",
    "network security", "information security", "soc", "siem",
    "splunk", "wireshark", "nmap", "burp suite", "metasploit",
    "owasp", "vulnerability assessment", "incident response",
    "cryptography", "encryption", "firewall", "ids", "ips",
    "compliance", "risk assessment", "security audit",
    # IT / Networking
    "tcp/ip", "dns", "dhcp", "vpn", "lan", "wan", "routing",
    "switching", "active directory", "ldap", "vmware", "virtualization",
    "help desk", "technical support", "troubleshooting",
    "comptia", "a+", "network+", "security+", "ccna", "cissp",
    # Math / Statistics (relevant for math minor)
    "statistics", "linear algebra", "calculus", "probability",
    "optimization", "algorithms", "data structures",
    # Soft skills (commonly matched)
    "agile", "scrum", "kanban", "problem solving", "communication",
    "teamwork", "leadership", "project management",
}


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_skills(text: str) -> list[str]:
    """Extract known tech skills from resume text."""
    text_lower = text.lower()
    found_skills = []

    for skill in TECH_SKILLS:
        # Use word boundary matching for short skills to avoid false positives
        if len(skill) <= 2:
            pattern = rf"\b{re.escape(skill)}\b"
            if re.search(pattern, text_lower):
                found_skills.append(skill)
        else:
            if skill in text_lower:
                found_skills.append(skill)

    # Sort alphabetically and capitalize properly
    found_skills.sort()
    return found_skills
