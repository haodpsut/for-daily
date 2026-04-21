"""Dense retrieval via pgvector cosine similarity."""

import logging
from typing import Optional

from openai import OpenAI

from ...config import settings
from ..indexer import EMBEDDING_MODEL, get_db_connection
from ..schemas import RetrievedChunk

log = logging.getLogger("uqos.mvp2.dense")


class DenseRetriever:
    """Semantic search using OpenAI embeddings + pgvector."""

    def __init__(self, openai_client: Optional[OpenAI] = None):
        self.client = openai_client or OpenAI(api_key=settings.openai_api_key)

    def embed_query(self, query: str) -> list[float]:
        resp = self.client.embeddings.create(model=EMBEDDING_MODEL, input=query)
        return resp.data[0].embedding

    def search(
        self,
        query: str,
        top_k: int = 20,
        dept_filter: Optional[list[str]] = None,
    ) -> list[RetrievedChunk]:
        """Return top-k chunks most similar to query (cosine distance)."""
        embedding = self.embed_query(query)
        vec_str = "[" + ",".join(str(x) for x in embedding) + "]"

        where_clauses = []
        params = []
        if dept_filter:
            where_clauses.append("dept = ANY(%s)")
            params.append(dept_filter)

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        sql = f"""
            SELECT chunk_id, doc_id, doc_path, text,
                   1 - (embedding <=> %s::vector) AS similarity
            FROM chunks
            {where_sql}
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """
        params = [vec_str] + params + [vec_str, top_k]

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                rows = cur.fetchall()
        finally:
            conn.close()

        results = []
        for chunk_id, doc_id, doc_path, text, similarity in rows:
            results.append(RetrievedChunk(
                chunk_id=chunk_id,
                doc_id=doc_id,
                doc_path=doc_path or "",
                text=text,
                score=float(similarity),
                retrieval_source="dense",
            ))

        return results
