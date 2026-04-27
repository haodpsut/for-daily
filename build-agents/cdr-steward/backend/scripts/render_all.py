"""CLI: render TẤT CẢ 5 templates cho 1 program.

Run:
    python scripts/render_all.py --program-code 7480201
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import SessionLocal
from app.services.render import render_all


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--program-code", default="7480201")
    args = p.parse_args()

    project_root = Path(__file__).resolve().parent.parent.parent
    db = SessionLocal()
    try:
        results = render_all(db, args.program_code, project_root)
        print(f"\n[OK] Rendered {len(results)} PDF(s):")
        for name, pdf in results.items():
            print(f"  {name:30s} → {pdf}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
