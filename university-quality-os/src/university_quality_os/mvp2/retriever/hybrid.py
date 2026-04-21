"""Hybrid retrieval = Reciprocal Rank Fusion of dense + sparse.

RRF combines rank-based signals robustly without tuning score ranges.
Paper: Cormack et al. 2009.
"""

import logging
from typing import Optional

from openai import OpenAI

from ...config import settings
from ..schemas import RetrievedChunk
from .dense import DenseRetriever
from .sparse import SparseRetriever

log = logging.getLogger("uqos.mvp2.hybrid")


class HybridRetriever:
    """Combines dense + sparse retrievers via RRF."""

    def __init__(
        self,
        dense: Optional[DenseRetriever] = None,
        sparse: Optional[SparseRetriever] = None,
        openai_client: Optional[OpenAI] = None,
    ):
        self.dense = dense or DenseRetriever(openai_client=openai_client)
        self.sparse = sparse or SparseRetriever()

    def search(
        self,
        query: str,
        top_k: int = 20,
        dept_filter: Optional[list[str]] = None,
        k_per_source: int = 30,
        rrf_k: int = 60,
    ) -> list[RetrievedChunk]:
        """Hybrid search with RRF fusion.

        - k_per_source: retrieve top-N from each source before fusion
        - rrf_k: RRF constant (60 is standard)
        """
        dense_results = self.dense.search(query, top_k=k_per_source, dept_filter=dept_filter)
        sparse_results = self.sparse.search(query, top_k=k_per_source, dept_filter=dept_filter)

        # RRF fusion
        fused: dict[str, dict] = {}  # chunk_id -> {chunk, rrf_score, sources}

        for rank, c in enumerate(dense_results):
            key = c.chunk_id
            if key not in fused:
                fused[key] = {"chunk": c, "rrf_score": 0.0, "sources": set()}
            fused[key]["rrf_score"] += 1.0 / (rrf_k + rank + 1)
            fused[key]["sources"].add("dense")

        for rank, c in enumerate(sparse_results):
            key = c.chunk_id
            if key not in fused:
                fused[key] = {"chunk": c, "rrf_score": 0.0, "sources": set()}
            fused[key]["rrf_score"] += 1.0 / (rrf_k + rank + 1)
            fused[key]["sources"].add("sparse")

        # Sort by RRF score
        ranked = sorted(fused.values(), key=lambda x: x["rrf_score"], reverse=True)[:top_k]

        results = []
        for item in ranked:
            c = item["chunk"]
            # Update source to hybrid/dense/sparse depending on coverage
            if len(item["sources"]) == 2:
                source = "hybrid"
            elif "dense" in item["sources"]:
                source = "dense"
            else:
                source = "sparse"

            results.append(RetrievedChunk(
                chunk_id=c.chunk_id,
                doc_id=c.doc_id,
                doc_path=c.doc_path,
                text=c.text,
                score=item["rrf_score"] * 100,  # scale up for display
                retrieval_source=source,
            ))

        return results
