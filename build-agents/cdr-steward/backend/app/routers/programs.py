"""Router: GET program detail + list + impact (staleness detection).

All endpoints require authentication. Programs are filtered by owner_id.
"""
from __future__ import annotations

from datetime import date, datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import get_current_user, get_user_program
from ..models import Program, PLO_PO, PO, PLO, CLO, ProgramLevel, User

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent  # cdr-steward/

router = APIRouter()


class ProgramCreate(BaseModel):
    code: str
    name_vn: str
    name_en: str | None = None
    level: str = "DAI_HOC"
    duration_years: int = 4
    total_credits: int | None = None
    decision_no: str | None = None
    decision_date: str | None = None
    issuing_authority: str | None = None
    language: str = "Tiếng Việt"


@router.get("")
def list_programs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(Program).filter_by(owner_id=user.id).order_by(Program.code).all()
    return [{"code": p.code, "name_vn": p.name_vn, "level": p.level.value} for p in rows]


@router.post("")
def create_program(
    body: ProgramCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(Program).filter_by(owner_id=user.id, code=body.code).first():
        raise HTTPException(409, f"Bạn đã có CTĐT mã {body.code}")
    try:
        level_enum = ProgramLevel(body.level)
    except ValueError:
        raise HTTPException(400, f"Invalid level: {body.level}")

    parsed_date = None
    if body.decision_date:
        try:
            parsed_date = date.fromisoformat(body.decision_date)
        except ValueError:
            raise HTTPException(400, f"Invalid date: {body.decision_date} (need YYYY-MM-DD)")

    program = Program(
        owner_id=user.id,
        code=body.code, name_vn=body.name_vn, name_en=body.name_en,
        level=level_enum, duration_years=body.duration_years,
        total_credits=body.total_credits, decision_no=body.decision_no,
        decision_date=parsed_date, issuing_authority=body.issuing_authority,
        language=body.language,
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return {"code": program.code, "name_vn": program.name_vn, "level": program.level.value}


@router.delete("/{code}")
def delete_program(
    code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    program = get_user_program(code, user, db)
    db.delete(program)
    db.commit()
    return {"ok": True, "deleted_code": code}


@router.get("/{code}")
def get_program(
    code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    program = get_user_program(code, user, db)

    plo_po_rows = (
        db.query(PLO_PO.plo_id, PO.code)
          .join(PO, PLO_PO.po_id == PO.id)
          .join(PLO, PLO_PO.plo_id == PLO.id)
          .filter(PLO.program_id == program.id)
          .all()
    )
    plo_po_map: dict[str, list[str]] = {}
    for plo_id, po_code in plo_po_rows:
        plo_po_map.setdefault(plo_id, []).append(po_code)

    program_course_ids = {c.id for c in program.courses}
    clo_count_map: dict[str, int] = {}
    if program_course_ids:
        for course_id, _ in db.query(CLO.course_id, CLO.id).filter(
            CLO.course_id.in_(program_course_ids)
        ).all():
            clo_count_map[course_id] = clo_count_map.get(course_id, 0) + 1

    pos_sorted = sorted(program.pos, key=lambda x: x.order)
    plos_sorted = sorted(program.plos, key=lambda x: x.order)
    courses_sorted = sorted(program.courses, key=lambda x: x.code)

    return {
        "id": program.id,
        "code": program.code,
        "name_vn": program.name_vn,
        "name_en": program.name_en,
        "level": program.level.value,
        "duration_years": program.duration_years,
        "total_credits": program.total_credits,
        "decision_no": program.decision_no,
        "decision_date": program.decision_date.isoformat() if program.decision_date else None,
        "issuing_authority": program.issuing_authority,
        "version": program.version,
        "pos": [
            {"id": p.id, "code": p.code, "text_vn": p.text_vn, "order": p.order}
            for p in pos_sorted
        ],
        "plos": [
            {
                "id": plo.id, "code": plo.code, "text_vn": plo.text_vn,
                "text_en": plo.text_en, "order": plo.order,
                "po_codes": sorted(plo_po_map.get(plo.id, [])),
                "pis": [
                    {"id": pi.id, "code": pi.code, "text_vn": pi.text_vn,
                     "text_en": pi.text_en, "order": pi.order}
                    for pi in sorted(plo.pis, key=lambda x: x.order)
                ],
            }
            for plo in plos_sorted
        ],
        "courses": [
            {
                "id": c.id, "code": c.code, "name_vn": c.name_vn, "name_en": c.name_en,
                "credits": c.credits,
                "hours_lt": c.hours_lt, "hours_th": c.hours_th,
                "knowledge_group": c.knowledge_group.value,
                "semester_default": c.semester_default,
                "description": c.description,
                "clos_count": clo_count_map.get(c.id, 0),
            }
            for c in courses_sorted
        ],
        "counts": {
            "pos": len(pos_sorted),
            "plos": len(plos_sorted),
            "pis": sum(len(p.pis) for p in plos_sorted),
            "courses": len(courses_sorted),
            "clos": sum(clo_count_map.get(c.id, 0) for c in courses_sorted),
        },
    }


@router.get("/{code}/impact")
def get_impact(
    code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    program = get_user_program(code, user, db)

    output_dir = PROJECT_ROOT / "backend" / "output" / program.code

    program_level = ["CT_CDR", "CT_CTDT", "CT_CTDH", "CT_MOTA"]
    decuong = sorted(
        f"CT_DECUONG_{c.code}"
        for c in program.courses
        if c.clos
    )

    last_rv = program.last_rendered_version

    def _status(name: str) -> dict:
        pdf = output_dir / f"{name}.pdf"
        if not pdf.exists():
            return {
                "name": name, "status": "missing",
                "rendered_at": None, "pdf_url": None,
            }
        rendered_at = datetime.fromtimestamp(pdf.stat().st_mtime)
        is_stale = last_rv is None or program.version > last_rv
        return {
            "name": name, "status": "stale" if is_stale else "fresh",
            "rendered_at": rendered_at.isoformat(),
            "pdf_url": f"/api/render/{code}/files/{name}.pdf",
        }

    program_templates = [_status(n) for n in program_level]
    decuong_templates = [_status(n) for n in decuong]
    all_templates = program_templates + decuong_templates

    counts = {"fresh": 0, "stale": 0, "missing": 0}
    for t in all_templates:
        counts[t["status"]] += 1

    return {
        "program_code": program.code,
        "program_version": program.version,
        "program_updated_at": program.updated_at.isoformat(),
        "last_rendered_version": program.last_rendered_version,
        "last_rendered_at": program.last_rendered_at.isoformat() if program.last_rendered_at else None,
        "is_stale_overall": counts["stale"] + counts["missing"] > 0,
        "counts": counts,
        "program_templates": program_templates,
        "decuong_templates": decuong_templates,
    }
