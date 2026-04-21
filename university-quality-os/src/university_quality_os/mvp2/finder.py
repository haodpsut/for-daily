"""Main EvidenceFinder — orchestrates retrieve → rerank → coverage."""

import logging
import time
from typing import Optional

from anthropic import Anthropic
from openai import OpenAI

from ..config import settings
from ..utils import estimate_cost_vnd
from .coverage import CoverageAnalyzer
from .indexer import estimate_embedding_cost_vnd
from .reranker import Reranker
from .retriever import HybridRetriever
from .schemas import EvidenceQuery, EvidenceResult

log = logging.getLogger("uqos.mvp2.finder")


class EvidenceFinder:
    """Find evidence for a KĐCLGD criterion (or free-text query)."""

    def __init__(
        self,
        criteria_data: Optional[dict] = None,
        retriever: Optional[HybridRetriever] = None,
        reranker: Optional[Reranker] = None,
        coverage_analyzer: Optional[CoverageAnalyzer] = None,
        anthropic_client: Optional[Anthropic] = None,
        openai_client: Optional[OpenAI] = None,
        model: Optional[str] = None,
    ):
        self.criteria_data = criteria_data
        self.retriever = retriever or HybridRetriever(openai_client=openai_client)
        self.reranker = reranker or Reranker(anthropic_client=anthropic_client, model=model)
        self.coverage = coverage_analyzer or CoverageAnalyzer(
            anthropic_client=anthropic_client, model=model
        )
        self.model = model or settings.claude_model_fast

    def _build_query_text(self, query: EvidenceQuery) -> tuple[str, Optional[dict]]:
        """Convert EvidenceQuery → query text + criterion context (if by ID)."""
        if query.criterion_id and self.criteria_data:
            # Find criterion in data
            for std in self.criteria_data.get("standards", []):
                for c in std.get("criteria", []):
                    if c["id"] == query.criterion_id:
                        # Build rich query text
                        parts = [c["name"]]
                        parts.extend(c.get("requirements", []))
                        parts.extend(c.get("keywords", [])[:5])
                        return " ".join(parts), c
            # Not found — fall back to ID as text
            return query.criterion_id, None

        return (query.query_text or "", None)

    def find(self, query: EvidenceQuery) -> EvidenceResult:
        """Full find pipeline."""
        if not query.is_valid():
            return EvidenceResult(query=query, error="Query must have criterion_id or query_text")

        result = EvidenceResult(query=query, model_used=self.model)
        t_start = time.time()

        # 1. Build query text + get criterion context
        query_text, criterion = self._build_query_text(query)

        # 2. Hybrid retrieval
        t0 = time.time()
        try:
            candidates = self.retriever.search(
                query=query_text,
                top_k=20,
                dept_filter=query.dept_filter,
            )
        except Exception as e:
            result.error = f"Retrieval failed: {e}"
            result.latency_ms_total = int((time.time() - t_start) * 1000)
            return result
        result.latency_ms_retrieval = int((time.time() - t0) * 1000)

        # Embedding cost for query
        result.embedding_cost_vnd = estimate_embedding_cost_vnd(len(query_text))

        if not candidates:
            result.latency_ms_total = int((time.time() - t_start) * 1000)
            return result  # no matches, return empty

        # 3. Rerank
        if query.rerank:
            matches, meta = self.reranker.rerank(query_text, candidates, top_k=query.top_k)
            result.matches = matches
            result.latency_ms_rerank = meta.get("latency_ms", 0)
            result.tokens_input += meta.get("tokens_in", 0)
            result.tokens_output += meta.get("tokens_out", 0)
            result.cost_vnd += meta.get("cost_vnd", 0.0)
        else:
            # Skip rerank: just take top-k from retrieval
            from .schemas import EvidenceMatch
            for c in candidates[:query.top_k]:
                result.matches.append(EvidenceMatch(
                    doc_id=c.doc_id,
                    doc_path=c.doc_path,
                    doc_filename=c.doc_path.split("/")[-1] if c.doc_path else "",
                    chunk_id=c.chunk_id,
                    excerpt=c.text[:200],
                    rerank_score=min(c.score, 1.0),
                    retrieval_source=c.retrieval_source,
                    reasoning="(no rerank — retrieval score)",
                ))

        # 4. Coverage analysis (only if criterion known + include_coverage)
        if query.include_coverage and criterion and result.matches:
            coverage, cov_meta = self.coverage.analyze(
                criterion_id=criterion["id"],
                criterion_name=criterion["name"],
                requirements=criterion.get("requirements", []),
                matches=result.matches,
            )
            result.coverage = coverage
            result.latency_ms_coverage = cov_meta.get("latency_ms", 0)
            result.tokens_input += cov_meta.get("tokens_in", 0)
            result.tokens_output += cov_meta.get("tokens_out", 0)
            result.cost_vnd += cov_meta.get("cost_vnd", 0.0)

        result.latency_ms_total = int((time.time() - t_start) * 1000)
        return result
