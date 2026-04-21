"""Batch evaluator — run Evidence Finder against ground truth expectations.

Ground truth reuse: uses the same ground_truth.json labels.
For each labeled doc, its kdclgd_criteria list tells us which criteria
that doc is evidence for. We INVERT: for each criterion, which docs?
"""

import logging
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional

from ..config import settings
from ..utils import read_json, write_json
from .finder import EvidenceFinder
from .metrics import aggregate, evaluate_single, format_report
from .schemas import EvidenceQuery

log = logging.getLogger("uqos.mvp2.eval")


def build_criterion_to_docs_map(ground_truth: dict) -> dict[str, list[str]]:
    """Invert ground_truth: {doc → criteria} into {criterion → docs}."""
    result: dict[str, list[str]] = defaultdict(list)
    for label in ground_truth.get("labels", []):
        doc_id = label["doc_id"]
        for crit_id in label.get("kdclgd_criteria", []):
            result[crit_id].append(doc_id)
    return dict(result)


def run_evaluation(
    finder: EvidenceFinder,
    max_criteria: Optional[int] = None,
    output_dir: Optional[Path] = None,
    verbose: bool = True,
) -> dict:
    """Run finder on all criteria that have ground truth."""
    gt_path = settings.data_dir / "ground_truth.json"
    if not gt_path.exists():
        raise FileNotFoundError(
            f"{gt_path} not found. Run labeler.py first."
        )

    gt = read_json(gt_path)
    crit_to_docs = build_criterion_to_docs_map(gt)

    if not crit_to_docs:
        raise ValueError("No criteria in ground truth have evidence. Label more docs.")

    # Sort by most-labeled first (easier to eval)
    sorted_crits = sorted(crit_to_docs.items(), key=lambda x: -len(x[1]))

    if max_criteria:
        sorted_crits = sorted_crits[:max_criteria]

    log.info(f"Evaluating on {len(sorted_crits)} criteria")

    per_query = []
    results = []

    for i, (crit_id, expected_docs) in enumerate(sorted_crits):
        if verbose:
            log.info(f"[{i+1}/{len(sorted_crits)}] {crit_id} "
                     f"(expected: {len(expected_docs)} docs)")

        query = EvidenceQuery(criterion_id=crit_id, top_k=5,
                              rerank=True, include_coverage=False)
        result = finder.find(query)
        results.append(result)

        metrics = evaluate_single(result, expected_docs)
        per_query.append(metrics)

        if verbose:
            log.info(f"  → P@5={metrics['precision_at_5']:.0%} "
                     f"R@5={metrics['recall_at_5']:.0%} "
                     f"MRR={metrics['mrr']:.2f} "
                     f"cost={result.cost_vnd:.0f} VND")

    overall = aggregate(per_query)

    # Write reports
    if output_dir is None:
        output_dir = settings.data_dir / "evaluations"
    output_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y-%m-%d_%H%M")
    json_path = output_dir / f"mvp2_eval_{ts}.json"
    md_path = output_dir / f"mvp2_eval_{ts}.md"

    payload = {
        "timestamp": datetime.now().isoformat(),
        "mvp": "mvp2-evidence-finder",
        "model": finder.model,
        "n_queries": len(per_query),
        "metrics": overall.model_dump(),
        "per_query": per_query,
    }
    write_json(payload, json_path)

    report = format_report(overall, per_query)
    md_path.write_text(report, encoding="utf-8")

    log.info(f"📁 Reports: {json_path}, {md_path}")

    return {
        "metrics": overall,
        "per_query": per_query,
        "results": results,
        "report": report,
    }
