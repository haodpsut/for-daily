"""Database setup — share DATABASE_URL với cdr-steward.

Convention:
- `Base` = declarative base CHO TẤT CẢ models (cả ref và meas_*).
- Ref models (Program, Course, CLO, PLO, PI, User) dùng `extend_existing=True` để không
  conflict với cdr-steward khi 2 app cùng connect 1 DB.
- Chỉ `meas_*` tables được tự tạo bởi `Base.metadata.create_all()` ở app này — ref tables
  đã được cdr-steward tạo trước.

Postgres (Neon) connection drops handling — pool_pre_ping + recycle + TCP keepalive.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../cdr-steward/backend/cdr_steward.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        future=True,
    )
else:
    # Postgres (Neon serverless) — connections get killed when idle.
    engine = create_engine(
        DATABASE_URL,
        future=True,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 3,
        },
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
