"""CLI: render CT_CDR.pdf cho 1 program.

Run:
    cd backend
    python scripts/render_ct_cdr.py --program-code 7480201
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import SessionLocal
from app.services.render import render_ct_cdr_by_code


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--program-code", default="7480201")
    args = p.parse_args()

    project_root = Path(__file__).resolve().parent.parent.parent
    db = SessionLocal()
    try:
        tex_path, pdf_path = render_ct_cdr_by_code(db, args.program_code, project_root)
        print(f"✓ TEX: {tex_path}")
        print(f"✓ PDF: {pdf_path}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
