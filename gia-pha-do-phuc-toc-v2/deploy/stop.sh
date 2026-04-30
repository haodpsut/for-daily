#!/usr/bin/env bash
# Stop pm2 + Postgres (giữ nguyên dữ liệu).
set -euo pipefail

GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"
GIAPHA_PM_NAME="${GIAPHA_PM_NAME:-giapha-web}"
PG_DATA="$GIAPHA_HOME/pgdata"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
conda activate "$GIAPHA_ENV_NAME"

pm2 stop "$GIAPHA_PM_NAME" 2>/dev/null || echo "pm2 process not running"

if pg_ctl -D "$PG_DATA" status >/dev/null 2>&1; then
    pg_ctl -D "$PG_DATA" -m fast stop
    echo "✓ Postgres stopped"
else
    echo "Postgres not running"
fi
