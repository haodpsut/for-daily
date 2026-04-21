# MVP-1 — Document Classifier Agent

> **Hypothesis:** Given an ISO document, LLM + RAG có thể phân loại đúng (a) ISO process nào, (b) KĐCLGD tiêu chí nào, với top-1 accuracy ≥ 70%.

**Thời gian:** 16 giờ thật (1 weekend)
**Owner:** Phú (engineering), Hảo (evaluation)
**Prerequisite:** MVP-0 done

---

## 1. Tổng quan

### 1.1 Vấn đề cần giải quyết

Trường ĐH có hàng ngàn document (quyết định, biên bản, báo cáo, biểu mẫu điền). Khi chuẩn bị TĐG KĐCLGD, phải biết:

- Doc này thuộc ISO process nào (để tra cứu khi cần)?
- Doc này là minh chứng cho tiêu chí KĐCLGD nào (để gắn vào Biểu 04)?

Hiện tại làm thủ công bởi nhóm TĐG → tốn 2-3 tháng chỉ để \emph{phân loại}, chưa làm gì khác.

### 1.2 Giải pháp

Agent tự động:
1. Đọc document (PDF/DOCX)
2. Trả về top-3 ISO processes + top-5 KĐCLGD criteria với confidence score + reasoning

### 1.3 Hypothesis cụ thể đang test

**H1:** Claude với structured prompt + criteria metadata có thể classify ISO process top-1 ≥ 70%.

**H2:** Với multi-label KĐCLGD criteria, recall@5 ≥ 80% (trong top-5 phải có ≥ 80% các criteria thật).

**H3:** Latency per document < 15 giây, cost < 1000 VND per classification.

**Nếu 2/3 hypothesis pass → tiến MVP-2. Nếu chỉ 1/3 → rethink architecture.**

---

## 2. Scope

### 2.1 In scope

- Input: 1 document (PDF text-based hoặc DOCX)
- Output: ISO process classifications + KĐCLGD criteria classifications
- Vietnamese content
- Streamlit UI for demo
- Evaluation harness với ground truth

### 2.2 Out of scope

- Image-only PDF (OCR là task riêng)
- Excel/XLSX files
- Multi-doc batch processing (sẽ batch trong evaluation, nhưng UI là single-doc)
- Production-grade UI (auth, multi-user, real-time sync)
- CĐR/PLO/CLO classification (có thể thử nếu có thời gian, không bắt buộc)
- Confidence calibration (dùng score thô từ LLM)

---

## 3. User Stories

### US-1 — Quality officer uploads a document
> *Là cán bộ Phòng Khảo thí, tôi muốn upload 1 quyết định vừa ban hành, để hệ thống tự động gắn nó vào ISO process và KĐCLGD criteria phù hợp, để tôi không phải label thủ công.*

### US-2 — QA lead bulk-classifies backlog
> *Là trưởng nhóm TĐG, tôi muốn chạy classifier trên 500 docs tồn đọng, để có bước đầu phân loại, tôi chỉ cần review và fix.*

(*US-2 là bonus trong MVP này — ưu tiên US-1.*)

### US-3 — Hảo evaluates accuracy
> *Là product lead, tôi muốn xem báo cáo accuracy trên test set 20 docs, để quyết định MVP có đáng tiến lên full product.*

---

## 4. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Upload file (PDF hoặc DOCX) qua Streamlit UI | Must |
| FR-002 | Extract text từ file (reuse code MVP-0) | Must |
| FR-003 | Classify ISO process — trả top-3 với confidence 0-1 và reasoning 1 câu | Must |
| FR-004 | Classify KĐCLGD criteria — trả top-5 với confidence và reasoning | Must |
| FR-005 | Hiển thị kết quả ở UI với expand/collapse cho reasoning | Must |
| FR-006 | Cho phép Hảo mark "correct/incorrect" → save vào log | Must |
| FR-007 | CLI script để chạy batch evaluation trên ground truth | Must |
| FR-008 | Evaluation report: precision@1, precision@3, recall@5, avg latency, avg cost | Must |
| FR-009 | Classify CĐR/PLO relevance (bonus) | Nice-to-have |
| FR-010 | Caching: same doc → cache result (không gọi LLM lại) | Nice-to-have |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | ISO process top-1 accuracy | ≥ 70% trên test set 20 docs |
| NFR-002 | ISO process top-3 accuracy | ≥ 85% |
| NFR-003 | KĐCLGD criteria recall@5 | ≥ 80% |
| NFR-004 | Latency per document (sau extract) | P95 < 15s |
| NFR-005 | Cost per classification | < 1000 VND (~0.04 USD) |
| NFR-006 | System chạy trên laptop local | 16GB RAM, no GPU cần thiết |
| NFR-007 | Codebase ≤ 800 LoC Python | Simplicity first |

