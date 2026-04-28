"""FastAPI dependencies for auth + ownership checks."""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .db import get_db
from .models import User, Program, PLO, PI, Course, CLO

security = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired token")
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found")
    return user


def get_user_program(code: str, user: User, db: Session) -> Program:
    """Resolve a program by code, verify ownership."""
    program = db.query(Program).filter_by(code=code, owner_id=user.id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Program {code} not found or access denied")
    return program


def get_user_program_by_id(program_id: str, user: User, db: Session) -> Program:
    program = db.query(Program).filter_by(id=program_id, owner_id=user.id).first()
    if not program:
        raise HTTPException(404, "Program not found or access denied")
    return program


def assert_plo_owner(plo_id: str, user: User, db: Session) -> PLO:
    plo = db.query(PLO).filter_by(id=plo_id).first()
    if not plo or plo.program.owner_id != user.id:
        raise HTTPException(404, "PLO not found or access denied")
    return plo


def assert_pi_owner(pi_id: str, user: User, db: Session) -> PI:
    pi = db.query(PI).filter_by(id=pi_id).first()
    if not pi or pi.plo.program.owner_id != user.id:
        raise HTTPException(404, "PI not found or access denied")
    return pi


def assert_course_owner(course_id: str, user: User, db: Session) -> Course:
    course = db.query(Course).filter_by(id=course_id).first()
    if not course or course.program.owner_id != user.id:
        raise HTTPException(404, "Course not found or access denied")
    return course


def assert_clo_owner(clo_id: str, user: User, db: Session) -> CLO:
    clo = db.query(CLO).filter_by(id=clo_id).first()
    if not clo or clo.course.program.owner_id != user.id:
        raise HTTPException(404, "CLO not found or access denied")
    return clo
