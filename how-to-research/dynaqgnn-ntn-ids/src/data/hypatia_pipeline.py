"""Run Hypatia + Hypatia-DoS extension and extract packet traces + topology.

Hypatia: https://github.com/snkas/hypatia
DoS extension: https://link.springer.com/article/10.1007/s10207-025-01191-0
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class HypatiaConfig:
    shell: str = "starlink_shell1"
    num_planes: int = 4
    sats_per_plane: int = 5
    altitude_km: int = 550
    inclination_deg: float = 53.0
    duration_s: int = 1800
    snapshot_interval_s: float = 1.0
    attacks: tuple[str, ...] = ("tcp_syn_flood", "udp_flood", "shrew_low_rate")
    output_dir: Path = Path("data/hypatia_output/")


def run_hypatia(cfg: HypatiaConfig) -> Path:
    """Launch Hypatia with the given config and return the output directory.

    TODO(week 2):
      1. Clone Hypatia (submodule or external).
      2. Patch with the DoS extension.
      3. Generate config scenario files (.temp) from ``cfg``.
      4. Invoke ns-3 simulation.
      5. Collect packet traces + ISL/GSL state at every snapshot.
    """
    raise NotImplementedError("Implement in week 2; see 04-experiment-plan.")


def load_traces(output_dir: Path):
    """Parse Hypatia traces into a uniform trace record format.

    TODO(week 2): return iterator of ``TraceRecord`` ready for ``graph_builder``.
    """
    raise NotImplementedError
