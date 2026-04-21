# MVP-0 — Data Preparation

> **Goal:** Chuẩn bị dataset và môi trường trước khi bắt đầu 3 MVP vibe. Không phải MVP thực sự — là prerequisite.

**Thời gian:** 6-10 giờ (có thể chia 2 buổi tối trong tuần)
**Owner:** Hảo (dataset + labeling) + Phú (env + extraction scripts)

---

## 1. Mục đích

Trước khi bất kỳ MVP nào chạy được, cần:

1. **Extracted text từ ~100 ISO documents** — nếu không, AI không có gì để đọc.
2. **Structured criteria database** — 60 tiêu chí KĐCLGD dạng JSON machine-readable.
3. **Ground truth labels** — 20 documents được Hảo label thủ công để đánh giá accuracy.
4. **ISO process metadata** — 50+ processes dạng structured data.
5. **Environment setup** — Python, API keys, pgvector, Streamlit.

Nếu không có các thứ trên, MVP-1 không thể đo được "70% accuracy" vì không có ground truth.

---

## 2. Deliverables

Sau MVP-0, folder có structure:

```
university-quality-os/
├── data/
│   ├── raw/                          # Original files (gitignored)
│   │   ├── iso/                      # Copy 100 sampled ISO docs
│   │   └── congvan/                  # KĐCLGD reference docs
│   ├── extracted/                    # Plain text + metadata
│   │   ├── iso_texts.jsonl           # 1 line per doc
│   │   └── congvan_texts.jsonl
│   ├── criteria.json                 # 60 KĐCLGD criteria structured
│   ├── iso_processes.json            # 50+ ISO processes structured
│   ├── ground_truth.json             # 20 documents labeled
│   └── README.md
├── scripts/
│   ├── extract_text.py               # PDF/DOCX → plain text
│   ├── build_criteria_json.py        # Parse PHAN-TICH-TONG-THE.md → JSON
│   ├── build_iso_metadata.py         # Scan iso/ folder → JSON
│   └── labeler.py                    # Streamlit app để Hảo label
├── .env.example                      # API key placeholders
├── requirements.txt
├── docker-compose.yml                # Postgres + pgvector
└── README.md
```

---

## 3. Task breakdown (6-10h)

### Task 0.1 — Environment setup (1h)

**Owner:** Phú

```bash
# 1. Python env
cd d:/Locals/git-working/for-daily
mkdir university-quality-os && cd university-quality-os
python -m venv .venv
.venv/Scripts/activate  # Windows

# 2. Install dependencies
pip install \
  anthropic openai \
  pdfplumber python-docx \
  pytesseract Pillow \
  pgvector psycopg2-binary sqlalchemy \
  pydantic pydantic-ai \
  streamlit \
  pandas numpy \
  pytest \
  python-dotenv \
  sentence-transformers

pip freeze > requirements.txt

# 3. .env file
cp .env.example .env
# Hảo điền:
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quality_os

# 4. Docker Postgres + pgvector
docker-compose up -d

# 5. Test
python -c "import anthropic; print('ok')"
```

**.env.example:**
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quality_os
LOG_LEVEL=INFO
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quality_os
    ports: ['5432:5432']
    volumes: [postgres_data:/var/lib/postgresql/data]
volumes:
  postgres_data:
```

**Acceptance:** `python -c "import anthropic, pgvector; print('ok')"` chạy thành công, Postgres với extension pgvector sẵn sàng.

---

### Task 0.2 — Sample 100 ISO documents (30 phút)

**Owner:** Hảo

Không thể extract hết 819 files trong MVP-0. Sample strategically:

**Strategy:**
- Mỗi 11 phòng ban: sample 8-10 docs = ~100 docs tổng
- Ưu tiên: file `QT_*.pdf` (quy trình) và tài liệu trong `Van ban/`
- Bỏ qua: file ảnh (PNG), file zip/rar

**Script:**
```python
# scripts/sample_docs.py
import shutil
from pathlib import Path
import random

SRC = Path("../de-an-thanh-lap-cong-ty/university/iso")
DST = Path("data/raw/iso")
DST.mkdir(parents=True, exist_ok=True)

random.seed(42)
dept_folders = [f for f in SRC.iterdir() if f.is_dir()]

sampled = []
for dept in dept_folders:
    all_pdfs = list(dept.rglob("*.pdf")) + list(dept.rglob("*.docx"))
    # Ưu tiên QT_*.pdf
    qt_files = [f for f in all_pdfs if f.name.startswith("QT") or "QUY TRÌNH" in f.name.upper()]
    other_files = [f for f in all_pdfs if f not in qt_files]
    chosen = qt_files[:5] + random.sample(other_files, min(5, len(other_files)))
    sampled.extend(chosen)
    print(f"{dept.name}: {len(chosen)} docs")

