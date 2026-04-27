# Data Model — CĐR Steward

> **Status:** Đề xuất v1, chờ review của thầy trước khi viết migration.

## Nguyên tắc thiết kế

1. **PLO là entity gốc duy nhất.** Mọi template DOCX render từ đây, không lưu PLO text trong file.
2. **Versioning ở mức Program.** Mỗi lần đổi PLO/CLO/Course đáng kể → bump `Program.version` + snapshot. Không versioning từng entity con (over-engineering ở MVP).
3. **Không lưu ma trận pre-computed.** Ma trận PLO×PO, CLO×PI, Course×PI được derive từ join tables — luôn nhất quán.
4. **Mã (code) là human-readable.** PLO1, PI1.1, CLO3, K1... — phải giữ đúng convention của Bộ/IUH để output DOCX đọc tự nhiên.

## Sơ đồ ERD (text)

```
                ┌─────────────┐
                │   Program   │ (CTĐT — 7480201)
                │ id, code    │
                │ name, ver   │
                └──┬────┬────┬┘
       ┌──────────┘    │    └────────────┐
       │               │                 │
   ┌───▼───┐       ┌───▼────┐       ┌────▼────┐
   │  PO   │       │  PLO   │       │ Course  │
   │ PO1-6 │       │ PLO1-9 │       │ 86 môn  │
   └───┬───┘       └───┬────┘       └────┬────┘
       │               │                 │
       │           ┌───▼────┐         ┌──▼──┐
       │           │   PI   │         │ CLO │
       │           │PI1.1-9.3       │ │CLO1-n│
       │           └───┬────┘         └──┬──┘
       │               │                 │
       │   ┌───────────┴─────────────────┘
       │   │  (M:N + level I/R/M/A)
       │   │
       │ ┌─▼──────┐         ┌──────────┐
       │ │ CLO_PI │         │   CO     │  ← Mục tiêu HP
       │ └────────┘         └────┬─────┘
       │                         │
   ┌───▼──────┐              ┌───▼────┐
   │ PLO_PO   │              │ CLO_CO │
   └──────────┘              └────────┘

   ┌──────────┐         ┌───────────────┐    ┌───────────┐
   │ VQF_Item │◄───────►│  PLO_VQF      │    │ Assessment│
   │ K/S/A    │         └───────────────┘    │ Component │
   └──────────┘                              └─────┬─────┘
                                                   │
                                            ┌──────▼─────┐
                                            │AssessCLO   │
                                            │ (weight %) │
                                            └────────────┘

   ┌──────────────┐    ┌──────────┐    ┌──────────┐
   │ WeeklyPlan   │    │ Material │    │ Faculty  │
   │ (15 tuần/HP) │    │(học liệu)│    │ (GV CTĐT)│
   └──────┬───────┘    └──────────┘    └──────────┘
          │
   ┌──────▼─────┐
   │WeeklyPlan  │
   │   _CLO     │
   └────────────┘
```

## Bảng chính

### Program (CTĐT)
| field | type | note |
|-------|------|------|
| id | UUID | PK |
| code | str | "7480201" |
| name_vn | str | "Công nghệ thông tin" |
| name_en | str | "Information Technology" |
| level | enum | DAI_HOC / THAC_SI / TIEN_SI |
| duration_years | int | 4 |
| total_credits | int | tính tự động hay nhập tay |
| language | str | "Tiếng Việt" |
| decision_no | str | "346/QĐ-ĐHKTĐN" |
| decision_date | date | 2024-06-25 |
| issuing_authority | str | "Hiệu trưởng Trường ĐH Kiến trúc Đà Nẵng" |
| version | int | bump khi PLO/CLO đổi |
| created_at, updated_at | timestamp | |

### PO (Mục tiêu đào tạo)
| field | type | note |
|-------|------|------|
| id | UUID | PK |
| program_id | FK | |
| code | str | "PO1" |
| text_vn | text | mô tả VN |
| text_en | text | mô tả EN |
| order | int | 1..6 |

### PLO (Chuẩn đầu ra CTĐT)
| field | type | note |
|-------|------|------|
| id | UUID | PK |
| program_id | FK | |
| code | str | "PLO1" |
| text_vn | text | |
| text_en | text | |
| order | int | 1..9 |

