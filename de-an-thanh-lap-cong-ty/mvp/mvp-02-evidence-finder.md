# MVP-2 — Evidence Finder Agent

> **Hypothesis:** Given a KĐCLGD criterion, semantic search + LLM reranking can surface right evidence documents with **Precision@5 ≥ 80%** across a corpus of 100+ indexed ISO documents.

**Thời gian:** 16 giờ (1 weekend)
**Owner:** Phú (engineering), Hảo (evaluation)
**Prerequisite:** MVP-1 pass; MVP-0 data

---

## 1. Tổng quan

### 1.1 Vấn đề cần giải quyết

Ngược lại MVP-1 (doc → criterion). Bây giờ:

- Khi viết Biểu 04 cho 1 tiêu chí, nhóm TĐG phải đi tìm minh chứng.
- Hiện: mở folder này, folder kia, Excel tracking, Google Drive... tốn 1-2h/tiêu chí.
- 60 tiêu chí × 1.5h = 90h chỉ để \emph{tìm file}.

**Nếu agent tìm được evidence với recall tốt → cắt giảm 80% thời gian tìm kiếm.**

### 1.2 Giải pháp

Agent:
1. Input: KĐCLGD criterion ID (e.g., "TC 3.1") hoặc free-text query
2. Process:
   - Retrieve top-20 candidate documents từ corpus
   - LLM rerank → top-5 most relevant
   - Extract relevant excerpts (quotes)
   - Analyze coverage: mỗi "yêu cầu" trong criterion được cover bởi evidence nào
3. Output: top-5 docs + quotes + coverage map + gap analysis

### 1.3 Hypothesis

**H1:** Hybrid retrieval (semantic + keyword) + LLM rerank cho **Precision@5 ≥ 80%**.

**H2:** Coverage analysis identify được ≥ 70% "yêu cầu" có evidence trong corpus (nếu có).

**H3:** Latency per query < 8 giây, cost < 500 VND per query.

---

## 2. Scope

### 2.1 In scope

- Input: KĐCLGD criterion ID OR free-text query (Vietnamese)
- Corpus: ~100 ISO documents từ MVP-0
- Output: top-5 docs + excerpts + coverage map
- Streamlit UI: select criterion → see results
- Indexing offline pipeline (build once, query many)
- Multi-criterion evaluation harness

### 2.2 Out of scope

- Real-time ingestion (new doc → instant index)
- Cross-document synthesis (e.g., "combine 3 docs to answer")
- Evidence quality scoring (is this a *strong* evidence? leave for later)
- Suggestion: "collect này đi" (proactive gap filling)
- Multi-language query

---

## 3. User Stories

### US-1 — QA officer finds evidence for criterion
> *Là cán bộ Phòng ĐBCL, tôi select tiêu chí TC 3.1 "Quy hoạch nhân sự", hệ thống show top-5 documents liên quan với excerpt, để tôi copy quote vào Biểu 04.*

### US-2 — Evaluator checks coverage
> *Là Hảo (TĐG lead), tôi muốn xem bảng "yêu cầu X của criterion có evidence chưa?", để biết còn thiếu gì cần thu thập.*

### US-3 — Free-text search
> *Là cán bộ, tôi nhập "ai chịu trách nhiệm phát triển chuyên môn giảng viên?" và tìm thấy Quy trình đào tạo giảng viên, dù không biết đó là criterion nào.*

---

## 4. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Indexing pipeline: all MVP-0 extracted docs → chunked & embedded | Must |
| FR-002 | Chunk strategy: semantic chunks ~500-800 tokens, overlap 100 | Must |
| FR-003 | Hybrid retrieval: dense (pgvector) + sparse (BM25) | Must |
| FR-004 | LLM rerank top-20 → top-5 with reasoning | Must |
| FR-005 | Streamlit UI: dropdown select criterion → show results | Must |
| FR-006 | Each result: doc title + excerpt quote + page ref + why relevant | Must |
| FR-007 | Coverage map: criterion's requirements × available evidence matrix | Must |
| FR-008 | Free-text query mode (not only predefined criteria) | Must |
| FR-009 | Evaluation: compare with Hảo's ground-truth evidence mapping | Must |
| FR-010 | "Mark correct/wrong" for each result (active learning) | Must |
| FR-011 | Evidence quality scoring (strong/weak/tangential) | Nice |
| FR-012 | Re-index when new docs added | Nice |

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Precision@5 trên 10 test criteria | ≥ 75% |
| NFR-002 | Recall of known evidence (MVP-0 ground truth) | ≥ 70% |
| NFR-003 | Latency per query | P95 < 8s (retrieval 2s + rerank 5s) |
| NFR-004 | Index build time | < 15 min for 100 docs |
| NFR-005 | Cost per query | < 500 VND |
| NFR-006 | Coverage analysis latency | < 15s |
| NFR-007 | Corpus size supported | Up to 1000 docs (MVP scope), architecture scalable to 10K |

