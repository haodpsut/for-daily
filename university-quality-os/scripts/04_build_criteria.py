"""Parse PHAN-TICH-TONG-THE.md → criteria.json using Claude.

Output:
{
  "version": "TT-2026-BGDDT",
  "source": "Thông tư /2026/TT-BGDĐT",
  "total_standards": 15,
  "total_criteria": 60,
  "standards": [
    {
      "id": "TC01",
      "name": "Tầm nhìn, sứ mạng, văn hoá và quản trị",
      "group": "A",
      "criteria": [
        {
          "id": "TC 1.1",
          "name": "Công bố tầm nhìn, sứ mạng",
          "requirements": [...],
          "evidence_types": [...],
          "keywords": [...]
        }
      ]
    }
  ]
}

Run: python scripts/04_build_criteria.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from anthropic import Anthropic

from university_quality_os.config import settings
from university_quality_os.utils import setup_logging, write_json, estimate_cost_vnd

log = setup_logging(settings.log_level)


SYSTEM_PROMPT = """Bạn là chuyên gia phân tích Thông tư về kiểm định chất lượng giáo dục đại học Việt Nam.

Nhiệm vụ: Trích xuất 60 tiêu chí KĐCLGD từ markdown đã phân tích sẵn, format thành JSON cấu trúc.

Quy tắc:
1. Output JSON STRICT, không markdown wrapping
2. Phải đầy đủ 15 tiêu chuẩn / 60 tiêu chí
3. Mỗi criterion phải có ít nhất 2 requirements + 2 evidence_types + 3 keywords
4. requirements và evidence_types tham khảo từ phân tích, không tự bịa
5. keywords là từ khóa tiếng Việt unique giúp search (1-2 từ each)

Schema:
{
  "standards": [
    {
      "id": "TC01",
      "name": "...",
      "group": "A",  // A=Năng lực thể chế (TC 1-5), B=Chính sách (TC 6-11), C=Kết quả (TC 12-15)
      "criteria": [
        {
          "id": "TC 1.1",
          "name": "Công bố tầm nhìn, sứ mạng",
          "requirements": ["Công bố rõ ràng", "Xây dựng dựa trên phân tích bên liên quan"],
          "evidence_types": ["Văn bản tầm nhìn sứ mạng", "Biên bản họp bên liên quan"],
          "keywords": ["tầm nhìn", "sứ mạng", "công bố"]
        }
      ]
    }
  ]
}"""


def call_claude(md_content: str, anthropic: Anthropic) -> dict:
    user_prompt = f"""Phân tích markdown sau và trích xuất TẤT CẢ 60 tiêu chí KĐCLGD thành JSON theo schema đã định nghĩa.

MARKDOWN:
{md_content}

Output JSON đầy đủ 15 standards / 60 criteria, không thiếu cái nào."""

    log.info("Calling Claude...")
    msg = anthropic.messages.create(
        model=settings.claude_model_primary,
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    response_text = msg.content[0].text
    cost = estimate_cost_vnd(msg.usage.input_tokens, msg.usage.output_tokens, "sonnet")
    log.info(f"  Tokens: in={msg.usage.input_tokens}, out={msg.usage.output_tokens}")
    log.info(f"  Estimated cost: {cost:.0f} VND")

    # Parse JSON (strip potential markdown wrapping)
    text = response_text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    return json.loads(text)


def validate_output(data: dict) -> tuple[bool, list[str]]:
    """Sanity check the extracted criteria."""
    issues = []

    if "standards" not in data:
        issues.append("Missing 'standards' key")
        return False, issues

    n_standards = len(data["standards"])
    if n_standards != 15:
        issues.append(f"Expected 15 standards, got {n_standards}")

    total_criteria = sum(len(s.get("criteria", [])) for s in data["standards"])
    if total_criteria != 60:
        issues.append(f"Expected 60 criteria total, got {total_criteria}")

    for std in data["standards"]:
        if not std.get("id") or not std.get("name"):
            issues.append(f"Standard missing id/name: {std}")
        if std.get("group") not in {"A", "B", "C"}:
            issues.append(f"Standard {std.get('id')} has invalid group: {std.get('group')}")
        for crit in std.get("criteria", []):
            if not crit.get("id") or not crit.get("name"):
                issues.append(f"Criterion missing id/name in {std.get('id')}")
            if len(crit.get("requirements", [])) < 1:
                issues.append(f"{crit.get('id')}: no requirements")
            if len(crit.get("evidence_types", [])) < 1:
                issues.append(f"{crit.get('id')}: no evidence_types")

    return len(issues) == 0, issues


def main():
    md_path = settings.criteria_md_path

    if not md_path.exists():
        log.error(f"Criteria markdown not found: {md_path}")
        log.error("Check CRITERIA_MD_SOURCE in .env")
        sys.exit(1)

    if not settings.anthropic_api_key:
        log.error("ANTHROPIC_API_KEY missing in .env")
        sys.exit(1)

    md_content = md_path.read_text(encoding="utf-8")
    log.info(f"Loaded {md_path.name}: {len(md_content)} chars")

    anthropic = Anthropic(api_key=settings.anthropic_api_key)

    try:
        data = call_claude(md_content, anthropic)
    except Exception as e:
        log.error(f"Claude call failed: {e}")
        sys.exit(1)

    # Validate
    valid, issues = validate_output(data)
    if not valid:
        log.warning("Validation issues found:")
        for issue in issues:
            log.warning(f"  - {issue}")
        log.warning("Proceeding anyway — Hảo should manually fix.")

    # Wrap with metadata
    output = {
        "version": "TT-2026-BGDDT",
        "source": "Thông tư /2026/TT-BGDĐT (parsed from PHAN-TICH-TONG-THE.md)",
        "total_standards": len(data.get("standards", [])),
        "total_criteria": sum(len(s.get("criteria", [])) for s in data.get("standards", [])),
        "standards": data.get("standards", []),
    }

    out_path = settings.data_dir / "criteria.json"
    write_json(output, out_path)

    log.info("")
    log.info(f"📊 Criteria summary:")
    log.info(f"  Standards: {output['total_standards']}/15")
    log.info(f"  Criteria:  {output['total_criteria']}/60")
    log.info("")
    log.info(f"📁 Output: {out_path}")
    log.info("")
    log.info("⚠️  IMPORTANT: Hảo should review criteria.json and fix any extraction errors")
    log.info("    (typically 10-20% of fields may be inaccurate)")


if __name__ == "__main__":
    main()
