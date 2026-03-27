import logging

import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """Lazy-load the sentence transformer model (singleton)."""
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {settings.embedding_model}")
        _model = SentenceTransformer(settings.embedding_model)
        logger.info("Model loaded successfully")
    return _model


class Embedder:
    """Handles text embedding using sentence-transformers."""

    def __init__(self):
        self.model = get_model()

    def encode(self, text: str) -> np.ndarray:
        """Encode a single text string into an embedding vector."""
        return self.model.encode(text, show_progress_bar=False)

    def encode_batch(self, texts: list[str], batch_size: int = 64) -> np.ndarray:
        """Encode a batch of texts into embedding vectors."""
        return self.model.encode(texts, batch_size=batch_size, show_progress_bar=True)

    def encode_to_bytes(self, text: str) -> bytes:
        """Encode text and return as bytes for database storage."""
        embedding = self.encode(text)
        return embedding.astype(np.float32).tobytes()

    def encode_batch_to_bytes(self, texts: list[str], batch_size: int = 64) -> list[bytes]:
        """Encode a batch and return each as bytes."""
        embeddings = self.encode_batch(texts, batch_size)
        return [emb.astype(np.float32).tobytes() for emb in embeddings]

    @staticmethod
    def bytes_to_numpy(embedding_bytes: bytes) -> np.ndarray:
        """Convert stored bytes back to numpy array."""
        return np.frombuffer(embedding_bytes, dtype=np.float32)


_embedder: Embedder | None = None


def get_embedder() -> Embedder:
    """Get the singleton embedder instance."""
    global _embedder
    if _embedder is None:
        _embedder = Embedder()
    return _embedder
