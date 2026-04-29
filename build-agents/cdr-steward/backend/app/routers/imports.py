"""Router: POST /api/import/excel — upload xlsx → import vào DB (with owner)."""
from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import get_current_user
from ..models import User
from ..services.import_excel import import_excel
from ..services.import_docx import import_docx
from ..services.word_smart_parser import parse_decuong, health_check as smart_parser_health

router = APIRouter()


async def _save_upload_to_temp(file: UploadFile, suffix: str) -> Path:
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        return Path(tmp.name)


@router.post("/excel")
async def import_excel_endpoint(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="File phải là .xlsx")

    tmp_path = await _save_upload_to_temp(file, ".xlsx")
    try:
        result = import_excel(db, tmp_path, owner_id=user.id)
    finally:
        tmp_path.unlink(missing_ok=True)

    if result.get("errors"):
        raise HTTPException(status_code=400, detail=result)
    return result


@router.post("/docx")
async def import_docx_endpoint(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="File phải là .docx")

    tmp_path = await _save_upload_to_temp(file, ".docx")
    try:
        result = import_docx(db, tmp_path, owner_id=user.id)
    finally:
        tmp_path.unlink(missing_ok=True)

    if result.get("errors"):
        raise HTTPException(status_code=400, detail=result)
    return result


@router.get("/docx-smart/health")
def smart_parser_health_endpoint(user: User = Depends(get_current_user)):
    """Check Ollama service + model status. Frontend dùng để disable smart parse
    button nếu LLM chưa sẵn sàng."""
    return smart_parser_health()


@router.post("/docx-smart")
async def import_docx_smart_endpoint(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Smart-parse Word đề cương (free-form, không cần template) → structured
    preview. Caller review preview rồi commit qua existing CRUD endpoints
    (POST /programs/{code}/courses, /courses/{id}/clos, /clos/{id}/pi-mapping).

    Backend: gọi local LLM (Ollama + Qwen 2.5 14B) trên VPS, ~30-60s/document.
    """
    import requests as _req  # avoid shadow

    if not file.filename or not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="File phải là .docx")

    tmp_path = await _save_upload_to_temp(file, ".docx")
    try:
        preview = parse_decuong(tmp_path)
    except _req.exceptions.ConnectionError:
        raise HTTPException(503, "LLM service (Ollama) không reach được. Verify: "
                                 "tmux attach -t ollama hoặc curl http://localhost:11434/api/version")
    except _req.exceptions.Timeout:
        raise HTTPException(504, "LLM timeout — model có thể đang tải lần đầu. Thử lại sau 30s.")
    except Exception as e:
        raise HTTPException(500, f"Parse failed: {e!r}")
    finally:
        tmp_path.unlink(missing_ok=True)

    return {
        "preview": preview,
        "needs_review": True,
        "next_steps": [
            "Review course_info, cos, clos, clo_pi_levels, assessments",
            "POST /api/programs/{code}/courses với course_info để tạo course",
            "Sau đó POST /api/courses/{id}/clos và /api/clos/{id}/pi-mapping",
        ],
    }
