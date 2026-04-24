"""Quantum baselines required by the paper (non-proposed, for comparison)."""
from __future__ import annotations


class QSVC:
    """Quantum Support Vector Classifier (QuIDS-style). 4 qubits, 8 features."""

    def __init__(self, n_qubits: int = 4, feature_map: str = "zz"):
        self.n_qubits = n_qubits
        self.feature_map = feature_map
        raise NotImplementedError


class QGANIDS:
    """QGAN-based IDS (SCITEPRESS 2025). VQC generator + classical discriminator."""

    def __init__(self, n_qubits: int = 8):
        self.n_qubits = n_qubits
        raise NotImplementedError


class QGNNVanilla:
    """Vanilla QGNN in the style of Recy-Narottama-Duong 2026 (fluid antenna).

    Same ansatz family, but without temporal encoding or topology-aware CNOT
    pattern -> isolates the contribution of DynaQGNN.
    """

    def __init__(self, n_qubits: int = 12, n_layers: int = 4):
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        raise NotImplementedError


class QuantumAutoencoder:
    """Quantum Auto-encoder (Quantum Machine Intelligence 2024).

    Unsupervised anomaly detection baseline.
    """

    def __init__(self, n_qubits: int = 6, latent_qubits: int = 2):
        self.n_qubits = n_qubits
        self.latent_qubits = latent_qubits
        raise NotImplementedError
