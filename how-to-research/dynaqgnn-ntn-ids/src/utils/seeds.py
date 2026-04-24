"""Deterministic seeding across numpy / torch / python random."""
from __future__ import annotations

import os
import random


def set_all_seeds(seed: int = 42, deterministic: bool = True) -> None:
    """Seed every RNG used by the project.

    When ``deterministic`` is True, CuDNN is configured for determinism,
    which costs some throughput but is required for reproducibility
    numbers reported in the paper.
    """
    random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)

    try:
        import numpy as np
        np.random.seed(seed)
    except ImportError:
        pass

    try:
        import torch
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
        if deterministic:
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False
    except ImportError:
        pass

    # Note: PennyLane does not expose a central seed; simulators honor the numpy
    # RNG seeded above, so no extra call is needed here.
