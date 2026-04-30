#!/usr/bin/env bash
# ============================================================================
# Gia Phả Đỗ Phúc Tộc v2 — One-shot installer (conda-only, no root needed)
#
# CHẠY TRÊN VPS:
#   curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install.sh | bash
#
# Hoặc tải về rồi chạy (recommended để xem trước nội dung):
#   curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install.sh -o install.sh
#   bash install.sh
#
# Idempotent: chạy lại nhiều lần → tự update code + reload pm2, KHÔNG mất dữ liệu.
# ============================================================================

set -euo pipefail

# ---- Config (override bằng env vars) ----
GIAPHA_HOME="${GIAPHA_HOME:-$HOME/giapha-v2}"
GIAPHA_ENV_NAME="${GIAPHA_ENV_NAME:-giapha}"
GIAPHA_PG_PORT="${GIAPHA_PG_PORT:-15432}"
GIAPHA_WEB_PORT="${GIAPHA_WEB_PORT:-3000}"
GIAPHA_DB_NAME="${GIAPHA_DB_NAME:-giapha}"
GIAPHA_REPO="${GIAPHA_REPO:-https://github.com/haodpsut/for-daily.git}"
GIAPHA_BRANCH="${GIAPHA_BRANCH:-main}"
GIAPHA_SEED="${GIAPHA_SEED:-ask}"   # ask | yes | no
GIAPHA_PM_NAME="${GIAPHA_PM_NAME:-giapha-web}"

PG_DATA="$GIAPHA_HOME/pgdata"
REPO_DIR="$GIAPHA_HOME/repo"
WEB_DIR="$REPO_DIR/gia-pha-do-phuc-toc-v2/web"
DB_USER="$(whoami)"

