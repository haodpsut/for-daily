"""Pydantic schemas for MVP-1 Classifier."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class DocumentInput(BaseModel):
    """Input to the classifier."""

    doc_id: str
    filename: str = ""
    dept: str = ""
    text: str
    text_len: int = 0
    npages: int = 0

    @classmethod
    def from_jsonl_record(cls, rec: dict) -> "DocumentInput":
        """Build from a record in iso_texts.jsonl."""
        return cls(
            doc_id=rec["id"],
            filename=rec.get("filename", ""),
            dept=rec.get("dept", ""),
            text=rec.get("text", ""),
            text_len=rec.get("text_len", 0),
            npages=rec.get("npages", 0),
        )


class ClassificationItem(BaseModel):
    """One classification result (1 ISO process OR 1 KĐCLGD criterion)."""

    id: str = Field(description="KHAOTHI-001 or 'TC 3.1' format")
    name: str = Field(description="Human-readable name")
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str = Field(description="1-2 sentence justification")


class ClassificationResult(BaseModel):
    """Full classifier output for one document."""

    doc_id: str
    doc_excerpt: str = Field(description="First ~500 chars of doc text")

    # Top-3 ISO processes
    iso_processes: list[ClassificationItem] = Field(default_factory=list)

    # Top-5 KĐCLGD criteria (multi-label)
    kdclgd_criteria: list[ClassificationItem] = Field(default_factory=list)

    # Metadata
    latency_ms: int = 0
    tokens_input: int = 0
    tokens_output: int = 0
    cost_vnd: float = 0.0
    model_used: str = ""
    timestamp: datetime = Field(default_factory=datetime.now)

    # Validation / retry count
    raw_response: Optional[str] = None
    parse_error: Optional[str] = None


class EvaluationMetrics(BaseModel):
    """Aggregated metrics across a batch."""

    n_docs: int = 0

    # ISO process metrics
    iso_precision_at_1: float = 0.0
    iso_precision_at_3: float = 0.0
    iso_recall_at_3: float = 0.0

    # KĐCLGD multi-label
    kdclgd_recall_at_5: float = 0.0
    kdclgd_precision_at_5: float = 0.0
    kdclgd_f1_at_5: float = 0.0

    # Perf
    avg_latency_ms: float = 0.0
    total_cost_vnd: float = 0.0
    total_tokens_input: int = 0
    total_tokens_output: int = 0

    # Breakdown
    per_dept: dict[str, dict] = Field(default_factory=dict)
    failure_cases: list[dict] = Field(default_factory=list)


class UserFeedback(BaseModel):
    """User's review on a classification result."""

    doc_id: str
    iso_correct: Optional[Literal["correct", "partial", "wrong"]] = None
    kdclgd_correct: Optional[Literal["correct", "partial", "wrong"]] = None
    notes: str = ""
    ts: datetime = Field(default_factory=datetime.now)
