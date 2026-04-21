# MVP-3 — Biểu 04 Drafter Agent

> **Hypothesis:** Given a KĐCLGD criterion + selected evidence, LLM có thể draft Biểu 04 (4 sections: Hiện trạng / Điểm mạnh / Tồn tại / Kế hoạch) với citations chính xác, đạt **edit distance < 30%** so với Hảo's final version.

**Thời gian:** 16 giờ (1 weekend)
**Owner:** Phú (engineering), Hảo (evaluation — chính)
**Prerequisite:** MVP-1 + MVP-2 passed

---

## 1. Tổng quan

### 1.1 Vấn đề cần giải quyết

Biểu 04 là form đánh giá từng tiêu chí trong TĐG. Cấu trúc:

```
Tiêu chí: TC X.Y [Tên]

1. Hiện trạng (Current state)
   - Mô tả tình hình thực tế
   - Trích dẫn minh chứng: [Mã minh chứng H_n.ab.cd.ef]

2. Điểm mạnh (Strengths)
   - Những điều trường làm tốt

3. Tồn tại / Hạn chế (Weaknesses)
   - Những yêu cầu chưa đạt hoặc đạt yếu

4. Kế hoạch hành động (Action plan)
   - Các bước cải thiện cho chu kỳ tiếp theo

Kết luận: ĐẠT / KHÔNG ĐẠT (có lý do)
```

Hiện mỗi criterion mất 1-2 giờ viết tay. 60 tiêu chí × 1.5h = 90 giờ writing. Đa số content lặp lại (mỗi chu kỳ 5 năm viết lại từ đầu).

**Nếu AI draft được 70% content, Hảo chỉ edit → cắt 80% thời gian.**

### 1.2 Giải pháp

Agent:
1. Input: criterion + confirmed evidence (từ MVP-2)
2. Process:
   - Structured prompt với 4-section template
   - Inject criterion requirements, evidence excerpts
   - LLM generates narrative với citations
   - Post-process: validate citations, format
3. Output: Biểu 04 draft + export DOCX

### 1.3 Hypothesis

**H1:** Edit distance (Levenshtein normalized) < 30% giữa AI draft và Hảo's final (trên 5 criteria manually evaluated).

**H2:** Citation accuracy = 100% (zero hallucinated sources).

**H3:** Generation time < 60s per criterion.

---

## 2. Scope

### 2.1 In scope

- Input: 1 criterion + selected evidence (from MVP-2 output)
- Output: Biểu 04 draft với 4 sections + conclusion + citations
- Side-by-side UI: draft vs evidence sources
- Section-by-section regeneration (user can request "rewrite chỉ phần Điểm mạnh")
- DOCX export matching official Biểu 04 template
- Evaluation: Hảo compare AI draft vs his manual draft

### 2.2 Out of scope

- Full Biểu 05 (Tổng hợp báo cáo TĐG — all 60 criteria)
- Multi-language
- Real-time collaboration (multiple users editing)
- Auto-translate citations format between different accreditation bodies (ABET, AUN-QA)
- Version control (basic save current only)

---

## 3. User Stories

### US-1 — Hảo drafts Biểu 04 for 1 criterion
> *Sau khi MVP-2 tìm evidence cho TC 3.1, tôi click "Draft Biểu 04". Agent generate 4-section draft trong 30s. Tôi đọc, edit 20-30%, export DOCX. Toàn bộ trong 15 phút thay vì 2 giờ.*

### US-2 — Hảo regenerates one section
> *Đọc Section "Tồn tại" thấy AI đánh giá quá mềm. Click "Regenerate — more critical". Agent rewrite chỉ section đó.*

### US-3 — Hảo exports 5 Biểu 04 for a workshop
> *Cuối weekend, tôi đã draft 5 Biểu 04 cho 5 criteria. Export batch DOCX để gửi nhóm TĐG review.*

---

