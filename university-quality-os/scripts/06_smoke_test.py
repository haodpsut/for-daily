"""Smoke test — verify everything works before MVP-1.

Tests:
1. Read 1 extracted doc
2. Load criteria + processes
3. Call Claude with a basic classification task
4. Print response + cost

Run: python scripts/06_smoke_test.py
"""

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from anthropic import Anthropic

from university_quality_os.config import settings
from university_quality_os.utils import setup_logging, read_json, read_jsonl, estimate_cost_vnd

log = setup_logging(settings.log_level)


def smoke_test_extraction():
    log.info("[1/4] Test: extraction output")
    iso_texts_path = settings.extracted_dir / "iso_texts.jsonl"
    if not iso_texts_path.exists():
        log.error(f"  ❌ {iso_texts_path} not found. Run 02_extract_text.py first.")
        return None

    docs = list(read_jsonl(iso_texts_path))
    ok_docs = [d for d in docs if d["extract_status"] == "ok"]
    log.info(f"  ✅ {len(ok_docs)}/{len(docs)} docs extracted successfully")

    if not ok_docs:
        log.error("  ❌ No OK documents to test with")
        return None

    return ok_docs[0]


def smoke_test_metadata():
    log.info("[2/4] Test: metadata files")

    criteria_path = settings.data_dir / "criteria.json"
    processes_path = settings.data_dir / "iso_processes.json"

    if not criteria_path.exists():
        log.error(f"  ❌ {criteria_path} not found. Run 04_build_criteria.py")
        return None, None

    if not processes_path.exists():
        log.error(f"  ❌ {processes_path} not found. Run 03_build_iso_metadata.py")
        return None, None

    criteria = read_json(criteria_path)
    processes = read_json(processes_path)

    log.info(f"  ✅ criteria.json:       {criteria.get('total_criteria', '?')} criteria")
    log.info(f"  ✅ iso_processes.json:  {processes.get('total', '?')} processes")

    return criteria, processes


def smoke_test_claude(doc, criteria):
    log.info("[3/4] Test: Claude API call")

    if not settings.anthropic_api_key:
        log.error("  ❌ ANTHROPIC_API_KEY missing")
        return False

    # Build a minimal classification prompt
    sample_criteria = []
    for std in criteria["standards"][:3]:  # First 3 standards
        for crit in std["criteria"][:2]:  # First 2 criteria each
            sample_criteria.append(f"- {crit['id']}: {crit['name']}")

    prompt = f"""Document (excerpt):
{doc['text'][:1500]}

Trong các tiêu chí KĐCLGD sau, document này có thể là minh chứng cho tiêu chí nào?
{chr(10).join(sample_criteria)}

Trả lời ngắn:
- Tiêu chí phù hợp nhất (nếu có)
- Confidence (cao/trung bình/thấp)
- Lý do (1 câu)"""

    log.info(f"  Doc: {doc['path']}")
    log.info(f"  Length: {doc['text_len']} chars")
    log.info(f"  Sending to {settings.claude_model_fast}...")

    anthropic = Anthropic(api_key=settings.anthropic_api_key)

    start = time.time()
    try:
        msg = anthropic.messages.create(
            model=settings.claude_model_fast,  # Use fast/cheap for smoke test
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        log.error(f"  ❌ Claude API error: {e}")
        return False
    elapsed = time.time() - start

    cost = estimate_cost_vnd(msg.usage.input_tokens, msg.usage.output_tokens, "haiku")

    log.info(f"  ✅ Response received in {elapsed:.1f}s")
    log.info(f"  Tokens: in={msg.usage.input_tokens}, out={msg.usage.output_tokens}")
    log.info(f"  Cost: {cost:.0f} VND")
    log.info("")
    log.info("  ─── Claude response ───")
    log.info(msg.content[0].text)
    log.info("  ─── end ───")

    return True


def smoke_test_database():
    log.info("[4/4] Test: PostgreSQL + pgvector")

    try:
        import psycopg2
        from psycopg2 import sql
    except ImportError:
        log.warning("  ⚠️  psycopg2 not installed (will install in MVP-1)")
        return None

    try:
        conn = psycopg2.connect(settings.database_url, connect_timeout=3)
        cur = conn.cursor()

        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        log.info(f"  ✅ Connected: {version[:50]}...")

        cur.execute("SELECT extversion FROM pg_extension WHERE extname='vector';")
        result = cur.fetchone()
        if result:
            log.info(f"  ✅ pgvector installed: v{result[0]}")
        else:
            log.warning(f"  ⚠️  pgvector extension not found (run init.sql)")

        cur.close()
        conn.close()
        return True
    except Exception as e:
        log.warning(f"  ⚠️  DB connection failed: {e}")
        log.warning(f"  Hint: docker compose up -d")
        return False


def main():
    log.info("=" * 60)
    log.info("UNIVERSITY QUALITY OS — MVP-0 SMOKE TEST")
    log.info("=" * 60)
    log.info("")

    # 1. Extraction
    doc = smoke_test_extraction()
    log.info("")

    # 2. Metadata
    criteria, processes = smoke_test_metadata()
    log.info("")

    # 3. Claude API (only if we have data)
    api_ok = False
    if doc and criteria:
        api_ok = smoke_test_claude(doc, criteria)
        log.info("")

    # 4. Database (optional)
    db_ok = smoke_test_database()
    log.info("")

    # Summary
    log.info("=" * 60)
    log.info("SMOKE TEST SUMMARY")
    log.info("=" * 60)
    log.info(f"  Extraction output:  {'✅' if doc else '❌'}")
    log.info(f"  Metadata files:     {'✅' if criteria and processes else '❌'}")
    log.info(f"  Claude API:         {'✅' if api_ok else '❌'}")
    log.info(f"  Postgres+pgvector:  {'✅' if db_ok else '⚠️'}  (optional for MVP-1)")
    log.info("")

    if doc and criteria and api_ok:
        log.info("🎉 Ready for MVP-1!")
        log.info("   Next: streamlit run scripts/labeler.py to ground-truth label")
    else:
        log.warning("Some prerequisites missing. Run earlier scripts first.")


if __name__ == "__main__":
    main()
