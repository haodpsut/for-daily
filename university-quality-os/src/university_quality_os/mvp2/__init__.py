"""MVP-2 — Evidence Finder Agent.

Given a KĐCLGD criterion (or free-text query), find top-N relevant documents
from the corpus with excerpts + coverage analysis.

Components:
- indexer: chunk + embed + store in pgvector
- retriever: hybrid dense (pgvector) + sparse (BM25) with RRF fusion
- reranker: Claude LLM rerank top-20 → top-5
- coverage: per-requirement evidence analysis
- finder: main orchestrator

See: de-an-thanh-lap-cong-ty/mvp/mvp-02-evidence-finder.md
"""

from .finder import EvidenceFinder
from .schemas import (
    CoverageAnalysis,
    EvidenceMatch,
    EvidenceQuery,
    EvidenceResult,
)

__all__ = [
    "EvidenceFinder",
    "EvidenceMatch",
    "EvidenceResult",
    "EvidenceQuery",
    "CoverageAnalysis",
]
