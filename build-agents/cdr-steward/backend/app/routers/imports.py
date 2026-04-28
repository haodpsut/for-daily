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

router = APIRouter()


@router.post("/excel")
async def import_excel_endpoint(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="File phải là .xlsx")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        result = import_excel(db, tmp_path, owner_id=user.id)
    finally:
        tmp_path.unlink(missing_ok=True)

    if result.get("errors"):
        raise HTTPException(status_code=400, detail=result)

    return result
