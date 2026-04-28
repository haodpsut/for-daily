from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ScoreUpsert(BaseModel):
    """Upsert 1 điểm — `(student_id, question_id)` unique key."""

    student_id: str
    question_id: str
    raw_score: Decimal | None = None  # null = chưa chấm


class BulkScoreUpsert(BaseModel):
    """Bulk upsert (sau khi import từ Excel)."""

    session_id: str
    scores: list[ScoreUpsert]


class ScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    student_id: str
    question_id: str
    raw_score: Decimal | None
    graded_at: datetime | None
    graded_by: str | None
