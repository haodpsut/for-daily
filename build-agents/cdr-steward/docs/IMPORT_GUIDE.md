# Import Guide — Excel Template

CĐR Steward cho phép nhập toàn bộ dữ liệu CTĐT bằng **1 file Excel duy nhất** thay vì gõ form web.

## Tải template trống

```bash
cd backend
python scripts/gen_import_template.py --program-code 7480201 --out ../../import_templates/CNTT_7480201_template.xlsx
```

File `.xlsx` sinh ra có 11 sheet, với header + 1 dòng ví dụ.

## Cấu trúc 11 sheet

| Sheet | Mục đích | Cần fill bởi |
|-------|---------|--------------|
| **00_Program** | Thông tin chung CTĐT | Trưởng khoa |
| **01_PO** | Mục tiêu đào tạo (PO1..PO6) | Trưởng khoa |
| **02_PLO** | Chuẩn đầu ra (PLO1..PLO9) | Trưởng khoa |
| **03_PI** | Performance Indicator (PI1.1..PI9.3) | Trưởng khoa |
| **04_PLO_PO_matrix** | Ma trận PLO × PO (X mark) | Trưởng khoa |
| **05_PLO_VQF_matrix** | Ma trận PLO × VQF (X mark) | Trưởng khoa |
| **06_Course** | Danh sách 86 học phần | Phụ trách CTĐT |
| **07_CLO** | CLO của từng học phần | GV/Phụ trách HP |
| **08_CLO_PI_matrix** | Ma trận CLO × PI (level I/R/M/A) | GV/Phụ trách HP |
| **09_Assessment** | Cấu phần đánh giá HP | GV |
| **10_WeeklyPlan** | Kế hoạch giảng dạy theo tuần | GV |

## Quy tắc fill

### Sheet 00_Program
| code | name_vn | name_en | level | duration_years | language | decision_no | decision_date |
|------|---------|---------|-------|----------------|----------|-------------|---------------|
| 7480201 | Công nghệ thông tin | Information Technology | DAI_HOC | 4 | Tiếng Việt | 346/QĐ-ĐHKTĐN | 2024-06-25 |

### Sheet 01_PO
| code | text_vn | text_en | order |
|------|---------|---------|-------|
| PO1 | Đào tạo nguồn nhân lực có phẩm chất... | ... | 1 |

### Sheet 02_PLO
| code | text_vn | text_en | order |
|------|---------|---------|-------|
| PLO1 | Áp dụng các kiến thức cơ bản... | ... | 1 |

### Sheet 03_PI
| code | plo_code | text_vn | text_en | order |
|------|----------|---------|---------|-------|
| PI1.1 | PLO1 | Vận dụng các kiến thức nền tảng... | ... | 1 |
| PI1.2 | PLO1 | Áp dụng kiến thức kinh tế... | ... | 2 |

### Sheet 04_PLO_PO_matrix
Hàng = PLO code; cột = PO code; cell = `X` nếu có quan hệ.
| plo_code | PO1 | PO2 | PO3 | PO4 | PO5 | PO6 |
|----------|-----|-----|-----|-----|-----|-----|
| PLO1 | X | | | | | |

### Sheet 06_Course
| code | name_vn | name_en | credits | hours_lt | hours_th | hours_self | prerequisites | knowledge_group | semester_default | language |
|------|---------|---------|---------|----------|----------|------------|---------------|-----------------|------------------|----------|
| MAT101 | Toán cao cấp 1 | Calculus 1 | 3 | 30 | 15 | 90 |  | DAI_CUONG | 1 | Tiếng Việt |

### Sheet 07_CLO
| course_code | clo_code | text_vn | text_en | order |
|-------------|----------|---------|---------|-------|
| MAT101 | CLO1 | Tính được giới hạn... | | 1 |

### Sheet 08_CLO_PI_matrix
| course_code | clo_code | pi_code | level |
|-------------|----------|---------|-------|
| MAT101 | CLO1 | PI1.1 | I |
| MAT101 | CLO2 | PI1.2 | R |

`level ∈ {I, R, M, A}` — Introduce / Reinforce / Master / Assess.

### Sheet 09_Assessment
| course_code | component_name | weight_pct | method | clo_codes |
|-------------|----------------|------------|--------|-----------|
| MAT101 | Tham gia học tập | 10 | Điểm danh | CLO1,CLO2 |
| MAT101 | Kiểm tra giữa kỳ | 30 | Tự luận 60p | CLO1,CLO2 |
| MAT101 | Thi cuối kỳ | 60 | Tự luận 90p | CLO1,CLO2,CLO3 |

### Sheet 10_WeeklyPlan
| course_code | week | topic | content | hours_lt | hours_th | clo_codes |
|-------------|------|-------|---------|----------|----------|-----------|
| MAT101 | 1 | Giới hạn dãy số | ... | 3 | 0 | CLO1 |

## Upload vào hệ thống

```bash
curl -X POST http://localhost:8000/api/import/excel \
  -F "file=@CNTT_7480201_template.xlsx" \
  -F "program_code=7480201"
```

Response:
```json
{
  "imported": {"plo": 9, "pi": 21, "course": 86, "clo": 312, ...},
  "warnings": ["Course MAT101 không có CLO map đến PLO5", ...],
  "errors": []
}
```

## Validation tự động khi import

- Mọi PI phải có `plo_code` tồn tại
- Mọi CLO phải có `course_code` tồn tại
- Cell ma trận chỉ chấp nhận `X` (PLO_PO/PLO_VQF) hoặc `I/R/M/A` (CLO_PI)
- Tổng `weight_pct` mỗi course trong sheet 09_Assessment phải = 100
- Cảnh báo (không block import): PLO chưa có course "M" + course "A"