---

## 6. System Architecture

### 6.1 Component diagram

```
┌────────────────────────────────────────────────────────────┐
│                    Streamlit UI                             │
│   Upload  │  Result view  │  Evaluation tab                 │
└─────────────────────┬──────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│ Text Extractor  │      │ Evaluator       │
│ (pdfplumber,    │      │ (runs batch     │
│  python-docx)   │      │  on test set)   │
└────────┬────────┘      └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        ClassifierAgent                   │
│                                          │
│  1. Truncate text if > 20K chars        │
│  2. Build RAG context                   │
│     - Retrieve top-10 related criteria   │
│     - Retrieve top-10 related processes  │
│  3. Call Claude with structured prompt   │
│  4. Parse JSON response                  │
│  5. Log to evaluation DB                 │
└──────┬───────────────────────┬──────────┘
       │                       │
       ▼                       ▼
┌─────────────┐          ┌──────────────────┐
│ Claude API  │          │ criteria.json    │
│ (Sonnet/    │          │ processes.json   │
│  Haiku)     │          │ (in-memory)      │
└─────────────┘          └──────────────────┘
```

### 6.2 Data flow

```
User uploads doc
  → extract_text() → raw_text (string)
  → truncate if needed → input_text
  → build_rag_context(input_text, criteria, processes) → context
  → call_classifier(input_text, context) → LLM response
  → parse_classification(response) → structured result
  → save_to_log(doc_id, result)
  → display in UI
```

### 6.3 RAG approach

Không embed toàn bộ corpus (chưa cần). Cách đơn giản hơn:

1. **Keyword retrieval:**
   - Extract top keywords từ doc (LLM hoặc TF-IDF)
   - Filter criteria/processes có keyword match
   - Shortlist 10-20 candidates

2. **Include shortlist in prompt:**
   - LLM chọn best match từ shortlist
   - Rationale: ít tokens hơn so với dump all 60 criteria

**Alternative (nếu RAG keyword không đủ):** Dùng embedding similarity sau. Embed criteria 1 lần, embed doc query, top-k. Nhưng bắt đầu với keyword simple.

---

## 7. Data Model

### 7.1 Input

```python
class DocumentInput(BaseModel):
    file_path: str
    file_type: Literal["pdf", "docx"]
    # Or direct text
    text: Optional[str] = None
    doc_id: Optional[str] = None
```

### 7.2 Output

```python
class Classification(BaseModel):
    id: str                    # "KHAOTHI-001" hoặc "TC 3.1"
    name: str
    confidence: float          # 0.0 to 1.0
    reasoning: str             # 1-2 câu giải thích

class ClassificationResult(BaseModel):
    doc_id: str
    doc_excerpt: str           # First 500 chars
    iso_processes: list[Classification]  # Top-3
    kdclgd_criteria: list[Classification]  # Top-5
    cdr_relevance: Optional[list[Classification]]  # Optional top-3
    latency_ms: int
    tokens_used: dict          # {"input": N, "output": M}
    cost_vnd: float
    model_used: str            # "claude-sonnet-4-6"
    timestamp: datetime
```

### 7.3 Log schema (SQLite or JSON)

```sql
CREATE TABLE classifications (
    id INTEGER PRIMARY KEY,
    doc_id TEXT,
    doc_path TEXT,
    result_json TEXT,
    latency_ms INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost_vnd REAL,
    user_feedback TEXT,       -- "correct" / "incorrect" / "partial"
    user_notes TEXT,
    created_at TIMESTAMP
);
```

---

## 8. Prompt Design

### 8.1 System prompt

