"""Router: POST render-all + serve PDF files — with ownership checks."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import get_current_user, get_user_program
from ..models import User
from ..services.render import render_all

router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


@router.post("/{program_code}")
def render_program(
    program_code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify ownership before rendering
    get_user_program(program_code, user, db)

    try:
        results = render_all(db, program_code, PROJECT_ROOT)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Render failed: {e}")

    return {
        "program_code": program_code,
        "results": [
            {
                "template": name,
                "pdf_filename": pdf.name,
                "pdf_url": f"/api/render/{program_code}/files/{pdf.name}",
            }
            for name, pdf in results.items()
        ],
    }


@router.get("/{program_code}/files/{filename}")
def get_pdf(
    program_code: str, filename: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify ownership
    get_user_program(program_code, user, db)

    if not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only .pdf allowed")
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    pdf_path = PROJECT_ROOT / "backend" / "output" / program_code / filename
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"PDF not found: {filename}")
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)
