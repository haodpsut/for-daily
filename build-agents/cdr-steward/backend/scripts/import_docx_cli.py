"""CLI: import Word .docx → DB.

Run:
    python scripts/import_docx_cli.py --file ../../import_templates/CTDT.docx --owner demo@cdr-steward.com
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
from app.models import User
from app.services.import_docx import import_docx


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True)
    p.add_argument("--owner", help="Email của owner (optional, mặc định NULL)")
    p.add_argument("--init-db", action="store_true")
    args = p.parse_args()

    if args.init_db:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        owner_id = None
        if args.owner:
            user = db.query(User).filter_by(email=args.owner).first()
            if not user:
                print(f"[ERR] User {args.owner} không tồn tại")
                sys.exit(1)
            owner_id = user.id

        result = import_docx(db, Path(args.file), owner_id=owner_id)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        if result.get("errors"):
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
