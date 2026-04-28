#!/bin/bash
# Setup Cloudflare Quick Tunnels cho cdr + kdcl backends.
# Mỗi tunnel = 1 process, mỗi cái 1 random URL *.trycloudflare.com.
# URL stable miễn là tunnel không restart.
#
# Sau khi tunnels chạy, copy 2 URL vào Vercel env:
#   VITE_API_URL      = <cdr tunnel URL>/api
#   VITE_KDCL_API_URL = <kdcl tunnel URL>/api

set -e

CLOUDFLARED_BIN="$HOME/bin/cloudflared"
CDR_PORT=8101
KDCL_PORT=8102

# ==========================================================
# Phase 1: Download cloudflared (no sudo)
# ==========================================================
echo "[1/3] Download cloudflared..."
mkdir -p "$HOME/bin"

if [ ! -x "$CLOUDFLARED_BIN" ]; then
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O "$CLOUDFLARED_BIN"
    chmod +x "$CLOUDFLARED_BIN"
    echo "  Downloaded: $($CLOUDFLARED_BIN --version | head -1)"
else
    echo "  [skip] đã có: $($CLOUDFLARED_BIN --version | head -1)"
fi

# ==========================================================
# Phase 2: Verify backends đang chạy local
# ==========================================================
echo ""
echo "[2/3] Verify backends..."
curl -s "http://127.0.0.1:$CDR_PORT/health" >/dev/null && echo "  cdr  :$CDR_PORT  OK" || (echo "  cdr  :$CDR_PORT  FAIL — chạy ./setup_vps.sh trước" && exit 1)
curl -s "http://127.0.0.1:$KDCL_PORT/health" >/dev/null && echo "  kdcl :$KDCL_PORT  OK" || (echo "  kdcl :$KDCL_PORT  FAIL — chạy ./setup_vps.sh trước" && exit 1)

# ==========================================================
# Phase 3: Start tunnels in tmux
# ==========================================================
echo ""
echo "[3/3] Start tunnels trong tmux..."

tmux kill-session -t tunnel-cdr 2>/dev/null || true
tmux kill-session -t tunnel-kdcl 2>/dev/null || true

tmux new -d -s tunnel-cdr "$CLOUDFLARED_BIN tunnel --url http://localhost:$CDR_PORT"
tmux new -d -s tunnel-kdcl "$CLOUDFLARED_BIN tunnel --url http://localhost:$KDCL_PORT"

echo ""
echo "Tunnels starting... (mất ~10-15s để có URL)"
sleep 15

# Capture URLs from tmux output
echo ""
echo "════════════════════════════════════════════════════════"
echo "PUBLIC URLs (paste vào Vercel env vars):"
echo "════════════════════════════════════════════════════════"

CDR_URL=$(tmux capture-pane -t tunnel-cdr -p | grep -oE 'https://[a-z-]+\.trycloudflare\.com' | head -1)
KDCL_URL=$(tmux capture-pane -t tunnel-kdcl -p | grep -oE 'https://[a-z-]+\.trycloudflare\.com' | head -1)

if [ -n "$CDR_URL" ]; then
    echo "VITE_API_URL=$CDR_URL/api"
else
    echo "VITE_API_URL=(chưa capture được — chạy: tmux attach -t tunnel-cdr để xem)"
fi

if [ -n "$KDCL_URL" ]; then
    echo "VITE_KDCL_API_URL=$KDCL_URL/api"
else
    echo "VITE_KDCL_API_URL=(chưa capture được — chạy: tmux attach -t tunnel-kdcl để xem)"
fi

echo ""
echo "Lưu 2 URL trên — paste vào Vercel project Settings → Environment Variables → save → redeploy."
echo ""
echo "Test: curl $CDR_URL/health"
echo "════════════════════════════════════════════════════════"