---

## 6. System Architecture

### 6.1 Component diagram

```
┌────────────────────────────────────────────────┐
│  Indexing Pipeline (offline, run once)          │
│                                                 │
│  Docs (.jsonl) → Chunker → Embedder → pgvector  │
│                       ↓                         │
│                  BM25 index (rank_bm25)         │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│  Query-time Pipeline (Streamlit UI)             │
│                                                 │
│  User selects criterion ──→ Build query        │
│           │                                     │
│           ▼                                     │
│  ┌──────────────────────┐                      │
│  │ Hybrid Retriever     │                      │
│  │  - Dense (pgvector)  │                      │
│  │  - Sparse (BM25)     │                      │
│  │  - RRF fusion        │                      │
│  │  → top-20            │                      │
│  └─────────┬────────────┘                      │
│            ▼                                    │
│  ┌──────────────────────┐                      │
│  │ LLM Reranker          │                     │
│  │  - Claude Haiku       │                     │
│  │  - Rerank top-20 → 5  │                     │
│  │  - Extract quotes     │                     │
│  └─────────┬────────────┘                      │
│            ▼                                    │
│  ┌──────────────────────┐                      │
│  │ Coverage Analyzer     │                     │
│  │  - Requirements × Evd │                     │
│  │  - Gap identification │                     │
│  └─────────┬────────────┘                      │
│            ▼                                    │
│         Results → UI                            │
└────────────────────────────────────────────────┘
```

### 6.2 Why hybrid retrieval?

Pure dense retrieval yếu với:
- Exact phrase matching ("Quyết định số 664/2019")
- Tiếng Việt có dấu khác không dấu
- Tên riêng, mã số

Pure sparse (BM25) yếu với:
- Semantic paraphrase ("quản trị nhân lực" ≈ "human resource management")
- Concept matching

Hybrid (RRF = Reciprocal Rank Fusion) kết hợp best of both.

### 6.3 Chunking strategy

```python
def chunk_document(doc: dict, chunk_size=800, overlap=150):
    """
    Semantic chunking:
    1. Split by sections/headings nếu doc có structure
    2. Fallback: fixed-size với overlap
    3. Mỗi chunk preserve: doc_id, page, section, position
    """
    text = doc["text"]

    # Try structured split (by === or numbered sections)
    sections = split_by_headings(text)

    chunks = []
    for section in sections:
        if len(section) <= chunk_size:
            chunks.append(section)
        else:
            # Sliding window
            chunks.extend(sliding_window(section, chunk_size, overlap))

    return [
        {
            "doc_id": doc["id"],
            "doc_path": doc["path"],
            "chunk_id": f"{doc['id']}#{i}",
            "text": c,
            "position": i,
            "total_chunks": len(chunks),
        }
        for i, c in enumerate(chunks)
    ]
```

---

## 7. Data Model

### 7.1 Input

```python
class EvidenceQuery(BaseModel):
    # Option 1: structured
    criterion_id: Optional[str] = None  # "TC 3.1"

    # Option 2: free-text
    query_text: Optional[str] = None

    # Filters
    dept_filter: Optional[list[str]] = None
    top_k: int = 5
```

### 7.2 Output

