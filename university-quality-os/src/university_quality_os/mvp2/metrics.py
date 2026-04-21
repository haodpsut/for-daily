"""Eval metrics for MVP-2.

Ground truth format: for each criterion, Hảo provides list of expected doc_ids.
We compute how well Evidence Finder retrieves those docs.
"""

from .schemas import EvalMetrics, EvidenceResult


def precision_at_k(pred: list[str], truth: set[str], k: int) -> float:
    if not pred:
        return 0.0
    top_k = pred[:k]
    hits = sum(1 for p in top_k if p in truth)
    return hits / len(top_k)


def recall_at_k(pred: list[str], truth: set[str], k: int) -> float:
    if not truth:
        return 0.0
    top_k = set(pred[:k])
    return len(top_k & truth) / len(truth)


def f1(p: float, r: float) -> float:
    return 2 * p * r / (p + r) if (p + r) > 0 else 0.0


def mean_reciprocal_rank(pred: list[str], truth: set[str]) -> float:
    """MRR: 1/rank of first correct result."""
    for i, p in enumerate(pred):
        if p in truth:
            return 1.0 / (i + 1)
    return 0.0


def evaluate_single(result: EvidenceResult, truth_doc_ids: list[str]) -> dict:
    """Metrics for one query."""
    pred = [m.doc_id for m in result.matches]
    truth = set(truth_doc_ids)

    return {
        "criterion_id": result.query.criterion_id or "",
        "precision_at_5": precision_at_k(pred, truth, 5),
        "recall_at_5": recall_at_k(pred, truth, 5),
        "mrr": mean_reciprocal_rank(pred, truth),
        "latency_ms": result.latency_ms_total,
        "cost_vnd": result.cost_vnd + result.embedding_cost_vnd,
        "tokens_in": result.tokens_input,
        "tokens_out": result.tokens_output,
        "pred": pred,
        "truth": list(truth),
        "coverage_pct": result.coverage.coverage_pct if result.coverage else None,
    }


def aggregate(per_query: list[dict]) -> EvalMetrics:
    if not per_query:
        return EvalMetrics()

    n = len(per_query)
    metrics = EvalMetrics(n_queries=n)

    metrics.precision_at_5 = sum(d["precision_at_5"] for d in per_query) / n
    metrics.recall_at_5 = sum(d["recall_at_5"] for d in per_query) / n
    metrics.f1_at_5 = f1(metrics.precision_at_5, metrics.recall_at_5)
    metrics.mrr = sum(d["mrr"] for d in per_query) / n
    metrics.avg_latency_ms = sum(d["latency_ms"] for d in per_query) / n
    metrics.total_cost_vnd = sum(d["cost_vnd"] for d in per_query)

    return metrics


def format_report(metrics: EvalMetrics, per_query: list[dict]) -> str:
    """Markdown report."""
    lines = [
        "# Evidence Finder — Evaluation Report",
        "",
        f"**Queries evaluated:** {metrics.n_queries}",
        "",
        "## Core metrics",
        "| Metric | Value |",
        "|---|---|",
        f"| Precision@5 | **{metrics.precision_at_5:.1%}** |",
        f"| Recall@5 | **{metrics.recall_at_5:.1%}** |",
        f"| F1@5 | {metrics.f1_at_5:.1%} |",
        f"| MRR | {metrics.mrr:.2f} |",
        f"| Avg latency | {metrics.avg_latency_ms:,.0f} ms |",
        f"| Total cost | {metrics.total_cost_vnd:,.0f} VND |",
        f"| Avg cost/query | {metrics.total_cost_vnd/max(metrics.n_queries,1):,.0f} VND |",
        "",
        "## Target comparison (MVP-2 SRS)",
        "| Target | Threshold | Actual | Status |",
        "|---|---|---|---|",
        f"| Precision@5 | ≥ 80% | {metrics.precision_at_5:.1%} | {'✅' if metrics.precision_at_5 >= 0.80 else '⚠️' if metrics.precision_at_5 >= 0.70 else '❌'} |",
        f"| Recall@5 | ≥ 70% | {metrics.recall_at_5:.1%} | {'✅' if metrics.recall_at_5 >= 0.70 else '❌'} |",
        f"| Avg latency | < 8s | {metrics.avg_latency_ms/1000:.1f}s | {'✅' if metrics.avg_latency_ms < 8000 else '❌'} |",
        f"| Cost/query | < 500 VND | {metrics.total_cost_vnd/max(metrics.n_queries,1):,.0f} VND | {'✅' if metrics.total_cost_vnd/max(metrics.n_queries,1) < 500 else '⚠️'} |",
        "",
        "## Per-query results",
        "| Criterion | P@5 | R@5 | MRR | Latency | Cost |",
        "|---|---|---|---|---|---|",
    ]
    for d in per_query:
        lines.append(
            f"| {d['criterion_id']} | {d['precision_at_5']:.1%} | "
            f"{d['recall_at_5']:.1%} | {d['mrr']:.2f} | "
            f"{d['latency_ms']:,}ms | {d['cost_vnd']:,.0f} |"
        )

    return "\n".join(lines)
