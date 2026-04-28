"""Compute endpoint — trigger tính + cache kết quả CLO/PLO."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..models.meas import MeasResultCLO, MeasResultPLO
from ..models.ref import CLO, PLO
from ..schemas import ComputeResponse, ResultCLOOut, ResultPLOOut
from ..services.compute import compute_session

router = APIRouter()


@router.post("/sessions/{session_id}/compute", response_model=ComputeResponse)
def compute(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    result = compute_session(db, sess)

    # Enrich with CLO/PLO codes for friendly display
    clo_meta = {c.id: (c.code, c.text_vn) for c in db.query(CLO).all()}
    plo_meta = {p.id: (p.code, p.text_vn) for p in db.query(PLO).all()}

    clo_outs: list[ResultCLOOut] = []
    for r in result["clo_results"]:
        code, text = clo_meta.get(r["clo_id"], (None, None))
        clo_outs.append(
            ResultCLOOut(
                session_id=r["session_id"],
                clo_id=r["clo_id"],
                clo_code=code,
                clo_text=text,
                n_students=r["n_students"],
                n_achieved=r["n_achieved"],
                pct_achieved=r["pct_achieved"],
                avg_score_pct=r["avg_score_pct"],
                computed_at=r["computed_at"],
            )
        )

    plo_outs: list[ResultPLOOut] = []
    for r in result["plo_results"]:
        code, text = plo_meta.get(r["plo_id"], (None, None))
        plo_outs.append(
            ResultPLOOut(
                session_id=r["session_id"],
                plo_id=r["plo_id"],
                plo_code=code,
                plo_text=text,
                pi_count=r["pi_count"],
                pct_achieved=r["pct_achieved"],
                computed_at=r["computed_at"],
            )
        )

    return ComputeResponse(
        session_id=sess.id,
        n_students_total=result["n_students_total"],
        n_questions_total=result["n_questions_total"],
        n_clos_evaluated=result["n_clos_evaluated"],
        n_plos_evaluated=result["n_plos_evaluated"],
        clo_results=clo_outs,
        plo_results=plo_outs,
        warnings=[w["message"] for w in result["warnings"]],
    )


@router.get("/sessions/{session_id}/results", response_model=ComputeResponse)
def get_cached_results(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Đọc kết quả đã cache mà không re-compute."""
    sess = assert_session_owner(session_id, user, db)
    clo_meta = {c.id: (c.code, c.text_vn) for c in db.query(CLO).all()}
    plo_meta = {p.id: (p.code, p.text_vn) for p in db.query(PLO).all()}

    clo_outs = []
    for r in db.query(MeasResultCLO).filter_by(session_id=sess.id).all():
        code, text = clo_meta.get(r.clo_id, (None, None))
        clo_outs.append(
            ResultCLOOut(
                session_id=r.session_id,
                clo_id=r.clo_id,
                clo_code=code,
                clo_text=text,
                n_students=r.n_students,
                n_achieved=r.n_achieved,
                pct_achieved=r.pct_achieved,
                avg_score_pct=r.avg_score_pct,
                computed_at=r.computed_at,
            )
        )

    plo_outs = []
    for r in db.query(MeasResultPLO).filter_by(session_id=sess.id).all():
        code, text = plo_meta.get(r.plo_id, (None, None))
        plo_outs.append(
            ResultPLOOut(
                session_id=r.session_id,
                plo_id=r.plo_id,
                plo_code=code,
                plo_text=text,
                pi_count=r.pi_count,
                pct_achieved=r.pct_achieved,
                computed_at=r.computed_at,
            )
        )

    return ComputeResponse(
        session_id=sess.id,
        n_students_total=len(sess.students),
        n_questions_total=len(sess.questions),
        n_clos_evaluated=len(clo_outs),
        n_plos_evaluated=len(plo_outs),
        clo_results=clo_outs,
        plo_results=plo_outs,
        warnings=[],
    )