```
Bạn là chuyên gia phân loại tài liệu cho hệ thống kiểm định chất lượng giáo dục (KĐCLGD) của trường đại học Việt Nam.

Nhiệm vụ: Cho 1 document, xác định:
1. ISO process (quy trình ISO) nào nó thuộc về (từ danh sách cho trước).
2. Tiêu chí KĐCLGD nào nó có thể là minh chứng cho (từ 60 tiêu chí cho trước).

Quy tắc:
- Dựa vào nội dung document, không đoán dựa trên tên file.
- Nếu không chắc, confidence < 0.5.
- Multi-label cho phép: 1 doc có thể là evidence cho nhiều criteria.
- Reasoning phải cụ thể, trích dẫn từ text nếu có.
- Output: JSON strict, không markdown wrapping.

Định dạng output:
{
  "iso_processes": [
    {"id": "...", "name": "...", "confidence": 0.9, "reasoning": "..."}
  ],
  "kdclgd_criteria": [
    {"id": "TC X.Y", "name": "...", "confidence": 0.8, "reasoning": "..."}
  ]
}
```

### 8.2 User prompt template

```
# Document to classify

Filename: {filename}
Department: {dept}
Length: {text_len} chars, {npages} pages

## Content (first {max_chars} chars)
{text_truncated}

# ISO process candidates (shortlist từ keyword matching)
{iso_processes_shortlist}   # List of {id, name, description}

# KĐCLGD criteria candidates (shortlist)
{kdclgd_criteria_shortlist}  # List of {id, name, requirements, evidence_types}

# Task
Phân loại document trên:
- Top-3 ISO processes với confidence và reasoning.
- Top-5 KĐCLGD criteria (multi-label) với confidence và reasoning.

Trả về JSON theo schema đã định nghĩa.
```

### 8.3 Text truncation strategy

Maximum ~20K characters input (~5K tokens Vietnamese).

```python
def truncate_text(text: str, max_chars: int = 20000) -> str:
    if len(text) <= max_chars:
        return text
    # Strategy: keep beginning (title, overview) + middle sample + ending (conclusion)
    head = text[:max_chars // 2]
    tail = text[-(max_chars // 4):]
    return f"{head}\n\n[... truncated ...]\n\n{tail}"
```

---

## 9. Tech Stack

```
Language:       Python 3.12+
LLM:            Claude Sonnet 4.6 (primary), Haiku 4.5 (fallback for cost)
Extraction:     pdfplumber, python-docx
UI:             Streamlit 1.30+
Data:           criteria.json, iso_processes.json, ground_truth.json (from MVP-0)
Logging:        SQLite (local file) via sqlalchemy
Config:         python-dotenv
Testing:        pytest
```

**Files:**
```
mvp-01-classifier/
├── SRS.md                        # This file
├── code/
│   ├── app.py                    # Streamlit UI
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── classifier.py         # Core agent logic
│   │   ├── rag.py                # Keyword + embedding retrieval
│   │   ├── prompts.py            # System + user prompts
│   │   └── schemas.py            # Pydantic models
│   ├── extraction/
│   │   └── text_extractor.py     # Reuse from MVP-0
│   ├── evaluation/
│   │   ├── evaluator.py          # Batch run on ground truth
│   │   └── metrics.py            # Precision, recall, F1
│   ├── db/
│   │   ├── models.py             # SQLAlchemy models
│   │   └── migrations.py
│   ├── config.py                 # Env + settings
│   └── utils.py
├── tests/
│   ├── test_classifier.py
│   ├── test_rag.py
│   └── test_evaluator.py
├── requirements.txt
├── .env.example
└── LEARNINGS.md                  # Fill after sprint
```

---

## 10. Sprint Plan (16 giờ / 1 weekend)

### Saturday morning (4h) — Core agent

**9:00-9:30 — Warmup**
- Review MVP-0 output
- Git init, copy from starter template
- Create directory structure

**9:30-11:00 — Schemas & prompts**
- Implement `schemas.py` (Pydantic models)
- Write `prompts.py` (system + user templates)
- Test prompts with 1 doc manually (copy-paste to Claude console)

**11:00-13:00 — Core classifier**
- Implement `classifier.py`:
  - `__init__(criteria, processes)`
  - `classify(doc_text, metadata) -> ClassificationResult`
- Implement `rag.py` keyword shortlisting
- Test on 3 docs, verify output JSON parses

### Saturday afternoon (4h) — Integration

**14:00-15:30 — Extraction integration**
- Wire text_extractor from MVP-0
- Handle edge cases (empty text, garbled Vietnamese, very short docs)
- Test end-to-end: file path → classification result

