from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ResultCLOOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    clo_id: str
    clo_code: str | None = None  # join từ ref.CLO
    clo_text: str | None = None
    n_students: int
    n_achieved: int
    pct_achieved: Decimal
    avg_score_pct: Decimal
    computed_at: datetime


class ResultPLOOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    plo_id: str
    plo_code: str | None = None  # join từ ref.PLO
    plo_text: str | None = None
    pi_count: int
    pct_achieved: Decimal
    computed_at: datetime


class ComputeResponse(BaseModel):
    """Response của POST /sessions/{id}/compute."""

    session_id: str
    n_students_total: int
    n_questions_total: int
    n_clos_evaluated: int
    n_plos_evaluated: int
    clo_results: list[ResultCLOOut]
    plo_results: list[ResultPLOOut]
    warnings: list[str] = []
