"""Word .docx → DB import.

Mirror cấu trúc Excel template — Word document có 11 tables (cùng thứ tự với 11
sheets Excel), mỗi table dòng đầu là header, các dòng sau là data.

Sinh template: scripts/gen_word_template.py
Parser: đọc theo thứ tự tables trong document.
"""
from __future__ import annotations

from pathlib import Path

from docx import Document
from sqlalchemy.orm import Session

from .import_excel import EXPECTED_SHEETS, import_sheets


def _table_to_rows(table) -> list[dict]:
    """Convert một docx Table → list[dict] dùng row đầu làm header."""
    if not table.rows:
        return []
    headers = [c.text.strip() for c in table.rows[0].cells]
    rows = []
    for row in table.rows[1:]:
        values = [c.text.strip() for c in row.cells]
        if all(not v for v in values):
            continue
        # Convert empty string → None để compatible với Excel parser logic
        d = {}
        for h, v in zip(headers, values):
            d[h] = v if v else None
        rows.append(d)
    return rows


def import_docx(db: Session, docx_path: Path, owner_id: str | None = None) -> dict:
    """Đọc Word doc, ánh xạ tables theo thứ tự với 11 sheets Excel rồi import."""
    doc = Document(docx_path)
    tables = doc.tables

    if len(tables) < 1:
        return {
            "imported": {}, "warnings": [],
            "errors": ["Word document không có bảng nào — dùng template từ "
                       "scripts/gen_word_template.py"],
        }

    sheets: dict[str, list[dict]] = {}
    for i, sheet_name in enumerate(EXPECTED_SHEETS):
        if i < len(tables):
            sheets[sheet_name] = _table_to_rows(tables[i])
        else:
            sheets[sheet_name] = []

    return import_sheets(db, sheets, owner_id=owner_id)