```python
class EvidenceMatch(BaseModel):
    doc_id: str
    doc_path: str
    doc_title: str
    chunk_id: str
    excerpt: str                    # The relevant quote
    page: Optional[int]
    rerank_score: float             # 0-1 from LLM rerank
    retrieval_source: Literal["dense", "sparse", "both"]
    reasoning: str                  # Why relevant

class CoverageAnalysis(BaseModel):
    criterion_id: str
    requirements: list[dict]        # [{"req": "...", "covered_by": [...], "gap": bool}]
    coverage_pct: float
    gaps: list[str]                 # Requirements without evidence

class EvidenceResult(BaseModel):
    query: EvidenceQuery
    matches: list[EvidenceMatch]
    coverage: Optional[CoverageAnalysis]
    latency_ms: int
    tokens_used: dict
    cost_vnd: float
```

### 7.3 Database schema

```sql
-- Extend from MVP-1
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    doc_id TEXT NOT NULL,
    doc_path TEXT,
    chunk_id TEXT UNIQUE,
    text TEXT NOT NULL,
    position INTEGER,
    embedding vector(3072),  -- text-embedding-3-large dimension
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON chunks USING gin (to_tsvector('simple', text));  -- BM25 approx

CREATE TABLE evidence_feedback (
    id SERIAL PRIMARY KEY,
    criterion_id TEXT,
    query_text TEXT,
    matched_chunk_id TEXT,
    user_marked Literal['correct', 'wrong', 'partial'],
    user_notes TEXT,
    created_at TIMESTAMP
);
```

---

## 8. Retrieval & Rerank Logic

### 8.1 Query construction

Từ criterion metadata, build query:

```python
def build_query_for_criterion(crit: dict) -> str:
    """
    Example:
    TC 3.1: Quy hoạch và tuyển dụng nhân sự
    Requirements:
    - Có kế hoạch quy hoạch nhân sự
    - Có quy trình tuyển dụng minh bạch
    Evidence types:
    - Văn bản quy hoạch
    - Quyết định tuyển dụng

    → Query: "Quy hoạch nhân sự, tuyển dụng minh bạch, kế hoạch nhân sự, quyết định tuyển dụng"
    """
    parts = [crit["name"]]
    parts.extend(crit["requirements"])
    parts.extend(crit["evidence_types"])
    parts.extend(crit["keywords"])
    return " ".join(parts)
```

### 8.2 Hybrid retrieval

```python
def hybrid_retrieve(query: str, top_k: int = 20) -> list[Chunk]:
    # Dense search
    embedding = embed(query)
    dense_results = pgvector_search(embedding, limit=30)

    # Sparse search (BM25)
    sparse_results = bm25_search(query, limit=30)

    # RRF fusion
    fused = reciprocal_rank_fusion(dense_results, sparse_results, k=60)

    return fused[:top_k]
```

### 8.3 LLM Reranker

```python
def rerank(query: str, candidates: list[Chunk], top_k: int = 5) -> list[Rerank]:
    """
    Prompt Claude:
    "Given criterion + 20 candidate chunks, rank by relevance.
     Output: top-5 with score 0-1, extract best quote, explain why."
    """
    prompt = f"""Criterion: {query}

Below are 20 candidate excerpts. Rank top 5 by relevance to the criterion.
For each, extract the most relevant quote (50-150 chars) and explain why.

Candidates:
{format_candidates(candidates)}

Output JSON:
{{"ranking": [
  {{"chunk_id": "...", "score": 0.95, "quote": "...", "reasoning": "..."}}
]}}"""

    response = claude_haiku.messages.create(
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_ranking(response)
```

Use **Haiku** (không Sonnet) vì:
- Rerank task đơn giản hơn classify
- Cần speed + cost
- Accuracy đủ cho rerank

### 8.4 Coverage analysis

```python
def analyze_coverage(criterion: dict, matches: list[EvidenceMatch]) -> CoverageAnalysis:
    """
    For each requirement in criterion:
    - Use LLM to check: do any of the matches cover this requirement?
    - Output: covered_by list + gap flag
    """
    requirements = criterion["requirements"]
    matches_text = "\n".join(f"[{m.doc_id}] {m.excerpt}" for m in matches)

    prompt = f"""Criterion: {criterion['name']}

Requirements:
{format_requirements(requirements)}

Available evidence:
{matches_text}

For each requirement, identify which evidence (if any) covers it.
Output JSON: {{"coverage": [{{"req": "...", "covered_by": ["doc_id"], "gap": bool, "reasoning": "..."}}]}}"""
    # ...
```

---

## 9. Tech Stack Additions (from MVP-1)

