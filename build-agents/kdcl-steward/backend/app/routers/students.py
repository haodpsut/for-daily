"""CRUD sinh viên + map student vào session."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import (
    assert_program_owner,
    assert_session_owner,
    assert_student_owner,
    get_current_user,
)
from ..models import User
from ..models.meas import MeasSessionStudent, MeasStudent
from ..schemas import SessionStudentLink, StudentCreate, StudentOut, StudentUpdate

router = APIRouter()


@router.post("/students", response_model=StudentOut)
def create_student(
    payload: StudentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assert_program_owner(payload.program_id, user, db)
    st = MeasStudent(**payload.model_dump())
    db.add(st)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Sinh viên đã tồn tại trong program: {exc}")
    db.refresh(st)
    return st


@router.get("/students", response_model=list[StudentOut])
def list_students(
    program_id: str,
    cohort_code: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assert_program_owner(program_id, user, db)
    q = db.query(MeasStudent).filter_by(program_id=program_id)
    if cohort_code:
        q = q.filter(MeasStudent.cohort_code == cohort_code)
    return q.order_by(MeasStudent.code).all()


@router.patch("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    st = assert_student_owner(student_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(st, field, value)
    db.commit()
    db.refresh(st)
    return st


@router.delete("/students/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    st = assert_student_owner(student_id, user, db)
    db.delete(st)
    db.commit()


# ---------------------------------------------------------------------------
# Session ↔ Student enrollment
# ---------------------------------------------------------------------------
@router.post("/sessions/{session_id}/students", status_code=201)
def enroll_students(
    session_id: str,
    links: list[SessionStudentLink],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    n_added = 0
    n_skipped = 0
    for link in links:
        st = db.query(MeasStudent).filter_by(id=link.student_id).first()
        if not st or st.program_id != sess.program_id:
            n_skipped += 1
            continue
        # Skip if already enrolled
        existing = (
            db.query(MeasSessionStudent)
            .filter_by(session_id=session_id, student_id=link.student_id)
            .first()
        )
        if existing:
            n_skipped += 1
            continue
        db.add(
            MeasSessionStudent(
                session_id=session_id,
                student_id=link.student_id,
                absent=link.absent,
                notes=link.notes,
            )
        )
        n_added += 1
    db.commit()
    return {"added": n_added, "skipped": n_skipped}


@router.get("/sessions/{session_id}/students", response_model=list[StudentOut])
def list_session_students(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    return [link.student for link in sess.students]


@router.delete("/sessions/{session_id}/students/{student_id}", status_code=204)
def unenroll_student(
    session_id: str,
    student_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    link = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=sess.id, student_id=student_id)
        .first()
    )
    if not link:
        raise HTTPException(404, "Student not enrolled in session")
    db.delete(link)
    db.commit()
