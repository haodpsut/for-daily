"""LLM-based reranker using Claude Haiku.

After hybrid retrieval gives top-20, LLM rerank to top-5 with:
- Better relevance ranking (sees actual content, not just vectors)
- Extract best quote (50-200 chars)
- 1-sentence reasoning
"""

import json
import logging
import re
import time
from typing import Optional

from anthropic import Anthropic

from ..config import settings
from ..utils import estimate_cost_vnd
from .schemas import EvidenceMatch, RetrievedChunk

log = logging.getLogger("uqos.mvp2.rerank")


SYSTEM_PROMPT = """Bạn là chuyên gia đánh giá mức độ liên quan của minh chứng cho tiêu chí kiểm định chất lượng giáo dục (KĐCLGD) Việt Nam.

Cho 1 query (tiêu chí hoặc câu hỏi) và 20 candidate chunks, nhiệm vụ:
1. Rank top-N chunks phù hợp nhất theo relevance (0-1).
2. Với mỗi top chunk: extract quote ngắn nhất (50-200 chars) thể hiện rõ mức độ liên quan.
3. Explain ngắn (1 câu) vì sao relevant.

Quy tắc:
- Quote phải là \textbf{nguyên văn} trích từ text, không paraphrase.
- Nếu chunk không thực sự relevant, có thể exclude (không bắt buộc fill full N).
- Tiếng Việt trong response giữ nguyên dấu.
- Output JSON strict, không markdown wrapping.

Định dạng output:
{
  "matches": [
    {"chunk_id": "...", "score": 0.92, "quote": "...", "reasoning": "..."}
  ]
}"""


def _format_candidates(chunks: list[RetrievedChunk]) -> str:
    lines = []
    for i, c in enumerate(chunks):
        # Truncate text to ~600 chars for prompt efficiency
        text = c.text[:600] + ("..." if len(c.text) > 600 else "")
        lines.append(
            f"[{i+1}] chunk_id={c.chunk_id} doc={c.doc_path}\n"
            f"    text: {text}\n"
        )
    return "\n".join(lines)


def _parse_json(text: str) -> dict:
    """Strip markdown wrapping and parse."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


class Reranker:
    """Claude-based reranker."""

    def __init__(
        self,
        anthropic_client: Optional[Anthropic] = None,
        model: Optional[str] = None,
    ):
        self.client = anthropic_client or Anthropic(api_key=settings.anthropic_api_key)
        self.model = model or settings.claude_model_fast  # Haiku default for speed

    def rerank(
        self,
        query: str,
        candidates: list[RetrievedChunk],
        top_k: int = 5,
    ) -> tuple[list[EvidenceMatch], dict]:
        """Rerank candidates → top-k matches.

        Returns (matches, metadata) where metadata contains tokens/cost/latency.
        """
        if not candidates:
            return [], {"latency_ms": 0, "tokens_in": 0, "tokens_out": 0, "cost_vnd": 0.0}

        candidate_map = {c.chunk_id: c for c in candidates}
        user_prompt = (
            f"# Query\n{query}\n\n"
            f"# Candidates ({len(candidates)} chunks)\n"
            f"{_format_candidates(candidates)}\n\n"
            f"# Task\nRank top-{top_k} most relevant chunks. Output JSON as specified."
        )

        t0 = time.time()
        try:
            msg = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )
            raw = msg.content[0].text
            model_key = "haiku" if "haiku" in self.model else "sonnet"
            cost = estimate_cost_vnd(msg.usage.input_tokens, msg.usage.output_tokens, model_key)
            metadata = {
                "latency_ms": int((time.time() - t0) * 1000),
                "tokens_in": msg.usage.input_tokens,
                "tokens_out": msg.usage.output_tokens,
                "cost_vnd": cost,
            }
        except Exception as e:
            log.error(f"Rerank API call failed: {e}")
            return [], {"latency_ms": int((time.time() - t0) * 1000), "tokens_in": 0,
                        "tokens_out": 0, "cost_vnd": 0.0, "error": str(e)}

        try:
            data = _parse_json(raw)
            match_items = data.get("matches", [])
        except Exception as e:
            log.warning(f"Failed to parse rerank response: {e}")
            return [], {**metadata, "parse_error": str(e)}

        # Build EvidenceMatch objects, preserving chunk metadata from candidates
        matches = []
        for item in match_items[:top_k]:
            chunk_id = item.get("chunk_id")
            source_chunk = candidate_map.get(chunk_id)
            if not source_chunk:
                continue  # LLM hallucinated a chunk_id

            quote = item.get("quote", "").strip()
            if not quote:
                quote = source_chunk.text[:200]

            matches.append(EvidenceMatch(
                doc_id=source_chunk.doc_id,
                doc_path=source_chunk.doc_path,
                doc_filename=source_chunk.doc_path.split("/")[-1] if source_chunk.doc_path else "",
                chunk_id=chunk_id,
                excerpt=quote,
                rerank_score=float(item.get("score", 0.5)),
                retrieval_source=source_chunk.retrieval_source,
                reasoning=item.get("reasoning", "").strip(),
            ))

        return matches, metadata