```
New dependencies:
  rank_bm25            # BM25 sparse retrieval
  sentence-transformers # for BGE-m3 or similar (optional Vietnamese)

Postgres:
  pgvector extension (already from MVP-0)
  pg_trgm extension (for trigram search fallback)

Config:
  EMBEDDING_MODEL=text-embedding-3-large  (OpenAI)
  EMBEDDING_DIM=3072
  CHUNK_SIZE=800
  CHUNK_OVERLAP=150
  RETRIEVAL_TOP_K=20
  RERANK_TOP_K=5
```

---

## 10. Sprint Plan (16 giờ / weekend)

### Saturday morning (4h) — Indexing pipeline

**9:00-9:30 — Setup**
- Create mvp-02-finder/ folder
- Copy reusable code from MVP-1 (schemas, config, extraction)
- Install new deps

**9:30-11:00 — Chunking**
- Implement `chunker.py`:
  - `chunk_document(doc, size, overlap)`
  - Heading-based + sliding window fallback
- Run on all 100 MVP-0 docs → count total chunks (expect 500-1500)

**11:00-13:00 — Embedding + storage**
- OpenAI text-embedding-3-large
- Batch embed chunks (cheapest API, 100 per call)
- Insert into pgvector
- Verify: `SELECT count(*) FROM chunks;` → total chunks

### Saturday afternoon (4h) — Retrieval

**14:00-15:30 — Dense retrieval**
- `retriever/dense.py`:
  - `search(query_embedding, top_k) -> list[Chunk]`
- Test với 3 criteria → visual sanity check

**15:30-16:30 — Sparse (BM25)**
- `retriever/sparse.py`:
  - Build BM25 index in-memory (100 docs manageable)
  - `search(query_text, top_k)`

**16:30-18:00 — RRF fusion + hybrid**
- `retriever/hybrid.py`:
  - RRF combination
  - Return top-20 with source flags
- Test: compare dense vs sparse vs hybrid on 5 queries

### Sunday morning (4h) — Reranker + Coverage

**9:00-11:00 — LLM Reranker**
- `reranker.py` using Haiku
- Test on outputs from hybrid retrieval
- Target: 5 rerank operations in < 25s total

**11:00-13:00 — Coverage Analyzer**
- `coverage.py`:
  - Input: criterion + matches
  - Output: CoverageAnalysis
- Test on 3 criteria manually

### Sunday afternoon (4h) — UI + Evaluation

**14:00-15:30 — Streamlit UI**
- `app.py`:
  - Criterion selector (dropdown 60 items)
  - Free-text query box
  - Results: top-5 cards với excerpt + reasoning
  - Coverage map table (yêu cầu × evidence)
  - "Mark correct/wrong" button per result

**15:30-17:00 — Evaluation**
- `evaluator.py`:
  - For each of 10 test criteria, query system
  - Compare with Hảo's expected evidence from ground_truth.json
  - Metrics: Precision@5, Recall@5, MRR
  - Report: JSON + markdown summary

**17:00-18:00 — Polish & docs**
- Iterate one round based on eval results
- Write LEARNINGS.md
- Prepare demo

---

## 11. Acceptance Criteria

### Must-pass

- [ ] **AC-1:** Index build successfully cho 100 docs
- [ ] **AC-2:** Hybrid retrieval returns top-20 in < 2s
- [ ] **AC-3:** Rerank top-5 produced in < 6s
- [ ] **AC-4:** Coverage analysis for criterion returns structured output
- [ ] **AC-5:** Streamlit UI: select criterion → see results + coverage
- [ ] **AC-6:** Precision@5 on 10 test criteria **≥ 70%** (relaxed from target 80%)
- [ ] **AC-7:** Free-text query works end-to-end

### Nice-to-pass

- [ ] Precision@5 ≥ 80% (target)
- [ ] Coverage analysis identifies gaps correctly ≥ 70% time
- [ ] Active learning: feedback improves next query (bonus, probably N/A in vibe)

---

## 12. Test Plan

### 12.1 Unit tests

```python
def test_chunker_respects_size_limit()
def test_chunker_overlap_preserved()
def test_bm25_returns_keyword_matches()
def test_dense_returns_semantic_matches()
def test_rrf_fusion_prefers_consensus()
def test_rerank_returns_valid_schema()
def test_coverage_handles_empty_evidence()
```

