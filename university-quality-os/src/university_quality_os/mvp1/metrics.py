"""Metrics for MVP-1 classifier evaluation.

Ground truth format (ground_truth.json):
{
  "labels": [
    {
      "doc_id": "qt_xay-dung-...",
      "iso_processes": ["KHAOTHI-001"],
      "kdclgd_criteria": ["TC 9.1", "TC 9.2"],
      ...
    }
  ]
}

Predicted: ClassificationResult with top-3 iso + top-5 kdclgd.
"""

from .schemas import ClassificationResult, EvaluationMetrics


def precision_at_k(predicted_ids: list[str], truth_ids: set[str], k: int) -> float:
    """Precision@K: fraction of top-k predictions that are in truth."""
    if not predicted_ids or not truth_ids:
        return 0.0
    top_k = predicted_ids[:k]
    hits = sum(1 for p in top_k if p in truth_ids)
    return hits / len(top_k)


def recall_at_k(predicted_ids: list[str], truth_ids: set[str], k: int) -> float:
    """Recall@K: fraction of truth items found in top-k predictions."""
    if not truth_ids:
        return 0.0
    top_k = set(predicted_ids[:k])
    hits = len(top_k & truth_ids)
    return hits / len(truth_ids)


def f1(p: float, r: float) -> float:
    if p + r == 0:
        return 0.0
    return 2 * p * r / (p + r)


def evaluate_single(
    result: ClassificationResult, truth: dict
) -> dict:
    """Metrics for one document.

    truth = {"iso_processes": [...], "kdclgd_criteria": [...]}
    """
    iso_pred = [item.id for item in result.iso_processes]
    crit_pred = [item.id for item in result.kdclgd_criteria]

    iso_truth = set(truth.get("iso_processes", []))
    crit_truth = set(truth.get("kdclgd_criteria", []))

    return {
        "doc_id": result.doc_id,
        "iso_p_at_1": precision_at_k(iso_pred, iso_truth, 1),
        "iso_p_at_3": precision_at_k(iso_pred, iso_truth, 3),
        "iso_r_at_3": recall_at_k(iso_pred, iso_truth, 3),
        "kdclgd_p_at_5": precision_at_k(crit_pred, crit_truth, 5),
        "kdclgd_r_at_5": recall_at_k(crit_pred, crit_truth, 5),
        "latency_ms": result.latency_ms,
        "cost_vnd": result.cost_vnd,
        "tokens_in": result.tokens_input,
        "tokens_out": result.tokens_output,
        "iso_pred": iso_pred,
        "iso_truth": list(iso_truth),
        "crit_pred": crit_pred,
        "crit_truth": list(crit_truth),
        "parse_error": result.parse_error,
    }


def aggregate(per_doc: list[dict], docs_meta: list[dict]) -> EvaluationMetrics:
    """Aggregate per-doc metrics into overall EvaluationMetrics.

    docs_meta: list of {"doc_id": str, "dept": str, ...} for per-dept breakdown.
    """
    if not per_doc:
        return EvaluationMetrics()

    n = len(per_doc)
    metrics = EvaluationMetrics(n_docs=n)

    metrics.iso_precision_at_1 = sum(d["iso_p_at_1"] for d in per_doc) / n
    metrics.iso_precision_at_3 = sum(d["iso_p_at_3"] for d in per_doc) / n
    metrics.iso_recall_at_3 = sum(d["iso_r_at_3"] for d in per_doc) / n

    metrics.kdclgd_precision_at_5 = sum(d["kdclgd_p_at_5"] for d in per_doc) / n
    metrics.kdclgd_recall_at_5 = sum(d["kdclgd_r_at_5"] for d in per_doc) / n
    metrics.kdclgd_f1_at_5 = f1(metrics.kdclgd_precision_at_5, metrics.kdclgd_recall_at_5)

    metrics.avg_latency_ms = sum(d["latency_ms"] for d in per_doc) / n
    metrics.total_cost_vnd = sum(d["cost_vnd"] for d in per_doc)
    metrics.total_tokens_input = sum(d["tokens_in"] for d in per_doc)
    metrics.total_tokens_output = sum(d["tokens_out"] for d in per_doc)

    # Per-dept breakdown
    dept_by_doc = {d["doc_id"]: d.get("dept", "?") for d in docs_meta}
    dept_metrics: dict[str, list[dict]] = {}
    for d in per_doc:
        dept = dept_by_doc.get(d["doc_id"], "?")
        dept_metrics.setdefault(dept, []).append(d)

    for dept, rows in dept_metrics.items():
        m = len(rows)
        metrics.per_dept[dept] = {
            "n": m,
            "iso_p_at_1": sum(d["iso_p_at_1"] for d in rows) / m,
            "kdclgd_r_at_5": sum(d["kdclgd_r_at_5"] for d in rows) / m,
        }

    # Top failure cases (lowest recall)
    sorted_by_recall = sorted(per_doc, key=lambda d: d["kdclgd_r_at_5"])
    metrics.failure_cases = sorted_by_recall[:5]

    return metrics


