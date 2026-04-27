"""Router: CRUD cho Course + CLO + CLO×PI mapping.

Endpoints:
- POST   /api/programs/{code}/courses   → tạo Course
- GET    /api/courses/{id}              → chi tiết Course + CLOs + PI mapping
- PUT    /api/courses/{id}              → cập nhật Course metadata
- DELETE /api/courses/{id}              → xóa Course (cascade CO/CLO/Assessment/WeeklyPlan)
- POST   /api/courses/{id}/clos         → thêm CLO
- PUT    /api/clos/{id}                 → cập nhật CLO
- DELETE /api/clos/{id}                 → xóa CLO
- PUT    /api/clos/{id}/pi-mapping      → set CLO×PI levels (replace all)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Program, Course, CLO, PI, PLO, CLO_PI,
    IRMALevel, KnowledgeGroup,
)

router = APIRouter()


# ────────────── schemas ──────────────

class CourseCreate(BaseModel):
    code: str
    name_vn: str
    name_en: str | None = None
    credits: int = 3
    hours_lt: int = 0
    hours_th: int = 0
    hours_self: int = 0
    knowledge_group: str = "CHUYEN_NGANH"
    semester_default: int | None = None
    description: str | None = None


class CourseUpdate(BaseModel):
    code: str | None = None
    name_vn: str | None = None
    name_en: str | None = None
    credits: int | None = None
    hours_lt: int | None = None
    hours_th: int | None = None
    hours_self: int | None = None
    knowledge_group: str | None = None
    semester_default: int | None = None
    description: str | None = None


class CLOCreate(BaseModel):
    code: str
    text_vn: str
    text_en: str | None = None
    order: int | None = None


class CLOUpdate(BaseModel):
    code: str | None = None
    text_vn: str | None = None
    text_en: str | None = None


class CLOPIMapping(BaseModel):
    """Map of pi_code → level. Pass empty value or omit to remove the mapping."""
    levels: dict[str, str]


# ────────────── helpers ──────────────

def _course_dict(c: Course) -> dict:
    return {
        "id": c.id, "code": c.code, "name_vn": c.name_vn, "name_en": c.name_en,
        "credits": c.credits, "hours_lt": c.hours_lt, "hours_th": c.hours_th,
        "hours_self": c.hours_self,
        "knowledge_group": c.knowledge_group.value,
        "semester_default": c.semester_default,
        "description": c.description,
    }


def _clo_dict(clo: CLO) -> dict:
    return {
        "id": clo.id, "code": clo.code, "text_vn": clo.text_vn,
        "text_en": clo.text_en, "order": clo.order,
    }


# ────────────── Course endpoints ──────────────

@router.post("/programs/{program_code}/courses")
def create_course(program_code: str, body: CourseCreate, db: Session = Depends(get_db)):
    program = db.query(Program).filter_by(code=program_code).first()
    if not program:
        raise HTTPException(404, f"Program {program_code} not found")
    if any(c.code == body.code for c in program.courses):
        raise HTTPException(409, f"Course {body.code} already exists")

    try:
        kg = KnowledgeGroup(body.knowledge_group)
    except ValueError:
        raise HTTPException(400, f"Invalid knowledge_group: {body.knowledge_group}")

    course = Course(
        program_id=program.id,
        code=body.code, name_vn=body.name_vn, name_en=body.name_en,
        credits=body.credits, hours_lt=body.hours_lt, hours_th=body.hours_th,
        hours_self=body.hours_self,
        knowledge_group=kg,
        semester_default=body.semester_default,
        description=body.description,
    )
    db.add(course)
    program.version += 1
    db.commit()
    db.refresh(course)
    return _course_dict(course)


@router.get("/courses/{course_id}")
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    program = course.program
    clos = sorted(course.clos, key=lambda x: x.order)

    # All PIs of program (for matrix editor)
    plos = sorted(program.plos, key=lambda p: p.order)
    pi_groups = []
    for plo in plos:
        pi_groups.append({
            "plo_code": plo.code,
            "plo_text": plo.text_vn,
            "pis": [{"id": pi.id, "code": pi.code, "text_vn": pi.text_vn}
                    for pi in sorted(plo.pis, key=lambda x: x.order)],
        })

    # Current CLO×PI mappings
    clo_pi_rows = (db.query(CLO_PI, PI.code)
                     .join(PI, CLO_PI.pi_id == PI.id)
                     .join(CLO, CLO_PI.clo_id == CLO.id)
                     .filter(CLO.course_id == course.id).all())
    clo_pi_levels: dict[str, dict[str, str]] = {}  # clo_code -> {pi_code: level}
    clo_id_to_code = {c.id: c.code for c in clos}
    for cp, pi_code in clo_pi_rows:
        clo_code = clo_id_to_code.get(cp.clo_id)
        if clo_code:
            clo_pi_levels.setdefault(clo_code, {})[pi_code] = cp.level.value

    return {
        **_course_dict(course),
        "program_code": program.code,
        "clos": [_clo_dict(c) for c in clos],
        "pi_groups": pi_groups,
        "clo_pi_levels": clo_pi_levels,
    }


@router.put("/courses/{course_id}")
def update_course(course_id: str, body: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    if body.code is not None and body.code != course.code:
        if any(c.code == body.code for c in course.program.courses if c.id != course.id):
            raise HTTPException(409, f"Course code {body.code} already used")
        course.code = body.code

    for field in ["name_vn", "name_en", "credits", "hours_lt", "hours_th",
                  "hours_self", "semester_default", "description"]:
        v = getattr(body, field)
        if v is not None:
            setattr(course, field, v)

    if body.knowledge_group is not None:
        try:
            course.knowledge_group = KnowledgeGroup(body.knowledge_group)
        except ValueError:
            raise HTTPException(400, f"Invalid knowledge_group: {body.knowledge_group}")

    course.program.version += 1
    db.commit()
    db.refresh(course)
    return _course_dict(course)


@router.delete("/courses/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    program = course.program
    db.delete(course)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": course_id}


# ────────────── CLO endpoints ──────────────

@router.post("/courses/{course_id}/clos")
def create_clo(course_id: str, body: CLOCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    if any(c.code == body.code for c in course.clos):
        raise HTTPException(409, f"CLO {body.code} already exists in {course.code}")

    order = body.order if body.order is not None else (
        max((c.order for c in course.clos), default=0) + 1
    )
    clo = CLO(
        course_id=course.id,
        code=body.code, text_vn=body.text_vn, text_en=body.text_en,
        order=order,
    )
    db.add(clo)
    course.program.version += 1
    db.commit()
    db.refresh(clo)
    return _clo_dict(clo)


@router.put("/clos/{clo_id}")
def update_clo(clo_id: str, body: CLOUpdate, db: Session = Depends(get_db)):
    clo = db.query(CLO).filter_by(id=clo_id).first()
    if not clo:
        raise HTTPException(404, "CLO not found")

    if body.code is not None and body.code != clo.code:
        if any(c.code == body.code for c in clo.course.clos if c.id != clo.id):
            raise HTTPException(409, f"CLO code {body.code} already used in this course")
        clo.code = body.code
    if body.text_vn is not None:
        clo.text_vn = body.text_vn
    if body.text_en is not None:
        clo.text_en = body.text_en

    clo.course.program.version += 1
    db.commit()
    db.refresh(clo)
    return _clo_dict(clo)


@router.delete("/clos/{clo_id}")
def delete_clo(clo_id: str, db: Session = Depends(get_db)):
    clo = db.query(CLO).filter_by(id=clo_id).first()
    if not clo:
        raise HTTPException(404, "CLO not found")
    program = clo.course.program
    db.delete(clo)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": clo_id}


@router.put("/clos/{clo_id}/pi-mapping")
def set_clo_pi_mapping(clo_id: str, body: CLOPIMapping, db: Session = Depends(get_db)):
    """Replace ALL CLO_PI rows for this CLO with the new set.

    body.levels = { "PI1.1": "I", "PI3.2": "M", ... }
    Empty string or absent → removed.
    """
    clo = db.query(CLO).filter_by(id=clo_id).first()
    if not clo:
        raise HTTPException(404, "CLO not found")

    program = clo.course.program

    # Build lookup: pi_code → PI object (only PIs of this program)
    program_pis: dict[str, PI] = {}
    for plo in program.plos:
        for pi in plo.pis:
            program_pis[pi.code] = pi

    # Validate
    invalid_pis = [c for c in body.levels.keys() if c not in program_pis]
    if invalid_pis:
        raise HTTPException(400, f"Unknown PI codes: {invalid_pis}")
    invalid_levels = [(c, l) for c, l in body.levels.items()
                      if l and l not in ("I", "R", "M", "A")]
    if invalid_levels:
        raise HTTPException(400, f"Invalid levels (must be I/R/M/A): {invalid_levels}")

    # Replace
    db.query(CLO_PI).filter_by(clo_id=clo.id).delete()
    count = 0
    for pi_code, level in body.levels.items():
        if not level:
            continue
        db.add(CLO_PI(
            clo_id=clo.id,
            pi_id=program_pis[pi_code].id,
            level=IRMALevel(level),
        ))
        count += 1

    program.version += 1
    db.commit()
    return {"ok": True, "clo_code": clo.code, "mapped_count": count}