for src in sampled:
    rel = src.relative_to(SRC)
    dst_path = DST / rel.parent / src.name
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst_path)

print(f"Total: {len(sampled)} docs copied to {DST}")
```

**Acceptance:** `data/raw/iso/` có ~100 files từ 11 phòng ban, mỗi phòng có đại diện.

---

### Task 0.3 — Extract text (1.5h)

**Owner:** Phú

**Script:**
```python
# scripts/extract_text.py
import json
from pathlib import Path
import pdfplumber
from docx import Document

SRC = Path("data/raw/iso")
OUT = Path("data/extracted/iso_texts.jsonl")
OUT.parent.mkdir(parents=True, exist_ok=True)

def extract_pdf(path):
    with pdfplumber.open(path) as pdf:
        pages = [p.extract_text() or "" for p in pdf.pages]
        return "\n\n".join(pages), len(pdf.pages)

def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip()), len(doc.paragraphs)

results = []
for f in SRC.rglob("*"):
    if f.suffix.lower() not in {".pdf", ".docx"}: continue
    try:
        if f.suffix.lower() == ".pdf":
            text, npages = extract_pdf(f)
        else:
            text, npages = extract_docx(f)
        rel_path = str(f.relative_to(SRC))
        dept = rel_path.split("/")[0] if "/" in rel_path else rel_path.split("\\")[0]
        process = rel_path.split("/")[1] if "/" in rel_path else ""
        results.append({
            "id": f.stem[:50],
            "path": rel_path,
            "dept": dept,
            "process": process,
            "ext": f.suffix.lower(),
            "npages": npages,
            "text": text,
            "text_len": len(text),
        })
        print(f"✓ {rel_path}: {len(text)} chars, {npages} pages")
    except Exception as e:
        print(f"✗ {f}: {e}")

with open(OUT, "w", encoding="utf-8") as fp:
    for r in results:
        fp.write(json.dumps(r, ensure_ascii=False) + "\n")

print(f"\nExtracted {len(results)} docs → {OUT}")
```

**Known issues:**
- Một số PDF là image-scan → text rỗng. Note lại, skip cho MVP-0 (OCR là separate task).
- DOCX with complex tables có thể mất structure. OK cho vibe.
- Tiếng Việt có dấu: pdfplumber handle OK nếu PDF là text, không ổn nếu scan.

**Expected output:** `data/extracted/iso_texts.jsonl` với ~80-100 records (một số file fail OCR).

**Acceptance:**
- ≥ 80 records extracted
- Trung bình text_len > 1000 chars (nếu < 500, kiểm tra lại)
- Tiếng Việt hiển thị đúng dấu (random check 5 records)

---

### Task 0.4 — Build structured criteria.json (1.5h)

**Owner:** Hảo + Phú

Hảo có sẵn `kiem-dinh-chat-luong/PHAN-TICH-TONG-THE.md` đã phân tích 60 tiêu chí. Convert thành JSON.

**Schema đề xuất:**
```typescript
{
  "version": "TT-2026-BGDDT",
  "source": "Thông tư /2026/TT-BGDĐT",
  "standards": [
    {
      "id": "TC01",
      "name": "Tầm nhìn, sứ mạng, văn hoá và quản trị",
      "group": "A",  // A=Năng lực thể chế, B=Chính sách, C=Kết quả
      "criteria": [
        {
          "id": "TC 1.1",
          "name": "Công bố tầm nhìn, sứ mạng",
          "requirements": [
            "Công bố rõ ràng trên website và các kênh truyền thông",
            "Xây dựng dựa trên phân tích bên liên quan"
          ],
          "evidence_types": [
            "Văn bản chính thức công bố tầm nhìn, sứ mạng",
            "Biên bản họp góp ý với bên liên quan",
            "Website screenshot"
          ],
          "keywords": ["tầm nhìn", "sứ mạng", "mission", "vision"],
          "related_iso_processes": []  // Fill in Task 0.5
        }
      ]
    }
    // ... 15 tiêu chuẩn, 60 tiêu chí
  ]
}
```

**Script helper:**
```python
# scripts/build_criteria_json.py
# Manual parsing vì PHAN-TICH-TONG-THE.md là markdown table
# Dùng pandas.read_clipboard hoặc parse trực tiếp

