"""Smart Word .docx parser — LLM-based, không cần template cố định.

Khác với `import_docx.py` (template structured tables) — service này parse
FREE-FORM Word legacy: thầy cô viết đề cương theo format riêng, mỗi trường
khác nhau. Dùng local LLM (Ollama + Qwen 2.5 14B) chạy trên RTX 4090 để
extract dữ liệu cấu trúc.

Workflow:
1. extract_docx_content() — đọc paragraphs + tables theo thứ tự document
2. Multi-prompt LLM extract per-section (course_info, COs, CLOs, mapping, assessments)
3. Trả structured dict, frontend preview cho user review
4. User confirm → caller dùng existing CRUD endpoints để insert

Env vars:
- OLLAMA_URL      (default http://localhost:11434)
- OLLAMA_MODEL    (default qwen2.5:14b)
- OLLAMA_TIMEOUT  (seconds, default 120)
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests
from docx import Document

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:14b")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "180"))


SYSTEM_PROMPT = """Bạn là chuyên gia kiểm định chất lượng giáo dục đại học Việt Nam,
chuyên xử lý đề cương học phần (syllabus) tiếng Việt theo chuẩn AUN-QA / ABET / TT04-2025.

Nhiệm vụ: trích xuất dữ liệu cấu trúc từ Word document. Trả về CHỈ JSON hợp lệ,
KHÔNG có markdown ```, KHÔNG giải thích thêm. Nếu không tìm thấy field nào,
trả null cho field đó (không bịa dữ liệu)."""


# ────────────────────── docx → text ──────────────────────


def _table_to_text(table) -> str:
    rows = []
    for row in table.rows:
        cells = [cell.text.strip() for cell in row.cells]
        rows.append(" | ".join(cells))
    return "\n".join(rows)


def extract_docx_content(docx_path: Path) -> str:
    """Đọc paragraphs + tables theo thứ tự body. Tables được đánh dấu [TABLE]...[/TABLE]
    để LLM nhận biết cấu trúc."""
    doc = Document(docx_path)
    parts: list[str] = []

    for elem in doc.element.body:
        tag = elem.tag.split("}")[-1]
        if tag == "p":
            text = "".join(node.text or "" for node in elem.iter() if node.tag.endswith("}t"))
            if text.strip():
                parts.append(text.strip())
        elif tag == "tbl":
            for table in doc.tables:
                if table._element is elem:
                    parts.append("[TABLE]")
                    parts.append(_table_to_text(table))
                    parts.append("[/TABLE]")
                    break

    return "\n".join(parts)


# ────────────────────── LLM call ──────────────────────


def _call_llm(prompt: str, schema_hint: str | None = None) -> dict:
    full_prompt = prompt
    if schema_hint:
        full_prompt += f"\n\nReturn ONLY valid JSON matching this schema:\n{schema_hint}"

    body = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": full_prompt},
        ],
        "stream": False,
        "format": "json",
        "options": {"temperature": 0.1, "num_ctx": 8192},
    }

    r = requests.post(f"{OLLAMA_URL}/api/chat", json=body, timeout=OLLAMA_TIMEOUT)
    r.raise_for_status()
    content = r.json()["message"]["content"]
    return json.loads(content)


# ────────────────────── per-section parsers ──────────────────────


def parse_course_info(text: str) -> dict:
    schema = """{
  "code": "string|null (mã học phần, vd MAT101)",
  "name_vn": "string|null",
  "name_en": "string|null",
  "credits": "number|null",
  "hours_lt": "number|null",
  "hours_th": "number|null",
  "hours_self": "number|null",
  "knowledge_group": "DAI_CUONG|CO_SO|CHUYEN_NGANH|TU_CHON|TOT_NGHIEP|null",
  "semester_default": "number 1-10|null",
  "prerequisites": "string|null",
  "description": "string|null"
}"""
    prompt = f"""Trích xuất thông tin chung học phần. Lấy từ phần "Thông tin chung"
hoặc "General Information" ở đầu đề cương.

TEXT:
{text[:8000]}"""
    return _call_llm(prompt, schema)


def parse_cos(text: str) -> dict:
    schema = '{"cos": [{"code": "CO1", "text_vn": "..."}]}'
    prompt = f"""Trích xuất danh sách Mục tiêu học phần (COs - Course Objectives).
Thường ở "Bảng 1: Mục tiêu của học phần" hoặc section "Mục tiêu học phần".

TEXT:
{text[:8000]}"""
    return _call_llm(prompt, schema)


def parse_clos(text: str) -> dict:
    schema = """{
  "clos": [
    {
      "code": "CLO1",
      "text_vn": "...",
      "bloom_level": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE",
      "co_codes": ["CO1", "CO2"]
    }
  ]
}"""
    prompt = f"""Trích xuất Chuẩn đầu ra học phần (CLOs - Course Learning Outcomes).
Thường ở "Bảng 2: Chuẩn đầu ra của học phần".

bloom_level dựa trên động từ chính:
- nhớ/liệt kê/định nghĩa = REMEMBER
- mô tả/giải thích/hiểu = UNDERSTAND
- vận dụng/áp dụng/tính = APPLY
- phân tích/so sánh/phân biệt = ANALYZE
- đánh giá/phản biện/lựa chọn = EVALUATE
- thiết kế/tạo/xây dựng = CREATE

co_codes là các mã CO mà CLO này phục vụ (lấy từ ma trận CLO×CO nếu có).

TEXT:
{text[:8000]}"""
    return _call_llm(prompt, schema)


def parse_clo_pi_mapping(text: str, clo_codes: list[str]) -> dict:
    schema = """{
  "mappings": [
    {"clo_code": "CLO1", "pi_code": "PI1.1", "level": "I|R|M|A"}
  ]
}"""
    clo_list = ", ".join(clo_codes) if clo_codes else "(không có CLO)"
    prompt = f"""Trích xuất ma trận đóng góp CLO × PLO/PI (levels I/R/M/A).
Thường ở "Bảng 3: Ma trận thể hiện đóng góp..." có header chứa PI codes
(PI1.1, PI1.2, ..., PI9.3) và các cell có "I", "R", "M", "A".

Levels:
- I (Introduce): mức giới thiệu/bắt đầu
- R (Reinforce): mức nâng cao
- M (Mastery): mức thuần thục
- A (Assessment): học phần đánh giá chính thức

Bỏ qua cell trống. Chỉ output mappings có level được điền.

CLOs đã extract trước: {clo_list}

TEXT:
{text[:10000]}"""
    return _call_llm(prompt, schema)


def parse_assessments(text: str) -> dict:
    schema = """{
  "components": [
    {
      "component_name": "string",
      "weight_pct": "number 0-100",
      "method": "string|null",
      "clo_codes": ["CLO1"]
    }
  ]
}"""
    prompt = f"""Trích xuất Cấu phần đánh giá. Thường ở "Bảng 5" hoặc section
"Kế hoạch đánh giá / Assessment Plan". Tổng weight_pct phải = 100.

clo_codes là các mã CLO mà cấu phần đó đo lường.

TEXT:
{text[:8000]}"""
    return _call_llm(prompt, schema)


# ────────────────────── orchestrator ──────────────────────


def parse_decuong(docx_path: Path) -> dict:
    """Parse 1 đề cương Word → structured course data.

    Returns:
        {
          "course_info": {code, name_vn, ..., description},
          "cos": [{code, text_vn}],
          "clos": [{code, text_vn, bloom_level, co_codes}],
          "clo_pi_levels": [{clo_code, pi_code, level}],
          "assessments": [{component_name, weight_pct, method, clo_codes}],
          "_extraction_text_chars": int,
          "_warnings": []
        }
    """
    text = extract_docx_content(docx_path)
    warnings: list[str] = []

    if len(text) < 100:
        warnings.append(f"Document quá ngắn ({len(text)} chars) — có thể parse fail")

    try:
        course_info = parse_course_info(text)
    except Exception as e:
        course_info = {}
        warnings.append(f"course_info extract fail: {e}")

    try:
        cos = parse_cos(text).get("cos", [])
    except Exception as e:
        cos = []
        warnings.append(f"COs extract fail: {e}")

    try:
        clos = parse_clos(text).get("clos", [])
    except Exception as e:
        clos = []
        warnings.append(f"CLOs extract fail: {e}")

    clo_codes = [c.get("code") for c in clos if c.get("code")]
    if clo_codes:
        try:
            clo_pi_levels = parse_clo_pi_mapping(text, clo_codes).get("mappings", [])
        except Exception as e:
            clo_pi_levels = []
            warnings.append(f"CLO×PI mapping extract fail: {e}")
    else:
        clo_pi_levels = []
        warnings.append("Không có CLO → bỏ qua mapping")

    try:
        assessments = parse_assessments(text).get("components", [])
    except Exception as e:
        assessments = []
        warnings.append(f"Assessments extract fail: {e}")

    # Validation: assessment weights must sum to 100
    total_weight = sum((a.get("weight_pct") or 0) for a in assessments)
    if assessments and abs(total_weight - 100) > 1:
        warnings.append(f"Tổng weight_pct = {total_weight}%, không = 100%")

    return {
        "course_info": course_info,
        "cos": cos,
        "clos": clos,
        "clo_pi_levels": clo_pi_levels,
        "assessments": assessments,
        "_extraction_text_chars": len(text),
        "_warnings": warnings,
    }


def health_check() -> dict:
    """Check Ollama service + model availability."""
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        r.raise_for_status()
        models = [m["name"] for m in r.json().get("models", [])]
        return {
            "ollama_available": True,
            "models": models,
            "configured_model": OLLAMA_MODEL,
            "model_pulled": any(OLLAMA_MODEL in m for m in models),
        }
    except Exception as e:
        return {
            "ollama_available": False,
            "error": str(e),
            "configured_model": OLLAMA_MODEL,
            "model_pulled": False,
        }
