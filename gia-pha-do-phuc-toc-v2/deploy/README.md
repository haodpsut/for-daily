# Deploy lên VPS (conda-only, không cần root)

Toàn bộ stack chạy user-mode bằng conda — không Docker, không systemd, không cần admin.

---

## Trên VPS lần đầu — 1 lệnh duy nhất

```bash
curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install.sh | bash
```

Script tự làm tất cả:

| Bước | Việc | Idempotent? |
|---|---|---|
| 1 | Check `conda`, `git`, `curl` | ✓ |
| 2 | Tạo conda env `giapha` với `nodejs=22` + `postgresql=16` | ✓ skip nếu đã có |
| 3 | Clone/pull repo về `~/giapha-v2/repo/` | ✓ |
| 4 | `initdb` Postgres data dir tại `~/giapha-v2/pgdata/`, port `15432` | ✓ skip nếu đã init |
| 5 | Start Postgres | ✓ skip nếu đang chạy |
| 6 | Create database `giapha` | ✓ skip nếu đã có |
| 7 | Generate `.env.local` với `AUTH_SECRET` random | ✓ giữ nếu đã tồn tại |
| 8 | `npm install` | ✓ |
| 9 | `npm run db:push` (sync schema) | ✓ |
| 10 | Seed dữ liệu mẫu (chỉ nếu DB rỗng) | ✓ |
| 11 | `npm run build` + `pm2 start` | ✓ reload nếu đã chạy |

→ Sau khoảng 5-10 phút (tuỳ tốc độ mạng): http://localhost:3000

---

## Tuỳ chỉnh trước khi chạy install

Override mặc định bằng env var:

```bash
export GIAPHA_HOME=/data/giapha           # default: ~/giapha-v2
export GIAPHA_PG_PORT=25432               # default: 15432
export GIAPHA_WEB_PORT=8080               # default: 3000
export GIAPHA_SEED=no                     # default: ask (yes/no/ask)
export GIAPHA_BRANCH=main                 # default: main
curl -fsSL ... | bash
```

---

## Các script vận hành (sau khi install xong)

Tất cả ở `~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/`:

| Script | Việc |
|---|---|
| **`install.sh`** | Chạy lại = update + tự reload (an toàn) |
| **`update.sh`** | Pull latest + rebuild + reload (auto-backup trước) |
| **`backup.sh`** | Export DB → `~/giapha-v2/backups/<timestamp>/` (giữ 30 bản gần nhất) |
| **`start.sh`** | Start Postgres + pm2 (dùng sau reboot) |
| **`stop.sh`** | Stop pm2 + Postgres (giữ data) |
| **`status.sh`** | Trạng thái + dung lượng disk |

Alias để gõ ngắn:

```bash
echo "alias giapha-update='bash ~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/update.sh'" >> ~/.bashrc
echo "alias giapha-status='bash ~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/status.sh'" >> ~/.bashrc
echo "alias giapha-backup='bash ~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/backup.sh'" >> ~/.bashrc
source ~/.bashrc
```

---

## Auto-start sau VPS reboot (không cần admin)

Dùng user crontab:

```bash
(crontab -l 2>/dev/null; echo "@reboot bash $HOME/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/start.sh > $HOME/giapha-v2/start.log 2>&1") | sort -u | crontab -
```

Verify: `crontab -l`

---

## Truy cập từ Internet (HTTPS) — Cloudflare Tunnel

Vì conda-only không bind được port 80/443, không cài được nginx/Let's Encrypt:

→ **Cloudflare Tunnel** là cách duy nhất sạch sẽ. Outbound-only, miễn phí, HTTPS auto.

Xem [CLOUDFLARE_TUNNEL.md](CLOUDFLARE_TUNNEL.md) (em sẽ viết khi anh xác nhận có domain Cloudflare).

---

## Backup & restore

**Backup tự động trước mỗi lần `update.sh`** chạy. Để backup tay:

```bash
bash ~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/deploy/backup.sh
```

Bundle xuất ra là 1 thư mục JSON đọc tay được. Copy về máy:

```bash
# Trên local:
scp -r vps:~/giapha-v2/backups/2026-04-30T14-30-00Z ./local-backup/
```

Restore từ bundle:

```bash
cd ~/giapha-v2/repo/gia-pha-do-phuc-toc-v2/web
npm run import ~/giapha-v2/backups/2026-04-30T14-30-00Z/
```

⚠️ `import` **WIPE database** trước khi restore. Auto-backup nên không sao.

---

## Khắc phục sự cố

### `conda not found`
→ Cài Miniconda: `mkdir -p ~/miniconda3 && wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh && bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3 && ~/miniconda3/bin/conda init bash && exec bash`

### `port 15432 already in use`
→ Đổi: `GIAPHA_PG_PORT=25432 bash install.sh`

### `npm install` quá chậm
→ Conda env có internal node, dùng đó. Hoặc thử mirror: `npm config set registry https://registry.npmmirror.com`

### `pm2: command not found` sau khi đóng terminal
→ pm2 cài trong conda env. `conda activate giapha` trước rồi chạy `pm2 status`. Hoặc dùng full path: `~/miniconda3/envs/giapha/bin/pm2`.

### Postgres không start lại sau reboot
→ Crontab @reboot chạy nhưng silent fail. Check: `cat ~/giapha-v2/start.log` và `cat ~/giapha-v2/pgdata/server.log`.

### Mất pm2 process sau VPS reboot
→ `pm2 resurrect` đọc lại từ `~/.pm2/dump.pm2`. Nếu `pm2 save` chưa chạy lần nào thì empty. Chạy `bash deploy/start.sh` để recover.

### Quên pm2 đang chạy app gì
→ `pm2 list` hoặc `pm2 status`.
