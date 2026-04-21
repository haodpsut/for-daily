# University Quality OS — MVP Specifications

Thư mục này chứa đặc tả chi tiết (SRS) cho các MVP của **University Quality OS** — sản phẩm core của CAIRA-DAU và spin-out 2027.

## Context

**Sản phẩm:** Agentic AI layer kết nối 3 kho dữ liệu của một trường đại học Việt Nam:

1. **ISO processes** (~50 quy trình, 11 phòng ban) — văn bản, biểu mẫu, quy trình thực thi.
2. **KĐCLGD framework** (15 tiêu chuẩn / 60 tiêu chí / 16 biểu mẫu) — Thông tư BGDĐT 2026.
3. **Chuẩn đầu ra measurement** (TT04-2025, ABET, AUN-QA) — PLOs, CLOs, rubrics, đề thi.

**Vấn đề:** 3 kho này sống trong 3 file system tách biệt. Không ai kết nối chúng. Kết quả: KĐCLGD TĐG tốn 6 tháng × 10 người mỗi chu kỳ.

**Giải pháp:** AI layer tự động:
- Phân loại mọi document → ISO process nào, KĐCLGD tiêu chí nào, PLO/CLO nào
- Tìm minh chứng phù hợp khi cần
- Sinh Biểu 04 (assessment narrative) có citation
- Theo dõi coverage gap real-time

## MVP Roadmap

3 MVP được thiết kế để test 3 hypothesis then chốt, mỗi MVP 1 cuối tuần:

| # | MVP | Hypothesis test | File SRS |
|---|---|---|---|
| **0** | Data Preparation | — (nền tảng) | [mvp-00-data-prep.md](mvp-00-data-prep.md) |
| **1** | Document Classifier | AI có thể phân loại document → ISO + KĐCLGD với 70%+ accuracy? | [mvp-01-document-classifier.md](mvp-01-document-classifier.md) |
| **2** | Evidence Finder | AI có thể tìm evidence cho 1 criterion với 80% precision@5? | [mvp-02-evidence-finder.md](mvp-02-evidence-finder.md) |
| **3** | Biểu 04 Drafter | AI có thể draft Biểu 04 với <30% edit distance? | [mvp-03-bieu04-drafter.md](mvp-03-bieu04-drafter.md) |

## Progression logic

```
MVP-0 (Data prep)
      ↓
MVP-1 (Classifier)  ──────→ Pass?  → MVP-2 (Finder)  ──────→ Pass?  → MVP-3 (Drafter)
                     Fail                           Fail
                     ↓                              ↓
                Rule-based +                   Improve chunking +
                AI hybrid                      reranking approach
```

**Mỗi MVP là một GO/NO-GO gate.** Không tiến MVP tiếp theo nếu MVP hiện tại fail acceptance criteria.

## Vibe coding principles

Các MVP này là **vibe prototype**, không phải production code. Nguyên tắc:

1. **Speed over perfection.** Mỗi MVP 16 giờ thật (1 cuối tuần). Nếu không xong, là design vấn đề, không phải thiếu thời gian.
2. **Streamlit/Gradio UI.** Không React. Không auth. Không database phức tạp. Local SQLite + pgvector nếu cần.
3. **User test ngay.** Mỗi MVP xong phải demo được cho ít nhất 1 người thật (Phú hoặc cán bộ DAU) trong 48 giờ.
4. **Learning > working product.** Output quan trọng nhất của MVP là \emph{học được gì về hypothesis}, không phải code đẹp.
5. **Keep a learning log.** Mỗi MVP có file `LEARNINGS.md` sau khi xong.

## Success criteria tổng thể (sau 3 tuần)

- [ ] Ít nhất 2/3 MVP pass acceptance criteria
- [ ] Có dataset 30+ document đã label ground truth
- [ ] Có câu trả lời rõ cho câu hỏi: "Có nên tiến lên CAIRA R\&D plan build University Quality OS hay không?"
- [ ] Demo được cho Hiệu trưởng DAU (5-phút demo)
- [ ] Decision rõ ràng về tech stack cho full build

## Người phụ trách

| Vai | Người | Trách nhiệm |
|---|---|---|
| Product lead | Hảo | Hypothesis, ground truth labeling, acceptance evaluation |
| Engineering lead | Phú | Implementation, test, debugging |
| Domain reviewer | Hảo | Đánh giá kết quả AI so với kiến thức KĐCLGD |

Hoàng không tham gia giai đoạn vibe này — anh ấy vào từ tuần 4 khi có demo để bắt đầu talking với trường ngoài.

## Tech stack chung (qua mọi MVP)

```
Language:       Python 3.12+
LLM Provider:   Anthropic (Claude Sonnet 4.x primary, Haiku fallback)
Backup LLM:     OpenAI (GPT-4.x)
Vector DB:      pgvector trên PostgreSQL (local Docker)
Embeddings:     OpenAI text-embedding-3-large (default)
                + Vietnamese PhoBERT (domain boost)
UI:             Streamlit (cho vibe), React sau này
Extraction:     pdfplumber, python-docx, pytesseract (OCR fallback)
Orchestration:  Plain Python → Pydantic AI (nếu cần)
Testing:        pytest + pandas cho evaluation
```

## File naming convention

```
mvp-XX-<name>/
├── SRS.md              # Specification (từ folder này)
├── code/               # Actual code
│   ├── app.py
│   ├── agents/
│   └── tests/
├── data/               # Input data (gitignored)
├── results/            # Output + evaluation
│   └── evaluation-<date>.json
└── LEARNINGS.md        # Post-sprint learning log
```

## Lịch đề xuất

| Tuần | Hoạt động | Output |
|---|---|---|
| Tuần 0 (hiện tại) | Review SRS, setup env, MVP-0 data prep | Dataset 100 docs + 20 labeled + env ready |
| Tuần 1 | MVP-1 Classifier (weekend) | Classifier chạy + evaluation report |
| Tuần 2 | MVP-2 Evidence Finder (weekend) | Finder chạy + evaluation report |
| Tuần 3 | MVP-3 Biểu 04 Drafter (weekend) | Drafter chạy + evaluation report |
| Tuần 4 | Demo + decision | Đi tiếp hay pivot |

---

## Đọc tiếp

Mở [mvp-00-data-prep.md](mvp-00-data-prep.md) để bắt đầu.
