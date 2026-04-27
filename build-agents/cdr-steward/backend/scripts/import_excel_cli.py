"""CLI: import Excel xlsx → DB (không cần API).

Run:
    python scripts/import_excel_cli.py --file ../import_templates/CNTT_7480201_filled.xlsx
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import Base, SessionLocal, engine
from app import models  # noqa
from app.services.import_excel import import_excel


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True, help="Đường dẫn file .xlsx")
    p.add_argument("--init-db", action="store_true", help="Tạo lại schema DB trước khi import")
    args = p.parse_args()

    if args.init_db:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("[OK] DB schema recreated")

    db = SessionLocal()
    try:
        result = import_excel(db, Path(args.file))
        print(json.dumps(result, indent=2, ensure_ascii=False))
        if result.get("errors"):
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
