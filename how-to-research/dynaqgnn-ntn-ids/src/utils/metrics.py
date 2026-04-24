"""Detection metrics used across all experiments.

See ``how-to-research/04-experiment-plan-niche1.tex`` Section "Metric".
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass
class DetectionMetrics:
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc_roc: float
    auc_pr: float
    miss_rate: float
    false_alarm_rate: float

    def as_dict(self) -> dict[str, float]:
        return asdict(self)


def detection_metrics(y_true: Any, y_score: Any, threshold: float = 0.5) -> DetectionMetrics:
    """Compute the full metric suite from scores and labels.

    ``y_score`` may be probabilities or logits; it is thresholded to form
    binary predictions. Imports are local so the module is cheap to import
    in environments that do not need sklearn (e.g., doc builds).
    """
    import numpy as np
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        roc_auc_score,
        average_precision_score,
    )

    y_true = np.asarray(y_true).astype(int)
    y_score = np.asarray(y_score).astype(float)
    y_pred = (y_score >= threshold).astype(int)

    # Guard against single-class edge cases (rare but possible on small val splits).
    try:
        auc_roc = float(roc_auc_score(y_true, y_score))
    except ValueError:
        auc_roc = float("nan")
    try:
        auc_pr = float(average_precision_score(y_true, y_score))
    except ValueError:
        auc_pr = float("nan")

    pos = y_true == 1
    neg = y_true == 0
    miss = float(((y_pred == 0) & pos).sum() / max(pos.sum(), 1))
    fa = float(((y_pred == 1) & neg).sum() / max(neg.sum(), 1))

    return DetectionMetrics(
        accuracy=float(accuracy_score(y_true, y_pred)),
        precision=float(precision_score(y_true, y_pred, zero_division=0)),
        recall=float(recall_score(y_true, y_pred, zero_division=0)),
        f1=float(f1_score(y_true, y_pred, zero_division=0)),
        auc_roc=auc_roc,
        auc_pr=auc_pr,
        miss_rate=miss,
        false_alarm_rate=fa,
    )