**15:30-17:00 — Streamlit UI**
- `app.py` with 3 tabs: Upload | Results | Evaluation
- Upload tab: file input → "Classify" button → spinner → results
- Results tab: nice display with expandable reasoning
- "Correct / Incorrect" feedback buttons

**17:00-18:00 — Logging & Database**
- SQLite log setup
- Every classification logged automatically
- View log in Evaluation tab

### Sunday morning (4h) — Evaluation

**9:00-11:00 — Evaluator**
- `evaluator.py`:
  - Load ground_truth.json
  - Run classifier on each labeled doc
  - Compute metrics
- `metrics.py`:
  - Precision@1, Precision@3, Recall@5
  - F1 for multi-label KĐCLGD
  - Per-department breakdown
  - Confusion matrix (misclassifications)

**11:00-13:00 — First evaluation run**
- Run evaluator on 20 ground truth docs
- Analyze failures
- Note patterns: which dept hard, which criteria confused

### Sunday afternoon (4h) — Iterate

**14:00-15:30 — Prompt tuning**
- Based on failure analysis, update prompts
- Maybe: add examples in prompt (few-shot)
- Re-run evaluation

**15:30-17:00 — Fallback to Haiku**
- Implement model switching
- Run same evaluation with Haiku (10x cheaper)
- Compare accuracy gap

**17:00-18:00 — Polish & demo**
- Clean up UI
- Write LEARNINGS.md
- Prepare 5-minute demo script cho Hảo Monday

---

## 11. Acceptance Criteria

### Must-pass (block progression to MVP-2 if fail)

- [ ] **AC-1:** Classifier chạy end-to-end: file → classification result
- [ ] **AC-2:** Streamlit UI working: upload → classify → display
- [ ] **AC-3:** Evaluation trên 20 ground truth docs: **ISO process top-1 ≥ 60%** (relaxed from target 70% — nếu 60-69% là OK, iterate sau)
- [ ] **AC-4:** KĐCLGD criteria recall@5 ≥ 70%
- [ ] **AC-5:** Latency P95 < 15s
- [ ] **AC-6:** Cost per classification < 1500 VND (relaxed)
- [ ] **AC-7:** Evaluation report generated (JSON + markdown)

### Nice-to-pass

- [ ] ISO process top-1 ≥ 70% (target)
- [ ] KĐCLGD criteria recall@5 ≥ 80% (target)
- [ ] Haiku version chạy được với accuracy drop < 15%
- [ ] CĐR relevance classification implemented
- [ ] Cache system working

### Learning output

- [ ] LEARNINGS.md viết đầy đủ 5 câu hỏi (section 13)
- [ ] Demo 5 phút prepared cho Hảo review
- [ ] Decision rõ ràng: go MVP-2 or pivot

---

## 12. Test Plan

### 12.1 Unit tests

```python
# tests/test_classifier.py
def test_classifier_returns_valid_schema():
    # Given sample doc, result must match ClassificationResult schema

def test_classifier_handles_empty_text():
    # Empty input → graceful degradation, confidence=0

def test_classifier_handles_truncation():
    # Very long text → truncated, still works

def test_classifier_parses_json_correctly():
    # LLM response with markdown wrapping still parses

# tests/test_rag.py
def test_keyword_shortlist_returns_relevant_criteria():
    # Doc about "tuyển dụng" → shortlist includes TC 3.1, P.TCNS-*

def test_shortlist_limits_size():
    # Shortlist always ≤ 10 criteria + ≤ 10 processes
```

### 12.2 Integration tests

```python
# tests/test_integration.py
def test_pdf_end_to_end():
    # PDF → extract → classify → result ok

def test_docx_end_to_end():
    # DOCX → extract → classify → result ok

def test_evaluator_on_small_sample():
    # 3 ground truth docs → metrics computed correctly
```

### 12.3 Manual/UI test

```
- [ ] Upload PDF: kết quả hiển thị đúng
- [ ] Upload DOCX: kết quả hiển thị đúng
- [ ] Upload non-Vietnamese file: graceful degradation
- [ ] Click "Correct" on a classification: saves to DB
- [ ] Run evaluation: all 20 docs processed, report displayed
- [ ] Network error simulation: error message friendly
```

---

## 13. Learning Log (fill after weekend)

