"""FastAPI dependencies cho auth + ownership checks."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .db import get_db
from .models import User, Program, Course
from .models.meas import MeasSession, MeasStudent

security = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


def assert_program_owner(program_id: str, user: User, db: Session) -> Program:
    program = db.query(Program).filter_by(id=program_id, owner_id=user.id).first()
    if not program:
        raise HTTPException(404, "Program not found or access denied")
    return program


def assert_course_owner(course_id: str, user: User, db: Session) -> Course:
    course = db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    program = db.query(Program).filter_by(id=course.program_id).first()
    if not program or program.owner_id != user.id:
        raise HTTPException(404, "Course not found or access denied")
    return course


def assert_session_owner(session_id: str, user: User, db: Session) -> MeasSession:
    sess = db.query(MeasSession).filter_by(id=session_id).first()
    if not sess:
        raise HTTPException(404, "Session not found")
    program = db.query(Program).filter_by(id=sess.program_id).first()
    if not program or program.owner_id != user.id:
        raise HTTPException(404, "Session not found or access denied")
    return sess


def assert_student_owner(student_id: str, user: User, db: Session) -> MeasStudent:
    st = db.query(MeasStudent).filter_by(id=student_id).first()
    if not st:
        raise HTTPException(404, "Student not found")
    program = db.query(Program).filter_by(id=st.program_id).first()
    if not program or program.owner_id != user.id:
        raise HTTPException(404, "Student not found or access denied")
    return st
