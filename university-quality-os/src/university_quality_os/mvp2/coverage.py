"""Coverage analysis — per-requirement evidence check.

Given a criterion with N requirements + K matched evidence chunks,
determine which requirements are covered by which evidence.

Output: requirements × evidence matrix + gap list.
"""

import json
import logging
import re
import time
from typing import Optional

from anthropic import Anthropic

from ..config import settings
from ..utils import estimate_cost_vnd
from .schemas import CoverageAnalysis, EvidenceMatch, RequirementCoverage

log = logging.getLogger("uqos.mvp2.coverage")


SYSTEM_PROMPT = """Bạn là chuyên gia đánh giá mức độ đáp ứng yêu cầu của tiêu chí KĐCLGD Việt Nam qua minh chứng.

Nhiệm vụ: Cho 1 tiêu chí với danh sách yêu cầu, và danh sách minh chứng (evidence) đã được xác định, xác định mỗi yêu cầu được cover bởi evidence nào (nếu có).

Quy tắc:
- is_gap=true nếu không có evidence nào cover yêu cầu đó.
- covered_by là danh sách doc_id cover yêu cầu đó.
- reasoning: 1 câu giải thích.
- Output JSON strict.

Định dạng:
{
  "coverage": [
    {"requirement": "...", "covered_by": ["doc_id"], "is_gap": false, "reasoning": "..."}
  ]
}"""


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        text = text[start:end + 1]
    return json.loads(text)


class CoverageAnalyzer:
    """Analyze which requirements of a criterion are covered by evidence."""

    def __init__(
        self,
        anthropic_client: Optional[Anthropic] = None,
        model: Optional[str] = None,
    ):
        self.client = anthropic_client or Anthropic(api_key=settings.anthropic_api_key)
        self.model = model or settings.claude_model_fast

    def analyze(
        self,
        criterion_id: str,
        criterion_name: str,
        requirements: list[str],
        matches: list[EvidenceMatch],
    ) -> tuple[CoverageAnalysis, dict]:
        """Produce CoverageAnalysis + metadata (cost/latency)."""
        if not requirements:
            return (
                CoverageAnalysis(criterion_id=criterion_id, coverage_pct=0.0),
                {"latency_ms": 0, "tokens_in": 0, "tokens_out": 0, "cost_vnd": 0.0},
            )

        if not matches:
            # No evidence → all gaps
            reqs = [RequirementCoverage(requirement=r, is_gap=True,
                                        reasoning="No evidence found")
                    for r in requirements]
            return (
                CoverageAnalysis(
                    criterion_id=criterion_id,
                    requirements=reqs,
                    coverage_pct=0.0,
                    gaps=list(requirements),
                ),
                {"latency_ms": 0, "tokens_in": 0, "tokens_out": 0, "cost_vnd": 0.0},
            )

        # Build prompt
        req_lines = "\n".join(f"- {r}" for r in requirements)
        ev_lines = "\n".join(
            f"[{m.doc_id}] {m.doc_filename}: {m.excerpt[:200]}" for m in matches
        )
        user_prompt = (
            f"# Tiêu chí\n"
            f"{criterion_id}: {criterion_name}\n\n"
            f"## Yêu cầu\n{req_lines}\n\n"
            f"## Evidence đã có\n{ev_lines}\n\n"
            f"Phân tích mỗi yêu cầu được cover bởi evidence nào. Output JSON theo schema."
        )

        t0 = time.time()
        try:
            msg = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
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
            log.error(f"Coverage API call failed: {e}")
            return (
                CoverageAnalysis(criterion_id=criterion_id),
                {"latency_ms": int((time.time() - t0) * 1000), "error": str(e),
                 "tokens_in": 0, "tokens_out": 0, "cost_vnd": 0.0},
            )

        try:
            data = _parse_json(raw)
            coverage_items = data.get("coverage", [])
        except Exception as e:
            log.warning(f"Coverage parse failed: {e}")
            return (
                CoverageAnalysis(criterion_id=criterion_id),
                {**metadata, "parse_error": str(e)},
            )

        # Build result
        req_coverage = []
        gaps = []
        covered_count = 0

        for item in coverage_items:
            rc = RequirementCoverage(
                requirement=item.get("requirement", ""),
                covered_by=item.get("covered_by", []),
                is_gap=bool(item.get("is_gap", False)),
                reasoning=item.get("reasoning", ""),
            )
            req_coverage.append(rc)
            if rc.is_gap:
                gaps.append(rc.requirement)
            else:
                covered_count += 1

        coverage_pct = covered_count / len(coverage_items) if coverage_items else 0.0

        return (
            CoverageAnalysis(
                criterion_id=criterion_id,
                requirements=req_coverage,
                coverage_pct=coverage_pct,
                gaps=gaps,
            ),
            metadata,
        )
