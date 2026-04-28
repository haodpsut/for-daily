"""Import endpoints — Excel gradebook upload."""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..services.import_excel import import_gradebook

router = APIRouter()


@router.post("/sessions/{session_id}/import")
async def import_excel(
    session_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Upload .xlsx gradebook → upsert students/questions/scores cho session.

    Returns summary `{students_created, students_updated, scores_created, ...}`.
    """
    sess = assert_session_owner(session_id, user, db)
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(400, "File phải là .xlsx hoặc .xlsm")
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(400, "File trống")
    try:
        summary = import_gradebook(db, sess, content, user.id)
    except Exception as exc:  # pragma: no cover — protect against malformed Excel
        db.rollback()
        raise HTTPException(400, f"Import thất bại: {exc}") from exc
    return summary