### 12.2 Retrieval quality test (manual)

Test 5 queries manually:

1. "quy hoạch nhân sự" → must return P.TCNS docs
2. "tuyển sinh" → must return P.Tuyensinh docs
3. "TC 3.1 Quy hoạch và tuyển dụng nhân sự" → must find HR-related
4. "chính sách công bố quốc tế" → must find KHCN docs
5. "thanh tra" → must find P.TTPC docs

Qualitative: top-5 có ≥ 3 clearly relevant.

### 12.3 Evaluation benchmark

10 test criteria (Hảo chọn):
- 5 criteria có evidence rõ trong corpus (expect high recall)
- 3 criteria borderline (evidence partial)
- 2 criteria không có evidence (expect "no matches found" hoặc low confidence)

Metrics reported:
- Precision@5 (averaged)
- Recall@5 (vs ground truth)
- MRR (mean reciprocal rank of first correct match)
- Coverage accuracy (vs Hảo's manual coverage analysis)

---

## 13. Learning Log (fill after weekend)

### Q1: Retrieval quality
```
Precision@5: XX%
Recall@5: XX%
Best-performing criteria: _____
Worst-performing criteria: _____
Pattern in failures: _____
```

### Q2: Dense vs Sparse vs Hybrid
```
Dense only P@5: XX%
Sparse only P@5: XX%
Hybrid P@5: XX%
When does dense win? _____
When does sparse win? _____
```

### Q3: Chunking choices
```
Chunks too big / too small? _____
Overlap hợp lý? _____
Structured chunking có hoạt động? _____
```

### Q4: Coverage analysis insight
```
Did coverage analysis help? _____
Gap identification accuracy: _____
Would Hảo actually use this feature? _____
```

### Q5: Go/No-go MVP-3
```
Decision: [GO / PIVOT / STOP]
Reasoning: _____
```

---

## 14. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Embeddings không tốt với tiếng Việt | Trung | Cao | Test multilingual-e5-large as backup |
| Corpus quá ít (100 docs) → evaluation không meaningful | Trung | Trung | OK for MVP; scale to 500 in post-MVP |
| pgvector performance kém local | Thấp | Thấp | HNSW index, only 1K vectors, fast |
| LLM rerank nuốt chi phí | Trung | Trung | Haiku rẻ 10x, limit 5 queries/session for testing |
| Coverage analysis quá ambitious | Cao | Thấp | Simplify to "exists evidence yes/no" if needed |

---

## 15. Interaction with MVP-1 & MVP-3

### From MVP-1 (reused)

- Text extraction pipeline → unchanged
- criteria.json, iso_processes.json → unchanged
- ground_truth.json → used for evaluation
- Schemas/Pydantic models → extended
- Streamlit + SQLite logging → extended

### To MVP-3

Output of MVP-2 becomes input of MVP-3:

```python
# MVP-2 output
evidence_result = EvidenceResult(...)

# MVP-3 input
bieu04_input = Bieu04Input(
    criterion=criterion,
    evidence=evidence_result.matches,
    coverage=evidence_result.coverage,
    # Plus: Hảo's selected/confirmed evidence (user input)
)
```

MVP-3 draft will use the evidence selected/confirmed in MVP-2 UI.

---

## 16. Next Steps after MVP-2

### If PASS (≥ 70% P@5)
→ [mvp-03-bieu04-drafter.md](mvp-03-bieu04-drafter.md)

### If PIVOT (60-70%)
Options:
1. Better embeddings (try BGE-m3 for multilingual)
2. Fine-tune cross-encoder for Vietnamese
3. Better chunking (respect document structure more)
4. Human-in-the-loop: show top-10 instead of top-5, let user pick

### If STOP (< 60%)
- Audit corpus quality: are docs actually relevant? Garbage in garbage out?
- Maybe corpus needs larger (500+ docs) to work
- Consider: postpone MVP-3, focus on data collection

---

## 17. References

- [MVP-1 Document Classifier](mvp-01-document-classifier.md)
- [MVP Overview](README.md)
- [Reciprocal Rank Fusion paper](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
- [pgvector HNSW docs](https://github.com/pgvector/pgvector)
- [rank_bm25 library](https://github.com/dorianbrown/rank_bm25)
