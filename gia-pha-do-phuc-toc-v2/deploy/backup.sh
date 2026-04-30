#!/usr/bin/env bash
# Backup DB → bundle JSON ở ~/giapha-v2/backups/<timestamp>/
# Dùng `npm run export` của app — bundle này import được lại bằng `npm run import`.
set -euo pipefail

GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"

REPO_DIR="$GIAPHA_HOME/repo"
WEB_DIR="$REPO_DIR/gia-pha-do-phuc-toc-v2/web"
BACKUP_DIR="$GIAPHA_HOME/backups"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
conda activate "$GIAPHA_ENV_NAME"

mkdir -p "$BACKUP_DIR"
STAMP=$(date -u +%Y-%m-%dT%H-%M-%SZ)
OUT="$BACKUP_DIR/$STAMP"

cd "$WEB_DIR"
npm run export -- "$OUT"

echo ""
echo "✓ Backup saved: $OUT"

# Giữ 30 backup gần nhất, xoá cũ
KEEP=30
COUNT=$(find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
if [ "$COUNT" -gt "$KEEP" ]; then
    find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d | sort | head -n -$KEEP | xargs rm -rf
    echo "  (cleaned old backups, keeping last $KEEP)"
fi
