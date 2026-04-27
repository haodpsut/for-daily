"""Router: GET program detail + list."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Program, PLO_PO, PO, PLO, CLO

router = APIRouter()


@router.get("")
def list_programs(db: Session = Depends(get_db)):
    rows = db.query(Program).order_by(Program.code).all()
    return [{"code": p.code, "name_vn": p.name_vn, "level": p.level.value} for p in rows]


@router.get("/{code}")
def get_program(code: str, db: Session = Depends(get_db)):
    program = db.query(Program).filter_by(code=code).first()
    if not program:
        raise HTTPException(status_code=404, detail=f"Program {code} not found")

    # Build PLO → list of PO codes map
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

    # CLO counts per course
    clo_count_rows = (
        db.query(CLO.course_id, CLO.id).all()
    )
    clo_count_map: dict[str, int] = {}
    for course_id, _ in clo_count_rows:
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
                "id": plo.id,
                "code": plo.code,
                "text_vn": plo.text_vn,
                "text_en": plo.text_en,
                "order": plo.order,
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
            "clos": sum(clo_count_map.values()),
        },
    }
