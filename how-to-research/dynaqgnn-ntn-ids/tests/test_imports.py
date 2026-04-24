"""Sanity tests: every module must be importable even before implementations land."""
from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


IMPORT_TARGETS = [
    "src",
    "src.utils",
    "src.utils.seeds",
    "src.utils.metrics",
    "src.models",
    "src.models.dynaqgnn",
    "src.models.baselines_classical",
    "src.models.baselines_quantum",
    "src.data",
    "src.data.hypatia_pipeline",
    "src.data.graph_builder",
    "src.training",
    "src.training.trainer",
    "src.training.bp_mitigation",
    "src.ansatz",
    "src.ansatz.topology_aware",
]


@pytest.mark.parametrize("module", IMPORT_TARGETS)
def test_module_importable(module: str) -> None:
    importlib.import_module(module)


def test_seed_roundtrip() -> None:
    """``set_all_seeds`` must produce deterministic numpy output."""
    from src.utils import set_all_seeds

    try:
        import numpy as np
    except ImportError:
        pytest.skip("numpy not installed in this env")

    set_all_seeds(123)
    a = np.random.rand(5)
    set_all_seeds(123)
    b = np.random.rand(5)
    assert (a == b).all()
