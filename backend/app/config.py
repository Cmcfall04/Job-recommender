from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./jobs.db"
    embedding_model: str = "all-MiniLM-L6-v2"
    frontend_url: str = "http://localhost:5173"
    handshake_email: str = ""
    handshake_password: str = ""
    serpapi_key: str = ""
    rapidapi_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
