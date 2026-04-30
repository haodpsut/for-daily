#!/usr/bin/env bash
# Start Postgres + pm2 (sau khi VPS reboot hoặc anh stop tay).
set -euo pipefail

GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"
GIAPHA_PM_NAME="${GIAPHA_PM_NAME:-giapha-web}"
PG_DATA="$GIAPHA_HOME/pgdata"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
conda activate "$GIAPHA_ENV_NAME"

if pg_ctl -D "$PG_DATA" status >/dev/null 2>&1; then
    echo "✓ Postgres already running"
else
    pg_ctl -D "$PG_DATA" -l "$PG_DATA/server.log" -w start
    echo "✓ Postgres started"
fi

pm2 resurrect 2>/dev/null || true
pm2 start "$GIAPHA_PM_NAME" 2>/dev/null || pm2 reload "$GIAPHA_PM_NAME" 2>/dev/null || true

pm2 status
