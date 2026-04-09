# Outline Slide — Tuần 4
# AI cho Tìm kiếm và Nghiên cứu

> Tổng: ~23 slide | 3 tiết | Phòng máy  
> Ghi chú: [GV] = ghi chú riêng cho giảng viên, không hiển thị trên slide

---

## SLIDE 1 — Trang bìa

**Tiêu đề:** Tuần 4 — AI cho Tìm kiếm và Nghiên cứu  
**Phụ đề:** Perplexity AI · SciSpace · NotebookLM  
**Hình ảnh gợi ý:** Biểu tượng kính lúp + các trang giấy có đánh dấu nguồn trích dẫn  
[GV: tạo bằng Canva hoặc Midjourney — dùng để demo AI tạo ảnh luôn]

---

## SLIDE 2 — Bạn tìm kiếm thông tin như thế nào?

**Tiêu đề:** Khảo sát nhanh — Lần cuối cần thông tin cho bài tập, bạn làm gì?

- 🔍 Google truyền thống
- 🤖 Hỏi ChatGPT / Gemini
- 📚 Thư viện / tài liệu môn học
- 🎬 YouTube / mạng xã hội
- 💬 Hỏi bạn bè / thầy cô

[GV: ghi kết quả lên bảng — tạo không khí + hiểu thói quen lớp]

---

## SLIDE 3 — Vấn đề của mỗi cách tìm kiếm

**Tiêu đề:** Mỗi cách đều có điểm yếu

| Cách tìm kiếm | Vấn đề |
|---|---|
| Google | Nhận danh sách link → tự đọc từng trang → mất thời gian |
| ChatGPT / Gemini | Trả lời tổng hợp nhưng **không có nguồn** → dễ hallucinate |
| Thư viện | Tài liệu thường cũ, khó tiếp cận |
| YouTube | Khó verify độ chính xác, không trích dẫn được |

**Dòng nhấn mạnh:**
> Cần công cụ vừa tổng hợp nhanh, vừa có nguồn đáng tin để verify

---

## SLIDE 4 — Mục tiêu hôm nay

**Tiêu đề:** Sau buổi học này, bạn sẽ...

- ✅ Dùng được **Perplexity AI** — tìm kiếm thông minh có dẫn nguồn
- ✅ Dùng được **SciSpace** — đọc paper khoa học bằng tiếng Việt
- ✅ Biết **NotebookLM** là gì và sẽ dùng ở tuần 8
- ✅ Biết cách **trích dẫn nguồn đúng** khi dùng AI hỗ trợ nghiên cứu

---

## SLIDE 5 — Google vs Perplexity AI

**Tiêu đề:** Khác nhau ở chỗ nào?

**Hai cột:**

| Google | Perplexity AI |
|---|---|
| Gõ từ khóa → nhận list link | Đặt câu hỏi → nhận câu trả lời tổng hợp |
| Tự đọc + tổng hợp | AI đọc nhiều nguồn thay bạn |
| Không có trích dẫn tự động | **Mỗi câu có số nguồn [1] [2] [3]** |
| Không cập nhật theo câu hỏi | Hiểu ngữ cảnh câu hỏi |
| Miễn phí hoàn toàn | Freemium (free đủ dùng) |

**Dòng nhấn mạnh:**
> Perplexity = Google + AI tổng hợp + trích dẫn tự động

---

## SLIDE 6 — [DEMO LIVE] Google vs Perplexity

**Tiêu đề:** Demo — Cùng 1 câu hỏi, 2 cách tìm

**Câu hỏi demo:**
> *"Xu hướng ứng dụng AI trong giáo dục đại học 2024–2025 là gì?"*

**Quy trình chiếu:**
1. Tìm trên Google → chỉ ra: nhận được gì, mất bao lâu để có câu trả lời
2. Hỏi Perplexity → chỉ ra: câu trả lời tổng hợp + số nguồn + panel bên phải

**3 điểm cần chú ý trong kết quả Perplexity:**
- Câu trả lời có đánh số nguồn [1][2][3]
- Panel nguồn bên phải — click vào xem bài gốc
- Câu hỏi tiếp theo gợi ý phía dưới

[GV: zoom vào phần số trích dẫn để SV thấy rõ]

---

## SLIDE 7 — Cách dùng Perplexity hiệu quả

