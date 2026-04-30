#!/usr/bin/env bash
# Show status of Postgres + pm2.
set -euo pipefail

GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"
PG_DATA="$GIAPHA_HOME/pgdata"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
conda activate "$GIAPHA_ENV_NAME"

echo "━━━ Postgres ━━━"
pg_ctl -D "$PG_DATA" status || true

echo ""
echo "━━━ pm2 ━━━"
pm2 status

echo ""
echo "━━━ Disk ━━━"
du -sh "$GIAPHA_HOME"/* 2>/dev/null | sort -h
