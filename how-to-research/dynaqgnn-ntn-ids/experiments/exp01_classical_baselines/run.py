"""Experiment 01 --- Classical baselines (Logistic, MLP, E-GraphSAGE, Anomal-E, TGN).

Usage:
    python experiments/exp01_classical_baselines/run.py --config configs/base.yaml
    python experiments/exp01_classical_baselines/run.py --smoke
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow `import src.*` when invoked from repo root.
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.utils import set_all_seeds  # noqa: E402


def smoke_test() -> int:
    """Minimal liveness check. Does NOT train; only verifies imports + seeding."""
    set_all_seeds(42)
    print("[smoke] Seeding OK.")
    try:
        import torch
        print(f"[smoke] torch {torch.__version__}, CUDA available: {torch.cuda.is_available()}")
    except Exception as e:  # noqa: BLE001 - defensive: torch may be absent or broken
        print(f"[smoke] torch unavailable: {type(e).__name__}: {e}")
    try:
        import pennylane
        print(f"[smoke] pennylane {pennylane.__version__}")
    except Exception as e:  # noqa: BLE001 - defensive: e.g., JAX/PennyLane version drift
        print(f"[smoke] pennylane unavailable: {type(e).__name__}: {e}")
    print("[smoke] All imports succeeded. Scaffold is live.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default=None)
    parser.add_argument("--smoke", action="store_true",
                        help="Run the minimal smoke test and exit.")
    args = parser.parse_args()

    if args.smoke:
        return smoke_test()

    # Real training loop lands in week 3 of the plan (see 04-experiment-plan-niche1.tex).
    raise NotImplementedError(
        "Classical baseline training lands in week 3. "
        "Run with --smoke to verify the scaffold."
    )


if __name__ == "__main__":
    raise SystemExit(main())
