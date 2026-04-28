"""FastAPI entry — kdcl-steward.

Chạy port 8001 (cdr-steward đã chiếm 8000).
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from . import models  # noqa: F401 — register all models
from .routers import compute as compute_router
from .routers import exports as exports_router
from .routers import imports as imports_router
from .routers import questions as questions_router
from .routers import refs as refs_router
from .routers import reports as reports_router
from .routers import scores as scores_router
from .routers import sessions as sessions_router
from .routers import students as students_router

app = FastAPI(title="KĐCLGD Steward — Đo lường CĐR", version="0.1.0")

default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",  # frontend kdcl chạy port khác
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins + extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Idempotent table create.

    - Shared DB với cdr (Postgres): user/program/course/... đã có → SQLAlchemy skip,
      chỉ tạo meas_* mới.
    - Standalone (SQLite ephemeral container): DB rỗng → tạo TẤT CẢ tables (cả ref
      lẫn meas_*) để app boot được. Data trống cho đến khi user import qua UI.
    """
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0", "app": "kdcl-steward"}


# Routers (auth không có — kdcl-steward share JWT_SECRET với cdr-steward, dùng token cấp bởi cdr)
app.include_router(refs_router.router, prefix="/api", tags=["refs"])
app.include_router(sessions_router.router, prefix="/api", tags=["sessions"])
app.include_router(questions_router.router, prefix="/api", tags=["questions"])
app.include_router(students_router.router, prefix="/api", tags=["students"])
app.include_router(scores_router.router, prefix="/api", tags=["scores"])
app.include_router(imports_router.router, prefix="/api", tags=["import"])
app.include_router(exports_router.router, prefix="/api", tags=["export"])
app.include_router(reports_router.router, prefix="/api", tags=["report"])
app.include_router(compute_router.router, prefix="/api", tags=["compute"])
