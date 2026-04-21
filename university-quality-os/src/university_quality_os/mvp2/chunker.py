"""Document chunking for retrieval.

Strategy: paragraph-aware sliding window.
1. Split text by double newline (paragraphs).
2. Greedily combine paragraphs up to chunk_size chars.
3. Add sentence-level overlap between chunks.

This preserves semantic units (paragraphs) while keeping chunks bounded.
"""

import re
from typing import Iterator


def split_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs (by blank lines)."""
    # Normalize Windows line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Split by 2+ newlines
    paras = re.split(r"\n\s*\n", text)
    return [p.strip() for p in paras if p.strip()]


def split_sentences(text: str) -> list[str]:
    """Split paragraph into sentences (simple heuristic for Vietnamese)."""
    # End of sentence: . ? ! followed by space + capital, OR end of string
    # Vietnamese uses same punctuation as English
    sents = re.split(r"(?<=[.!?])\s+(?=[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ])", text)
    return [s.strip() for s in sents if s.strip()]


def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap_chars: int = 150,
) -> list[str]:
    """Chunk text with paragraph-aware sliding.

    - chunk_size: target chars per chunk (soft limit, may exceed if one paragraph is bigger)
    - overlap_chars: approximate chars of overlap between consecutive chunks
    """
    paras = split_paragraphs(text)
    if not paras:
        return []

    chunks: list[str] = []
    buf: list[str] = []
    buf_len = 0

    for para in paras:
        # If current buffer + this paragraph fits, add it
        if buf_len + len(para) + 2 <= chunk_size or not buf:
            buf.append(para)
            buf_len += len(para) + 2  # +2 for separator
        else:
            # Flush current buffer as chunk
            chunks.append("\n\n".join(buf))
            # Start new buffer with overlap (last ~overlap_chars of previous chunk)
            prev_text = "\n\n".join(buf)
            if len(prev_text) > overlap_chars:
                overlap_part = prev_text[-overlap_chars:]
                # Try to start at sentence boundary
                m = re.search(r"[.!?]\s+", overlap_part)
                if m:
                    overlap_part = overlap_part[m.end():]
                buf = [overlap_part, para]
                buf_len = len(overlap_part) + len(para) + 4
            else:
                buf = [para]
                buf_len = len(para)

    if buf:
        chunks.append("\n\n".join(buf))

    return chunks


def chunk_document(doc: dict, chunk_size: int = 800, overlap: int = 150) -> list[dict]:
    """Chunk a document (from iso_texts.jsonl) into chunk records.

    Input: doc with keys id, path, text, dept, filename, etc.
    Output: list of {chunk_id, doc_id, doc_path, chunk_idx, text, ...}
    """
    text = doc.get("text", "")
    if not text.strip():
        return []

    raw_chunks = chunk_text(text, chunk_size=chunk_size, overlap_chars=overlap)

    records = []
    for i, chunk in enumerate(raw_chunks):
        records.append({
            "chunk_id": f"{doc['id']}#{i}",
            "doc_id": doc["id"],
            "doc_path": doc.get("path", ""),
            "doc_filename": doc.get("filename", ""),
            "dept": doc.get("dept", ""),
            "chunk_idx": i,
            "total_chunks": len(raw_chunks),
            "text": chunk,
            "text_len": len(chunk),
        })

    return records