# colors
G="\033[1;32m"; Y="\033[1;33m"; R="\033[1;31m"; B="\033[1;34m"; N="\033[0m"
step() { echo -e "${B}━━━${N} ${G}$1${N}"; }
info() { echo -e "    $1"; }
warn() { echo -e "${Y}⚠${N}  $1"; }
err()  { echo -e "${R}✗${N}  $1"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Gia Phả Đỗ Phúc Tộc v2 — Installer (conda)     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
info "Install dir:  $GIAPHA_HOME"
info "Conda env:    $GIAPHA_ENV_NAME"
info "Postgres:     localhost:$GIAPHA_PG_PORT (db=$GIAPHA_DB_NAME, user=$DB_USER)"
info "Web:          localhost:$GIAPHA_WEB_PORT"
echo ""

# ---- Step 1: Check prerequisites ----
step "1/10  Checking prerequisites..."
command -v conda >/dev/null || err "conda not found. Install Miniconda first: https://docs.conda.io/projects/miniconda"
command -v git   >/dev/null || err "git not found"
command -v curl  >/dev/null || err "curl not found"

CONDA_BASE=$(conda info --base)
# shellcheck source=/dev/null
source "$CONDA_BASE/etc/profile.d/conda.sh"
info "✓ conda, git, curl OK"

mkdir -p "$GIAPHA_HOME"

# ---- Step 2: Conda env ----
step "2/10  Setting up conda env '$GIAPHA_ENV_NAME'..."
if conda env list | awk 'NR>2 {print $1}' | grep -qx "$GIAPHA_ENV_NAME"; then
    info "Env exists — skipping creation"
else
    info "Creating env with nodejs=22 + postgresql=16 (~3-5 min, ~500MB)..."
    conda create -n "$GIAPHA_ENV_NAME" -c conda-forge -y nodejs=22 postgresql=16
fi
conda activate "$GIAPHA_ENV_NAME"
info "✓ node $(node --version), $(psql --version)"

# ---- Step 3: Clone / update repo ----
step "3/10  Pulling source code from GitHub..."
if [ ! -d "$REPO_DIR/.git" ]; then
    info "Cloning $GIAPHA_REPO ($GIAPHA_BRANCH)..."
    git clone --branch "$GIAPHA_BRANCH" --single-branch "$GIAPHA_REPO" "$REPO_DIR"
else
    info "Updating existing repo..."
    git -C "$REPO_DIR" fetch origin "$GIAPHA_BRANCH"
    git -C "$REPO_DIR" checkout "$GIAPHA_BRANCH"
    git -C "$REPO_DIR" pull --ff-only
fi
[ -d "$WEB_DIR" ] || err "Expected web dir not found: $WEB_DIR"

# ---- Step 4: Init Postgres data dir ----
step "4/10  Initializing Postgres data dir..."
if [ -f "$PG_DATA/PG_VERSION" ]; then
    info "Already initialized at $PG_DATA"
else
    info "Running initdb at $PG_DATA..."
    # auth-host=trust OK vì listen_addresses bị giới hạn 'localhost' bên dưới — chỉ
    # process cùng máy mới connect được. Single-user VPS → trust là chuẩn.
    initdb -D "$PG_DATA" -U "$DB_USER" --auth-local=trust --auth-host=trust -E UTF8 --no-locale
    # set port + bind localhost only
    sed -i.bak \
        -e "s/^#\?port = .*/port = $GIAPHA_PG_PORT/" \
        -e "s/^#\?listen_addresses = .*/listen_addresses = 'localhost'/" \
        "$PG_DATA/postgresql.conf"
    info "✓ Initialized (port=$GIAPHA_PG_PORT, localhost only, trust auth)"
fi

# ---- Step 5: Start Postgres ----
step "5/10  Starting Postgres..."
if pg_ctl -D "$PG_DATA" status >/dev/null 2>&1; then
    info "Postgres already running"
else
    pg_ctl -D "$PG_DATA" -l "$PG_DATA/server.log" -w start
    info "✓ Started — log: $PG_DATA/server.log"
fi

# ---- Step 6: Create database ----
step "6/10  Ensuring database '$GIAPHA_DB_NAME' exists..."
if psql -h localhost -p "$GIAPHA_PG_PORT" -U "$DB_USER" -d postgres -tAc \
    "SELECT 1 FROM pg_database WHERE datname='$GIAPHA_DB_NAME'" | grep -q 1; then
    info "Database exists"
else
    createdb -h localhost -p "$GIAPHA_PG_PORT" -U "$DB_USER" "$GIAPHA_DB_NAME"
    info "✓ Created"
fi

# ---- Step 7: .env.local ----
step "7/10  Writing .env.local..."
ENV_FILE="$WEB_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
    info "Exists — keeping existing values"
else
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    cat > "$ENV_FILE" <<EOF
# Auto-generated by deploy/install.sh on $(date -Iseconds)
SITE_NAME="Đỗ Phúc Tộc"
SITE_URL="http://localhost:$GIAPHA_WEB_PORT"
DATABASE_URL="postgres://$DB_USER@localhost:$GIAPHA_PG_PORT/$GIAPHA_DB_NAME"
AUTH_SECRET="$AUTH_SECRET"
PORT=$GIAPHA_WEB_PORT
NODE_ENV=production
EOF
    info "✓ Created with random AUTH_SECRET"
fi

# ---- Step 8: npm install ----
step "8/10  Installing npm dependencies..."
cd "$WEB_DIR"
npm install --no-audit --no-fund

# ---- Step 9: Schema + seed ----
step "9/10  Syncing schema (drizzle-kit push)..."
npm run db:push

case "$GIAPHA_SEED" in
    yes) info "Seeding sample data..."; npm run seed ;;
    no)  info "Skipping seed (GIAPHA_SEED=no)" ;;
    ask)
        # Check tables exist (db:push must have succeeded) AND persons is empty
        TABLE_EXISTS=$(psql -h localhost -p "$GIAPHA_PG_PORT" -U "$DB_USER" -d "$GIAPHA_DB_NAME" \
                       -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='persons'" 2>/dev/null)
        TABLE_EXISTS="${TABLE_EXISTS:-0}"
        if [ "$TABLE_EXISTS" != "1" ]; then
            err "Table 'persons' không tồn tại — db:push step 9 đã fail. Kiểm tra log npm ở trên."
        fi
        ROW_COUNT=$(psql -h localhost -p "$GIAPHA_PG_PORT" -U "$DB_USER" -d "$GIAPHA_DB_NAME" \
                    -tAc "SELECT count(*) FROM persons" 2>/dev/null)
        ROW_COUNT="${ROW_COUNT:-0}"
        if [ "$ROW_COUNT" = "0" ]; then
            if [ -t 0 ]; then
                read -p "    DB trống. Insert dữ liệu mẫu? [Y/n] " -r
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then npm run seed; fi
            else
                info "Non-interactive mode + empty DB → seeding sample data"
                npm run seed
            fi
        else
            info "DB has $ROW_COUNT persons — skipping seed (use GIAPHA_SEED=yes to force)"
        fi
        ;;
esac

# ---- Step 10: Build + pm2 ----
step "10/10  Building + starting with pm2..."
npm run build

if ! command -v pm2 >/dev/null; then
    info "Installing pm2 globally..."
    npm install -g pm2
fi

if pm2 describe "$GIAPHA_PM_NAME" >/dev/null 2>&1; then
    info "Reloading existing pm2 process..."
    pm2 reload "$GIAPHA_PM_NAME" --update-env
else
    info "Starting new pm2 process..."
    PORT=$GIAPHA_WEB_PORT pm2 start npm --name "$GIAPHA_PM_NAME" -- start
fi
pm2 save >/dev/null

# ---- Done ----
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo -e "║              ${G}✓ Cài đặt hoàn tất!${N}                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "🌐 Web:        http://localhost:$GIAPHA_WEB_PORT"
echo "🐘 Postgres:   localhost:$GIAPHA_PG_PORT/$GIAPHA_DB_NAME (user: $DB_USER)"
echo "📁 Code:       $WEB_DIR"
echo "📁 PG data:    $PG_DATA"
echo ""
echo "Lệnh hữu ích:"
echo "  pm2 status                                        # trạng thái"
echo "  pm2 logs $GIAPHA_PM_NAME                              # xem log realtime"
echo "  bash $REPO_DIR/gia-pha-do-phuc-toc-v2/deploy/update.sh   # git pull + rebuild"
echo "  bash $REPO_DIR/gia-pha-do-phuc-toc-v2/deploy/backup.sh   # backup DB"
echo "  bash $REPO_DIR/gia-pha-do-phuc-toc-v2/deploy/stop.sh     # stop tất cả"
echo "  bash $REPO_DIR/gia-pha-do-phuc-toc-v2/deploy/start.sh    # start lại sau reboot"
echo ""
echo "Truy cập từ ngoài Internet (HTTPS):"
echo "  Cài Cloudflare Tunnel — xem deploy/CLOUDFLARE_TUNNEL.md"
echo ""
