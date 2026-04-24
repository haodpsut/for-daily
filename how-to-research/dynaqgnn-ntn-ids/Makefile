# Makefile for DynaQGNN-IDS
# Usage:
#   make setup      # install pre-commit hooks, verify env
#   make test       # run pytest
#   make sanity     # smoke test classical baseline
#   make train EXP=exp03_dynaqgnn_centralized
#   make eval  EXP=exp03_dynaqgnn_centralized RUN=<run_id>
#   make figures    # re-build paper figures
#   make lint       # black + ruff
#   make clean      # remove caches

.PHONY: setup test sanity train eval figures lint clean help

PY      ?= python
EXP     ?= exp03_dynaqgnn_centralized
RUN     ?= latest

help:
	@echo "Targets: setup | test | sanity | train | eval | figures | lint | clean"

setup:
	pre-commit install || true
	$(PY) -c "import torch, pennylane, qiskit; print('torch', torch.__version__); print('pennylane', pennylane.__version__); print('qiskit', qiskit.__version__)"

test:
	$(PY) -m pytest tests/ -v

sanity:
	$(PY) experiments/exp01_classical_baselines/run.py --smoke

train:
	$(PY) experiments/$(EXP)/run.py --config configs/base.yaml

eval:
	$(PY) experiments/$(EXP)/run.py --eval --run $(RUN)

figures:
	cd paper/figures && for f in *.tex; do pdflatex -interaction=nonstopmode "$$f"; done

lint:
	black src/ tests/ experiments/
	ruff check src/ tests/ experiments/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	rm -rf .pytest_cache .ruff_cache .mypy_cache
	rm -rf build dist *.egg-info
