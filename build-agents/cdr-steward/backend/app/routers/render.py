"""Router: POST render-all + serve PDF files."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..db import get_db
from ..services.render import render_all

router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent  # cdr-steward/


@router.post("/{program_code}")
def render_program(program_code: str, db: Session = Depends(get_db)):
    """Render all 5 templates + N đề cương cho 1 program.

    Returns list of (template_name, pdf_filename, pdf_url).
    """
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
def get_pdf(program_code: str, filename: str):
    """Serve a generated PDF file."""
    if not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only .pdf allowed")
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    pdf_path = PROJECT_ROOT / "backend" / "output" / program_code / filename
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"PDF not found: {filename}")
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)
