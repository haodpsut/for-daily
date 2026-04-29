#!/bin/bash
# Sprint 1 — Ollama userspace install + Qwen 2.5 14B pull + smoke test
# No sudo cần thiết. Run trên VPS daipv11@Ubuntu22.
#
# Output cuối: Ollama đang chạy trên :11434, model qwen2.5:14b sẵn sàng.
# Verify: curl http://localhost:11434/api/version

set -e

OLLAMA_DIR="$HOME/ollama"
BIN_DIR="$HOME/bin"
MODEL="qwen2.5:14b"  # Q4_K_M quantization ~9GB, fit 24GB VRAM với buffer lớn

mkdir -p "$BIN_DIR"

# ────────────── 1. Download Ollama binary ──────────────
echo "════════════════════════════════════════════════════════"
echo "[1/5] Download Ollama (userspace, no sudo)"
echo "════════════════════════════════════════════════════════"

if [ ! -x "$BIN_DIR/ollama" ]; then
    cd /tmp
    echo "Downloading from GitHub..."
    curl -L --progress-bar \
        https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64.tgz \
        -o ollama.tgz
    mkdir -p "$OLLAMA_DIR"
    tar -xzf ollama.tgz -C "$OLLAMA_DIR"
    ln -sf "$OLLAMA_DIR/bin/ollama" "$BIN_DIR/ollama"
    rm -f /tmp/ollama.tgz
    echo "[OK] Installed to $OLLAMA_DIR"
else
    echo "[skip] Ollama đã có ở $BIN_DIR/ollama"
fi

export PATH="$BIN_DIR:$PATH"
echo ""
echo "Version: $($BIN_DIR/ollama --version)"

# ────────────── 2. Verify GPU available ──────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "[2/5] Verify GPU"
echo "════════════════════════════════════════════════════════"
if command -v nvidia-smi &>/dev/null; then
    nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader
else
    echo "[warn] nvidia-smi không có — Ollama sẽ fall back CPU (chậm 10-50x)"
fi

# ────────────── 3. Start Ollama server in tmux ──────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "[3/5] Start Ollama server (tmux: ollama)"
echo "════════════════════════════════════════════════════════"
tmux kill-session -t ollama 2>/dev/null || true

# OLLAMA_HOST=127.0.0.1:11434 chỉ listen localhost (security)
# OLLAMA_KEEP_ALIVE=24h giữ model trong VRAM lâu hơn (đỡ reload)
tmux new -d -s ollama "
export PATH=$BIN_DIR:\$PATH
export OLLAMA_HOST=127.0.0.1:11434
export OLLAMA_KEEP_ALIVE=24h
$BIN_DIR/ollama serve
"
sleep 5

# ────────────── 4. Verify server alive ──────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "[4/5] Verify server"
echo "════════════════════════════════════════════════════════"
if curl -sf http://localhost:11434/api/version > /tmp/ollama_check.json; then
    cat /tmp/ollama_check.json
    echo ""
else
    echo "[ERR] Ollama server chưa lên — xem: tmux attach -t ollama"
    exit 1
fi

# ────────────── 5. Pull model ──────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "[5/5] Pull model: $MODEL (~9GB, 5-15 phút lần đầu)"
echo "════════════════════════════════════════════════════════"
$BIN_DIR/ollama pull "$MODEL"

echo ""
echo "════════════════════════════════════════════════════════"
echo "✓ Setup xong"
echo "════════════════════════════════════════════════════════"
echo "  Server  : http://localhost:11434"
echo "  Model   : $MODEL ($(du -sh ~/.ollama/models 2>/dev/null | cut -f1) total)"
echo "  tmux    : tmux attach -t ollama  (Ctrl+B D detach)"
echo ""
echo "  Smoke test: bash $(dirname "$0")/test_smart_parser.sh"
echo "════════════════════════════════════════════════════════"
