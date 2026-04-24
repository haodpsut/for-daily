"""Build the temporal, heterogeneous graph the DynaQGNN consumes.

Decision documented in ``04-experiment-plan-niche1.tex`` Section 2.3:

  - Node types:  {UE, LEO-sat, gateway}
  - Edge types:  {uplink, ISL, downlink}  with edge features per flow
  - Adjacency A_t changes per snapshot (orbital dynamics)
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class GraphSnapshot:
    """Single-timestep snapshot. Keeps edge features separate from adjacency."""
    t: int
    node_features: "any"    # shape [N_t, d_node]
    edge_index: "any"       # shape [2, E_t]
    edge_features: "any"    # shape [E_t, d_edge]
    node_types: "any"       # {'ue', 'sat', 'gateway'}
    edge_types: "any"       # {'uplink', 'isl', 'downlink'}
    flow_labels: "any"      # per-edge label (0 = benign, >=1 = attack type)


def build_snapshots(traces, flow_labels, window_slots: int = 5):
    """Stream of ``GraphSnapshot`` produced from Hypatia traces + flow labels.

    TODO(week 2-3):
      - Merge traces with CICIDS-2017 flow-level labels via IP+timestamp match.
      - Enforce time-split (train/val/test) to avoid leakage.
      - Return batches of `window_slots` snapshots for temporal encoding.
    """
    raise NotImplementedError
