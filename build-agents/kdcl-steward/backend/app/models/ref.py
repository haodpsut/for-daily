"""Read-only reference models — MIRROR cdr-steward.

Chỉ gồm subset cần thiết cho kdcl-steward (User, Program, Course, CLO, PLO, PI, CLO_PI,
Assessment). Schema MUST khớp với cdr-steward — nếu cdr-steward thay đổi cột, file này
phải update theo (drift = bug khó debug).

Tất cả tables ở đây đã được cdr-steward tạo. `Base.metadata.create_all()` của
kdcl-steward sẽ idempotent (CREATE TABLE IF NOT EXISTS) → an toàn.
"""
from __future__ import annotations

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Program / PLO / PI (read-only inside kdcl-steward)
# ---------------------------------------------------------------------------
class ProgramLevel(str, enum.Enum):
    DAI_HOC = "DAI_HOC"
    THAC_SI = "THAC_SI"
    TIEN_SI = "TIEN_SI"


class Program(Base):
    __tablename__ = "program"
    __table_args__ = (UniqueConstraint("owner_id", "code", name="uq_program_owner_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    owner_id: Mapped[str | None] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=True, index=True
    )
    code: Mapped[str] = mapped_column(String(20), index=True)
    name_vn: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    level: Mapped[ProgramLevel] = mapped_column(Enum(ProgramLevel), default=ProgramLevel.DAI_HOC)
    duration_years: Mapped[int] = mapped_column(Integer, default=4)
    total_credits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String(50), default="Tiếng Việt")
    decision_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    decision_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    issuing_authority: Mapped[str | None] = mapped_column(String(255), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    last_rendered_version: Mapped[int | None] = mapped_column(Integer, nullable=True)
    last_rendered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class PLO(Base):
    __tablename__ = "plo"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_plo_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(
        ForeignKey("program.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)


class PI(Base):
    __tablename__ = "pi"
    __table_args__ = (UniqueConstraint("plo_id", "code", name="uq_pi_plo_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    plo_id: Mapped[str] = mapped_column(ForeignKey("plo.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)


# ---------------------------------------------------------------------------
# Course / CLO / Assessment (read-only inside kdcl-steward)
# ---------------------------------------------------------------------------
class IRMALevel(str, enum.Enum):
    I = "I"
    R = "R"
    M = "M"
    A = "A"


class KnowledgeGroup(str, enum.Enum):
    DAI_CUONG = "DAI_CUONG"
    CO_SO = "CO_SO"
    CHUYEN_NGANH = "CHUYEN_NGANH"
    TU_CHON = "TU_CHON"
    TOT_NGHIEP = "TOT_NGHIEP"


class Course(Base):
    __tablename__ = "course"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_course_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(
        ForeignKey("program.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(20))
    name_vn: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    credits: Mapped[int] = mapped_column(Integer)
    hours_lt: Mapped[int] = mapped_column(Integer, default=0)
    hours_th: Mapped[int] = mapped_column(Integer, default=0)
    hours_self: Mapped[int] = mapped_column(Integer, default=0)
    prerequisites: Mapped[str | None] = mapped_column(Text, nullable=True)
    corequisites: Mapped[str | None] = mapped_column(Text, nullable=True)
    knowledge_group: Mapped[KnowledgeGroup] = mapped_column(
        Enum(KnowledgeGroup), default=KnowledgeGroup.CHUYEN_NGANH
    )
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False)
    semester_default: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String(50), default="Tiếng Việt")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class CLO(Base):
    __tablename__ = "clo"
    __table_args__ = (UniqueConstraint("course_id", "code", name="uq_clo_course_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)


class CLO_PI(Base):
    __tablename__ = "clo_pi"
    clo_id: Mapped[str] = mapped_column(ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True)
    pi_id: Mapped[str] = mapped_column(ForeignKey("pi.id", ondelete="CASCADE"), primary_key=True)
    level: Mapped[IRMALevel] = mapped_column(Enum(IRMALevel))


class Assessment(Base):
    """Component-level assessment definition (cdr-steward).

    Khác với `meas_session`: `Assessment` là blueprint (giữa kỳ 30%, cuối kỳ 50%);
    `meas_session` là instance đo lường thực tế (cuối kỳ HKII 2024-2025 lớp 21CS01).
    """

    __tablename__ = "assessment"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    component_name: Mapped[str] = mapped_column(String(100))
    weight_pct: Mapped[int] = mapped_column(Integer)
    method: Mapped[str | None] = mapped_column(String(255), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
