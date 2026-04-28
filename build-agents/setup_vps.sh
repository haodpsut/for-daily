#!/bin/bash
# Setup script cho VPS conda-only — deploy cdr + kdcl backends.
#
# Usage:
#   bash setup_vps.sh           # full setup (idempotent — chạy lại OK)
#   bash setup_vps.sh restart   # chỉ restart 2 backend trong tmux
#
# Trước khi chạy:
#   - VPS đã có conda (verify: `conda --version`)
#   - VPS có internet outbound 443 (verify: `curl -sI https://github.com`)
#   - Disk >= 5GB free (verify: `df -h ~`)

set -e  # exit on error

DEPLOY_DIR="$HOME/cdr-deploy"
DATA_DIR="$HOME/cdr-data"
ENV_NAME="cdr-prod"
CDR_PORT=8101
KDCL_PORT=8102
DB_PATH="$DATA_DIR/db.sqlite"
JWT_SECRET="${JWT_SECRET:-pPiZbi_dLvLyVrUwMBrRCSznrhxRprqLCItCz6ZNZRezaApMdsavQX30X6YoqvAy}"
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://cdr-steward.vercel.app}"
LATEX_FONT="${LATEX_FONT:-DejaVu Serif}"

# ==========================================================
# Phase 1: Conda env
# ==========================================================
echo "════════════════════════════════════════════════════════"
echo "[1/6] Setup conda env: $ENV_NAME"
echo "════════════════════════════════════════════════════════"

source "$(conda info --base)/etc/profile.d/conda.sh"

if conda env list | grep -q "^$ENV_NAME "; then
    echo "[skip] env $ENV_NAME đã tồn tại"
else
    conda create -n "$ENV_NAME" python=3.11 -y
fi
conda activate "$ENV_NAME"

# ==========================================================
# Phase 2: Tectonic (LaTeX engine, tự auto-download packages)
# ==========================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "[2/6] Install tectonic (LaTeX) + DejaVu fonts"
echo "════════════════════════════════════════════════════════"

if ! command -v tectonic &> /dev/null; then
    conda install -c conda-forge -y tectonic fonts-conda-ecosystem
else
    echo "[skip] tectonic đã có: $(tectonic --version | head -1)"
fi

# ==========================================================
# Phase 3: Clone repo + Python deps
# ==========================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "[3/6] Clone repo + install Python deps"
echo "════════════════════════════════════════════════════════"

mkdir -p "$DEPLOY_DIR"
if [ ! -d "$DEPLOY_DIR/.git" ]; then
    git clone https://github.com/haodpsut/for-daily.git "$DEPLOY_DIR"
else
    echo "[update] git pull"
    cd "$DEPLOY_DIR" && git pull
fi

# Install deps cho cả 2 service (chung 1 env vì requirements gần giống nhau)
pip install -q -r "$DEPLOY_DIR/build-agents/cdr-steward/requirements.txt"
pip install -q -r "$DEPLOY_DIR/build-agents/kdcl-steward/requirements.txt"

# ==========================================================
# Phase 4: SQLite shared dir
# ==========================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "[4/6] Setup data dir: $DATA_DIR"
echo "════════════════════════════════════════════════════════"

mkdir -p "$DATA_DIR"
DB_URL="sqlite:////${DB_PATH#/}"  # 4 slashes for absolute path
echo "DATABASE_URL = $DB_URL"

# ==========================================================
# Phase 5: Seed DB (idempotent)
# ==========================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "[5/6] Seed cdr-steward (User + 2 demo programs)"
echo "════════════════════════════════════════════════════════"

cd "$DEPLOY_DIR/build-agents/cdr-steward/backend"
DATABASE_URL="$DB_URL" \
JWT_SECRET="$JWT_SECRET" \
LATEX_FONT="$LATEX_FONT" \
python scripts/seed_demo.py

echo ""
echo "[Seed kdcl-steward — measurement demo]"
cd "$DEPLOY_DIR/build-agents/kdcl-steward/backend"
DATABASE_URL="$DB_URL" \
JWT_SECRET="$JWT_SECRET" \
LATEX_FONT="$LATEX_FONT" \
python scripts/seed_demo.py || echo "[warn] kdcl seed có thể fail nếu cdr chưa có user — sẽ retry sau"

# ==========================================================
# Phase 6: Run cdr + kdcl trong tmux
# ==========================================================
echo ""
echo "════════════════════════════════════════════════════════"
echo "[6/6] Start backends trong tmux"
echo "════════════════════════════════════════════════════════"

# Kill existing sessions nếu có
tmux kill-session -t cdr 2>/dev/null || true
tmux kill-session -t kdcl 2>/dev/null || true

# Start cdr backend
tmux new -d -s cdr "
source $(conda info --base)/etc/profile.d/conda.sh && \
conda activate $ENV_NAME && \
cd $DEPLOY_DIR/build-agents/cdr-steward/backend && \
DATABASE_URL='$DB_URL' \
JWT_SECRET='$JWT_SECRET' \
ALLOWED_ORIGINS='$ALLOWED_ORIGINS' \
LATEX_FONT='$LATEX_FONT' \
uvicorn app.main:app --host 127.0.0.1 --port $CDR_PORT
"

# Start kdcl backend
tmux new -d -s kdcl "
source $(conda info --base)/etc/profile.d/conda.sh && \
conda activate $ENV_NAME && \
cd $DEPLOY_DIR/build-agents/kdcl-steward/backend && \
DATABASE_URL='$DB_URL' \
JWT_SECRET='$JWT_SECRET' \
ALLOWED_ORIGINS='$ALLOWED_ORIGINS' \
LATEX_FONT='$LATEX_FONT' \
uvicorn app.main:app --host 127.0.0.1 --port $KDCL_PORT
"

sleep 4

# Verify
echo ""
echo "═══ Verify ═══"
curl -s "http://127.0.0.1:$CDR_PORT/health" && echo "  ← cdr OK" || echo "  ← cdr FAIL — xem: tmux attach -t cdr"
curl -s "http://127.0.0.1:$KDCL_PORT/health" && echo "  ← kdcl OK" || echo "  ← kdcl FAIL — xem: tmux attach -t kdcl"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✓ Backends đang chạy local"
echo "════════════════════════════════════════════════════════"
echo "  cdr  → http://127.0.0.1:$CDR_PORT  (tmux attach -t cdr)"
echo "  kdcl → http://127.0.0.1:$KDCL_PORT (tmux attach -t kdcl)"
echo ""
echo "Bước tiếp: setup Cloudflare tunnels (xem hướng dẫn riêng)"
echo "════════════════════════════════════════════════════════"
