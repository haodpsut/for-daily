"""Batch evaluator — run classifier on ground truth + compute metrics."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from ..config import settings
from ..utils import read_json, read_jsonl, write_json
from .classifier import DocumentClassifier
from .metrics import aggregate, evaluate_single, format_report
from .schemas import DocumentInput

log = logging.getLogger("uqos.mvp1.eval")


def run_evaluation(
    classifier: DocumentClassifier,
    max_docs: Optional[int] = None,
    output_dir: Optional[Path] = None,
    verbose: bool = True,
) -> dict:
    """Run classifier on ground truth test set.

    Returns: {
        "metrics": EvaluationMetrics,
        "per_doc": list of dict,
        "results": list of ClassificationResult,
    }

    Also writes:
        {output_dir}/evaluation_YYYY-MM-DD_HHMM.json     (full)
        {output_dir}/evaluation_YYYY-MM-DD_HHMM.md       (report)
    """
    # Load ground truth
    gt_path = settings.data_dir / "ground_truth.json"
    if not gt_path.exists():
        raise FileNotFoundError(
            f"{gt_path} not found. Run labeler.py first to create labels."
        )

    gt_data = read_json(gt_path)
    labels = gt_data.get("labels", [])

    if not labels:
        raise ValueError("Ground truth has no labels. Label some docs first.")

    if max_docs:
        labels = labels[:max_docs]

    # Load extracted docs
    iso_path = settings.extracted_dir / "iso_texts.jsonl"
    all_docs = {d["id"]: d for d in read_jsonl(iso_path)}

    # For each labeled doc, classify + compare
    per_doc = []
    results = []
    docs_meta = []

    for i, lbl in enumerate(labels):
        doc_id = lbl["doc_id"]
        if doc_id not in all_docs:
            log.warning(f"[{i+1}/{len(labels)}] {doc_id}: not in extracted docs, skipping")
            continue

        raw = all_docs[doc_id]
        if raw["extract_status"] != "ok":
            log.warning(f"[{i+1}/{len(labels)}] {doc_id}: extract_status={raw['extract_status']}, skipping")
            continue

        if verbose:
            log.info(f"[{i+1}/{len(labels)}] Classifying {doc_id}...")

        doc_input = DocumentInput.from_jsonl_record(raw)
        result = classifier.classify(doc_input)
        results.append(result)

        metrics = evaluate_single(result, lbl)
        metrics["dept"] = raw.get("dept", "?")
        per_doc.append(metrics)
        docs_meta.append({"doc_id": doc_id, "dept": raw.get("dept", "?")})

        if verbose:
            log.info(
                f"  → ISO P@1={metrics['iso_p_at_1']:.0%}, "
                f"KĐCLGD R@5={metrics['kdclgd_r_at_5']:.0%}, "
                f"latency={result.latency_ms}ms, "
                f"cost={result.cost_vnd:.0f} VND"
            )

    # Aggregate
    overall = aggregate(per_doc, docs_meta)

    # Write reports
    if output_dir is None:
        output_dir = settings.data_dir / "evaluations"
    output_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y-%m-%d_%H%M")
    json_path = output_dir / f"evaluation_{ts}.json"
    md_path = output_dir / f"evaluation_{ts}.md"

    payload = {
        "timestamp": datetime.now().isoformat(),
        "n_docs": len(per_doc),
        "model": classifier.model,
        "metrics": overall.model_dump(),
        "per_doc": per_doc,
    }
    write_json(payload, json_path)

    report = format_report(overall)
    md_path.write_text(report, encoding="utf-8")

    log.info("")
    log.info(f"📁 Evaluation written:")
    log.info(f"  JSON: {json_path}")
    log.info(f"  Report: {md_path}")

    return {
        "metrics": overall,
        "per_doc": per_doc,
        "results": results,
        "report": report,
    }