## 4. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Load criterion + evidence from MVP-2 | Must |
| FR-002 | Generate 4-section Biểu 04 draft | Must |
| FR-003 | Every claim has citation: [Nguồn: doc_id, trang X] | Must |
| FR-004 | Citation validation: no source outside provided evidence | Must |
| FR-005 | Output: ĐẠT / KHÔNG ĐẠT conclusion với reasoning | Must |
| FR-006 | UI: side-by-side draft + evidence sources | Must |
| FR-007 | Section regeneration: user click → rewrite just that section | Must |
| FR-008 | User edit inline + save | Must |
| FR-009 | DOCX export matching Biểu 04 official template | Must |
| FR-010 | Evaluation: compute edit distance vs Hảo's reference draft | Must |
| FR-011 | Multi-criterion batch draft (5 criteria at once) | Nice |
| FR-012 | Tone knobs: "more academic", "more critical", "more concise" | Nice |
| FR-013 | Few-shot examples library (Hảo's past drafts) | Nice |
| FR-014 | PDF export | Nice |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Edit distance (Hảo vs AI draft) | < 40% (must), < 30% (target) |
| NFR-002 | Citation accuracy (no hallucination) | 100% |
| NFR-003 | Generation time per draft | < 60s |
| NFR-004 | Section regeneration time | < 20s |
| NFR-005 | DOCX export matches template | All 4 sections + conclusion ở đúng vị trí |
| NFR-006 | Cost per draft | < 3000 VND (tốn hơn MVP-1/2 vì generate nhiều tokens) |

---

## 6. System Architecture

### 6.1 Component diagram

```
┌─────────────────────────────────────────────────────┐
│  Streamlit UI                                        │
│  Criterion picker │ Evidence viewer │ Draft editor   │
│  Regenerate btns  │ Export btn                       │
└─────────────────┬──────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  Orchestrator (DraftingAgent)                       │
│                                                      │
│  1. Load criterion + evidence                       │
│  2. Build structured prompt with 4 sections         │
│  3. Call Claude Sonnet (need quality)               │
│  4. Parse response → 4 sections                     │
│  5. Validate citations (no hallucination)           │
│  6. Return Bieu04Draft                              │
└─────────────────┬──────────────────────────────────┘
                  │
      ┌───────────┴──────────────┐
      ▼                          ▼
┌──────────────┐         ┌────────────────┐
│ Claude Sonnet│         │ DOCX Renderer  │
│  (4.6)       │         │ (docxtpl)      │
└──────────────┘         └────────────────┘
```

### 6.2 Why Sonnet not Haiku?

MVP-1/2 dùng Haiku khi có thể. MVP-3 cần Sonnet vì:
- Writing task cần higher quality
- 4-section narrative needs coherence
- Academic Vietnamese nuance
- Citation discipline (Haiku dễ slip up)

Cost impact: ~2-3K VND per draft vs 500 VND. Acceptable for vibe MVP.

### 6.3 Prompt design philosophy

3 nguyên tắc:

1. **Constrain to evidence.** "Chỉ dùng thông tin trong evidence provided. Không guess, không fill gap bằng prior knowledge."

2. **Structured output.** Claude tốt với structured output (JSON với 4 fields). UI parse dễ.

3. **Citation discipline.** Every sentence making claim phải có cite. Hard rule in prompt.

---

## 7. Data Model

### 7.1 Input

```python
class Bieu04Input(BaseModel):
    criterion_id: str
    criterion_name: str
    criterion_requirements: list[str]
    evidence: list[EvidenceMatch]      # From MVP-2, confirmed
    # Optional: Hảo's prior notes or preferences
    context_notes: Optional[str] = None
    tone: Literal["academic", "neutral", "critical"] = "neutral"
    length: Literal["concise", "standard", "detailed"] = "standard"
```

### 7.2 Output

```python
class Section(BaseModel):
    heading: str                       # "1. Hiện trạng" etc.
    content: str                       # Main narrative
    citations: list[str]               # ["doc_id_1", "doc_id_2"]

class Conclusion(BaseModel):
    result: Literal["ĐẠT", "KHÔNG ĐẠT", "ĐẠT VỚI CẢI TIẾN"]
    reasoning: str

class Bieu04Draft(BaseModel):
    criterion_id: str
    sections: dict[Literal["hien_trang", "diem_manh", "ton_tai", "ke_hoach"], Section]
    conclusion: Conclusion
    generation_metadata: dict          # time, cost, model
    citations_used: list[dict]         # {doc_id, used_in_sections}
```

### 7.3 DOCX template

Use `docxtpl` (python-docx-template) với template file:

```
# bieu04_template.docx
{{criterion_id}}: {{criterion_name}}

1. Hiện trạng
{{sections.hien_trang.content}}

2. Điểm mạnh
{{sections.diem_manh.content}}

3. Tồn tại
{{sections.ton_tai.content}}

4. Kế hoạch hành động
{{sections.ke_hoach.content}}

Kết luận: {{conclusion.result}}
Lý do: {{conclusion.reasoning}}
```

---

## 8. Prompt Design

### 8.1 System prompt

```
Bạn là chuyên gia kiểm định chất lượng giáo dục (KĐCLGD) của trường đại học Việt Nam.

Nhiệm vụ: Soạn Biểu 04 đánh giá 1 tiêu chí, gồm 4 phần + kết luận.

Quy tắc NGHIÊM NGẶT:
1. CHỈ dùng thông tin từ evidence được cung cấp. TUYỆT ĐỐI không guess hoặc fill gap bằng thông tin bên ngoài.
2. MỌI câu khẳng định về hiện trạng phải có citation format [Nguồn: doc_id].
3. Nếu không đủ evidence để kết luận, hãy ghi "Chưa đủ minh chứng" - KHÔNG tự bịa.
4. Tiếng Việt học thuật chuẩn. Không dùng tiếng Anh trừ technical terms đã phổ biến.
5. Mỗi section 150-300 từ (concise), 300-500 từ (detailed).

Định dạng output: JSON với 4 sections + conclusion.
```

### 8.2 User prompt template

```
# Tiêu chí
{criterion_id}: {criterion_name}

## Yêu cầu của tiêu chí
{requirements_numbered_list}

## Evidence đã xác minh
{evidence_blocks}
# Each: [doc_id] doc_path — excerpt

## Context (optional)
{context_notes}

## Task
Soạn Biểu 04 cho tiêu chí trên:

1. **Hiện trạng**: Mô tả tình hình thực tế dựa trên evidence, có citations.

2. **Điểm mạnh**: Những điểm trường làm tốt (dựa evidence).

3. **Tồn tại / Hạn chế**: Yêu cầu chưa đạt hoặc đạt chưa đầy đủ.
   Nếu không có evidence cho 1 yêu cầu → ghi vào đây.

4. **Kế hoạch hành động**: Các bước cụ thể để cải thiện trong 2-3 năm tới.
   Kế hoạch phải SMART: Specific, Measurable, Achievable, Relevant, Time-bound.

5. **Kết luận**: ĐẠT / KHÔNG ĐẠT / ĐẠT VỚI CẢI TIẾN + lý do ngắn gọn.

Tone: {tone}
Length: {length}

Output JSON:
{{
  "sections": {{
    "hien_trang": {{"heading": "1. Hiện trạng", "content": "...", "citations": ["doc_id"]}},
    "diem_manh": {{...}},
    "ton_tai": {{...}},
    "ke_hoach": {{...}}
  }},
  "conclusion": {{"result": "ĐẠT", "reasoning": "..."}}
}}
```

### 8.3 Citation validation

```python
def validate_citations(draft: Bieu04Draft, provided_evidence: list[EvidenceMatch]) -> ValidationResult:
    """
    Rule 1: All citations in draft must exist in provided_evidence
    Rule 2: At least 1 citation per section (except kế hoạch)
    Rule 3: No fake doc_ids
    """
    valid_doc_ids = {e.doc_id for e in provided_evidence}
    issues = []

    for section_name, section in draft.sections.items():
        cited_ids = extract_citation_ids(section.content)

        for cited in cited_ids:
            if cited not in valid_doc_ids:
                issues.append(f"Section {section_name}: cited '{cited}' but no such doc in evidence")

        if section_name != "ke_hoach" and len(cited_ids) == 0:
            issues.append(f"Section {section_name}: no citations (required for evidence-based sections)")

    return ValidationResult(valid=len(issues) == 0, issues=issues)
```

Nếu citation invalid → **retry with feedback prompt** (max 2 retries):

```
Your previous draft had citation issues:
{issues}

Please rewrite addressing these issues. Use only evidence with these doc_ids: {valid_ids}
```

---

## 9. Tech Stack (additions from MVP-2)

```
New dependencies:
  docxtpl              # DOCX template rendering
  python-Levenshtein   # Edit distance

Template:
  templates/bieu04_template.docx  # Official biểu 04 format
```

---

## 10. Sprint Plan (16 giờ / weekend)

### Saturday morning (4h) — Drafting core

**9:00-9:30 — Setup**
- Create mvp-03-drafter/ folder
- Reuse schemas from MVP-1/2
- Copy Biểu 04 template DOCX (user provides OR create minimal version)

**9:30-11:30 — Prompts + drafting agent**
- `prompts.py`: system + user templates
- `drafter.py`:
  - `draft(input: Bieu04Input) -> Bieu04Draft`
- Test với 1 criterion + mock evidence manually

**11:30-13:00 — Citation validation**
- `validator.py`:
  - Extract citations regex
  - Check against provided evidence
  - Retry logic if invalid (max 2 retries)

### Saturday afternoon (4h) — UI + DOCX

**14:00-15:30 — Streamlit UI core**
- `app.py`:
  - Criterion picker (reuse from MVP-2)
  - Evidence list (show from MVP-2 output)
  - "Draft" button → spinner → show result
  - 4 sections with headings
  - Inline editable (st.text_area)

**15:30-17:00 — Section regenerate**
- "Regenerate section X" buttons
- Pass section context + user intent ("more critical" / "more concise")
- Update just that section

**17:00-18:00 — DOCX export**
- Create minimal Biểu 04 template DOCX manually
- `exporter.py` using docxtpl
- Test: export → open in Word → looks correct

### Sunday morning (4h) — Evaluation + polish

**9:00-11:00 — Evaluation setup**
- Hảo pre-writes manual Biểu 04 for 3 criteria (pilot set for grading)
- Store as `reference_drafts/*.json`
- `evaluator.py`:
  - Generate AI draft for same 3 criteria
  - Compute edit distance per section
  - Compute citation accuracy
  - Per-section quality rating (Hảo manual)

**11:00-13:00 — First eval run + iterate**
- Run eval
- Analyze where AI differs from Hảo
- Tune prompts (tone, length, structure)

### Sunday afternoon (4h) — Scale test + demo

**14:00-15:30 — 5 criteria full draft**
- Batch draft 5 criteria (using MVP-2 evidence results)
- Hảo reviews each
- Track edit time

**15:30-17:00 — Polish UI**
- Side-by-side view: evidence panel left, draft right
- Citation hover-to-preview
- Section regenerate smooth

**17:00-18:00 — LEARNINGS.md + demo**
- Write learnings
- Prepare 10-min demo: pick TC 3.1 → show full workflow (find evidence → draft → edit → export)

---

## 11. Acceptance Criteria

### Must-pass

- [ ] **AC-1:** Generate 4-section draft from criterion + evidence in < 60s
- [ ] **AC-2:** Citation validation: 100% of citations in draft exist in provided evidence
- [ ] **AC-3:** DOCX export produces valid Word file that matches template
- [ ] **AC-4:** Section regenerate works for any of 4 sections
- [ ] **AC-5:** Edit distance on 3 reference criteria: **< 40%** (must)
- [ ] **AC-6:** Streamlit UI: full workflow (criterion → draft → edit → export)

### Nice-to-pass

- [ ] Edit distance < 30% (target)
- [ ] Batch draft 5 criteria
- [ ] Tone knobs working (academic/neutral/critical)
- [ ] Few-shot examples library

---

## 12. Test Plan

### 12.1 Unit tests

```python
def test_drafter_returns_4_sections()
def test_citation_validator_catches_hallucination()
def test_citation_validator_passes_valid_draft()
def test_docx_export_creates_valid_file()
def test_section_regenerate_updates_only_target()
def test_edit_distance_calculation()
```

### 12.2 Evaluation benchmark

**Hảo reference set:** Pre-write 3 Biểu 04 (manually, high quality) for:
- TC 3.1 (Quy hoạch nhân sự) — easy, lots of evidence
- TC 6.1 (Chính sách đào tạo) — medium
- TC 14.3 (Kết quả kết nối cộng đồng) — hard, sparse evidence

Per criterion:
- Compute edit distance per section
- Count citation errors
- Rate quality 1-5 (Hảo subjective)

**Target:**
- TC 3.1: Edit distance < 30% (should be easier)
- TC 6.1: < 40%
- TC 14.3: < 50% (OK để weaker)

### 12.3 Manual quality checklist

Per draft, Hảo scores:
- [ ] Mô tả hiện trạng đúng (1-5)
- [ ] Điểm mạnh được phát hiện tốt (1-5)
- [ ] Tồn tại identified đầy đủ (1-5)
- [ ] Kế hoạch SMART? (1-5)
- [ ] Tone academic phù hợp (1-5)
- [ ] Citations chính xác (yes/no)
- [ ] Có chỗ AI hallucinate không? (yes/no)

---

## 13. Learning Log

### Q1: Edit distance results
```
Per-criterion edit distance:
  TC 3.1: XX%
  TC 6.1: XX%
  TC 14.3: XX%
Average: XX%
Per-section breakdown:
  Hiện trạng: XX%
  Điểm mạnh: XX%
  Tồn tại: XX%
  Kế hoạch: XX%
```

### Q2: Citation discipline
```
Hallucinated citations: X out of Y drafts
Most common hallucination type: _____
Did retry loop fix issues? _____
```

### Q3: Which section is AI best/worst at?
```
Best: _____
Worst: _____
Why: _____
```

### Q4: How much editing time saved?
```
Manual draft time (Hảo's baseline): X hours per criterion
AI-assisted time (draft + edit): Y hours
Time saved: Z% (target: 60-80%)
```

### Q5: What needs improvement for production?
```
- Prompts: _____
- Template: _____
- Integration with MVPs 1&2: _____
```

---

## 14. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Hallucinated citations | Cao | Rất cao | Citation validator + retry loop. Hard rule trong prompt. |
| Overly generic content | Trung | Cao | Evidence-constrained prompt. Few-shot examples. |
| Vietnamese academic tone wrong | Trung | Trung | Hảo provides 1-2 example drafts in prompt |
| Token limit exceeded (evidence lớn) | Thấp | Trung | Truncate evidence to top-5 quotes only, <500 chars each |
| DOCX template issues | Trung | Thấp | Start với minimal template, enhance later |
| Section regenerate breaks coherence | Trung | Trung | Regenerate pass full context, not just section |

---

## 15. Reference Biểu 04 (Hảo to provide)

Trước khi start weekend, Hảo cần pre-write ≥ 3 Biểu 04 cho 3 criteria khác nhau. Đây là **ground truth** cho evaluation.

Format storage:
```
reference_drafts/
├── TC-3-1-Hao-manual.json
├── TC-6-1-Hao-manual.json
└── TC-14-3-Hao-manual.json
```

Each file = Bieu04Draft schema với content Hảo's manual.

**Thời gian Hảo cần:** 4-6 giờ total (writing 3 Biểu 04 properly). Làm trong tuần trước weekend.

---

## 16. Integration with Full University Quality OS

Sau khi MVP-3 pass, toàn bộ 3 MVP ghép lại thành workflow:

```
User workflow:
1. Upload document → MVP-1 classifier → "this doc is evidence for TC 3.1"
2. Open Biểu 04 for TC 3.1 → MVP-2 finder → show all evidence
3. Click "Draft" → MVP-3 drafter → AI writes draft
4. User edits, approves → export DOCX
5. System tracks: this doc is used in Biểu 04 for TC 3.1

This is the Minimum Viable Product (not prototype) of University Quality OS.
```

Thời gian user saved:
- Manual: 2h (find) + 2h (draft) = 4h per criterion × 60 criteria = 240h
- With MVP (1+2+3): 0.2h (find) + 0.5h (edit AI draft) = 0.7h per criterion × 60 = 42h
- **Saving: 198 hours per TĐG cycle (5 năm 1 lần). 80% reduction.**

---

## 17. Next Steps after MVP-3

### If PASS

**Major decision point:** MVP sequence complete → evaluate overall Quality OS viability.

Action items:
1. Create unified UI combining 3 MVPs (1 Streamlit app, 3 tabs)
2. Demo to Hảo's DAU team (Phòng Khảo thí, Phòng ĐBCL)
3. Demo to Hiệu trưởng DAU as CAIRA proof of concept
4. Update [caira-va-spinout.tex](../caira-va-spinout.tex):
   - Update use case \#1 from "Admissions Agent" → "Quality Management Suite"
   - Refine Q2-Q4 2026 plan
5. Begin real pilot at DAU (not vibe prototype anymore)

### If PIVOT

Scenarios:
- Citations keep hallucinating → need structured generation approach
- Edit distance too high → need better few-shot or domain-specific fine-tune
- Slower than writing manually → users won't adopt → rethink UX

### If STOP

Rare case where AI drafting fundamentally not good enough. Options:
- Pivot to "evidence finder + template" (no auto-draft, just organized evidence)
- Focus Quality OS on MVP-1 + MVP-2 only (evidence management)

---

## 18. References

- [MVP-1 Document Classifier](mvp-01-document-classifier.md)
- [MVP-2 Evidence Finder](mvp-02-evidence-finder.md)
- [MVP Overview](README.md)
- Thông tư /2026/TT-BGDĐT — official Biểu 04 format (in [kiem-dinh-chat-luong/](../../kiem-dinh-chat-luong/))
- [docxtpl documentation](https://docxtpl.readthedocs.io/)
- [python-Levenshtein](https://github.com/maxbachmann/python-Levenshtein)
