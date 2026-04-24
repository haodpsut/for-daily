"""Generic trainer for classical + quantum models (single interface)."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TrainConfig:
    epochs: int = 50
    batch_size: int = 64
    lr: float = 1e-3
    weight_decay: float = 1e-4
    scheduler: str = "cosine"
    early_stopping_patience: int = 10
    device: str = "cuda"
    quantum_backend: str = "lightning.gpu"


class Trainer:
    """Minimal trainer; expanded in week 3+.

    Design note (``00-methodology.tex`` Section 7):
      - W&B logging is mandatory for every production run.
      - Checkpoints every ``eval_every_n_epochs`` epochs to ``results/checkpoints/``.
      - Commit hash + dataset hash recorded at run start.
    """

    def __init__(self, model, config: TrainConfig):
        self.model = model
        self.config = config
        raise NotImplementedError("Implement in week 3; see 04-experiment-plan.")

    def fit(self, train_loader, val_loader):
        raise NotImplementedError

    def evaluate(self, loader):
        raise NotImplementedError
