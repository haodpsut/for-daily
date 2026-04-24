"""Classical baselines required for the paper's main comparison table.

Each class is a thin wrapper around an already-published model; we re-implement
only the interface to the DynaQGNN-IDS trainer. The actual architectures are
brought in from third-party repos where licenses permit.
"""
from __future__ import annotations


class LogisticBaseline:
    """Plain logistic regression on flow features. Lower-bound sanity check."""

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        raise NotImplementedError("Implement in week 3 (see 04-experiment-plan).")


class MLPBaseline:
    """2-3 layer MLP on flow features. Tabular baseline."""

    def __init__(self, hidden: tuple[int, ...] = (128, 64), dropout: float = 0.2):
        self.hidden = hidden
        self.dropout = dropout
        raise NotImplementedError


class EGraphSAGE:
    """Lo et al. 2021. GraphSAGE variant that captures edge (flow) features.

    Upstream: https://arxiv.org/abs/2103.16329
    Reference implementation: https://github.com/waimorris/E-GraphSAGE
    """

    def __init__(self, in_node_dim: int, in_edge_dim: int, hidden: int = 128, num_layers: int = 2):
        self.in_node_dim = in_node_dim
        self.in_edge_dim = in_edge_dim
        self.hidden = hidden
        self.num_layers = num_layers
        raise NotImplementedError


class AnomalE:
    """Caville et al. 2022. Self-supervised GNN IDS (E-GraphSAGE + Deep Graph Infomax)."""

    def __init__(self, **kwargs):
        raise NotImplementedError


class EGRACL:
    """Contrastive learning on GNN for IoT IDS (J. Supercomputing 2024)."""

    def __init__(self, **kwargs):
        raise NotImplementedError


class GATBaseline:
    """Graph Attention Network IDS (Nature Sci. Reports 2025)."""

    def __init__(self, **kwargs):
        raise NotImplementedError


class TGNBaseline:
    """Temporal Graph Network (Rossi 2020). Bat buoc vi ta co temporal graph."""

    def __init__(self, **kwargs):
        raise NotImplementedError
