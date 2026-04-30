#!/usr/bin/env bash
# Install cloudflared (Cloudflare Tunnel client) — user-mode binary, không cần root.
set -euo pipefail

BIN_DIR="$HOME/bin"
BIN="$BIN_DIR/cloudflared"

mkdir -p "$BIN_DIR"

ARCH=$(uname -m)
case "$ARCH" in
    x86_64)  PKG=cloudflared-linux-amd64 ;;
    aarch64) PKG=cloudflared-linux-arm64 ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
esac

URL="https://github.com/cloudflare/cloudflared/releases/latest/download/$PKG"

echo "→ Downloading $PKG..."
curl -fsSL "$URL" -o "$BIN"
chmod +x "$BIN"

# Add ~/bin to PATH if not already there
if ! grep -q 'HOME/bin' ~/.bashrc 2>/dev/null; then
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    echo "→ Added \$HOME/bin to PATH in ~/.bashrc (chạy 'source ~/.bashrc' hoặc mở shell mới)"
fi

export PATH="$HOME/bin:$PATH"
echo ""
echo "✓ Installed: $($BIN --version 2>&1 | head -1)"
echo ""
echo "Bước tiếp theo: làm theo deploy/CLOUDFLARE_TUNNEL.md"
