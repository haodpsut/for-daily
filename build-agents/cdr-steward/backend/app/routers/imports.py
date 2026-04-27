"""Router: POST /api/import/excel — upload xlsx → import vào DB."""
from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..services.import_excel import import_excel

router = APIRouter()


@router.post("/excel")
async def import_excel_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload .xlsx (sinh bởi gen_import_template.py), import full CTĐT.

    Behavior:
    - Program với cùng code đã tồn tại → ghi đè (full upsert)
    - Validation lỗi → 400, không ghi gì
    - Validation warning → 200 + warnings, vẫn ghi
    """
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="File phải là .xlsx")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        result = import_excel(db, tmp_path)
    finally:
        tmp_path.unlink(missing_ok=True)

    if result.get("errors"):
        raise HTTPException(status_code=400, detail=result)

    return result
