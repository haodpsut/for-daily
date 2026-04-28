"""Report endpoints — render LaTeX → PDF báo cáo TT04-2025."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..services.render import render_tt04_report

router = APIRouter()


@router.post("/sessions/{session_id}/report/tt04")
def generate_tt04(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Render `.tex` + thử xelatex → `.pdf`.

    Returns paths (relative to output dir).
    `.tex` luôn có; `.pdf` có thể null nếu xelatex chưa cài.
    """
    sess = assert_session_owner(session_id, user, db)
    tex_path, pdf_path = render_tt04_report(db, sess)
    return {
        "session_id": sess.id,
        "tex_path": str(tex_path),
        "pdf_path": str(pdf_path) if pdf_path else None,
        "pdf_available": pdf_path is not None,
    }


@router.get("/sessions/{session_id}/report/tt04.pdf")
def download_tt04_pdf(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    tex_path, pdf_path = render_tt04_report(db, sess)
    if not pdf_path or not pdf_path.exists():
        raise HTTPException(
            424,
            "PDF chưa render được — xelatex không khả dụng. Tải `.tex` rồi compile thủ công.",
        )
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.name)


@router.get("/sessions/{session_id}/report/tt04.tex")
def download_tt04_tex(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    tex_path, _ = render_tt04_report(db, sess, run_pdf=False)
    return FileResponse(tex_path, media_type="application/x-tex", filename=tex_path.name)
