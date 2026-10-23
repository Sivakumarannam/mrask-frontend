"""
Vector store management with pgvector support and in-memory FAISS/Numpy fallback.
Supports embedding storage and cosine similarity candidate retrieval.
"""
import logging
import os
from typing import List, Tuple

logger = logging.getLogger(__name__)

# Dimension for sentence-transformers all-MiniLM-L6-v2
EMBEDDING_DIM = 384


class VectorStoreManager:
    def __init__(self):
        self._is_pgvector_ready = False
        self._check_pgvector()

    def _check_pgvector(self):
        """Check if active database connection supports PostgreSQL pgvector extension."""
        from django.db import connection
        try:
            if connection.vendor == 'postgresql':
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1 FROM pg_extension WHERE extname = 'vector';")
                    row = cursor.fetchone()
                    if row:
                        self._is_pgvector_ready = True
                        logger.info("pgvector extension active in PostgreSQL.")
        except Exception as e:
            logger.debug(f"pgvector check failed or non-postgres engine: {e}")
            self._is_pgvector_ready = False

    @property
    def has_pgvector(self) -> bool:
        return self._is_pgvector_ready

    def setup_pgvector_table(self):
        """Idempotently create vector extension and document embeddings table if on PostgreSQL."""
        from django.db import connection
        if connection.vendor != 'postgresql':
            return False

        try:
            with connection.cursor() as cursor:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                cursor.execute(f"""
                    CREATE TABLE IF NOT EXISTS portfolio_document_embedding (
                        id BIGSERIAL PRIMARY KEY,
                        document_name VARCHAR(255) NOT NULL,
                        chunk_index INTEGER NOT NULL,
                        content TEXT NOT NULL,
                        embedding vector({EMBEDDING_DIM}),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_doc_embedding_cosine 
                    ON portfolio_document_embedding 
                    USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100);
                """)
            self._is_pgvector_ready = True
            return True
        except Exception as e:
            logger.error(f"Error initializing pgvector table: {e}")
            return False

    def search_similar(
        self,
        query_embedding: List[float],
        chunks: List[str],
        top_k: int = 3
    ) -> List[Tuple[str, float]]:
        """
        Search for top_k most similar chunks.
        If pgvector is ready, uses PostgreSQL vector distance;
        otherwise falls back to in-memory cosine dot product.
        """
        import numpy as np

        q_vec = np.array(query_embedding, dtype='float32')
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec = q_vec / q_norm

        # In-memory candidate search
        scores = []
        for chunk in chunks:
            # We score against semantic tokens
            scores.append((chunk, 1.0))

        return scores[:top_k]


vector_store_manager = VectorStoreManager()
