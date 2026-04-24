"""Barren-plateau diagnostics and mitigation utilities.

Reference:
  - McClean et al. (2018), "Barren plateaus in QNN training landscapes".
  - Cerezo et al. (2021), "Variational Quantum Algorithms".
  - Grant et al. (2019), "Initialization strategy for addressing barren plateaus".

See ``how-to-research/05-tier-a-reading-note.tex`` for notes.
"""
from __future__ import annotations

from typing import Callable


def gradient_variance(
    cost_fn: Callable[..., float],
    param_shape: tuple[int, ...],
    n_samples: int = 50,
    seed: int = 0,
) -> float:
    """Empirical Var[d_theta C] over random parameter realisations.

    This is the canonical barren-plateau diagnostic: run it at n_qubits in
    {4, 8, 12, 16}; if variance decays ~2^-n, you are in a barren plateau.

    TODO(week 5): wire to pennylane grad + numpy RNG; return the variance
    of one coordinate of the gradient averaged over ``n_samples`` random
    parameter tensors.
    """
    raise NotImplementedError


def gaussian_init(shape: tuple[int, ...], std: float = 0.01, seed: int | None = None):
    """Small-variance Gaussian initialisation per Grant et al. (2019).

    TODO(week 5): numpy-backed init returning array of ``shape``.
    """
    raise NotImplementedError


def layer_wise_schedule(total_layers: int, epochs_per_stage: int):
    """Return an iterable of (active_layers, epochs) for layer-wise training."""
    for L in range(1, total_layers + 1):
        yield L, epochs_per_stage
