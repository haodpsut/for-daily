"""Read-only endpoints map cdr-steward data — phục vụ dropdown frontend."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import (
    assert_course_owner,
    assert_program_owner,
    get_current_user,
)
from ..models import (
    Assessment,
    CLO,
    CLO_PI,
    Course,
    PI,
    PLO,
    Program,
    User,
)

router = APIRouter()


@router.get("/refs/programs")
def list_programs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List CTĐT thuộc owner để chọn cho session."""
    progs = db.query(Program).filter_by(owner_id=user.id).order_by(Program.code).all()
    return [
        {
            "id": p.id,
            "code": p.code,
            "name_vn": p.name_vn,
            "level": p.level.value if p.level else None,
        }
        for p in progs
    ]


@router.get("/refs/programs/{program_id}/courses")
def list_courses(
    program_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assert_program_owner(program_id, user, db)
    courses = db.query(Course).filter_by(program_id=program_id).order_by(Course.code).all()
    return [
        {
            "id": c.id,
            "code": c.code,
            "name_vn": c.name_vn,
            "credits": c.credits,
        }
        for c in courses
    ]


@router.get("/refs/courses/{course_id}/clos")
def list_clos(
    course_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assert_course_owner(course_id, user, db)
    clos = (
        db.query(CLO).filter_by(course_id=course_id).order_by(CLO.order, CLO.code).all()
    )
    # Also fetch CLO_PI links so frontend can render Bloom level mapping
    clo_ids = [c.id for c in clos]
    links = db.query(CLO_PI).filter(CLO_PI.clo_id.in_(clo_ids)).all() if clo_ids else []
    pi_links: dict[str, list] = {}
    for link in links:
        pi_links.setdefault(link.clo_id, []).append(
            {"pi_id": link.pi_id, "level": link.level.value}
        )
    return [
        {
            "id": c.id,
            "code": c.code,
            "text_vn": c.text_vn,
            "order": c.order,
            "pi_links": pi_links.get(c.id, []),
        }
        for c in clos
    ]


@router.get("/refs/courses/{course_id}/assessments")
def list_assessments(
    course_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assert_course_owner(course_id, user, db)
    assess = (
        db.query(Assessment)
        .filter_by(course_id=course_id)
        .order_by(Assessment.order)
        .all()
    )
    return [
        {
            "id": a.id,
            "component_name": a.component_name,
            "weight_pct": a.weight_pct,
            "method": a.method,
        }
        for a in assess
    ]


@router.get("/refs/programs/{program_id}/plos")
def list_plos(
    program_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """PLO + PI tree để hiển thị roll-up structure."""
    assert_program_owner(program_id, user, db)
    plos = (
        db.query(PLO).filter_by(program_id=program_id).order_by(PLO.order, PLO.code).all()
    )
    plo_ids = [p.id for p in plos]
    pis = (
        db.query(PI).filter(PI.plo_id.in_(plo_ids)).order_by(PI.order).all()
        if plo_ids
        else []
    )
    pis_by_plo: dict[str, list] = {}
    for pi in pis:
        pis_by_plo.setdefault(pi.plo_id, []).append(
            {"id": pi.id, "code": pi.code, "text_vn": pi.text_vn, "order": pi.order}
        )
    return [
        {
            "id": p.id,
            "code": p.code,
            "text_vn": p.text_vn,
            "order": p.order,
            "pis": pis_by_plo.get(p.id, []),
        }
        for p in plos
    ]