def format_report(metrics: EvaluationMetrics) -> str:
    """Human-readable markdown report."""
    lines = [
        f"# Evaluation Report",
        f"",
        f"**Documents evaluated:** {metrics.n_docs}",
        f"",
        f"## ISO Process Classification",
        f"| Metric | Value |",
        f"|---|---|",
        f"| Precision@1 | **{metrics.iso_precision_at_1:.1%}** |",
        f"| Precision@3 | {metrics.iso_precision_at_3:.1%} |",
        f"| Recall@3 | {metrics.iso_recall_at_3:.1%} |",
        f"",
        f"## KĐCLGD Criteria Classification (multi-label)",
        f"| Metric | Value |",
        f"|---|---|",
        f"| Precision@5 | {metrics.kdclgd_precision_at_5:.1%} |",
        f"| **Recall@5** | **{metrics.kdclgd_recall_at_5:.1%}** |",
        f"| F1@5 | {metrics.kdclgd_f1_at_5:.1%} |",
        f"",
        f"## Performance",
        f"| Metric | Value |",
        f"|---|---|",
        f"| Avg latency | {metrics.avg_latency_ms:,.0f} ms |",
        f"| Total cost | {metrics.total_cost_vnd:,.0f} VND |",
        f"| Avg cost/doc | {metrics.total_cost_vnd/max(metrics.n_docs,1):,.0f} VND |",
        f"| Input tokens | {metrics.total_tokens_input:,} |",
        f"| Output tokens | {metrics.total_tokens_output:,} |",
        f"",
        f"## Per-Department Breakdown",
        f"| Dept | N | ISO P@1 | KĐCLGD R@5 |",
        f"|---|---|---|---|",
    ]
    for dept, m in sorted(metrics.per_dept.items(), key=lambda x: -x[1]["n"]):
        lines.append(f"| {dept} | {m['n']} | {m['iso_p_at_1']:.1%} | {m['kdclgd_r_at_5']:.1%} |")

    # Targets comparison
    lines.extend([
        f"",
        f"## Target Comparison",
        f"| Hypothesis | Target | Actual | Status |",
        f"|---|---|---|---|",
        f"| H1: ISO P@1 ≥ 70% | 70% | {metrics.iso_precision_at_1:.1%} | {'✅' if metrics.iso_precision_at_1 >= 0.70 else '❌'} |",
        f"| H2: KĐCLGD R@5 ≥ 80% | 80% | {metrics.kdclgd_recall_at_5:.1%} | {'✅' if metrics.kdclgd_recall_at_5 >= 0.80 else '❌'} |",
        f"| H3: Latency < 15s | 15,000 ms | {metrics.avg_latency_ms:,.0f} ms | {'✅' if metrics.avg_latency_ms < 15000 else '❌'} |",
        f"| H3: Cost/doc < 1000 VND | 1,000 VND | {metrics.total_cost_vnd/max(metrics.n_docs,1):,.0f} VND | {'✅' if metrics.total_cost_vnd/max(metrics.n_docs,1) < 1000 else '❌'} |",
    ])

    return "\n".join(lines)