**Tiêu đề:** Hỏi Perplexity đúng cách

**Dùng tốt cho:**
- Tìm thông tin thực tế, số liệu mới nhất
- Tổng quan một chủ đề nhanh
- So sánh 2–3 đối tượng, khái niệm
- Tìm nghiên cứu / bài báo liên quan

**Câu hỏi hiệu quả:**
```
"Các nghiên cứu gần đây về [chủ đề] cho thấy điều gì?"
"So sánh [A] và [B] trong bối cảnh [lĩnh vực]"
"[Công nghệ X] đang được ứng dụng như thế nào trong [ngành Y]?"
```

**Bước không thể bỏ:**
> Sau khi đọc kết quả Perplexity → **click vào nguồn gốc** để verify trước khi dùng

---

## SLIDE 8 — [LAB 1] Perplexity AI

**Tiêu đề:** Lab 1 — Tìm kiếm có nguồn

**Bước 1:** Đăng ký tại `perplexity.ai` (đăng nhập Google — xong ngay)

**Nhiệm vụ:**
> Chọn 1 chủ đề liên quan đến ngành bạn đang học.  
> Tìm trên **Google** → rồi hỏi **Perplexity** → so sánh:

| | Google | Perplexity |
|---|---|---|
| Có tóm tắt ngay? | | |
| Có trích dẫn nguồn? | | |
| Thời gian có câu trả lời | | |
| Hữu ích (1–5) | | |

**Sau đó:** Click vào **2 nguồn** Perplexity trích dẫn → verify xem có đúng không

⏱ 25 phút

---

## SLIDE 9 — Vấn đề khi đọc Paper học thuật

**Tiêu đề:** Tại sao paper tiếng Anh khó đọc?

**Thực tế của sinh viên:**

- 📄 Paper thường dài **10–30 trang**, ngôn ngữ học thuật phức tạp
- 🔤 Thuật ngữ chuyên ngành bằng tiếng Anh khó tra nghĩa trong ngữ cảnh
- 🔢 Phần Methods và Statistics đặc biệt khó hiểu với người không chuyên
- ⏰ Đọc 1 paper mất **1–3 tiếng** nếu không quen

**Nhưng:**
> Bài tập, báo cáo tốt nghiệp, luận văn — cần tham khảo paper học thuật để có nguồn đáng tin

---

## SLIDE 10 — SciSpace là gì?

**Tiêu đề:** SciSpace — Trợ lý Đọc Paper

**4 tính năng chính:**

| Tính năng | Mô tả |
|---|---|
| 📤 Upload PDF | Tải paper lên → AI đọc toàn bộ |
| 💬 Hỏi đáp tiếng Việt | Đặt câu hỏi bằng TV → nhận câu trả lời bằng TV |
| 🖊️ Explain highlight | Bôi đen đoạn khó → AI giải thích ngay |
| 🔍 Tìm paper liên quan | Gợi ý bài báo tương tự trong hệ thống |

**Truy cập:** `typeset.io` hoặc `scispace.com` · Đăng nhập Google · Miễn phí

---

## SLIDE 11 — [DEMO LIVE] SciSpace

**Tiêu đề:** Demo — Đọc Paper trong 5 phút

**Quy trình GV demo:**

1. Tải PDF paper lên SciSpace
2. Hỏi: *"Bài báo này nghiên cứu vấn đề gì? Kết quả chính?"*
3. Highlight đoạn khó → click Explain → xem AI giải thích
4. Hỏi: *"Hạn chế của nghiên cứu này?"*
5. Hỏi: *"Tôi có thể trích dẫn bài này khi viết về [chủ đề] không?"*

**Điểm cần chú ý:**
- SciSpace trả lời dựa trên nội dung paper — trích đúng đoạn
- Vẫn cần đọc lại để verify (đặc biệt với số liệu cụ thể)

[GV: chọn paper có hình ảnh / bảng biểu để demo tính năng explain trực quan]

---

## SLIDE 12 — Câu hỏi hay để hỏi SciSpace

**Tiêu đề:** Hỏi SciSpace những gì?

**5 câu hỏi hữu ích nhất:**

```
1. "Bài báo này nghiên cứu vấn đề gì và tại sao quan trọng?"

2. "Phương pháp nghiên cứu chính được dùng là gì?"

3. "Kết quả và kết luận quan trọng nhất là gì?"

4. "Hạn chế của nghiên cứu này là gì?"

5. "Tôi muốn trích dẫn ý này — đây là thông tin ở trang/phần nào?"
```

