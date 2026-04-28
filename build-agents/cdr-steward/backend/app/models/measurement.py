"""Measurement models — bảng riêng của kdcl-steward, prefix `meas_`.

Chỉ những bảng này được tạo bởi `Base.metadata.create_all()` của kdcl-steward
(filter trong main.py). Ref tables (program/course/clo/...) đã được cdr-steward tạo.
"""
from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class SessionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SCORING = "SCORING"
    COMPUTED = "COMPUTED"
    PUBLISHED = "PUBLISHED"


class BloomLevel(str, enum.Enum):
    REMEMBER = "REMEMBER"
    UNDERSTAND = "UNDERSTAND"
    APPLY = "APPLY"
    ANALYZE = "ANALYZE"
    EVALUATE = "EVALUATE"
    CREATE = "CREATE"


class RubricLevel(str, enum.Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    PASS = "PASS"
    FAIL = "FAIL"


# ---------------------------------------------------------------------------
# meas_session — 1 lần đo lường (course × semester × cohort)
# ---------------------------------------------------------------------------
class MeasSession(Base):
    __tablename__ = "meas_session"
    __table_args__ = (
        UniqueConstraint(
            "program_id",
            "course_id",
            "semester",
            "cohort_code",
            "assessment_id",
            name="uq_meas_session_unique",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(
        ForeignKey("program.id", ondelete="CASCADE"), index=True
    )
    course_id: Mapped[str] = mapped_column(
        ForeignKey("course.id", ondelete="CASCADE"), index=True
    )
    assessment_id: Mapped[str | None] = mapped_column(
        ForeignKey("assessment.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255))
    semester: Mapped[str] = mapped_column(String(50))
    cohort_code: Mapped[str] = mapped_column(String(50))
    exam_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    max_total_score: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("10.0"))
    pass_threshold: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("5.0"))
    clo_threshold_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("50.0"))
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus), default=SessionStatus.DRAFT)
    created_by: Mapped[str | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    questions: Mapped[list["MeasQuestion"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="MeasQuestion.order"
    )
    scores: Mapped[list["MeasScore"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    students: Mapped[list["MeasSessionStudent"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    result_clos: Mapped[list["MeasResultCLO"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )
    result_plos: Mapped[list["MeasResultPLO"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# meas_question — câu hỏi trong session
# ---------------------------------------------------------------------------
class MeasQuestion(Base):
    __tablename__ = "meas_question"
    __table_args__ = (
        UniqueConstraint("session_id", "number", name="uq_meas_question_session_number"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(
        ForeignKey("meas_session.id", ondelete="CASCADE"), index=True
    )
    number: Mapped[str] = mapped_column(String(20))
    order: Mapped[int] = mapped_column(Integer, default=0)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_score: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    bloom_level: Mapped[BloomLevel | None] = mapped_column(Enum(BloomLevel), nullable=True)
    weight_in_session: Mapped[Decimal | None] = mapped_column(Numeric(10, 4), nullable=True)

    session: Mapped["MeasSession"] = relationship(back_populates="questions")
    clo_links: Mapped[list["MeasQuestionCLO"]] = relationship(
        back_populates="question", cascade="all, delete-orphan"
    )
    rubrics: Mapped[list["MeasRubric"]] = relationship(
        back_populates="question", cascade="all, delete-orphan", order_by="MeasRubric.order"
    )


class MeasQuestionCLO(Base):
    """Map question ↔ CLO with weight in [0, 1]; sum theo question = 1."""

    __tablename__ = "meas_question_clo"

    question_id: Mapped[str] = mapped_column(
        ForeignKey("meas_question.id", ondelete="CASCADE"), primary_key=True
    )
    clo_id: Mapped[str] = mapped_column(
        ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True
    )
    weight: Mapped[Decimal] = mapped_column(Numeric(5, 4), default=Decimal("1.0"))

    question: Mapped["MeasQuestion"] = relationship(back_populates="clo_links")


class MeasRubric(Base):
    __tablename__ = "meas_rubric"
    __table_args__ = (
        UniqueConstraint("question_id", "level", name="uq_meas_rubric_question_level"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    question_id: Mapped[str] = mapped_column(
        ForeignKey("meas_question.id", ondelete="CASCADE"), index=True
    )
    level: Mapped[RubricLevel] = mapped_column(Enum(RubricLevel))
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    criteria_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    score_range_min: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    score_range_max: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    order: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped["MeasQuestion"] = relationship(back_populates="rubrics")


# ---------------------------------------------------------------------------
# meas_student — sinh viên (program-scoped)
# ---------------------------------------------------------------------------
class MeasStudent(Base):
    __tablename__ = "meas_student"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_meas_student_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(
        ForeignKey("program.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(50))
    full_name: Mapped[str] = mapped_column(String(255))
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    cohort_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    sessions: Mapped[list["MeasSessionStudent"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    scores: Mapped[list["MeasScore"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class MeasSessionStudent(Base):
    """Many-to-many session ↔ student với metadata (vắng / ghi chú)."""

    __tablename__ = "meas_session_student"

    session_id: Mapped[str] = mapped_column(
        ForeignKey("meas_session.id", ondelete="CASCADE"), primary_key=True
    )
    student_id: Mapped[str] = mapped_column(
        ForeignKey("meas_student.id", ondelete="CASCADE"), primary_key=True
    )
    absent: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped["MeasSession"] = relationship(back_populates="students")
    student: Mapped["MeasStudent"] = relationship(back_populates="sessions")


# ---------------------------------------------------------------------------
# meas_score — điểm cá nhân từng câu
# ---------------------------------------------------------------------------
class MeasScore(Base):
    __tablename__ = "meas_score"
    __table_args__ = (
        UniqueConstraint("student_id", "question_id", name="uq_meas_score_student_question"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(
        ForeignKey("meas_session.id", ondelete="CASCADE"), index=True
    )
    student_id: Mapped[str] = mapped_column(
        ForeignKey("meas_student.id", ondelete="CASCADE"), index=True
    )
    question_id: Mapped[str] = mapped_column(
        ForeignKey("meas_question.id", ondelete="CASCADE"), index=True
    )
    raw_score: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    graded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    graded_by: Mapped[str | None] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )

    session: Mapped["MeasSession"] = relationship(back_populates="scores")
    student: Mapped["MeasStudent"] = relationship(back_populates="scores")


# ---------------------------------------------------------------------------
# Cached aggregates (sau khi compute())
# ---------------------------------------------------------------------------
class MeasResultCLO(Base):
    __tablename__ = "meas_result_clo"

    session_id: Mapped[str] = mapped_column(
        ForeignKey("meas_session.id", ondelete="CASCADE"), primary_key=True
    )
    clo_id: Mapped[str] = mapped_column(
        ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True
    )
    n_students: Mapped[int] = mapped_column(Integer, default=0)
    n_achieved: Mapped[int] = mapped_column(Integer, default=0)
    pct_achieved: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.0"))
    avg_score_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.0"))
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["MeasSession"] = relationship(back_populates="result_clos")


class MeasResultPLO(Base):
    __tablename__ = "meas_result_plo"

    session_id: Mapped[str] = mapped_column(
        ForeignKey("meas_session.id", ondelete="CASCADE"), primary_key=True
    )
    plo_id: Mapped[str] = mapped_column(
        ForeignKey("plo.id", ondelete="CASCADE"), primary_key=True
    )
    pi_count: Mapped[int] = mapped_column(Integer, default=0)
    pct_achieved: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.0"))
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["MeasSession"] = relationship(back_populates="result_plos")
