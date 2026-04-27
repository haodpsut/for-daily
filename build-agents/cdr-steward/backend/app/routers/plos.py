"""Router: CRUD cho PLO + PI (nested).

Endpoints:
- POST   /api/programs/{code}/plos      → tạo PLO mới
- PUT    /api/plos/{plo_id}             → cập nhật PLO
- DELETE /api/plos/{plo_id}             → xóa PLO (cascade PIs + PLO_PO)
- POST   /api/plos/{plo_id}/pis         → thêm PI mới dưới PLO
- PUT    /api/pis/{pi_id}               → cập nhật PI
- DELETE /api/pis/{pi_id}               → xóa PI
- PUT    /api/plos/{plo_id}/po-mapping  → set ma trận PLO×PO (replace all)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Program, PLO, PI, PLO_PO, PO

router = APIRouter()


# ────────────── schemas ──────────────

class PLOCreate(BaseModel):
    code: str
    text_vn: str
    text_en: str | None = None
    order: int | None = None


class PLOUpdate(BaseModel):
    code: str | None = None
    text_vn: str | None = None
    text_en: str | None = None
    order: int | None = None


class PICreate(BaseModel):
    code: str
    text_vn: str
    text_en: str | None = None
    order: int | None = None


class PIUpdate(BaseModel):
    code: str | None = None
    text_vn: str | None = None
    text_en: str | None = None
    order: int | None = None


class POMappingUpdate(BaseModel):
    po_codes: list[str]


def _plo_dict(plo: PLO) -> dict:
    return {
        "id": plo.id, "code": plo.code,
        "text_vn": plo.text_vn, "text_en": plo.text_en,
        "order": plo.order,
    }


def _pi_dict(pi: PI) -> dict:
    return {
        "id": pi.id, "code": pi.code,
        "text_vn": pi.text_vn, "text_en": pi.text_en,
        "order": pi.order,
    }


# ────────────── PLO endpoints ──────────────

@router.post("/programs/{program_code}/plos")
def create_plo(program_code: str, body: PLOCreate, db: Session = Depends(get_db)):
    program = db.query(Program).filter_by(code=program_code).first()
    if not program:
        raise HTTPException(404, f"Program {program_code} not found")
    if any(p.code == body.code for p in program.plos):
        raise HTTPException(409, f"PLO {body.code} already exists in {program_code}")

    order = body.order if body.order is not None else (
        max((p.order for p in program.plos), default=0) + 1
    )
    plo = PLO(
        program_id=program.id,
        code=body.code, text_vn=body.text_vn, text_en=body.text_en,
        order=order,
    )
    db.add(plo)
    db.commit()
    db.refresh(plo)
    return _plo_dict(plo)


@router.put("/plos/{plo_id}")
def update_plo(plo_id: str, body: PLOUpdate, db: Session = Depends(get_db)):
    plo = db.query(PLO).filter_by(id=plo_id).first()
    if not plo:
        raise HTTPException(404, "PLO not found")

    if body.code is not None and body.code != plo.code:
        # Check unique within program
        if any(p.code == body.code for p in plo.program.plos if p.id != plo.id):
            raise HTTPException(409, f"PLO code {body.code} already used in this program")
        plo.code = body.code
    if body.text_vn is not None:
        plo.text_vn = body.text_vn
    if body.text_en is not None:
        plo.text_en = body.text_en
    if body.order is not None:
        plo.order = body.order

    plo.program.version += 1
    db.commit()
    db.refresh(plo)
    return _plo_dict(plo)


@router.delete("/plos/{plo_id}")
def delete_plo(plo_id: str, db: Session = Depends(get_db)):
    plo = db.query(PLO).filter_by(id=plo_id).first()
    if not plo:
        raise HTTPException(404, "PLO not found")
    program = plo.program
    db.delete(plo)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": plo_id}


@router.put("/plos/{plo_id}/po-mapping")
def update_plo_po_mapping(plo_id: str, body: POMappingUpdate, db: Session = Depends(get_db)):
    """Replace all PLO_PO rows for this PLO with the new set."""
    plo = db.query(PLO).filter_by(id=plo_id).first()
    if not plo:
        raise HTTPException(404, "PLO not found")

    pos = {po.code: po for po in plo.program.pos}
    invalid = [c for c in body.po_codes if c not in pos]
    if invalid:
        raise HTTPException(400, f"Unknown PO codes: {invalid}")

    db.query(PLO_PO).filter_by(plo_id=plo.id).delete()
    for po_code in body.po_codes:
        db.add(PLO_PO(plo_id=plo.id, po_id=pos[po_code].id))

    plo.program.version += 1
    db.commit()
    return {"ok": True, "plo_code": plo.code, "po_codes": body.po_codes}


# ────────────── PI endpoints ──────────────

@router.post("/plos/{plo_id}/pis")
def create_pi(plo_id: str, body: PICreate, db: Session = Depends(get_db)):
    plo = db.query(PLO).filter_by(id=plo_id).first()
    if not plo:
        raise HTTPException(404, "PLO not found")
    if any(p.code == body.code for p in plo.pis):
        raise HTTPException(409, f"PI {body.code} already exists in {plo.code}")

    order = body.order if body.order is not None else (
        max((p.order for p in plo.pis), default=0) + 1
    )
    pi = PI(plo_id=plo.id, code=body.code, text_vn=body.text_vn,
            text_en=body.text_en, order=order)
    db.add(pi)
    plo.program.version += 1
    db.commit()
    db.refresh(pi)
    return _pi_dict(pi)


@router.put("/pis/{pi_id}")
def update_pi(pi_id: str, body: PIUpdate, db: Session = Depends(get_db)):
    pi = db.query(PI).filter_by(id=pi_id).first()
    if not pi:
        raise HTTPException(404, "PI not found")
    if body.code is not None and body.code != pi.code:
        if any(p.code == body.code for p in pi.plo.pis if p.id != pi.id):
            raise HTTPException(409, f"PI code {body.code} already used in this PLO")
        pi.code = body.code
    if body.text_vn is not None:
        pi.text_vn = body.text_vn
    if body.text_en is not None:
        pi.text_en = body.text_en
    if body.order is not None:
        pi.order = body.order

    pi.plo.program.version += 1
    db.commit()
    db.refresh(pi)
    return _pi_dict(pi)


@router.delete("/pis/{pi_id}")
def delete_pi(pi_id: str, db: Session = Depends(get_db)):
    pi = db.query(PI).filter_by(id=pi_id).first()
    if not pi:
        raise HTTPException(404, "PI not found")
    program = pi.plo.program
    db.delete(pi)
    program.version += 1
    db.commit()
    return {"ok": True, "deleted_id": pi_id}
