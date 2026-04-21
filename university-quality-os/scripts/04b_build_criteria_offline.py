"""Offline fallback for 04_build_criteria.py — parses PHAN-TICH-TONG-THE.md
directly with regex (no API key needed).

Output is simpler than the LLM version (less detailed requirements/evidence_types),
but enough to bootstrap labeler.py and downstream MVP-1.

Run: python scripts/04b_build_criteria_offline.py
"""

import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings
from university_quality_os.utils import setup_logging, write_json

log = setup_logging(settings.log_level)


# Group mapping
GROUP_FOR_STD = {
    1: "A", 2: "A", 3: "A", 4: "A", 5: "A",                  # Năng lực thể chế
    6: "B", 7: "B", 8: "B", 9: "B", 10: "B", 11: "B",        # Chính sách
    12: "C", 13: "C", 14: "C", 15: "C",                       # Kết quả
}


def parse_markdown(md_text: str) -> dict:
    """Parse the analysis markdown to extract standards + criteria."""

    standards = []
    current_std = None

    # Match: "### Tiêu chuẩn N: Name (X tiêu chí)"
    std_pattern = re.compile(r"^###\s+Tiêu chuẩn\s+(\d+):\s+(.+?)\s+\((\d+)\s+tiêu chí\)", re.MULTILINE)

    # Match a single line: "| 1.1 | Name |" or "| 1.1 | Name | Description |"
    # We process line-by-line to avoid regex multiline pitfalls with consecutive `|`
    line_pattern = re.compile(r"^\|\s*(\d+\.\d+)\s*\|\s*([^|]+?)\s*\|(?:\s*([^|]+?)\s*\|)?\s*$")

    # Find all standards
    std_matches = list(std_pattern.finditer(md_text))
    log.info(f"Found {len(std_matches)} tiêu chuẩn in markdown")

    for i, m in enumerate(std_matches):
        std_num = int(m.group(1))
        std_name = m.group(2).strip()
        expected_count = int(m.group(3))

        # Get text for this standard's section (until next standard or end)
        section_start = m.end()
        section_end = std_matches[i + 1].start() if i + 1 < len(std_matches) else len(md_text)
        section_text = md_text[section_start:section_end]

        # Extract criteria — process line-by-line for reliability
        criteria = []
        for line in section_text.splitlines():
            row_match = line_pattern.match(line.rstrip())
            if not row_match:
                continue
            crit_id_short = row_match.group(1)
            name = row_match.group(2).strip()
            description = (row_match.group(3) or "").strip()

            crit_id = f"TC {crit_id_short}"

            # Split description into requirements (split by ; or .)
            req_parts = [r.strip() for r in re.split(r"[;.]", description) if r.strip()]
            # If no description, use the name as the only requirement
            requirements = req_parts if req_parts else [name]

            # Generate keywords from name (simple word split, filter stopwords)
            stopwords = {"và", "của", "về", "các", "có", "với", "tại", "trong", "đến", "từ"}
            words = re.findall(r"\b\w+\b", name.lower())
            keywords = [w for w in words if w not in stopwords and len(w) > 2][:6]

            criteria.append({
                "id": crit_id,
                "name": name,
                "requirements": requirements,
                "evidence_types": [
                    f"Tài liệu liên quan đến {name.lower()}",
                    "Văn bản, biên bản, báo cáo có liên quan",
                ],
                "keywords": keywords,
                "related_iso_processes": [],  # Empty — fill later via 05 or manually
            })

        log.info(f"  Tiêu chuẩn {std_num}: {std_name} → {len(criteria)}/{expected_count} criteria parsed")

        standards.append({
            "id": f"TC{std_num:02d}",
            "name": std_name,
            "group": GROUP_FOR_STD.get(std_num, "?"),
            "criteria": criteria,
        })

    total_criteria = sum(len(s["criteria"]) for s in standards)

    return {
        "version": "TT-2026-BGDDT",
        "source": "Thông tư /2026/TT-BGDĐT (offline parse from PHAN-TICH-TONG-THE.md)",
        "generated_at": datetime.now().isoformat(),
        "method": "offline-regex",
        "total_standards": len(standards),
        "total_criteria": total_criteria,
        "standards": standards,
    }


def main():
    md_path = settings.criteria_md_path

    if not md_path.exists():
        log.error(f"Markdown not found: {md_path}")
        sys.exit(1)

    md_text = md_path.read_text(encoding="utf-8")
    log.info(f"Loaded {md_path.name}: {len(md_text)} chars")

    output = parse_markdown(md_text)

    out_path = settings.data_dir / "criteria.json"
    write_json(output, out_path)

    log.info("")
    log.info(f"📊 Criteria summary (offline parse):")
    log.info(f"  Standards: {output['total_standards']}/15")
    log.info(f"  Criteria:  {output['total_criteria']}/60")
    log.info("")
    log.info(f"📁 Output: {out_path}")
    log.info("")
    log.info("⚠️  Offline parse is simpler than LLM version. For richer requirements/evidence_types,")
    log.info("   run scripts/04_build_criteria.py with API key set.")
    log.info("   But this version works for bootstrapping labeler + MVP-1.")


if __name__ == "__main__":
    main()
