# DATA MODEL — KĐCLGD Steward

> **DUYỆT TRƯỚC KHI CODE.** Thay đổi sau khi đã có dữ liệu thật → migration đau đầu.

## Triết lý

- **Read-only từ cdr-steward**: `Program`, `Course`, `CLO`, `PLO`, `PI`, `CLO_PI` là **truth source** đã có. Không duplicate.
- **Bảng mới prefix `meas_`** để tách biệt — share cùng DATABASE_URL nhưng schema namespace rõ ràng.
- **Idempotent compute**: kết quả tính được \emph{cache} vào `meas_result_*` để báo cáo không phải tính lại; nhưng có thể re-compute bất kỳ lúc nào.

## ERD (text-based)

```
                       ┌─── cdr-steward (read-only) ───┐
                       │                               │
                       │  Program ─◄ Course            │
                       │             │                 │
                       │             ├──◄ CLO ─────┐   │
                       │             └──◄ Assessment   │
                       │                          │   │
                       │  PLO ─◄ PI ────◄ CLO_PI ─┘   │
                       └───────────────────────────────┘
                                       │
                                       │ FK
                       ┌───── kdcl-steward (write) ────────┐
                       │                                   │
                       │  meas_session ◄── meas_question   │
                       │       │              │            │
                       │       │              └─◄ meas_question_clo
                       │       │              └─◄ meas_rubric
                       │       │                                │
                       │       ├──◄ meas_session_student ──────┐│
                       │       │           │                   ││
                       │       │           ▼                   ││
                       │       │      meas_student              │
                       │       │           ▲                   │
                       │       │           │                   │
                       │       │      meas_score ──────────────┘
                       │       │           ▲
                       │       │           └── (FK meas_question)
                       │       │
                       │       ├──◄ meas_result_clo  (cache)
                       │       └──◄ meas_result_plo  (cache)
                       └───────────────────────────────────────┘
```

## Bảng chi tiết

### 1. `meas_session` — Phiên đo lường

Một lần đo = 1 môn × 1 kỳ × 1 cohort × 1 component (e.g., "CSC101 cuối kỳ HKII 2024-2025 lớp 21CS01").

