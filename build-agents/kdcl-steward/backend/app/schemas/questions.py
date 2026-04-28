from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from ..models.meas import BloomLevel, RubricLevel


class QuestionCLOLink(BaseModel):
    clo_id: str
    weight: Decimal = Decimal("1.0")


class QuestionCreate(BaseModel):
    number: str = Field(..., min_length=1, max_length=20)
    order: int = 0
    text: str | None = None
    max_score: Decimal
    bloom_level: BloomLevel | None = None
    weight_in_session: Decimal | None = None
    clo_links: list[QuestionCLOLink] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    number: str | None = None
    order: int | None = None
    text: str | None = None
    max_score: Decimal | None = None
    bloom_level: BloomLevel | None = None
    weight_in_session: Decimal | None = None
    clo_links: list[QuestionCLOLink] | None = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    number: str
    order: int
    text: str | None
    max_score: Decimal
    bloom_level: BloomLevel | None
    weight_in_session: Decimal | None
    clo_links: list[QuestionCLOLink] = Field(default_factory=list)


# Rubric -----------------------------------------------------------------
class RubricCreate(BaseModel):
    level: RubricLevel
    label: str | None = None
    criteria_text: str | None = None
    score_range_min: Decimal
    score_range_max: Decimal
    order: int = 0


class RubricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    level: RubricLevel
    label: str | None
    criteria_text: str | None
    score_range_min: Decimal
    score_range_max: Decimal
    order: int
