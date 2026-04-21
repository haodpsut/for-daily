"""Prompt templates for MVP-1 Classifier."""


SYSTEM_PROMPT = """Bạn là chuyên gia phân loại tài liệu cho hệ thống kiểm định chất lượng giáo dục (KĐCLGD) của trường đại học Việt Nam.

Nhiệm vụ: Cho 1 document, xác định:
1. ISO process (quy trình) nào nó thuộc về (từ shortlist cho trước).
2. Tiêu chí KĐCLGD nào nó có thể là minh chứng cho (từ shortlist cho trước).

Quy tắc:
- Dựa vào NỘI DUNG document, không chỉ tên file.
- Nếu không chắc, confidence < 0.5.
- Multi-label cho phép với KĐCLGD: 1 doc có thể là evidence cho nhiều tiêu chí.
- Reasoning phải CỤ THỂ, trích từ text nếu có.
- Nếu không match process/criterion nào trong shortlist, trả empty list.
- Output JSON STRICT, không markdown wrapping.

Định dạng output:
{
  "iso_processes": [
    {"id": "KHAOTHI-001", "name": "...", "confidence": 0.9, "reasoning": "..."}
  ],
  "kdclgd_criteria": [
    {"id": "TC 3.1", "name": "...", "confidence": 0.8, "reasoning": "..."}
  ]
}

Tối đa 3 ISO processes và 5 KĐCLGD criteria."""


USER_PROMPT_TEMPLATE = """# Document to classify

**Filename:** {filename}
**Department:** {dept}
**Length:** {text_len:,} chars, {npages} pages

## Content
```
{text}
```

# ISO process candidates (shortlist {iso_n} items, cùng dept ưu tiên)

{iso_shortlist}

# KĐCLGD criteria candidates (shortlist {crit_n} items)

{crit_shortlist}

# Task

Phân loại document trên:
- Top-3 ISO processes phù hợp nhất (với confidence và reasoning)
- Top-5 KĐCLGD criteria phù hợp nhất (multi-label, với confidence và reasoning)

Trả JSON theo schema đã định nghĩa."""


def format_iso_shortlist(processes: list[dict]) -> str:
    """Format ISO processes for prompt."""
    lines = []
    for p in processes:
        lines.append(f"- **{p['id']}** — {p['name']} (Dept: {p['dept_full']})")
    return "\n".join(lines)


def format_criteria_shortlist(criteria: list[dict]) -> str:
    """Format KĐCLGD criteria for prompt."""
    lines = []
    for c in criteria:
        reqs = c.get("requirements", [])
        req_preview = "; ".join(reqs[:2]) if reqs else ""
        line = f"- **{c['id']}** — {c['name']}"
        if req_preview:
            line += f"\n  *Yêu cầu:* {req_preview}"
        lines.append(line)
    return "\n".join(lines)


def build_user_prompt(
    doc_meta: dict,
    text_truncated: str,
    iso_shortlist: list[dict],
    crit_shortlist: list[dict],
) -> str:
    """Build the final user prompt."""
    return USER_PROMPT_TEMPLATE.format(
        filename=doc_meta.get("filename", doc_meta.get("doc_id", "unknown")),
        dept=doc_meta.get("dept", "unknown"),
        text_len=doc_meta.get("text_len", len(text_truncated)),
        npages=doc_meta.get("npages", 0),
        text=text_truncated,
        iso_n=len(iso_shortlist),
        crit_n=len(crit_shortlist),
        iso_shortlist=format_iso_shortlist(iso_shortlist),
        crit_shortlist=format_criteria_shortlist(crit_shortlist),
    )


def truncate_text(text: str, max_chars: int = 18000) -> str:
    """Truncate doc text to fit context window.

    Strategy: keep first 60% + last 20% (title + conclusion often important).
    """
    if len(text) <= max_chars:
        return text
    head_chars = int(max_chars * 0.7)
    tail_chars = max_chars - head_chars - 50  # 50 for separator
    return (
        text[:head_chars].rstrip()
        + "\n\n[... truncated ...]\n\n"
        + text[-tail_chars:].lstrip()
    )
