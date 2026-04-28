"""Router: CRUD cho Course + CLO + CLO×PI mapping — with ownership checks."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import (
    get_current_user, get_user_program,
    assert_course_owner, assert_clo_owner,
)
from ..models import (
    Program, Course, CLO, PI, PLO, CLO_PI,
    IRMALevel, KnowledgeGroup, User,
)

router = APIRouter()


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
    levels: dict[str, str]


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


@router.post("/programs/{program_code}/courses")
def create_course(
    program_code: str, body: CourseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    program = get_user_program(program_code, user, db)
    if any(c.code == body.code for c in program.courses):
        raise HTTPException(409, f"Course {body.code} đã tồn tại")

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
def get_course(
    course_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = assert_course_owner(course_id, user, db)

    program = course.program
    clos = sorted(course.clos, key=lambda x: x.order)

    plos = sorted(program.plos, key=lambda p: p.order)
    pi_groups = []
    for plo in plos:
        pi_groups.append({
            "plo_code": plo.code, "plo_text": plo.text_vn,
            "pis": [{"id": pi.id, "code": pi.code, "text_vn": pi.text_vn}
                    for pi in sorted(plo.pis, key=lambda x: x.order)],
        })

    clo_pi_rows = (db.query(CLO_PI, PI.code)
                     .join(PI, CLO_PI.pi_id == PI.id)
                     .join(CLO, CLO_PI.clo_id == CLO.id)
                     .filter(CLO.course_id == course.id).all())
    clo_pi_levels: dict[str, dict[str, str]] = {}
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
def update_course(
    course_id: str, body: CourseUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = assert_course_owner(course_id, user, db)

    if body.code is not None and body.code != course.code:
        if any(c.code == body.code for c in course.program.courses if c.id != course.id):
            raise HTTPException(409, f"Course code {body.code} đã được dùng")
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
def delete_course(
    course_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = assert_course_owner(course_id, user, db)
    program = course.program
    db.delete(course)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": course_id}


@router.post("/courses/{course_id}/clos")
def create_clo(
    course_id: str, body: CLOCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = assert_course_owner(course_id, user, db)
    if any(c.code == body.code for c in course.clos):
        raise HTTPException(409, f"CLO {body.code} đã tồn tại")

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
def update_clo(
    clo_id: str, body: CLOUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clo = assert_clo_owner(clo_id, user, db)

    if body.code is not None and body.code != clo.code:
        if any(c.code == body.code for c in clo.course.clos if c.id != clo.id):
            raise HTTPException(409, f"CLO code {body.code} đã được dùng")
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
def delete_clo(
    clo_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clo = assert_clo_owner(clo_id, user, db)
    program = clo.course.program
    db.delete(clo)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": clo_id}


@router.put("/clos/{clo_id}/pi-mapping")
def set_clo_pi_mapping(
    clo_id: str, body: CLOPIMapping,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clo = assert_clo_owner(clo_id, user, db)
    program = clo.course.program

    program_pis: dict[str, PI] = {}
    for plo in program.plos:
        for pi in plo.pis:
            program_pis[pi.code] = pi

    invalid_pis = [c for c in body.levels.keys() if c not in program_pis]
    if invalid_pis:
        raise HTTPException(400, f"Unknown PI codes: {invalid_pis}")
    invalid_levels = [(c, l) for c, l in body.levels.items()
                      if l and l not in ("I", "R", "M", "A")]
    if invalid_levels:
        raise HTTPException(400, f"Invalid levels (must be I/R/M/A): {invalid_levels}")

    db.query(CLO_PI).filter_by(clo_id=clo.id).delete()
    count = 0
    for pi_code, level in body.levels.items():
        if not level:
            continue
        db.add(CLO_PI(
            clo_id=clo.id, pi_id=program_pis[pi_code].id,
            level=IRMALevel(level),
        ))
        count += 1

    program.version += 1
    db.commit()
    return {"ok": True, "clo_code": clo.code, "mapped_count": count}
