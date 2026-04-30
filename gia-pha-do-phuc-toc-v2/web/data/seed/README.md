# Seed data — Gia Phả Đỗ Phúc Tộc v2

> ⚠️ **TẤT CẢ dữ liệu trong thư mục này là HƯ CẤU** — dùng để demo cấu trúc app + làm tài liệu format cho việc nhập dữ liệu thật. KHÔNG phải gia phả thực tế của họ Đỗ Phúc Tộc.

## Cấu trúc

| File | Bảng | Số rows mẫu |
|---|---|---|
| `ancestral_hall_info.json` | Thông tin Từ đường (singleton) | 1 |
| `persons.json` | Cá nhân trong gia phả | 12 |
| `relationships.json` | Quan hệ (vợ/chồng, cha/mẹ-con) | 11 |
| `death_anniversaries.json` | Giỗ kỵ | 5 |
| `rituals.json` | Nghi lễ (template) | 3 |
| `ritual_occurrences.json` | Lần thực hiện nghi lễ | 3 |
| `annual_reports.json` | Báo cáo Từ đường năm | 2 |
| `contributions.json` | Công đức | 5 |
| `heritage_items.json` | Di sản tinh thần | 4 |
| `graves.json` | Mộ | 4 |
| `grave_visits.json` | Tảo mộ | 2 |

## Cấu trúc gia phả mẫu (4 đời)

```
Đời 1: Đỗ Phúc Tổ ⚭ Trần Thị Mẫu (Cụ ông + Cụ bà)
       │
       ├── Đỗ Phúc Trưởng ⚭ Nguyễn Thị Thuần       ← Đời 2 (con cả)
       │   ├── Đỗ Văn Hùng ⚭ Lê Thị Lan            ← Đời 3
       │   │   └── Đỗ Phúc Bảo                      ← Đời 4
       │   └── Đỗ Thị Mai
       │
       ├── Đỗ Phúc Nhị ⚭ Lê Thị Hoa                 ← Đời 2 (con thứ)
       │   └── Đỗ Văn Cường ⚭ Phạm Thị Hương
       │       └── Đỗ Văn Khang
       │
       └── Đỗ Thị Tam ⚭ Phan Văn Phúc (rể)         ← Đời 2 (con gái)
```

## Format

- Mỗi file là **JSON array** thuần.
- Tất cả `id` là UUID có quy luật dễ đọc khi đọc tay (ví dụ `00000000-0000-0000-0000-000000000P01` = Person 01).
- Field tên giống schema TypeScript (`fullName`, không phải `full_name`) — script `seed.ts` sẽ map.
- Date dùng định dạng ISO `YYYY-MM-DD`.
- Lunar date là 2 số nguyên `lunarMonth` + `lunarDay`.

## Cách dùng

```bash
# Wipe DB + insert seed (DEV ONLY — sẽ xoá toàn bộ dữ liệu)
npm run seed

# Backup dữ liệu thật trước khi seed nếu đã nhập
npm run export ./data/backups/before-reseed
```

## Khi anh có dữ liệu thật

1. Chạy `npm run export ./data/backups/<tên-mô-tả>` để backup
2. Sửa các JSON này — hoặc tạo bundle riêng theo format `GiaPhaBundle v1` (xem `scripts/import.ts`)
3. `npm run import ./path/to/your/bundle/`

Recommended: sao lưu các JSON gốc của repo này, rồi tạo bundle riêng cho dữ liệu thật, KHÔNG commit dữ liệu thật vào git.