| Field | Type | Note |
|---|---|---|
| id | UUID PK | |
| program_id | FK program | (cdr-steward) |
| course_id | FK course | (cdr-steward) |
| assessment_id | FK assessment, nullable | Liên kết về definition `Assessment` của cdr-steward (component giữa kỳ/cuối kỳ); nullable nếu đo ad-hoc |
| name | str | "Cuối kỳ HKII 2024-2025 -- 21CS01" |
| semester | str | "HKII 2024-2025" |
| cohort_code | str | "21CS01" |
| exam_date | date, nullable | |
| max_total_score | numeric | Tổng điểm tối đa (thường 10) |
| pass_threshold | numeric | Default 5.0 (≥5 điểm = đạt) — \emph{thresholding ở mức câu hỏi/CLO sẽ define riêng* |
| clo_threshold_pct | numeric | Default 50% — % điểm tối thiểu để 1 SV được tính \"đạt CLO_x\" |
| status | enum | DRAFT / SCORING / COMPUTED / PUBLISHED |
| created_by | FK user | |
| created_at, updated_at | datetime | |

**Constraint:** `(program_id, course_id, semester, cohort_code, assessment_id)` unique.

**Note**: 1 môn có thể có nhiều `meas_session` cùng kỳ (giữa kỳ + cuối kỳ + assignment) — mỗi cái là 1 session. Roll-up CLO ở mức course là job riêng (multi-session aggregate).

### 2. `meas_question` — Câu hỏi trong session

| Field | Type | Note |
|---|---|---|
| id | UUID PK | |
| session_id | FK meas_session | CASCADE |
| number | str | "1a", "2", "II.3" — tự do |
| order | int | Thứ tự hiển thị |
| text | text, nullable | Đề bài (optional) |
| max_score | numeric | Điểm tối đa câu này |
| bloom_level | enum | REMEMBER / UNDERSTAND / APPLY / ANALYZE / EVALUATE / CREATE |
| weight_in_session | numeric, nullable | Tỷ trọng % trong session, sum=100; nếu null → tính theo `max_score / sum(max_score)` |

**Constraint**: `(session_id, number)` unique.

### 3. `meas_question_clo` — Map question ↔ CLO

| Field | Type | Note |
|---|---|---|
| question_id | FK meas_question | PK |
| clo_id | FK clo (cdr-steward) | PK |
| weight | numeric | Trong [0, 1]; sum theo question = 1 (1 câu có thể đo nhiều CLO chia tỷ lệ) |

**Note**: Không dùng `Assessment_CLO` của cdr-steward vì đó là level component, ta cần level câu hỏi (granularity hơn).

### 4. `meas_rubric` — Rubric cho từng câu

| Field | Type | Note |
|---|---|---|
| id | UUID PK | |
| question_id | FK meas_question | CASCADE |
| level | enum | EXCELLENT / GOOD / PASS / FAIL — hoặc free-form name |
| label | str | "Xuất sắc", "Tốt", "Đạt", "Chưa đạt" |
| criteria_text | text | Mô tả tiêu chí |
| score_range_min | numeric | |
| score_range_max | numeric | |
| order | int | |

**Constraint**: `(question_id, level)` unique.

### 5. `meas_student` — Sinh viên (session-scoped, có thể promote ra global sau)

| Field | Type | Note |
|---|---|---|
| id | UUID PK | |
| program_id | FK program | (cdr-steward) -- để query cohort |
| code | str | Mã SV |
| full_name | str | |
| date_of_birth | date, nullable | |
| cohort_code | str, nullable | "21CS01" |
| email | str, nullable | |

**Constraint**: `(program_id, code)` unique.

### 6. `meas_session_student` — Many-to-many session ↔ student

(Cùng SV có thể tham gia nhiều session: giữa kỳ + cuối kỳ; cùng session có nhiều SV)

| Field | Type | Note |
|---|---|---|
| session_id | FK meas_session | PK CASCADE |
| student_id | FK meas_student | PK CASCADE |
| absent | bool, default false | SV vắng → loại khỏi compute |
| notes | text, nullable | |

### 7. `meas_score` — Điểm cá nhân từng câu

| Field | Type | Note |
|---|---|---|
| id | UUID PK | |
| session_id | FK meas_session | CASCADE — denormalize cho query nhanh |
| student_id | FK meas_student | CASCADE |
| question_id | FK meas_question | CASCADE |
| raw_score | numeric, nullable | Điểm thô (null nếu chưa chấm) |
| graded_at | datetime, nullable | |
| graded_by | FK user, nullable | |

**Constraint**: `(student_id, question_id)` unique.

### 8. `meas_result_clo` — Cache aggregate per CLO per session

(Tính sau `compute()`)

| Field | Type | Note |
|---|---|---|
| session_id | FK meas_session | PK CASCADE |
| clo_id | FK clo | PK |
| n_students | int | SV tham gia |
| n_achieved | int | SV đạt threshold |
| pct_achieved | numeric | n_achieved / n_students × 100 |
| avg_score_pct | numeric | trung bình % điểm theo CLO |
| computed_at | datetime | |

### 9. `meas_result_plo` — Cache aggregate per PLO per session

| Field | Type | Note |
|---|---|---|
| session_id | FK meas_session | PK CASCADE |
| plo_id | FK plo | PK |
| pi_count | int | Số PI dưới PLO này được đo trong session |
| pct_achieved | numeric | Roll-up theo PI weighting (xem COMPUTE_GUIDE.md) |
| computed_at | datetime | |

## Compute logic (preview)

```
Per Student per CLO:
  clo_pct(s, c) = sum_{q ∈ Q_c}(score_q × weight_qc / max_q) × 100
                 ─────────────────────────────────────────────
                 sum_{q ∈ Q_c}(weight_qc)

  achieved_clo(s, c) = (clo_pct(s, c) ≥ session.clo_threshold_pct)

Per Session per CLO:
  pct_achieved_clo(c) = | { s : achieved_clo(s, c) } | / n_students × 100

Per Session per PLO:
  pis_for_plo = { pi : pi.plo_id == plo }
  for each pi ∈ pis_for_plo:
    pct_pi = avg over CLO_PI(pi, c, level=A)  of pct_achieved_clo(c)
  pct_plo = avg(pct_pi)  # hoặc weighted, see COMPUTE_GUIDE.md
```

\emph{Cài đặt chi tiết + decision points (e.g., what if 1 CLO không có question đo? roll-up Bloom level matter?) → see `docs/COMPUTE_GUIDE.md`.*

## Naming convention

| Loại | Convention | Ví dụ |
|---|---|---|
| Bảng | snake_case, prefix `meas_` | `meas_session` |
| FK đến cdr-steward | giữ tên gốc, không alias | `course_id`, `clo_id`, `program_id` |
| Enum | UPPERCASE values | `DRAFT`, `EXCELLENT` |
| Boolean | `is_*` hoặc tính từ rõ | `absent`, `is_published` |

## Migration strategy

- Dev: `Base.metadata.create_all()` (giống cdr-steward) — auto-create bảng mới khi boot
- Prod: Alembic migration sau (Phase 2)

## Deletion semantics

- Xoá `Program` (cdr-steward) → CASCADE xuống `Course` → CASCADE xuống `meas_session` (qua FK course_id) → CASCADE meas_question, meas_score, meas_result_*
- Xoá `meas_student` → CASCADE meas_score, meas_session_student
- Xoá `meas_session` riêng → CASCADE tất cả meas_question / meas_score / meas_result_*

## Open questions (cần feedback)

1. **Threshold per CLO hay per session?** Hiện tại default ở session (`clo_threshold_pct=50`). Cần override per CLO không? (e.g., CLO Bloom level CREATE thì threshold cao hơn?)
2. **Roll-up PLO weighting**: simple average qua PI, hay weighted bằng `level` (I/R/M/A) của `CLO_PI`? Hiện tại assume \emph{chỉ dùng CLO ở level A (Assess)}.
3. **Multi-session aggregate**: Course có nhiều session (giữa kỳ + cuối kỳ). Course-level CLO mastery = gì? (weighted avg theo `Assessment.weight_pct`)? — Phase 2.
4. **Cohort vs Class**: hiện gộp làm một (`cohort_code`). Có nên tách Class (lớp học) khỏi Cohort (khoá tuyển sinh) không?
5. **Anonymity**: Báo cáo TT04-2025 có cần anon SV (chỉ giữ mã)? Hay full PII?
