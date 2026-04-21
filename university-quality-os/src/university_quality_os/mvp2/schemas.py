"""Pydantic schemas for MVP-2 Evidence Finder."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class EvidenceQuery(BaseModel):
    """Query input — either structured (criterion_id) or free-text."""

    criterion_id: Optional[str] = None  # e.g., "TC 3.1"
    query_text: Optional[str] = None

    dept_filter: Optional[list[str]] = None
    top_k: int = 5
    rerank: bool = True
    include_coverage: bool = True

    def is_valid(self) -> bool:
        return bool(self.criterion_id or self.query_text)


class RetrievedChunk(BaseModel):
    """Raw chunk from retrieval (before rerank)."""

    chunk_id: str
    doc_id: str
    doc_path: str
    text: str
    score: float
    retrieval_source: Literal["dense", "sparse", "hybrid"] = "hybrid"
    chunk_idx: int = 0


class EvidenceMatch(BaseModel):
    """One evidence match after reranking — shown to user."""

    doc_id: str
    doc_path: str
    doc_filename: str = ""
    chunk_id: str
    excerpt: str = Field(description="The relevant quote")
    rerank_score: float = Field(ge=0.0, le=1.0)
    retrieval_source: Literal["dense", "sparse", "hybrid"] = "hybrid"
    reasoning: str = Field(description="Why this is relevant")


class RequirementCoverage(BaseModel):
    """Coverage of one criterion requirement by evidence."""

    requirement: str
    covered_by: list[str] = Field(default_factory=list, description="doc_ids")
    is_gap: bool = False
    reasoning: str = ""


class CoverageAnalysis(BaseModel):
    """How well evidence covers criterion requirements."""

    criterion_id: str
    requirements: list[RequirementCoverage] = Field(default_factory=list)
    coverage_pct: float = 0.0
    gaps: list[str] = Field(default_factory=list, description="requirements without evidence")


class EvidenceResult(BaseModel):
    """Full result of an evidence query."""

    query: EvidenceQuery
    matches: list[EvidenceMatch] = Field(default_factory=list)
    coverage: Optional[CoverageAnalysis] = None

    # Performance
    latency_ms_retrieval: int = 0
    latency_ms_rerank: int = 0
    latency_ms_coverage: int = 0
    latency_ms_total: int = 0

    # Cost / tokens
    tokens_input: int = 0
    tokens_output: int = 0
    cost_vnd: float = 0.0
    embedding_cost_vnd: float = 0.0

    # Meta
    timestamp: datetime = Field(default_factory=datetime.now)
    model_used: str = ""
    error: Optional[str] = None


class EvalMetrics(BaseModel):
    """Aggregated eval metrics."""

    n_queries: int = 0
    precision_at_5: float = 0.0
    recall_at_5: float = 0.0
    f1_at_5: float = 0.0
    mrr: float = Field(default=0.0, description="Mean Reciprocal Rank of first correct")
    avg_latency_ms: float = 0.0
    total_cost_vnd: float = 0.0
