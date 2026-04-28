from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from ..models.meas import SessionStatus


class SessionCreate(BaseModel):
    program_id: str
    course_id: str
    assessment_id: str | None = None
    name: str = Field(..., min_length=1, max_length=255)
    semester: str = Field(..., min_length=1, max_length=50)
    cohort_code: str = Field(..., min_length=1, max_length=50)
    exam_date: date | None = None
    max_total_score: Decimal = Decimal("10.0")
    pass_threshold: Decimal = Decimal("5.0")
    clo_threshold_pct: Decimal = Decimal("50.0")


class SessionUpdate(BaseModel):
    name: str | None = None
    semester: str | None = None
    cohort_code: str | None = None
    exam_date: date | None = None
    max_total_score: Decimal | None = None
    pass_threshold: Decimal | None = None
    clo_threshold_pct: Decimal | None = None
    status: SessionStatus | None = None


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    program_id: str
    course_id: str
    assessment_id: str | None
    name: str
    semester: str
    cohort_code: str
    exam_date: date | None
    max_total_score: Decimal
    pass_threshold: Decimal
    clo_threshold_pct: Decimal
    status: SessionStatus
    created_at: datetime
    updated_at: datetime


class SessionListItem(BaseModel):
    """Compact view for listing sessions."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    course_id: str
    semester: str
    cohort_code: str
    status: SessionStatus
    n_questions: int = 0
    n_students: int = 0
    updated_at: datetime