**Lưu ý:**
> Câu 5 đặc biệt hữu ích khi viết báo cáo — biết chính xác trích dẫn từ đâu

---

## SLIDE 13 — [LAB 2] SciSpace

**Tiêu đề:** Lab 2 — Đọc Paper với AI

**Lấy paper:**
- Tìm trên `scholar.google.com` (từ khóa liên quan đến ngành)
- **Hoặc** dùng paper GV cung cấp

**Nhiệm vụ — Hỏi SciSpace 5 câu:**

| Câu hỏi | Ghi tóm tắt câu trả lời |
|---|---|
| Bài báo này nghiên cứu gì? | |
| Phương pháp chính là gì? | |
| Kết quả quan trọng nhất? | |
| Hạn chế của nghiên cứu? | |
| [Câu hỏi tự đặt] | |

**Sau đó:** Đọc lại phần **Abstract** của paper gốc → SciSpace có tóm tắt đúng không?

⏱ 25 phút

---

## SLIDE 14 — NotebookLM: Hỏi đáp Nhiều Tài liệu

**Tiêu đề:** NotebookLM — Khi bạn có nhiều tài liệu cần tổng hợp

**NotebookLM (Google) cho phép:**

- Upload **nhiều tài liệu cùng lúc** (PDF, Google Docs, link web, YouTube)
- AI đọc tất cả → bạn hỏi → AI trả lời **chỉ dựa trên tài liệu của bạn**
- Nếu thông tin không có trong tài liệu → AI nói thẳng "Không tìm thấy"
- Tạo **podcast AI tự động** — 2 giọng nói thảo luận về nội dung

**Điểm khác biệt quan trọng nhất:**
> Không bịa — chỉ dùng thông tin trong tài liệu bạn cung cấp

---

## SLIDE 15 — [DEMO] NotebookLM

**Tiêu đề:** Demo — GV chiếu, SV quan sát

**Kịch bản demo:**
> 3–4 tài liệu về AI trong giáo dục → tổng hợp điểm chung và mâu thuẫn

**Quy trình:**
1. Mở `notebooklm.google.com` → Tạo Notebook mới
2. Upload 3 file → chờ AI xử lý
3. Hỏi: *"Các tài liệu này đồng ý với nhau về điểm nào?"*
4. Hỏi: *"Có thông tin nào mâu thuẫn giữa các tài liệu không?"*
5. Demo tạo **Audio Overview** (podcast AI)

**Khi nào bạn sẽ dùng NotebookLM:**
> Tuần 8 — khi học về AI năng suất và tổng hợp tài liệu

[GV: tính năng Audio Overview tạo ấn tượng mạnh — chiếu kết quả 1–2 phút]

---

## SLIDE 16 — So sánh 3 công cụ hôm nay

**Tiêu đề:** Dùng cái nào khi nào?

| Tình huống | Công cụ phù hợp |
|---|---|
| Cần thông tin tổng quan về 1 chủ đề | Perplexity AI |
| Cần số liệu mới nhất + có link nguồn | Perplexity AI |
| Cần đọc 1 paper tiếng Anh | SciSpace |
| Cần tóm tắt nhiều tài liệu cùng lúc | NotebookLM |
| Cần phân tích, viết lách, brainstorm | ChatGPT / Gemini |
| Muốn tìm paper học thuật | Google Scholar + SciSpace |

---

## SLIDE 17 — Quy tắc Trích dẫn khi dùng AI

**Tiêu đề:** Khi nào phải khai báo nguồn AI?

**Quy tắc rõ ràng:**

```
✅ ĐÚNG:
  → Dùng Perplexity tìm → click nguồn gốc → trích nguồn gốc
  → Ghi chú: "Tìm kiếm với hỗ trợ Perplexity AI"

✅ ĐÚNG:
  → Dùng SciSpace đọc paper → trích dẫn paper gốc đúng format
  → Ghi chú: "Đọc với hỗ trợ SciSpace"

❌ SAI:
  → Trích dẫn: "Theo Perplexity AI..." (không phải nguồn học thuật)
  → Dùng thông tin từ AI mà không click vào nguồn gốc để verify
```