# Alternative: Hảo input trực tiếp qua Streamlit form (Task 0.7)
```

**Recommended approach:** Viết 1 Python script dùng Claude API để extract từ PHAN-TICH-TONG-THE.md sang JSON:

```python
# scripts/build_criteria_from_md.py
from anthropic import Anthropic
import json

md = open("../../kiem-dinh-chat-luong/PHAN-TICH-TONG-THE.md").read()

prompt = f"""Từ markdown sau, extract 60 tiêu chí KĐCLGD thành JSON.
Schema:
{{"standards": [{{"id": "TC01", "name": "...", "group": "A|B|C",
"criteria": [{{"id": "TC 1.1", "name": "...", "requirements": [...],
"evidence_types": [...], "keywords": [...]}}]}}]}}

Markdown:
{md}

Output JSON only, no markdown wrapping."""

client = Anthropic()
msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8000,
    messages=[{"role": "user", "content": prompt}]
)
result = json.loads(msg.content[0].text)
with open("data/criteria.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
```

**Acceptance:**
- `data/criteria.json` có 15 standards, 60 criteria
- Mỗi criterion có ít nhất 2 requirements + 2 evidence_types + 3 keywords
- Hảo review và fix các chỗ AI extract sai (~20-30% sai là bình thường)

---

### Task 0.5 — Build ISO processes metadata (1h)

**Owner:** Phú

Scan folder ISO → extract metadata mỗi process.

**Schema:**
```typescript
{
  "processes": [
    {
      "id": "KHAO-THI-01",
      "name": "Xây dựng và quản lý ngân hàng câu hỏi thi",
      "department": "KHAO THI",
      "dept_full": "Phòng Khảo thí và Đảm bảo chất lượng",
      "folder_path": "KHAO THI/1. XAY DUNG VA QUAN LY NGAN HANG CAU HOI THI",
      "qt_file": "QT_XAY DUNG VA QUAN LY NGAN HANG CAU HOI THI.pdf",
      "num_templates": 3,  // count .docx in Bieu mau/
      "num_regulations": 1, // count .pdf in Van ban/
      "keywords_from_name": ["ngân hàng câu hỏi", "thi", "khảo thí"]
    }
  ]
}
```

**Script:**
```python
# scripts/build_iso_metadata.py
import json, re
from pathlib import Path

SRC = Path("../de-an-thanh-lap-cong-ty/university/iso")

dept_name_map = {
    "KHAO THI": "Phòng Khảo thí",
    "P.CTSV": "Phòng Công tác Sinh viên",
    "P.DAOTAO": "Phòng Đào tạo",
    "P.HC-TH": "Phòng Hành chính - Tổng hợp",
    "P.HTQT-TT": "Phòng Hợp tác Quốc tế - Truyền thông",
    "P.KH-CN": "Phòng Khoa học Công nghệ",
    "P.QLDA và QTTB": "Phòng Quản lý Dự án và QTTB",
    "P.TCKT": "Phòng Tài chính Kế toán",
    "P.TCNS": "Phòng Tổ chức Nhân sự",
    "P.TTPC": "Phòng Thanh tra Pháp chế",
    "P.Tuyensinh": "Phòng Tuyển sinh",
}

processes = []
for dept_folder in SRC.iterdir():
    if not dept_folder.is_dir(): continue
    dept = dept_folder.name
    for proc_folder in dept_folder.iterdir():
        if not proc_folder.is_dir(): continue
        qt_files = [f for f in proc_folder.glob("*.pdf")
                    if f.name.startswith("QT") or "QUY TRÌNH" in f.name.upper()]
        bieu_mau = list((proc_folder / "Bieu mau").glob("*.docx")) if (proc_folder / "Bieu mau").exists() else []
        van_ban = list((proc_folder / "Van ban").glob("*.pdf")) if (proc_folder / "Van ban").exists() else []

        # Keywords from name
        name = proc_folder.name
        stop = {"quy", "trình", "về", "và", "của", "cho", "các"}
        words = re.findall(r'\b\w+\b', name.lower())
        keywords = [w for w in words if w not in stop and len(w) > 2][:8]

        processes.append({
            "id": f"{dept.replace(' ', '').replace('.', '')}-{len(processes)+1:03d}",
            "name": name,
            "department": dept,
            "dept_full": dept_name_map.get(dept, dept),
            "folder_path": str(proc_folder.relative_to(SRC)),
            "qt_file": qt_files[0].name if qt_files else None,
            "num_templates": len(bieu_mau),
            "num_regulations": len(van_ban),
            "keywords_from_name": keywords,
        })

with open("data/iso_processes.json", "w", encoding="utf-8") as f:
    json.dump({"processes": processes, "total": len(processes)}, f, ensure_ascii=False, indent=2)

print(f"✓ Found {len(processes)} ISO processes across {len(set(p['department'] for p in processes))} departments")
```

**Acceptance:**
- `data/iso_processes.json` có 40-60 processes
- 11 departments represented
- Mỗi process có id, name, folder_path unique

---

### Task 0.6 — Link criteria ↔ ISO processes (30 phút)

**Owner:** Hảo (domain knowledge)

Đây là link mà AI sẽ học từ — nếu không có, AI phải guess từ zero.

**Format:** Bổ sung trường `related_iso_processes` vào mỗi criterion.

**Script giúp:**
```python
# scripts/link_criteria_processes.py
import json
from anthropic import Anthropic

criteria = json.load(open("data/criteria.json"))
processes = json.load(open("data/iso_processes.json"))

prompt = """Cho 60 tiêu chí KĐCLGD và 50+ ISO processes của trường ĐH.
Với mỗi tiêu chí, liệt kê các ISO processes có thể liên quan (cung cấp minh chứng).
Ví dụ:
- TC 3.1 "Quy hoạch và tuyển dụng nhân sự" → P.TCNS-001 "Quy trình tuyển dụng nhân viên"
- TC 6.1 "Chính sách đào tạo" → P.DAOTAO-*

CRITERIA: {criteria}
PROCESSES: {processes}

Output JSON: {{"mappings": [{{"criterion_id": "TC 3.1", "process_ids": ["...", "..."]}}]}}"""

# ... call Claude, parse, merge into criteria.json
```

Hảo review output và fix sai. **Target:** mỗi criterion có 1-5 related processes.

**Acceptance:** `criteria.json` updated với `related_iso_processes` field cho 60 tiêu chí.

---

### Task 0.7 — Ground truth labeling (2-3h, Hảo làm)

**Owner:** Hảo

Đây là công đoạn \emph{tốn thời gian nhất và quan trọng nhất}. Không có nó → không đo được MVP-1 accuracy.

**Quy trình:**
1. Chạy Streamlit labeler app (script dưới)
2. App show 1 document tại a time
3. Hảo chọn:
   - ISO process phù hợp (từ dropdown 50+ options, multi-select)
   - KĐCLGD criteria phù hợp (từ 60 options, multi-select)
   - CĐR relevance (tùy chọn)
4. Ghi chú tại sao (optional)
5. Repeat 20 lần

**Streamlit app:**
```python
# scripts/labeler.py
import streamlit as st
import json
from pathlib import Path

st.title("Ground Truth Labeler")

# Load data
docs = [json.loads(l) for l in open("data/extracted/iso_texts.jsonl")]
criteria = json.load(open("data/criteria.json"))
processes = json.load(open("data/iso_processes.json"))

# Flatten options
all_criteria = [(c["id"], c["name"]) for s in criteria["standards"] for c in s["criteria"]]
all_processes = [(p["id"], p["name"]) for p in processes["processes"]]

# Progress
labeled_file = Path("data/ground_truth.json")
if labeled_file.exists():
    labeled = json.load(open(labeled_file))
else:
    labeled = {"labels": []}

already_labeled = {l["doc_id"] for l in labeled["labels"]}
to_label = [d for d in docs if d["id"] not in already_labeled]

st.sidebar.metric("Labeled", len(labeled["labels"]))
st.sidebar.metric("Remaining", len(to_label))
st.sidebar.metric("Target", 20)

if not to_label:
    st.success("Done 🎉")
    st.stop()

# Pick random or next
doc = to_label[0]

# Show doc
st.header(doc["path"])
st.caption(f"Dept: {doc['dept']} | Pages: {doc['npages']} | Length: {doc['text_len']} chars")

with st.expander("Preview text (first 2000 chars)"):
    st.text(doc["text"][:2000])

# Labels
st.subheader("ISO process (chọn 1-3)")
proc_options = st.multiselect(
    "Process", options=all_processes, format_func=lambda x: f"{x[0]} — {x[1]}",
    max_selections=3
)

st.subheader("KĐCLGD criteria (chọn 1-10)")
crit_options = st.multiselect(
    "Criteria", options=all_criteria, format_func=lambda x: f"{x[0]} — {x[1]}",
    max_selections=10
)

st.subheader("Ghi chú")
notes = st.text_area("Lý do / gợi ý cho AI", height=100)

if st.button("Save label", type="primary"):
    labeled["labels"].append({
        "doc_id": doc["id"],
        "doc_path": doc["path"],
        "iso_processes": [p[0] for p in proc_options],
        "kdclgd_criteria": [c[0] for c in crit_options],
        "notes": notes,
    })
    with open(labeled_file, "w", encoding="utf-8") as f:
        json.dump(labeled, f, ensure_ascii=False, indent=2)
    st.rerun()
```

**Run:** `streamlit run scripts/labeler.py`

**Strategy để label 20 docs trong 2-3h:**
- 10 docs từ processes Hảo thân quen nhất (DAOTAO, CTSV, Khảo thí)
- 5 docs từ KH-CN, TCNS
- 5 docs từ ngẫu nhiên các phòng khác

**Tiêu chí label đúng:**
- Nếu không chắc: bỏ qua doc, lấy doc khác (quality > quantity)
- Mục tiêu: labels \emph{chính xác}, không phải \emph{nhiều}. 15 labels đúng > 30 labels sai.

**Acceptance:**
- ≥ 20 docs labeled (ideal 25)
- Mỗi doc có ≥ 1 ISO process + ≥ 1 KĐCLGD criterion
- Phân bố labeled docs across ≥ 7 departments
- Notes rõ ràng cho docs khó

---

### Task 0.8 — Smoke test với Claude API (30 phút)

**Owner:** Phú

Trước khi bắt đầu MVP-1, verify rằng Claude API + local data pipeline hoạt động.

```python
# scripts/smoke_test.py
import json
from anthropic import Anthropic

client = Anthropic()
docs = [json.loads(l) for l in open("data/extracted/iso_texts.jsonl")]
criteria = json.load(open("data/criteria.json"))

# Pick 1 doc
doc = docs[0]
criterion_names = [c["name"] for s in criteria["standards"] for c in s["criteria"]][:10]

prompt = f"""Document (ngắn gọn): {doc['text'][:1500]}

Trong 10 tiêu chí KĐCLGD sau, doc này có thể là minh chứng cho tiêu chí nào?
{chr(10).join(f"- {n}" for n in criterion_names)}

Trả lời ngắn: chỉ nêu tên tiêu chí (nếu có) + lý do 1 câu."""

msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=500,
    messages=[{"role": "user", "content": prompt}]
)
print("INPUT DOC:", doc["path"])
print("\nCLAUDE RESPONSE:")
print(msg.content[0].text)
print("\nTokens used:", msg.usage)
```

**Acceptance:** Claude trả lời hợp lý (có thể không chính xác, nhưng hợp lý). Tokens used < 3000. No error.

---

## 4. Definition of Done cho MVP-0

- [ ] Environment sẵn sàng (Task 0.1)
- [ ] 100 ISO docs sampled (Task 0.2)
- [ ] ≥ 80 docs có text extracted (Task 0.3)
- [ ] `criteria.json` có 60 tiêu chí structured (Task 0.4)
- [ ] `iso_processes.json` có 40+ processes (Task 0.5)
- [ ] Criteria ↔ processes linked (Task 0.6)
- [ ] ≥ 20 docs labeled ground truth (Task 0.7)
- [ ] Smoke test Claude API pass (Task 0.8)

**Tổng thời gian ước:** 6-10 giờ, có thể làm trong 2-3 buổi tối trong tuần trước weekend 1.

---

## 5. Rủi ro thường gặp

| Rủi ro | Likelihood | Mitigation |
|---|---|---|
| PDF scan không extract được text | Cao (30-40% docs fail) | Skip fail docs ở MVP-0, OCR là task riêng sau |
| Tiếng Việt bị mất dấu sau extract | Trung | Verify 5 random records sau extract, dùng pdfplumber (không PyPDF2) |
| Hảo label không đủ 20 docs vì thiếu thời gian | Trung-Cao | Timebox 2.5h cho Task 0.7, min 15 docs là OK |
| Claude API không có quota / API key fail | Thấp | Kiểm tra account trước khi bắt đầu, backup OpenAI API |
| pgvector install fail trên Windows | Thấp-Trung | Dùng Docker image pgvector/pgvector:pg16 thay vì build local |

---

## 6. Handoff

Khi MVP-0 done, output files sau sẵn sàng cho MVP-1:

```
data/
├── extracted/iso_texts.jsonl        # ~80-100 docs với text
├── criteria.json                     # 60 tiêu chí structured
├── iso_processes.json                # 40+ processes
└── ground_truth.json                 # 20+ labeled docs (test set)
```

**Mở:** [mvp-01-document-classifier.md](mvp-01-document-classifier.md)
