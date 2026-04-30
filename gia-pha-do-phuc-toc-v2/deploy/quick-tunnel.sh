#!/usr/bin/env bash
# Start (or restart) Cloudflare Quick Tunnel via pm2 + print public URL.
# URL random, đổi mỗi lần restart — phù hợp dev/demo, không phải production.
set -euo pipefail

GIAPHA_WEB_PORT="${GIAPHA_WEB_PORT:-3000}"
TUNNEL_NAME="giapha-tunnel"

CONDA_BASE=$(conda info --base 2>/dev/null || true)
if [ -n "$CONDA_BASE" ]; then
    # shellcheck source=/dev/null
    source "$CONDA_BASE/etc/profile.d/conda.sh"
    conda activate giapha 2>/dev/null || true
fi

export PATH="$HOME/bin:$PATH"

if ! command -v cloudflared >/dev/null; then
    echo "✗ cloudflared chưa cài. Chạy:"
    echo "  bash <(curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install-cloudflared.sh)"
    exit 1
fi
if ! command -v pm2 >/dev/null; then
    echo "✗ pm2 chưa cài (chạy install.sh trước)."
    exit 1
fi

# Restart nếu đã có, start nếu chưa
if pm2 describe "$TUNNEL_NAME" >/dev/null 2>&1; then
    echo "→ Restarting tunnel để lấy URL mới..."
    pm2 delete "$TUNNEL_NAME" >/dev/null
fi

pm2 start "$(which cloudflared)" --name "$TUNNEL_NAME" \
    -- tunnel --url "http://localhost:$GIAPHA_WEB_PORT" --no-autoupdate >/dev/null
pm2 save >/dev/null

echo "→ Đợi tunnel khởi tạo URL (~5s)..."
sleep 5

# Tìm URL trong log (cloudflared in ra ở stderr)
LOG_FILE=$(pm2 describe "$TUNNEL_NAME" 2>/dev/null | grep -E 'error log|out log' | awk '{print $NF}' | head -2)
URL=""
for f in $LOG_FILE; do
    if [ -f "$f" ]; then
        FOUND=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$f" 2>/dev/null | tail -1)
        if [ -n "$FOUND" ]; then URL="$FOUND"; break; fi
    fi
done

# Fallback: thử thêm vài giây
if [ -z "$URL" ]; then
    sleep 5
    for f in $LOG_FILE; do
        if [ -f "$f" ]; then
            FOUND=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$f" 2>/dev/null | tail -1)
            if [ -n "$FOUND" ]; then URL="$FOUND"; break; fi
        fi
    done
fi

echo ""
if [ -n "$URL" ]; then
    echo "╔══════════════════════════════════════════════════╗"
    echo "║  ✓ Quick Tunnel READY                            ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 Public URL:  $URL"
    echo "🔁 URL này sẽ đổi nếu pm2 restart tunnel."
    echo ""
    echo "Lệnh hữu ích:"
    echo "  bash $(dirname "$0")/quick-tunnel.sh    # restart + lấy URL mới"
    echo "  pm2 logs $TUNNEL_NAME                  # xem log realtime"
    echo "  pm2 stop $TUNNEL_NAME                  # tạm tắt public access"
else
    echo "⚠ Tunnel start nhưng chưa tìm thấy URL trong log."
    echo "  Chờ thêm vài giây rồi chạy: pm2 logs $TUNNEL_NAME --lines 30 --nostream | grep trycloudflare"
fi