**Dòng nhấn mạnh:**
> AI là công cụ tìm kiếm — nguồn học thuật vẫn phải là tài liệu gốc

---

## SLIDE 18 — Checklist Nghiên cứu với AI

**Tiêu đề:** Quy trình 5 bước khi nghiên cứu có AI

```
□ Bước 1: Dùng Perplexity để có cái nhìn tổng quan nhanh
□ Bước 2: Click vào ít nhất 2–3 nguồn Perplexity trích dẫn → đọc thực sự
□ Bước 3: Tìm paper liên quan trên Google Scholar
□ Bước 4: Dùng SciSpace để đọc và hiểu paper chính
□ Bước 5: Viết và trích dẫn nguồn gốc — không trích "AI nói..."
```

---

## SLIDE 19 — BT3 — Bài tập tuần 4

**Tiêu đề:** Bài tập tuần 4

**Yêu cầu:**
> Viết tóm tắt **300 từ** về 1 chủ đề liên quan đến ngành bạn đang học.

**Sử dụng bắt buộc:**
- **Perplexity AI** để tìm thông tin → chú thích [Perplexity] sau mỗi thông tin lấy từ đó
- **SciSpace** để đọc ít nhất 1 paper học thuật → trích dẫn đúng cách

**Nộp:**
- File Word/PDF tóm tắt 300 từ
- Danh sách nguồn (tên tài liệu + link)
- Screenshot Perplexity và SciSpace đã dùng

**Deadline:** Đầu buổi học Tuần 5 · **Điểm:** BT3 / 5

---

## SLIDE 20 — Chia sẻ kết quả Labs

**Tiêu đề:** Bạn thấy gì trong 2 lab hôm nay?

**3 câu hỏi thảo luận:**
- Perplexity hay SciSpace — cái nào bạn thấy hữu ích hơn ngay lập tức? Tại sao?
- Bạn có phát hiện điểm nào AI tóm tắt sai hoặc thiếu so với tài liệu gốc không?
- Bạn sẽ dùng công cụ nào trong việc làm BT3?

[GV: mời 2–3 SV chia sẻ — đặc biệt quan tâm trường hợp ai phát hiện AI sai]

---

## SLIDE 21 — Tóm tắt Tuần 4

**Tiêu đề:** 3 điều cần nhớ hôm nay

**3 điểm lớn:**

1. **Perplexity AI** — Tìm kiếm thông minh có nguồn · Dùng khi cần thông tin thực tế, cập nhật · Luôn verify nguồn gốc
2. **SciSpace** — Đọc paper tiếng Anh bằng tiếng Việt · Đặt câu hỏi về nội dung cụ thể · Không thay thế đọc paper thực sự
3. **Quy tắc vàng** — Dù dùng AI nào để tìm: trích dẫn **nguồn gốc**, không trích "AI nói"

---

## SLIDE 22 — Xem trước Tuần 5

**Tiêu đề:** Tuần sau — AI cho Viết lách và Dịch thuật

**Hình ảnh gợi ý:** Bút viết + hai ngôn ngữ Anh/Việt đan xen

**Teaser:**
> *"Bạn đã biết cách tìm thông tin với AI.*  
> *Tuần 5 học cách **viết và dịch** bằng AI —*  
> *DeepL · Grammarly · Paperpal: bộ 3 công cụ viết tiếng Anh tốt nhất cho sinh viên."*

**Chuẩn bị:** Nộp BT3 đầu buổi tuần sau

---

## SLIDE 23 — Tài nguyên thực hành thêm

**Tiêu đề:** Muốn thực hành thêm?

**Perplexity:**
- `perplexity.ai` — Thử chế độ "Focus: Academic" để tìm tài liệu học thuật

**SciSpace:**
- `typeset.io` — Thư viện sẵn có hàng triệu paper, không cần tải lên

**Tìm paper miễn phí:**
- `scholar.google.com` — Google Scholar
- `arxiv.org` — Preprint AI/CS miễn phí hoàn toàn
- `semanticscholar.org` — Semantic Scholar, có tóm tắt AI

**Lưu ý:**
> Các công cụ này cập nhật tính năng thường xuyên — nếu giao diện khác slide này, đó là bình thường.

---

*Outline slide — Tuần 4 | Phiên bản 1.0*  
*Khoa CNTT — ĐH Kiến trúc Đà Nẵng*
