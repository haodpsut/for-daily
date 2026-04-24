# DynaQGNN-IDS

**Dynamic Quantum Graph Neural Network for Intrusion Detection in 6G Non-Terrestrial Networks.**

Skeleton repository for the research project described in `../how-to-research/03-sota-niche1-ntn-ids.tex` and `../how-to-research/04-experiment-plan-niche1.tex`.

---

## Status

Phase 0 — **skeleton**. Only file stubs, directory structure, and environment spec. No trainable code yet.

See `../how-to-research/04-experiment-plan-niche1.tex` Section "Lộ trình theo tuần" for the 12-week plan that will fill this scaffold.

---

## Quick start

### 1. Local setup (RTX 4090 server)

```bash
conda env create -f environment.yml
conda activate dynaqgnn
make setup
```

### 2. Google Colab Pro+

See [**COLAB_GUIDE.md**](./COLAB_GUIDE.md) for step-by-step setup + tiered workflow for sharing results back.

Quick summary: open `notebooks/colab_bootstrap.ipynb` in Colab. It will:
1. Clone the GitHub repo (use a PAT if private);
2. Install pinned dependencies;
3. Run a smoke test on a tiny subset.

### 3. Sanity check

```bash
make test       # pytest tests/
make sanity     # runs experiments/exp01_classical_baselines/run.py --smoke
```

---

## Repository layout

```
dynaqgnn-ntn-ids/
├── src/                 # Python package
│   ├── models/          # DynaQGNN + baselines (classical + quantum)
│   ├── data/            # Hypatia integration, graph builder, flow mapper
│   ├── training/        # Trainer, callbacks, barren-plateau utilities
│   ├── ansatz/          # Reusable VQC ansatz library
│   └── utils/           # Seeds, metrics, expressibility diagnostics
├── experiments/         # One folder per experiment (config.yaml + run.py)
├── configs/             # YAML configs grouped by model family
├── notebooks/           # Exploration + Colab bootstrap
├── data/                # .gitignored (datasets)
├── results/             # .gitignored (checkpoints, figures, W&B artifacts)
├── paper/               # Draft LaTeX
└── tests/               # pytest
```

---

## Compute budget (see `../how-to-research/04-experiment-plan-niche1.tex`)

- **RTX 4090 (24 GB)**: primary — simulator up to ~28 qubits.
- **Colab Pro+ (A100 40 GB when available)**: hyperparameter sweeps.
- **IBM Quantum**: final validation only (4–8 qubits, parameter-shift).

---

## How this repo is meant to be pushed to GitHub

This scaffold lives under `how-to-research/` for convenience while the research plan is iterated. To turn it into a standalone GitHub repo:

```bash
# 1. Copy scaffold out of the research-notes parent repo
cp -r dynaqgnn-ntn-ids ~/projects/
cd ~/projects/dynaqgnn-ntn-ids

# 2. Initialize as its own git repo
git init
git add .
git commit -m "Initial DynaQGNN-IDS skeleton"

# 3. Create private repo on GitHub and push
gh repo create dynaqgnn-ntn-ids --private --source=. --push
```

---

## License

MIT. See `LICENSE`.

## Author

**Đỗ Phúc Hảo** — Khoa CNTT, Đại học Kiến trúc Đà Nẵng.
