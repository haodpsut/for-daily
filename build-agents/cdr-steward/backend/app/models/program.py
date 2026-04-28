import enum
import uuid
from datetime import date, datetime
from sqlalchemy import (
    String, Integer, Date, DateTime, Enum, ForeignKey, Text, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ProgramLevel(str, enum.Enum):
    DAI_HOC = "DAI_HOC"
    THAC_SI = "THAC_SI"
    TIEN_SI = "TIEN_SI"


class VQFDomain(str, enum.Enum):
    KNOWLEDGE = "KNOWLEDGE"
    SKILL = "SKILL"
    ATTITUDE = "ATTITUDE"


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
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner: Mapped["User | None"] = relationship(back_populates="programs")  # type: ignore  # noqa: F821
    pos: Mapped[list["PO"]] = relationship(back_populates="program", cascade="all, delete-orphan")
    plos: Mapped[list["PLO"]] = relationship(back_populates="program", cascade="all, delete-orphan")
    courses: Mapped[list["Course"]] = relationship(back_populates="program", cascade="all, delete-orphan")  # type: ignore


class PO(Base):
    __tablename__ = "po"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_po_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(ForeignKey("program.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    program: Mapped["Program"] = relationship(back_populates="pos")


class PLO(Base):
    __tablename__ = "plo"
    __table_args__ = (UniqueConstraint("program_id", "code", name="uq_plo_program_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    program_id: Mapped[str] = mapped_column(ForeignKey("program.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    program: Mapped["Program"] = relationship(back_populates="plos")
    pis: Mapped[list["PI"]] = relationship(back_populates="plo", cascade="all, delete-orphan", order_by="PI.order")


class PI(Base):
    __tablename__ = "pi"
    __table_args__ = (UniqueConstraint("plo_id", "code", name="uq_pi_plo_code"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    plo_id: Mapped[str] = mapped_column(ForeignKey("plo.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(20))
    text_vn: Mapped[str] = mapped_column(Text)
    text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    plo: Mapped["PLO"] = relationship(back_populates="pis")


class PLO_PO(Base):
    __tablename__ = "plo_po"
    plo_id: Mapped[str] = mapped_column(ForeignKey("plo.id", ondelete="CASCADE"), primary_key=True)
    po_id: Mapped[str] = mapped_column(ForeignKey("po.id", ondelete="CASCADE"), primary_key=True)


class VQFItem(Base):
    __tablename__ = "vqf_item"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String(10), unique=True)
    domain: Mapped[VQFDomain] = mapped_column(Enum(VQFDomain))
    text_vn: Mapped[str] = mapped_column(Text)


class PLO_VQF(Base):
    __tablename__ = "plo_vqf"
    plo_id: Mapped[str] = mapped_column(ForeignKey("plo.id", ondelete="CASCADE"), primary_key=True)
    vqf_item_id: Mapped[str] = mapped_column(ForeignKey("vqf_item.id", ondelete="CASCADE"), primary_key=True)
