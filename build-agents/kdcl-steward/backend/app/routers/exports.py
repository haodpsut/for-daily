"""CSV evidence export endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from io import BytesIO
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..services.export_csv import (
    export_clo_mastery,
    export_evidence_summary,
    export_score_matrix,
)

router = APIRouter()


def _csv_response(content: str, filename: str) -> StreamingResponse:
    bio = BytesIO(content.encode("utf-8"))
    return StreamingResponse(
        bio,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/sessions/{session_id}/export/scores.csv")
def get_score_matrix(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    csv_text = export_score_matrix(db, sess)
    fname = f"scores_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)


@router.get("/sessions/{session_id}/export/clo_mastery.csv")
def get_clo_mastery(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    csv_text = export_clo_mastery(db, sess)
    fname = f"clo_mastery_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)


@router.get("/sessions/{session_id}/export/evidence.csv")
def get_evidence_summary(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    csv_text = export_evidence_summary(db, sess)
    fname = f"evidence_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)
