"""Main DocumentClassifier — orchestrates extraction, RAG, LLM call, parsing."""

import json
import logging
import re
import time
from typing import Optional

from anthropic import Anthropic

from ..config import settings
from ..utils import estimate_cost_vnd
from . import prompts
from .rag import shortlist_criteria, shortlist_processes
from .schemas import ClassificationItem, ClassificationResult, DocumentInput

log = logging.getLogger("uqos.mvp1")


class DocumentClassifier:
    """Classify a document → ISO process(es) + KĐCLGD criteria."""

    def __init__(
        self,
        criteria_data: dict,
        processes_data: dict,
        anthropic_client: Optional[Anthropic] = None,
        model: Optional[str] = None,
    ):
        self.criteria_data = criteria_data
        self.processes_data = processes_data
        self.processes = processes_data["processes"]
        self.model = model or settings.claude_model_primary
        self.client = anthropic_client or Anthropic(api_key=settings.anthropic_api_key)

    def classify(self, doc: DocumentInput) -> ClassificationResult:
        """Classify one document. Never raises — returns result with error field if fails."""
        t0 = time.time()
        result = ClassificationResult(
            doc_id=doc.doc_id,
            doc_excerpt=doc.text[:500],
            model_used=self.model,
        )

        # 1. Build shortlists
        iso_shortlist = shortlist_processes(
            doc.text, self.processes, dept_hint=doc.dept, top_n=12
        )
        crit_shortlist = shortlist_criteria(
            doc.text, self.criteria_data, top_n=15
        )

        # 2. Truncate + build prompt
        text_truncated = prompts.truncate_text(doc.text, max_chars=18000)
        user_prompt = prompts.build_user_prompt(
            doc_meta={
                "filename": doc.filename,
                "dept": doc.dept,
                "text_len": doc.text_len,
                "npages": doc.npages,
            },
            text_truncated=text_truncated,
            iso_shortlist=iso_shortlist,
            crit_shortlist=crit_shortlist,
        )

        # 3. Call Claude
        try:
            msg = self.client.messages.create(
                model=self.model,
                max_tokens=2500,
                system=prompts.SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
            )
            response_text = msg.content[0].text
            result.raw_response = response_text
            result.tokens_input = msg.usage.input_tokens
            result.tokens_output = msg.usage.output_tokens

            model_key = "haiku" if "haiku" in self.model else "sonnet"
            result.cost_vnd = estimate_cost_vnd(
                msg.usage.input_tokens, msg.usage.output_tokens, model_key
            )
        except Exception as e:
            result.parse_error = f"API call failed: {e}"
            log.error(f"classify({doc.doc_id}): API error: {e}")
            result.latency_ms = int((time.time() - t0) * 1000)
            return result

        # 4. Parse JSON
        try:
            parsed = self._parse_response(response_text)
            result.iso_processes = [
                ClassificationItem(**item) for item in parsed.get("iso_processes", [])[:3]
            ]
            result.kdclgd_criteria = [
                ClassificationItem(**item) for item in parsed.get("kdclgd_criteria", [])[:5]
            ]
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            result.parse_error = f"JSON parse failed: {e}"
            log.warning(f"classify({doc.doc_id}): parse error: {e}")

        result.latency_ms = int((time.time() - t0) * 1000)
        return result

    def _parse_response(self, response_text: str) -> dict:
        """Strip potential markdown wrapping and parse JSON."""
        text = response_text.strip()

        # Find JSON block if wrapped in code fences
        if text.startswith("```"):
            # Remove opening ```json or ```
            text = re.sub(r"^```(?:json)?\s*\n?", "", text)
            # Remove closing ```
            text = re.sub(r"\n?```\s*$", "", text)

        # Find first { and last } if there's extra text
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            text = text[start:end + 1]

        return json.loads(text)

    def classify_batch(
        self, docs: list[DocumentInput], verbose: bool = True
    ) -> list[ClassificationResult]:
        """Classify multiple docs sequentially.

        For now, no parallelism — Anthropic API throttling behavior varies per key tier.
        """
        results = []
        for i, doc in enumerate(docs):
            if verbose:
                log.info(f"[{i+1}/{len(docs)}] Classifying {doc.doc_id}...")
            results.append(self.classify(doc))
        return results
