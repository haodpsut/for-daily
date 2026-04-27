import enum
import uuid
from sqlalchemy import (
    String, Integer, Boolean, Enum, ForeignKey, Text, UniqueConstraint, JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class IRMALevel(str, enum.Enum):
    I = "I"  # Introduce
    R = "R"  # Reinforce
    M = "M"  # Master
    A = "A"  # Assess


class KnowledgeGroup(str, enum.Enum):
    DAI_CUONG = "DAI_CUONG"
    CO_SO = "CO_SO"
    CHUYEN_NGANH = "CHUYEN_NGANH"
    TU_CHON = "TU_CHON"
    TOT_NGHIEP = "TOT_NGHIEP"


class MaterialType(str, enum.Enum):
    TEXTBOOK = "TEXTBOOK"
    REFERENCE = "REFERENCE"
    ONLINE = "ONLINE"


class Course(Base):
    __tablename__ = "course"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_course_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(ForeignKey("program.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    name_vn: Mapped[str] = mapped_column(String(255))
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    credits: Mapped[int] = mapped_column(Integer)
    hours_lt: Mapped[int] = mapped_column(Integer, default=0)
    hours_th: Mapped[int] = mapped_column(Integer, default=0)
    hours_self: Mapped[int] = mapped_column(Integer, default=0)
    prerequisites: Mapped[str | None] = mapped_column(Text, nullable=True)
    corequisites: Mapped[str | None] = mapped_column(Text, nullable=True)
    knowledge_group: Mapped[KnowledgeGroup] = mapped_column(Enum(KnowledgeGroup), default=KnowledgeGroup.CHUYEN_NGANH)
    is_elective: Mapped[bool] = mapped_column(Boolean, default=False)
    semester_default: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str] = mapped_column(String(50), default="Tiếng Việt")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    program: Mapped["Program"] = relationship(back_populates="courses")  # type: ignore
    cos: Mapped[list["CO"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    clos: Mapped[list["CLO"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    weekly_plans: Mapped[list["WeeklyPlan"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    materials: Mapped[list["Material"]] = relationship(back_populates="course", cascade="all, delete-orphan")


class CO(Base):
    __tablename__ = "co"
    __table_args__ = (UniqueConstraint("course_id", "code", name="uq_co_course_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    order: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship(back_populates="cos")


class CLO(Base):
    __tablename__ = "clo"
    __table_args__ = (UniqueConstraint("course_id", "code", name="uq_clo_course_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship(back_populates="clos")


class CLO_CO(Base):
    __tablename__ = "clo_co"
    clo_id: Mapped[str] = mapped_column(ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True)
    co_id: Mapped[str] = mapped_column(ForeignKey("co.id", ondelete="CASCADE"), primary_key=True)


class CLO_PI(Base):
    __tablename__ = "clo_pi"
    clo_id: Mapped[str] = mapped_column(ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True)
    pi_id: Mapped[str] = mapped_column(ForeignKey("pi.id", ondelete="CASCADE"), primary_key=True)
    level: Mapped[IRMALevel] = mapped_column(Enum(IRMALevel))


class Assessment(Base):
    __tablename__ = "assessment"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    component_name: Mapped[str] = mapped_column(String(100))
    weight_pct: Mapped[int] = mapped_column(Integer)
    method: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rubric_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship(back_populates="assessments")


class Assessment_CLO(Base):
    __tablename__ = "assessment_clo"
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessment.id", ondelete="CASCADE"), primary_key=True)
    clo_id: Mapped[str] = mapped_column(ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True)
    weight_in_assessment: Mapped[int | None] = mapped_column(Integer, nullable=True)


class WeeklyPlan(Base):
    __tablename__ = "weekly_plan"
    __table_args__ = (UniqueConstraint("course_id", "week", name="uq_weekly_course_week"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    week: Mapped[int] = mapped_column(Integer)
    topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    hours_lt: Mapped[int] = mapped_column(Integer, default=0)
    hours_th: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped["Course"] = relationship(back_populates="weekly_plans")


class WeeklyPlan_CLO(Base):
    __tablename__ = "weekly_plan_clo"
    weekly_plan_id: Mapped[str] = mapped_column(ForeignKey("weekly_plan.id", ondelete="CASCADE"), primary_key=True)
    clo_id: Mapped[str] = mapped_column(ForeignKey("clo.id", ondelete="CASCADE"), primary_key=True)


class Material(Base):
    __tablename__ = "material"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    type: Mapped[MaterialType] = mapped_column(Enum(MaterialType), default=MaterialType.TEXTBOOK)
    citation_text: Mapped[str] = mapped_column(Text)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)

    course: Mapped["Course"] = relationship(back_populates="materials")


class Faculty(Base):
    __tablename__ = "faculty"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(ForeignKey("program.id", ondelete="CASCADE"), index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    degree: Mapped[str | None] = mapped_column(String(50), nullable=True)
    field: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)
    year_of_birth: Mapped[int | None] = mapped_column(Integer, nullable=True)
