# KĐCLGD Steward — Đo lường Chuẩn đầu ra (CĐR Measurement)

App đồng hành với [`cdr-steward`](../cdr-steward): **đo % đạt CLO/PLO thực tế** từ điểm sinh viên, tự sinh báo cáo TT04-2025 / ABET / AUN-QA.

## Pain giải quyết

Sau khi đã có \"blueprint CĐR\" (cdr-steward) — khoa cần **đóng vòng PDCA** bằng cách đo CĐR thực tế:

- 1 môn × 3-4 assessment × 5-15 câu/assessment × 30-60 sinh viên × N CLO ↔ M PLO
- Mỗi học kỳ phải tính tay: % SV đạt CLO_x → roll-up → % đạt PLO_y
- Báo cáo TT04-2025: bảng đo PLO + evidence trail per cohort
- Hiện trạng: Excel rời rạc, mất 2-3 tuần/kỳ, không reproducible, dễ mâu thuẫn giữa các thầy

KĐCLGD Steward biến "điểm câu hỏi" thành single source of truth → auto-compute CLO/PLO mastery → auto-render báo cáo.

## Wedge MVP (6 tuần)

Workflow tool cho **cán bộ phụ trách CTĐT + giảng viên**:

1. Pick môn từ cdr-steward (chọn `Course` đã có CLO/PLO map)
2. Tạo **Measurement Session** = 1 lần đo (môn × kỳ × cohort)
3. Define **Question** trong session: số câu, max điểm, Bloom level, map → CLO (kế thừa từ cdr-steward `Assessment_CLO`)
4. Import **gradebook Excel** (1 cột/câu × N sinh viên) → auto-fill `Score`
5. **Compute** → trả về:
   - % SV đạt từng CLO (theo threshold, default 50%)
   - % đạt PLO (roll-up qua PI weighting)
   - Heatmap CLO × Cohort
   - Gap analysis
6. **Export** PDF báo cáo theo TT04-2025 / ABET self-study / AUN-QA Criterion 4

## Khác biệt với cdr-steward

| Aspect | cdr-steward | kdcl-steward (app này) |
|---|---|---|
| Lớp PDCA | **Plan + Do** (định nghĩa CĐR) | **Check + Act** (đo + cải tiến) |
| Data | Định nghĩa CLO/PLO/Course | Điểm sinh viên thực tế |
| Output | 5 PDF blueprint CTĐT | Báo cáo đo CĐR + evidence |
| Frequency | 1 lần/4 năm (chu kỳ CTĐT) | Hàng kỳ (real measurement) |
| Audience | Trưởng khoa, BQL CTĐT | Giảng viên + KĐCLGD officer |

## Stack — share với cdr-steward

| Layer | Choice |
|---|---|
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy 2.x + Pydantic v2 |
| **DB** | **Cùng DATABASE_URL với cdr-steward** — đọc Program/Course/CLO/PLO sẵn có, ghi bảng `meas_*` riêng |
| Auth | Cùng JWT scheme, share `user` table |
| PDF render | LaTeX (XeLaTeX) + Jinja2 |
| Excel | openpyxl |
| Frontend | React (phase sau) |

## Cấu trúc

```
kdcl-steward/
├── README.md                      ← bạn đang đọc
├── requirements.txt
├── .env.example                   ← cùng DATABASE_URL với cdr-steward
├── docs/
│   ├── DATA_MODEL.md              ← schema + ERD (DUYỆT TRƯỚC KHI CODE)
│   ├── COMPUTE_GUIDE.md           ← thuật toán % đạt CLO/PLO
│   └── REPORT_GUIDE.md            ← TT04-2025 / ABET / AUN-QA template
├── backend/
│   ├── app/
│   │   ├── main.py                ← FastAPI entry (port 8001)
│   │   ├── db.py                  ← share schema cdr-steward
│   │   ├── auth.py + dependencies.py
│   │   ├── models/
│   │   │   ├── ref.py             ← read-only models map cdr-steward Program/Course/CLO/PLO/PI
│   │   │   └── meas.py            ← Session, Question, Rubric, Student, Score, Result
│   │   ├── schemas/
│   │   ├── routers/               ← /sessions /students /scores /compute /report
│   │   └── services/              ← compute.py, import_excel.py, report.py
│   ├── scripts/
│   │   ├── seed_demo.py           ← demo data 1 môn DAU
│   │   └── gen_import_template.py
│   └── tests/
├── templates/                     ← LaTeX báo cáo TT04-2025
└── import_templates/              ← Excel gradebook templates
```

## Roadmap 6 tuần

| Tuần | Output |
|---|---|
| **1** | DATA_MODEL.md duyệt + Excel gradebook template + skeleton |
| **2** | API CRUD: Session / Question / Student + Excel import điểm |
| **3** | Compute engine: % đạt CLO theo threshold + roll-up PLO qua PI weighting |
| **4** | Heatmap UI + CSV evidence export |
| **5** | LaTeX render báo cáo TT04-2025 (PDF) |
| **6** | Pilot 1 môn DAU CNTT — so sánh với cách thủ công |

## Yêu cầu hệ thống

- Python 3.11+ + XeLaTeX (TeX Live 2023+)
- Cùng `DATABASE_URL` với cdr-steward (SQLite dev / Postgres prod)
- Hoặc: chỉ chạy standalone với DB riêng (lúc đó phải duplicate Program/Course/CLO/PLO — không khuyến nghị)

## Chạy local

```bash
cd build-agents/kdcl-steward
pip install -r requirements.txt

# DB share với cdr-steward — chạy cdr-steward seed trước
cd ../cdr-steward/backend && python scripts/seed_demo.py

# Quay về kdcl-steward, seed demo measurement
cd ../../kdcl-steward/backend
python scripts/seed_demo.py            # tạo 1 session + 30 sinh viên + 50 điểm fake

uvicorn app.main:app --reload --port 8001
# → http://localhost:8001/docs
```

## Trạng thái

- [x] Folder skeleton
- [ ] DATA_MODEL.md (ưu tiên review)
- [ ] Models + share DB với cdr-steward
- [ ] Excel gradebook template
- [ ] Compute engine
- [ ] Báo cáo TT04-2025
- [ ] Pilot DAU CNTT