### PI (Performance Indicator)
| field | type | note |
|-------|------|------|
| id | UUID | PK |
| plo_id | FK | parent PLO |
| code | str | "PI1.1" |
| text_vn | text | |
| text_en | text | |
| order | int | trong PLO |

### PLO_PO (M:N — ma trận PLO×PO)
| field | type |
|-------|------|
| plo_id | FK |
| po_id | FK |
| (PK = composite) | |

### VQF_Item (Khung trình độ Quốc gia VN, bậc 6 ĐH)
| field | type | note |
|-------|------|------|
| code | str | "K1", "S2", "A3" |
| domain | enum | KNOWLEDGE / SKILL / ATTITUDE |
| text_vn | text | seed sẵn |

### PLO_VQF (M:N)
| plo_id | FK | |
| vqf_item_id | FK | |

### Course (Học phần)
| field | type | note |
|-------|------|------|
| id | UUID | PK |
| program_id | FK | |
| code | str | "MAT101" |
| name_vn, name_en | str | |
| credits | int | |
| hours_lt | int | giờ lý thuyết |
| hours_th | int | giờ thực hành |
| hours_self | int | tự học |
| prerequisites | text | mã các HP trước, comma-sep |
| corequisites | text | song hành |
| knowledge_group | enum | DAI_CUONG / CO_SO / CHUYEN_NGANH / TU_CHON / TOT_NGHIEP |
| is_elective | bool | |
| semester_default | int | HK đề xuất 1..10 |
| language | str | "Tiếng Việt" |
| description | text | mô tả vắn tắt (Mục 3 CT_DECUONG) |

### CO (Course Objective — Mục tiêu HP)
| id, course_id (FK), code "CO1", text_vn, order |

### CLO (Course Learning Outcome — CĐR HP)
| id, course_id (FK), code "CLO1", text_vn, text_en, order |

### CLO_CO (M:N)
| clo_id, co_id |

### CLO_PI (M:N với level)
| clo_id | FK | |
| pi_id | FK | |
| level | enum | I / R / M / A (Introduce/Reinforce/Master/Assess) |

> **Lưu ý:** không có bảng `CLO_PLO` — relationship CLO → PLO derived qua PI.plo_id.

### Assessment (Cấu phần đánh giá HP)
| id, course_id, name "Giữa kỳ", weight (% tổng), method, rubric_json (JSON) |

### Assessment_CLO (M:N + weight)
| assessment_id, clo_id, weight_in_assessment (% trong cấu phần đó) |

### WeeklyPlan
| id, course_id, week (1..15), topic, content, hours_lt, hours_th |

### WeeklyPlan_CLO (M:N)
| weekly_plan_id, clo_id |

### Material (Học liệu)
| id, course_id, type (TEXTBOOK/REFERENCE/ONLINE), citation_text, is_required |

### Faculty (Đội ngũ GV — section 4 CT_MOTA)
| id, program_id, full_name, degree (TS/ThS/CN), field, role, year_of_birth |

## Migration strategy

- Alembic. Initial migration tạo toàn bộ bảng trên.
- Seed bằng `scripts/seed_cntt.py` — đọc CT_CDR.docx của ngành CNTT 7480201 + manual fill cho các trường thiếu.

## Câu hỏi cần thầy chốt trước khi viết migration

1. **Multi-tenant?** MVP chỉ phục vụ 1 trường (DAU) hay đã chuẩn bị structure cho nhiều trường? Nếu nhiều trường → cần thêm bảng `Institution` + `Faculty` (Khoa) làm parent của Program. Đề xuất: thêm ngay từ MVP, ít cost.
2. **Versioning sâu hay nông?** Phương án (A) chỉ snapshot Program version; (B) versioning từng PLO với `effective_from / effective_to`. Đề xuất: (A) ở MVP, (B) khi có khách thứ 2.
3. **Ngôn ngữ:** giữ song ngữ (VN+EN) cho mọi text fields, hay VN only ở MVP? Đề xuất: song ngữ ngay (vì template DAU đã song ngữ).
4. **CO (Mục tiêu HP)** — có thực sự cần entity riêng không, hay merge vào CLO? Theo CT_DECUONG DAU thì có cả CO và CLO riêng biệt, ma trận CLO×CO. Đề xuất: giữ riêng.
