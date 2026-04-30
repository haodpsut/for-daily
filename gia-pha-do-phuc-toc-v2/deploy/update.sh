#!/usr/bin/env bash
# Pull latest code, sync schema, rebuild, reload pm2. KHÔNG seed.
set -euo pipefail

GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"
GIAPHA_BRANCH="${GIAPHA_BRANCH:-main}"
GIAPHA_PM_NAME="${GIAPHA_PM_NAME:-giapha-web}"

REPO_DIR="$GIAPHA_HOME/repo"
WEB_DIR="$REPO_DIR/gia-pha-do-phuc-toc-v2/web"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
conda activate "$GIAPHA_ENV_NAME"

echo "→ Auto-backup before update..."
bash "$REPO_DIR/gia-pha-do-phuc-toc-v2/deploy/backup.sh" || echo "  (backup failed, continuing)"

echo "→ Pulling code..."
git -C "$REPO_DIR" fetch origin "$GIAPHA_BRANCH"
git -C "$REPO_DIR" checkout "$GIAPHA_BRANCH"
git -C "$REPO_DIR" pull --ff-only

cd "$WEB_DIR"
echo "→ npm install..."
npm install --no-audit --no-fund

echo "→ db:push..."
npm run db:push

echo "→ Building..."
npm run build

echo "→ Reloading pm2..."
pm2 reload "$GIAPHA_PM_NAME" --update-env
pm2 save >/dev/null

echo ""
echo "✓ Update done."
pm2 status
