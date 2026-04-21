"""Simple keyword-based retrieval for shortlisting candidates.

Given a document text, shortlist top-N most likely candidates
(ISO processes + KĐCLGD criteria) BEFORE sending to LLM.

This reduces prompt size dramatically (60 criteria → 10-15 candidates).
"""

import re
import unicodedata
from collections import Counter


def normalize_vi(text: str) -> str:
    """Remove diacritics + lowercase + normalize whitespace.

    Helps matching 'quản lý' with 'quan ly', etc.
    """
    # Normalize unicode
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    # Handle đ/Đ
    text = text.replace("đ", "d").replace("Đ", "D")
    # Lowercase + collapse whitespace
    text = re.sub(r"\s+", " ", text.lower())
    return text


VN_STOPWORDS = {
    "quy", "trinh", "trình", "ve", "về", "va", "và", "cua", "của", "cho",
    "cac", "các", "co", "có", "voi", "với", "tai", "tại", "trong", "ngoai",
    "ngoài", "den", "đến", "tu", "từ", "khi", "bang", "bằng", "thuoc", "thuộc",
    "do", "doi", "đối", "viec", "việc", "noi", "nội", "theo", "mot", "một",
    "la", "là", "se", "sẽ", "da", "đã", "hay", "cung", "cũng", "day",
    "nay", "này", "nhu", "như", "thi", "thì", "de", "để", "khong", "không",
    "nhung", "những", "nhieu", "nhiều", "moi", "mới", "khac", "khác",
    "ra", "den", "vao", "vào", "len", "lên", "xuong", "xuống",
    "qt", "qd",
}


def extract_keywords(text: str, top_n: int = 30) -> list[str]:
    """Extract top-N meaningful keywords from text.

    Simple TF-based. Drops stopwords and short tokens.
    """
    normalized = normalize_vi(text)
    # Word tokens (2+ chars, alphanumeric)
    words = re.findall(r"\b[a-z][a-z0-9]{1,}\b", normalized)
    # Filter stopwords + short
    filtered = [w for w in words if w not in VN_STOPWORDS and len(w) >= 3]
    # TF
    counts = Counter(filtered)
    return [w for w, _ in counts.most_common(top_n)]


def score_candidate(doc_keywords: set[str], candidate_keywords: list[str]) -> float:
    """Jaccard-ish overlap score."""
    if not candidate_keywords:
        return 0.0
    cand_set = {normalize_vi(k) for k in candidate_keywords}
    overlap = doc_keywords & cand_set
    return len(overlap) / max(len(cand_set), 1)


def shortlist_processes(
    doc_text: str,
    processes: list[dict],
    dept_hint: str = "",
    top_n: int = 12,
) -> list[dict]:
    """Shortlist top-N ISO processes most likely to match doc.

    Strategy:
    1. If doc has dept_hint, prioritize same-dept processes.
    2. Score by keyword overlap of doc keywords vs process keywords + name.
    3. Return top-N.
    """
    doc_keywords = set(extract_keywords(doc_text, top_n=50))

    scored = []
    for p in processes:
        # Keyword overlap
        proc_keywords = p.get("keywords", []) + re.findall(r"\b\w+\b", p.get("name", "").lower())
        score = score_candidate(doc_keywords, proc_keywords)

        # Dept boost
        if dept_hint and p.get("department") == dept_hint:
            score += 0.3  # Strong bonus for same dept

        scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for score, p in scored[:top_n] if score > 0.01 or not dept_hint]


def shortlist_criteria(
    doc_text: str,
    criteria_data: dict,
    top_n: int = 15,
) -> list[dict]:
    """Shortlist top-N KĐCLGD criteria most likely to match doc.

    Uses keyword overlap on: criterion name, requirements, keywords field.
    """
    doc_keywords = set(extract_keywords(doc_text, top_n=50))

    # Flatten criteria
    all_criteria = []
    for std in criteria_data["standards"]:
        for crit in std["criteria"]:
            all_criteria.append({
                "standard": std["name"],
                **crit,
            })

    scored = []
    for c in all_criteria:
        # Build keyword pool: explicit keywords + words from name + words from requirements
        kw_pool = list(c.get("keywords", []))
        kw_pool.extend(re.findall(r"\b\w+\b", c.get("name", "").lower()))
        for req in c.get("requirements", []):
            kw_pool.extend(re.findall(r"\b\w+\b", req.lower()))

        score = score_candidate(doc_keywords, kw_pool)
        scored.append((score, c))

    scored.sort(key=lambda x: x[0], reverse=True)

    # Always return top_n (even if low score — let LLM decide)
    return [c for score, c in scored[:top_n]]