After sprint, fill `LEARNINGS.md` with these 5 questions:

### Q1: Did hypothesis H1-H3 pass? Show data.
```
H1 (ISO top-1 ≥ 70%): [ACHIEVED / MISSED] — actual: XX%
H2 (KĐCLGD recall@5 ≥ 80%): [ACHIEVED / MISSED] — actual: XX%
H3 (Latency < 15s, cost < 1000 VND): [ACHIEVED / MISSED]
```

### Q2: Where did AI fail most?
```
- Department with worst accuracy: _____
- Criteria most confused: _____
- Common failure patterns: _____
```

### Q3: What worked surprisingly well?
```
- _____
- _____
```

### Q4: What needs rethinking for MVP-2?
```
- Retrieval approach: _____
- Prompt strategy: _____
- Data needs: _____
```

### Q5: Go/No-go for MVP-2?
```
Decision: [GO / PIVOT / STOP]
Reasoning: _____
```

---

## 14. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Claude response không đúng schema JSON | Trung | Trung | Use structured output (tool use) hoặc validate + retry |
| Ground truth labels sai / không nhất quán | Trung | Cao | Hảo review lại labels khi thấy pattern lạ |
| Tiếng Việt embeddings kém | Thấp | Trung | Keyword approach đã mitigate; thử multilingual-e5 nếu cần |
| Context window overflow (doc dài) | Trung | Thấp | Truncation strategy ở section 8.3 |
| Cost blowup nếu test nhiều | Thấp | Thấp | Haiku fallback, cache results |
| Phú bị block vào thứ 7 | Trung-Cao | Cao | Hảo chuẩn bị trước helper scripts, Phú chỉ integrate |

---

## 15. Next steps after MVP-1

### If PASS

→ Mở [mvp-02-evidence-finder.md](mvp-02-evidence-finder.md).

Reuse in MVP-2:
- `schemas.py` (extend with EvidenceResult)
- `rag.py` (upgrade to embedding-based)
- `extraction/` (unchanged)
- Evaluation harness pattern
- SQLite logging

### If PIVOT (partial pass)

3 scenarios:

**Scenario A: ISO good, KĐCLGD bad (< 60% recall@5)**
- Pivot: KĐCLGD cần dataset lớn hơn, fine-tune approach
- Continue với MVP-2 nhưng tập trung retrieval thay vì classification

**Scenario B: ISO bad (< 50% top-1), KĐCLGD OK**
- Pivot: ISO classification có thể cần hybrid rule-based (keyword + department)
- Add manual mapping layer

**Scenario C: Tất cả kém**
- Pivot: Có thể domain quá phức tạp cho pure LLM approach
- Consider: collect more labeled data + fine-tune small model
- Delay MVP-2 by 1 week

### If STOP

Fail catastrophic (top-1 < 40%, recall@5 < 50%) rất hiếm. Nếu xảy ra:
- Analyze: có phải data quality issue không (PDFs scan, text garbled)?
- Re-evaluate: liệu AI có đủ khả năng cho bài toán này không?
- Xem xét: approach khác cho University Quality OS (không phải classifier)

---

## 16. Glossary

- **ISO process:** Quy trình chuẩn của trường theo ISO, có văn bản quy định rõ.
- **KĐCLGD:** Kiểm định chất lượng giáo dục.
- **Tiêu chí (criterion):** Một trong 60 tiêu chí đánh giá theo TT 2026.
- **Minh chứng (evidence):** Tài liệu chứng minh cho 1 tiêu chí.
- **Biểu 04:** Form đánh giá từng tiêu chí trong quy trình TĐG.
- **TĐG:** Tự đánh giá (self-assessment).
- **Top-1 accuracy:** Classifier dự đoán top-1 đúng so với ground truth.
- **Recall@5:** % ground truth labels nằm trong top-5 predictions.
- **Confidence score:** 0-1, LLM-reported độ tự tin (not calibrated).

---

## 17. References

- [MVP-0 Data Preparation](mvp-00-data-prep.md)
- [MVP Overview](README.md)
- [PHAN-TICH-TONG-THE.md](../../kiem-dinh-chat-luong/PHAN-TICH-TONG-THE.md) — 60 tiêu chí analysis
- [Anthropic Claude API docs](https://docs.anthropic.com)
- [pdfplumber docs](https://github.com/jsvine/pdfplumber)
