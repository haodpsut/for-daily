"""CRUD for measurement sessions (1 session = 1 lần đo)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import (
    assert_course_owner,
    assert_program_owner,
    assert_session_owner,
    get_current_user,
)
from ..models import User
from ..models.meas import MeasSession
from ..schemas import SessionCreate, SessionListItem, SessionOut, SessionUpdate

router = APIRouter()


@router.post("/sessions", response_model=SessionOut)
def create_session(
    payload: SessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify ownership
    assert_program_owner(payload.program_id, user, db)
    course = assert_course_owner(payload.course_id, user, db)
    if course.program_id != payload.program_id:
        raise HTTPException(400, "Course không thuộc Program đã chỉ định")

    sess = MeasSession(
        program_id=payload.program_id,
        course_id=payload.course_id,
        assessment_id=payload.assessment_id,
        name=payload.name,
        semester=payload.semester,
        cohort_code=payload.cohort_code,
        exam_date=payload.exam_date,
        max_total_score=payload.max_total_score,
        pass_threshold=payload.pass_threshold,
        clo_threshold_pct=payload.clo_threshold_pct,
        created_by=user.id,
    )
    db.add(sess)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Session đã tồn tại hoặc dữ liệu không hợp lệ: {exc}")
    db.refresh(sess)
    return sess


@router.get("/sessions", response_model=list[SessionListItem])
def list_sessions(
    program_id: str | None = None,
    course_id: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasSession)
    if program_id:
        assert_program_owner(program_id, user, db)
        q = q.filter(MeasSession.program_id == program_id)
    if course_id:
        assert_course_owner(course_id, user, db)
        q = q.filter(MeasSession.course_id == course_id)
    if not program_id:
        # Restrict to user's programs only
        from ..models import Program

        owned = db.query(Program.id).filter_by(owner_id=user.id).subquery()
        q = q.filter(MeasSession.program_id.in_(owned))
    sessions = q.order_by(MeasSession.updated_at.desc()).all()

    out: list[SessionListItem] = []
    for s in sessions:
        out.append(
            SessionListItem(
                id=s.id,
                name=s.name,
                course_id=s.course_id,
                semester=s.semester,
                cohort_code=s.cohort_code,
                status=s.status,
                n_questions=len(s.questions),
                n_students=len(s.students),
                updated_at=s.updated_at,
            )
        )
    return out


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return assert_session_owner(session_id, user, db)


@router.patch("/sessions/{session_id}", response_model=SessionOut)
def update_session(
    session_id: str,
    payload: SessionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sess, field, value)
    db.commit()
    db.refresh(sess)
    return sess


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    db.delete(sess)
    db.commit()
