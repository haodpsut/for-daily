"""Topology-aware variational ansatz for DynaQGNN.

CNOT pattern follows the current adjacency ``A_t`` -> fewer spurious
entangling gates, softer barren-plateau profile (cf. Cerezo 2021).
"""
from __future__ import annotations


def topology_aware_layer(weights, wires, adjacency):
    """One variational block: Ry -> Rz -> CX(adjacency-driven) -> Ry.

    TODO(week 5):
      - Accept pennylane wire objects.
      - For each edge (i, j) in ``adjacency``, apply qml.CNOT(wires=[i, j]).
      - Final Ry rotation uses a second parameter vector.
    """
    raise NotImplementedError


def hardware_efficient_layer(weights, wires):
    """Standard HEA baseline (Cerezo 2021 Fig. 2). Ry/Rz + linear CNOT chain.

    TODO(week 5).
    """
    raise NotImplementedError
