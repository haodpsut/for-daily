"""Database setup — share DATABASE_URL với cdr-steward.

Convention:
- `Base` = declarative base CHO TẤT CẢ models (cả ref và meas_*).
- Ref models (Program, Course, CLO, PLO, PI, User) dùng `extend_existing=True` để không
  conflict với cdr-steward khi 2 app cùng connect 1 DB.
- Chỉ `meas_*` tables được tự tạo bởi `Base.metadata.create_all()` ở app này — ref tables
  đã được cdr-steward tạo trước.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../cdr-steward/backend/cdr_steward.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
