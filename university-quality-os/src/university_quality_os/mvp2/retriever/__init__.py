"""Retrieval layer for MVP-2.

Exposes:
- dense_search: pgvector semantic search
- sparse_search: BM25 keyword search
- hybrid_search: RRF fusion of dense + sparse
"""

from .dense import DenseRetriever
from .sparse import SparseRetriever
from .hybrid import HybridRetriever

__all__ = ["DenseRetriever", "SparseRetriever", "HybridRetriever"]
