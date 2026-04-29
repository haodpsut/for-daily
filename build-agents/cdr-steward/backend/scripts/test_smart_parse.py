"""CLI test cho smart Word parser. Test offline (không cần web app chạy).

Usage:
    python scripts/test_smart_parse.py --file /path/to/decuong.docx
    python scripts/test_smart_parse.py --health  # check Ollama status
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.word_smart_parser import parse_decuong, health_check, extract_docx_content


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--file", help="Path to .docx")
    p.add_argument("--health", action="store_true", help="Check Ollama service")
    p.add_argument("--text-only", action="store_true",
                   help="In ra text trích từ docx (không gọi LLM)")
    args = p.parse_args()

    print(f"Ollama URL:   {os.getenv('OLLAMA_URL', 'http://localhost:11434')}")
    print(f"Model:        {os.getenv('OLLAMA_MODEL', 'qwen2.5:14b')}")
    print()

    if args.health:
        result = health_check()
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    if not args.file:
        p.error("--file required (hoặc dùng --health)")

    docx_path = Path(args.file)
    if not docx_path.exists():
        print(f"[ERR] File không tồn tại: {docx_path}")
        sys.exit(1)

    if args.text_only:
        text = extract_docx_content(docx_path)
        print(f"--- Extracted text ({len(text)} chars) ---")
        print(text)
        return

    print(f"Parsing {docx_path.name}...")
    print("(Lần đầu LLM có thể mất 30-90s vì load model + multi-prompt)")
    print()

    import time
    t0 = time.time()
    result = parse_decuong(docx_path)
    elapsed = time.time() - t0

    print(json.dumps(result, indent=2, ensure_ascii=False))
    print()
    print(f"[Time] {elapsed:.1f}s")
    print(f"[Stats] {len(result['cos'])} COs, {len(result['clos'])} CLOs, "
          f"{len(result['clo_pi_levels'])} mappings, "
          f"{len(result['assessments'])} assessments")
    if result.get("_warnings"):
        print(f"[Warnings] {len(result['_warnings'])}")
        for w in result["_warnings"]:
            print(f"  - {w}")


if __name__ == "__main__":
    main()
