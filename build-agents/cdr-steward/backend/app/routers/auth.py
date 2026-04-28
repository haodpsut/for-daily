"""Auth router: register / login / me."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, verify_password
from ..db import get_db
from ..dependencies import get_current_user
from ..models import User

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    institution_name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "institution_name": user.institution_name,
    }


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if db.query(User).filter_by(email=body.email).first():
        raise HTTPException(409, f"Email {body.email} already registered")

    user = User(
        email=body.email.lower().strip(),
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        institution_name=body.institution_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=_user_dict(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=body.email.lower().strip()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Sai email hoặc mật khẩu")
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=_user_dict(user),
    )


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _user_dict(user)
