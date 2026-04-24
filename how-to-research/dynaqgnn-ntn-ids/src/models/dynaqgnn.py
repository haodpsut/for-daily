"""DynaQGNN-IDS: proposed Dynamic Quantum Graph Neural Network.

Reference: ``how-to-research/03-sota-niche1-ntn-ids.tex`` Section "Ba dong gop de xuat".
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DynaQGNNConfig:
    n_qubits: int = 12
    n_variational_layers: int = 4
    encoding: str = "angle"          # angle | amplitude | reuploading
    ansatz: str = "topology_aware"   # hardware_efficient | topology_aware
    use_local_cost: bool = True
    gaussian_init_std: float = 0.01
    layer_wise_training: bool = True
    classical_head_hidden: tuple[int, ...] = (64, 32)
    classical_head_dropout: float = 0.2


class DynaQGNN:
    """Proposed DynaQGNN for NTN intrusion detection.

    Pipeline (cf. ``figures/fig-dynaqgnn-ansatz.tex``):
      1. Encode (A_t, X_t) -> |psi_in>
      2. L variational layers with topology-aware CNOT pattern
      3. Local measurement <Z_i>
      4. Classical MLP head -> attack probability
    """

    def __init__(self, config: DynaQGNNConfig):
        self.config = config
        # TODO(week 5): wire pennylane QNode + torch nn.Module.
        # See experiments/exp03_dynaqgnn_centralized/run.py for the entry point.
        raise NotImplementedError("DynaQGNN forward path lands in week 5 of the plan.")

    def forward(self, adjacency, node_features):
        raise NotImplementedError
