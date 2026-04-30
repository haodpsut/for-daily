# Cloudflare Tunnel — HTTPS public access cho VPS

Đưa Gia Phả app ra Internet với HTTPS auto, **không cần admin VPS**, **không cần mở port** nào. Cloudflare Tunnel chạy outbound-only như một con khách hàng — VPS gọi ra Cloudflare, Cloudflare làm proxy.

Yêu cầu trước:
- ✅ App chạy ổn ở `http://localhost:3000` trên VPS (kiểm: `pm2 status`)
- ✅ 1 domain trỏ NS về Cloudflare (xem mục **Chuẩn bị domain** bên dưới nếu chưa có)

---

## Chuẩn bị domain (skip nếu đã có)

### Đã có domain (Namecheap/GoDaddy/...)
1. Đăng ký free Cloudflare account: https://dash.cloudflare.com/sign-up
2. **Add a Site** → nhập domain anh có → chọn **Free plan**
3. Cloudflare scan DNS records — giữ nguyên record cũ
4. Cloudflare in ra **2 nameservers** (ví dụ `mira.ns.cloudflare.com`, `nash.ns.cloudflare.com`)
5. Vào registrar (Namecheap/GoDaddy/...) → đổi nameservers sang 2 cái Cloudflare cấp
6. Đợi 5 phút → 24 giờ (thường < 1 tiếng) cho NS propagate

### Chưa có domain
- Mua qua Cloudflare Registrar (~$10/năm cho .com): https://dash.cloudflare.com → Registrar
- Hoặc free domain (kém tin cậy, không khuyến nghị): Freenom .tk/.ml — đã ngừng từ 2024
- Hoặc dùng tạm `*.trycloudflare.com` (Quick Tunnel — không cần domain, nhưng URL random + đổi mỗi lần restart)

---

## Setup — 7 bước

### Bước 1 — Cài cloudflared (1 lệnh)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/haodpsut/for-daily/main/gia-pha-do-phuc-toc-v2/deploy/install-cloudflared.sh)
source ~/.bashrc
cloudflared --version
```

### Bước 2 — Login Cloudflare (mở URL)

```bash
cloudflared tunnel login
```

→ Script in ra 1 URL `https://dash.cloudflare.com/argotunnel?...`. Copy URL đó, paste vào browser ở **máy local**. Login Cloudflare → chọn domain anh vừa add → click **Authorize**.

→ Cert được lưu tại `~/.cloudflared/cert.pem`. Terminal sẽ tự exit khi xong.

### Bước 3 — Tạo tunnel

```bash
cloudflared tunnel create giapha
```

Output sẽ có đoạn:
```
Created tunnel giapha with id <UUID>
```

→ **Copy UUID đó** — sẽ dùng ở bước 4.

### Bước 4 — Tạo config

Thay 2 chỗ bên dưới:
- `<TUNNEL_UUID>` = UUID copy ở bước 3
- `giapha.example.com` = subdomain anh muốn (ví dụ `giapha.dophuctoc.vn`)

```bash
TUNNEL_UUID=<paste UUID ở đây>
HOSTNAME=giapha.example.com

cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_UUID
credentials-file: $HOME/.cloudflared/$TUNNEL_UUID.json

ingress:
  - hostname: $HOSTNAME
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
  - service: http_status:404
EOF

cat ~/.cloudflared/config.yml
```

### Bước 5 — Route DNS

```bash
cloudflared tunnel route dns giapha $HOSTNAME
```

Lệnh này tự tạo CNAME record trỏ `$HOSTNAME` → tunnel UUID trong Cloudflare DNS. Verify trong Cloudflare dashboard → DNS → Records.

### Bước 6 — Test (foreground)

```bash
cloudflared tunnel run giapha
```

Mở browser: `https://giapha.example.com` → thấy landing page với HTTPS auto = ✓.

`Ctrl+C` để stop.

### Bước 7 — Chạy nền với pm2

```bash
pm2 start "$(which cloudflared)" --name giapha-tunnel -- tunnel run giapha
pm2 save
pm2 status
```

Bây giờ pm2 quản lý cả 2: `giapha-web` (Next.js) + `giapha-tunnel` (Cloudflare). Reboot VPS → cron `@reboot start.sh` resurrect cả 2.

---

## Cập nhật `start.sh` để bao gồm tunnel

File `deploy/start.sh` đã có `pm2 resurrect` — sẽ tự khôi phục cả tunnel sau reboot.

Verify sau reboot:
```bash
pm2 status
curl -sI https://giapha.example.com | head -3
```

---

## Vận hành thường ngày

### Xem log
```bash
pm2 logs giapha-tunnel --lines 50
```

### Đổi subdomain hoặc thêm hostname thứ 2
1. Sửa `~/.cloudflared/config.yml` — thêm/đổi `hostname:`
2. `cloudflared tunnel route dns giapha <new-hostname>`
3. `pm2 reload giapha-tunnel`

### Tạm tắt public access (giữ VPS chạy)
```bash
pm2 stop giapha-tunnel
```

### Xoá tunnel hoàn toàn
```bash
pm2 delete giapha-tunnel
cloudflared tunnel delete giapha
# Optional: xoá CNAME trong Cloudflare DNS dashboard
```

---

## Bảo mật bổ sung (khuyến nghị)

### 1. Bật Cloudflare Access (login bắt buộc trước khi vào app)

Chỉ con cháu trong họ mới xem được:
- Cloudflare dashboard → **Zero Trust** → Access → Applications → Add → Self-hosted
- Subdomain: `giapha.example.com`
- Policies: Allow emails từ list cụ thể, hoặc OTP qua email

→ Browser truy cập sẽ bị chặn ở trang login Cloudflare trước. Free đến 50 users.

### 2. Cloudflare WAF + Rate limiting (tự động nếu Free plan)

- DDoS protection: enabled mặc định
- Rate limiting cơ bản: enabled
- Bot fight mode: bật trong Security → Bots

### 3. Always Use HTTPS

Cloudflare dashboard → SSL/TLS → **Edge Certificates** → bật **Always Use HTTPS**.

---

## Troubleshooting

### `cloudflared tunnel login` không ra URL
→ Có thể bị stuck ở splash. `Ctrl+C` rồi chạy lại với `--cred-file`.

### Browser truy cập subdomain báo `Error 1033 / 1016`
→ Tunnel chưa connect Cloudflare. Check: `pm2 logs giapha-tunnel`.

### `Error 502 / Origin Unreachable`
→ App Next.js không chạy. `pm2 status` xem `giapha-web` có online không. Nếu down: `pm2 restart giapha-web`.

### Subdomain trỏ đúng nhưng vẫn 404
→ Hostname trong `config.yml` phải khớp đúng với route DNS. Check: `cloudflared tunnel info giapha`.

### Quên UUID tunnel
```bash
cloudflared tunnel list
```

### Tunnel không tự khởi động sau reboot
→ Verify pm2 đã save state: `cat ~/.pm2/dump.pm2 | grep tunnel`. Nếu không thấy: `pm2 save` lại.

---

## Quick Tunnel (chỉ test, không cần domain)

Không có domain mà muốn test ngay:

```bash
cloudflared tunnel --url http://localhost:3000
```

→ In ra URL random kiểu `https://abc-def-ghi.trycloudflare.com`. URL đổi mỗi lần restart. Chỉ phù hợp test 5 phút.
