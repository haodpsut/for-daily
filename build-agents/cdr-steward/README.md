# CĐR Steward

Single source of truth cho **PLO / CLO / Course** của một chương trình đào tạo (CTĐT) đại học Việt Nam — auto-render ra 5 template DOCX chuẩn, phân tích tác động khi PLO thay đổi.

## Pain giải quyết

Hiện trạng tại 1 khoa CNTT điển hình:
- 9 PLO × 21 PI × 86 học phần × 5 template DOCX
- Sửa 1 PLO → ~180 điểm chỉnh tay → 1-2 tuần lao động → các bản DOCX **drift** nhau

CĐR Steward biến PLO thành 1 entity duy nhất; 5 template = 5 view auto-render.

## Wedge MVP (6 tuần)

Workflow tool cho **Trưởng khoa + cán bộ phụ trách CTĐT**:

1. Nhập PLO / PI / PO / Course / CLO **một lần** (form web hoặc Excel import)
2. 1 click → xuất **5 file PDF rendered từ LaTeX template**, layout giống mẫu DAU (chuẩn academic):
   - CT_CDR (Chuẩn đầu ra)
   - CT_CTDT (Chương trình đào tạo)
   - CT_MOTA (Mô tả chương trình)
   - CT_CTDH (Chương trình dạy học)
   - CT_DECUONG (Đề cương — N file, 1/môn)
   
   File `.tex` cũng xuất kèm để thầy có thể chỉnh tay nếu cần.
3. Sửa 1 PLO → bảng "n học phần × m đề cương bị ảnh hưởng" → re-render
4. Validate tự động: cảnh báo PLO thiếu Mastery/Assessment, CLO chưa map PLO

## Stack

| Layer | Choice | Lý do |
|-------|--------|-------|
| Backend | Python 3.11 + FastAPI | Phù hợp parser/render Word/Excel |
| ORM | SQLAlchemy 2.x + Pydantic v2 | Standard |
| DB (dev) | SQLite | Zero-friction, không cần Docker |
| DB (prod) | PostgreSQL | Cùng schema, đổi connection string |
| **PDF render** | **LaTeX (XeLaTeX) + Jinja2** | Typography academic, Unicode VN tốt, output PDF chuyên nghiệp hơn DOCX |
| Excel | openpyxl | Đọc/sinh template import |
| Frontend | React (phase sau) | MVP đầu chỉ cần API + Excel import |

## Cấu trúc thư mục

```
cdr-steward/
├── README.md                    ← bạn đang đọc
├── requirements.txt
├── .env.example
├── docs/
│   ├── DATA_MODEL.md            ← schema + ERD (DUYỆT TRƯỚC KHI CODE)
│   ├── IMPORT_GUIDE.md          ← cách dùng Excel template
│   └── RENDER_GUIDE.md          ← cách map data → 5 template DOCX
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI entry
│   │   ├── db.py                ← SQLAlchemy setup
│   │   ├── models/              ← Program, PLO, PI, Course, CLO, ...
│   │   ├── schemas/             ← Pydantic
│   │   ├── routers/             ← /plos /courses /import /render
│   │   └── services/            ← render.py, import_excel.py, impact.py
│   ├── scripts/
│   │   ├── gen_import_template.py   ← sinh Excel template trống
│   │   └── seed_cntt.py             ← seed CNTT 7480201 từ CT_CDR DAU
│   └── tests/
├── templates/                   ← 5 file .tex.j2 (Jinja2 → LaTeX → PDF)
└── import_templates/            ← Excel templates xuất bởi gen_import_template.py
```

## Roadmap 6 tuần

| Tuần | Output |
|------|--------|
| **1** | Schema DB + DATA_MODEL.md duyệt + Excel import template |
| **2** | API CRUD: Program / PLO / PI / PO + import Excel PLO sheets |
| **3** | API CRUD: Course / CLO + import Excel Course sheets |
| **4** | Render CT_CDR + CT_CTDT (2 template đơn giản nhất) |
| **5** | Render CT_MOTA + CT_CTDH + 1 đề cương; impact analyzer |
| **6** | Pilot khoa CNTT: import PLO thật → sửa → đo phút tiết kiệm |

## Yêu cầu hệ thống

- **Python 3.11+** + **XeLaTeX** (TeX Live 2023+) cho backend
- **Node 18+** cho frontend
- Font Times New Roman (mặc định Windows; Linux cài `ttf-mscorefonts-installer`)

## Chạy local — full stack (backend + frontend)

**Terminal 1 — Backend (port 8000):**
```bash
cd build-agents/cdr-steward
pip install -r requirements.txt
cd backend
python scripts/seed_demo.py     # Seed CNTT 7480201 + 3 demo courses
uvicorn app.main:app --reload   # → http://localhost:8000/docs
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd build-agents/cdr-steward/frontend
npm install                     # lần đầu
npm run dev                     # → http://localhost:5173
```

Mở browser: **http://localhost:5173** — sidebar có 5 trang (Tổng quan / PO / PLO / Học phần / Tài liệu sinh ra).

## Chạy CLI (không cần frontend)

```bash
cd backend
python scripts/seed_demo.py
python scripts/render_all.py --program-code 7480201
# → backend/output/7480201/CT_*.pdf

# Excel import:
python scripts/gen_import_template.py --out ../import_templates/template.xlsx
python scripts/import_excel_cli.py --file ../import_templates/template.xlsx --init-db
# → output/7480201/CT_CDR.pdf + CT_CDR.tex

# 4. (sau) Khởi API
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

## Trạng thái hiện tại

- [x] Folder skeleton
- [ ] DATA_MODEL.md (ưu tiên review)
- [ ] Models + migrations
- [ ] Excel import template
- [ ] Render engine
- [ ] Pilot DAU CNTT
