"""Link 60 KĐCLGD criteria ↔ ISO processes using Claude.

Reads:
  data/criteria.json
  data/iso_processes.json

Writes:
  data/criteria.json (updated with `related_iso_processes` field per criterion)

Strategy: process criteria in batches of 10 to manage prompt size.

Run: python scripts/05_link_criteria_processes.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from anthropic import Anthropic
from tqdm import tqdm

from university_quality_os.config import settings
from university_quality_os.utils import setup_logging, read_json, write_json, estimate_cost_vnd

log = setup_logging(settings.log_level)


SYSTEM_PROMPT = """Bạn là chuyên gia kiểm định chất lượng giáo dục (KĐCLGD) của trường đại học Việt Nam.

Nhiệm vụ: Cho danh sách tiêu chí KĐCLGD và danh sách ISO processes của trường,
xác định các process có thể cung cấp minh chứng cho mỗi tiêu chí.

Quy tắc:
1. Mỗi criterion link với 0-5 processes (đa số là 1-3)
2. Chỉ link nếu có liên quan rõ ràng — không gượng ép
3. Output JSON STRICT
4. Có thể giải thích ngắn cho mỗi link (1 câu)

Schema:
{
  "mappings": [
    {
      "criterion_id": "TC 3.1",
      "related_processes": [
        {"process_id": "PTCNS-001", "reasoning": "Quy trình tuyển dụng nhân viên trực tiếp cung cấp..."}
      ]
    }
  ]
}"""


def build_prompt(criteria_batch: list[dict], processes: list[dict]) -> str:
    crit_text = "\n".join(
        f"- {c['id']}: {c['name']}\n  Requirements: {'; '.join(c.get('requirements', []))}"
        for c in criteria_batch
    )

    proc_text = "\n".join(
        f"- {p['id']}: {p['name']} ({p['dept_full']})"
        for p in processes
    )

    return f"""# CRITERIA cần link
{crit_text}

# ISO PROCESSES có sẵn
{proc_text}

Với mỗi criterion ở trên, liệt kê 0-5 processes liên quan. Output JSON theo schema."""


def call_claude(prompt: str, anthropic: Anthropic) -> dict:
    msg = anthropic.messages.create(
        model=settings.claude_model_primary,
        max_tokens=4000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    cost = estimate_cost_vnd(msg.usage.input_tokens, msg.usage.output_tokens, "sonnet")

    text = msg.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    return json.loads(text), cost, msg.usage


def main():
    criteria_path = settings.data_dir / "criteria.json"
    processes_path = settings.data_dir / "iso_processes.json"

    if not criteria_path.exists():
        log.error(f"criteria.json not found. Run scripts/04_build_criteria.py first.")
        sys.exit(1)

    if not processes_path.exists():
        log.error(f"iso_processes.json not found. Run scripts/03_build_iso_metadata.py first.")
        sys.exit(1)

    if not settings.anthropic_api_key:
        log.error("ANTHROPIC_API_KEY missing in .env")
        sys.exit(1)

    criteria_data = read_json(criteria_path)
    processes_data = read_json(processes_path)

    # Flatten criteria
    all_criteria = []
    for std in criteria_data["standards"]:
        for crit in std["criteria"]:
            all_criteria.append({
                "standard_id": std["id"],
                **crit,
            })

    processes = processes_data["processes"]

    log.info(f"Linking {len(all_criteria)} criteria with {len(processes)} processes")
    log.info("")

    anthropic = Anthropic(api_key=settings.anthropic_api_key)

    # Process in batches of 10
    BATCH_SIZE = 10
    all_mappings = {}
    total_cost = 0.0
    total_input_tokens = 0
    total_output_tokens = 0

    for i in tqdm(range(0, len(all_criteria), BATCH_SIZE), desc="Linking", unit="batch"):
        batch = all_criteria[i:i + BATCH_SIZE]
        prompt = build_prompt(batch, processes)

        try:
            result, cost, usage = call_claude(prompt, anthropic)
            total_cost += cost
            total_input_tokens += usage.input_tokens
            total_output_tokens += usage.output_tokens

            for mapping in result.get("mappings", []):
                all_mappings[mapping["criterion_id"]] = mapping.get("related_processes", [])
        except Exception as e:
            log.error(f"Batch {i}-{i+BATCH_SIZE} failed: {e}")

    # Update criteria with mappings
    for std in criteria_data["standards"]:
        for crit in std["criteria"]:
            crit["related_iso_processes"] = all_mappings.get(crit["id"], [])

    # Save
    write_json(criteria_data, criteria_path)

    # Summary
    linked = sum(1 for cid in all_mappings if all_mappings[cid])
    avg_links = sum(len(v) for v in all_mappings.values()) / max(len(all_mappings), 1)

    log.info("")
    log.info(f"📊 Linking summary:")
    log.info(f"  Criteria linked:    {linked}/{len(all_criteria)}")
    log.info(f"  Avg links/criterion: {avg_links:.1f}")
    log.info(f"  Total tokens:       in={total_input_tokens:,}, out={total_output_tokens:,}")
    log.info(f"  Total cost:         {total_cost:.0f} VND (~{total_cost/25000:.2f} USD)")
    log.info("")
    log.info(f"📁 Updated: {criteria_path}")
    log.info("")
    log.info("⚠️  Hảo should review the auto-generated links and add missing ones manually.")


if __name__ == "__main__":
    main()
