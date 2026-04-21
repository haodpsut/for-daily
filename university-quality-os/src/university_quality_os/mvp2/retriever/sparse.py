"""Sparse (keyword) retrieval via BM25.

BM25 is computed in-memory from all chunks. For ~1000 chunks this is
instant and memory-light. If scale grows, switch to Postgres full-text or
Elasticsearch.
"""

import logging
import re
import unicodedata
from typing import Optional

from rank_bm25 import BM25Okapi

from ..indexer import get_db_connection
from ..schemas import RetrievedChunk

log = logging.getLogger("uqos.mvp2.sparse")


def normalize_vietnamese(text: str) -> str:
    """Remove diacritics + lowercase (for keyword matching robustness)."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.replace("đ", "d").replace("Đ", "D")
    return text.lower()


def tokenize(text: str) -> list[str]:
    """Simple whitespace tokenizer with Vietnamese normalization."""
    normalized = normalize_vietnamese(text)
    # Word tokens
    tokens = re.findall(r"\b[a-z0-9]{2,}\b", normalized)
    return tokens


class SparseRetriever:
    """BM25 search over all chunks (in-memory).

    Loads all chunks on first use, then caches.
    """

    def __init__(self):
        self._bm25: Optional[BM25Okapi] = None
        self._chunks: list[dict] = []
        self._loaded = False

    def _load(self) -> None:
        """Load chunks + build BM25 index. Called lazily."""
        if self._loaded:
            return

        log.info("Loading chunks + building BM25 index...")
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT chunk_id, doc_id, doc_path, text, dept
                    FROM chunks
                    ORDER BY id;
                """)
                rows = cur.fetchall()
        finally:
            conn.close()

        self._chunks = [
            {"chunk_id": r[0], "doc_id": r[1], "doc_path": r[2] or "",
             "text": r[3], "dept": r[4] or ""}
            for r in rows
        ]

        if not self._chunks:
            log.warning("No chunks in DB — SparseRetriever is empty")
            self._loaded = True
            return

        tokenized = [tokenize(c["text"]) for c in self._chunks]
        self._bm25 = BM25Okapi(tokenized)
        log.info(f"  BM25 ready for {len(self._chunks)} chunks")
        self._loaded = True

    def invalidate(self) -> None:
        """Force reload on next search (call after re-indexing)."""
        self._loaded = False
        self._bm25 = None
        self._chunks = []

    def search(
        self,
        query: str,
        top_k: int = 20,
        dept_filter: Optional[list[str]] = None,
    ) -> list[RetrievedChunk]:
        self._load()
        if not self._bm25 or not self._chunks:
            return []

        q_tokens = tokenize(query)
        if not q_tokens:
            return []

        scores = self._bm25.get_scores(q_tokens)

        # Apply dept filter
        if dept_filter:
            dept_set = set(dept_filter)
            scores = [
                s if self._chunks[i]["dept"] in dept_set else -1e9
                for i, s in enumerate(scores)
            ]

        # Top-k indices
        indexed = list(enumerate(scores))
        indexed.sort(key=lambda x: x[1], reverse=True)
        top = indexed[:top_k]

        max_score = max((s for _, s in top if s > 0), default=1.0)

        results = []
        for idx, score in top:
            if score <= 0:
                continue
            c = self._chunks[idx]
            results.append(RetrievedChunk(
                chunk_id=c["chunk_id"],
                doc_id=c["doc_id"],
                doc_path=c["doc_path"],
                text=c["text"],
                score=score / max_score if max_score > 0 else 0.0,  # normalize to 0-1
                retrieval_source="sparse",
            ))

        return results
