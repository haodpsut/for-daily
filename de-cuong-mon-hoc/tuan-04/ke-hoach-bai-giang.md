# Kế hoạch Bài giảng — Tuần 4
# AI cho Tìm kiếm và Nghiên cứu

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 4 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO3, CLO5

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] So sánh được kết quả tìm kiếm giữa Google truyền thống và Perplexity AI
- [ ] Dùng **Perplexity AI** để tìm thông tin có dẫn nguồn, giảm nguy cơ hallucination
- [ ] Dùng **SciSpace** để đọc và đặt câu hỏi về bài báo khoa học bằng tiếng Việt
- [ ] Dùng **NotebookLM** để hỏi đáp tổng hợp nhiều tài liệu cùng lúc
- [ ] Trích dẫn nguồn đúng cách khi dùng AI hỗ trợ nghiên cứu

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Tài khoản Perplexity AI (freemium — bản free đủ dùng)
- [ ] Tài khoản SciSpace (free, đăng nhập bằng Google)
- [ ] Tài khoản NotebookLM (free, đăng nhập bằng Google)
- [ ] Chuẩn bị 1 paper tiếng Anh liên quan đến AI/công nghệ (~5–10 trang, PDF)
- [ ] Chuẩn bị 3–4 tài liệu mẫu để demo NotebookLM (PDF, Google Docs, hoặc link URL)

### Kiểm tra bài tập tuần trước
- Quiz tuần 3 — trả kết quả nhanh hoặc điểm danh quiz
- Nhắc BT3 sẽ giao cuối buổi hôm nay

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Khởi động + kết nối Phần I → Phần II | Cả lớp |
| 10–30 phút | Lý thuyết: Google vs AI Search, Perplexity AI | Giảng + demo |
| 30–55 phút | Lab 1: Perplexity AI — Tìm kiếm có nguồn | Cá nhân |
| 55–75 phút | Lý thuyết + Demo: SciSpace — Đọc paper với AI | Giảng + demo |
| 75–100 phút | Lab 2: SciSpace — Đặt câu hỏi về paper | Cá nhân |
| 100–115 phút | Demo: NotebookLM — Tổng hợp nhiều tài liệu | Cả lớp xem |
| 115–125 phút | Chia sẻ + thảo luận + giao BT3 | Cả lớp |
| 125–135 phút | Tổng kết + giới thiệu tuần 5 | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Khởi động (10 phút)

**Câu hỏi kích hoạt:**
> *"Lần cuối cùng bạn cần tìm thông tin cho một bài tập, bạn dùng gì?"*

Ghi nhanh lên bảng: Google / YouTube / hỏi bạn bè / hỏi ChatGPT / Thư viện / Khác.

**Kết nối vào bài:**
> *"Chúng ta đã học cách viết prompt để AI làm việc cho mình.*  
> *Hôm nay học cách dùng AI để **tìm thông tin đáng tin cậy** —*  
> *vì không phải tất cả thông tin AI đưa ra đều đúng, và có công cụ giúp giải quyết điều đó."*

**Nhắc lại nhanh hallucination từ tuần 3:**
- AI chatbot thông thường (ChatGPT, Gemini) không tra cứu web theo thời gian thực
- Kết quả tốt cho phân tích, viết lách — nhưng số liệu cụ thể cần kiểm chứng
- Hôm nay học công cụ giải quyết vấn đề này

---

### 4.B — Lý thuyết: AI Search vs Google truyền thống (20 phút)

#### Vấn đề của tìm kiếm truyền thống

**Google truyền thống:**
```
Bạn gõ từ khóa → Nhận danh sách link → Tự đọc từng trang → Tự tổng hợp
```

- Mỗi trang web có agenda riêng, định dạng khác nhau
- Mất thời gian đọc lọc nội dung thừa
- Khó biết nguồn nào đáng tin

**AI Search (Perplexity, Bing AI, Google AI Overview):**
```
Bạn đặt câu hỏi → AI đọc nhiều nguồn → Tổng hợp câu trả lời → Kèm link nguồn
```

- Tiết kiệm thời gian đọc
- Câu trả lời ngay lập tức, dạng văn xuôi
- Nhưng vẫn cần **verify nguồn** trước khi dùng cho học thuật

#### Perplexity AI là gì?

**Điểm mạnh khác biệt:**
- **Tìm kiếm web thật** → không bịa thông tin
- **Trích dẫn nguồn tự động** → mỗi câu có link nguồn cụ thể
- **Cập nhật thời gian thực** → tốt cho thông tin mới (không bị giới hạn knowledge cutoff)
- **Giao diện đơn giản** → dùng ngay không cần học

**Điểm yếu cần lưu ý:**
- Miễn phí giới hạn số lần hỏi "Pro Search"
- Câu trả lời đôi khi cắt ngắn nguồn
- Không thay thế hoàn toàn việc đọc tài liệu gốc

#### Demo live — So sánh Google vs Perplexity

**Câu hỏi demo (GV chọn 1, liên quan đến ngành của SV):**

```
"Xu hướng ứng dụng AI trong giáo dục đại học năm 2024–2025 là gì?"
```

**Bước 1:** Tìm trên Google → cho SV thấy: nhận được danh sách link, phải click từng trang
**Bước 2:** Hỏi Perplexity cùng câu hỏi → cho SV thấy: câu trả lời tổng hợp, có số thứ tự nguồn rõ ràng

**Chỉ ra các thành phần của kết quả Perplexity:**
- Câu trả lời tổng hợp
- Số nguồn tham chiếu (1, 2, 3...)
- Panel nguồn bên phải — click vào để xem bài gốc
- Câu hỏi tiếp theo được gợi ý

[GV: chú ý chiếu rõ phần nguồn trích dẫn — đây là điểm khác biệt quan trọng nhất]

---

### 4.C — Lab 1: Perplexity AI (25 phút)

**Hướng dẫn đăng ký:**
- Truy cập `perplexity.ai`
- Đăng nhập bằng Google hoặc email
- Bản Free: đủ dùng cho bài tập hôm nay

**Nhiệm vụ Lab 1 — 3 bước:**

**Bước 1 — Tìm kiếm thông thường (10 phút):**
> Chọn 1 chủ đề liên quan đến ngành bạn đang học (ví dụ: một vấn đề kỹ thuật, một xu hướng trong ngành, một khái niệm cần tìm hiểu).  
> Tìm kiếm chủ đề đó trên **Google** → ghi lại: mất bao nhiêu phút, tìm được gì.  
> Sau đó hỏi **Perplexity AI** cùng câu hỏi → ghi lại kết quả.

**Bảng so sánh SV điền:**

| | Google | Perplexity |
|---|---|---|
| Số lượng nguồn hiển thị | | |
| Có tóm tắt ngay không? | | |
| Có trích dẫn nguồn không? | | |
| Thời gian để có câu trả lời | | |
| Mức độ hữu ích (1–5) | | |

**Bước 2 — Thực hành đặt câu hỏi nâng cao (10 phút):**

Thử các dạng câu hỏi khác nhau trên Perplexity:

```
Dạng 1 — Tìm kiếm thực tế:
"[Tên trường ĐH] có chương trình đào tạo về [ngành] không?"

Dạng 2 — Tổng hợp nghiên cứu:
"Các nghiên cứu gần đây về [chủ đề] cho thấy điều gì?"

Dạng 3 — So sánh:
"So sánh [A] và [B] trong bối cảnh [lĩnh vực]"
```

**Bước 3 — Verify nguồn (5 phút):**
> Click vào ít nhất **2 nguồn** mà Perplexity trích dẫn.  
> Kiểm tra: Perplexity có tóm tắt đúng không? Có thông tin nào bị cắt hay hiểu nhầm không?

[GV: nhấn mạnh bước verify — đây là thói quen cần xây dựng]

---

### 4.D — Lý thuyết + Demo: SciSpace (20 phút)

#### Vấn đề khi đọc paper học thuật

Paper học thuật tiếng Anh thường:
- Dài 10–30 trang, ngôn ngữ học thuật phức tạp
- Chứa thuật ngữ chuyên ngành khó hiểu
- Cấu trúc Abstract → Introduction → Methods → Results → Discussion → Conclusion

**Vấn đề của sinh viên:** Muốn tìm hiểu 1 chủ đề nhưng không biết đọc paper từ đâu, mất quá nhiều thời gian.

#### SciSpace là gì?

**SciSpace** (trước đây là Typeset.io) là công cụ cho phép:
- **Tải PDF paper** lên → AI đọc toàn bộ
- **Đặt câu hỏi bằng tiếng Việt** → nhận trả lời bằng tiếng Việt
- **Highlight từ bất kỳ** trong paper → AI giải thích ngay
- **Tìm kiếm paper** liên quan trực tiếp trong hệ thống

**Khi nào dùng SciSpace:**
- Cần đọc tài liệu học thuật cho báo cáo, luận văn
- Muốn hiểu nhanh nội dung chính của 1 paper mà không đọc toàn bộ
- Cần tóm tắt abstract và methodology của nhiều paper

#### Demo live — GV chiếu màn hình

**Tài liệu demo:** Paper về AI trong giáo dục (GV chuẩn bị trước)

**Quy trình demo:**
1. Mở `typeset.io` → đăng nhập Google → tải PDF lên
2. Đặt câu hỏi: *"Bài báo này nghiên cứu vấn đề gì? Kết quả chính là gì?"*
3. Highlight 1 đoạn methodology phức tạp → click "Explain" → SciSpace giải thích
4. Hỏi: *"Bài báo này kết luận điều gì về hiệu quả của AI trong học tập?"*
5. Hỏi: *"Hạn chế của nghiên cứu này là gì?"*

[GV: chiếu rõ cách SciSpace trích dẫn đúng phần trong paper khi trả lời]

---

### 4.E — Lab 2: SciSpace (25 phút)

**Hướng dẫn đăng ký:**
- Truy cập `typeset.io` hoặc `scispace.com`
- Đăng nhập bằng Google — miễn phí

**Lấy paper thực hành:**

*Cách 1 (có kết nối ổn định):* Tìm paper trên Google Scholar
```
1. Truy cập scholar.google.com
2. Tìm: "artificial intelligence education" hoặc "[ngành của bạn] AI"
3. Lọc: 2022–2025, chọn paper có full text PDF
4. Tải PDF về máy
```

*Cách 2 (GV chuẩn bị sẵn):* GV chia sẻ 1–2 paper mẫu trên máy chủ lớp / USB / Google Drive

**Nhiệm vụ Lab 2:**

> Dùng SciSpace với paper vừa tải, trả lời các câu hỏi sau:

| Câu hỏi đặt cho SciSpace | Ghi câu trả lời tóm tắt |
|---|---|
| "Bài báo này nghiên cứu vấn đề gì?" | |
| "Phương pháp nghiên cứu chính là gì?" | |
| "Kết quả quan trọng nhất là gì?" | |
| "Hạn chế của nghiên cứu?" | |
| [Câu hỏi tự đặt về nội dung bạn quan tâm] | |

**Câu hỏi phản ánh sau lab:**
- AI có tóm tắt đúng ý của paper không?
- Bạn có thể tin hoàn toàn vào câu trả lời của SciSpace không?
- So với đọc paper trực tiếp — tiết kiệm được bao nhiêu thời gian?

---

### 4.F — Demo: NotebookLM (15 phút)

[Đây là demo GV chiếu — SV quan sát, không yêu cầu thực hành trong giờ. SV sẽ dùng NotebookLM trong Tuần 8]

#### NotebookLM là gì?

**NotebookLM** (Google) là công cụ cho phép:
- **Upload nhiều tài liệu cùng lúc** (PDF, Google Docs, link web, YouTube video)
- AI đọc tất cả → bạn đặt câu hỏi → AI trả lời **dựa trên tài liệu của bạn**, không bịa
- **Tạo podcast AI** từ tài liệu — 2 giọng AI thảo luận về nội dung
- Tạo tóm tắt, FAQ, outline tự động

**Điểm khác biệt quan trọng:**
> NotebookLM chỉ trả lời dựa trên **tài liệu bạn upload** — không dùng kiến thức chung.  
> Nếu thông tin không có trong tài liệu → AI nói "Tôi không tìm thấy trong tài liệu này."  
> → Đây là cách thiết kế **giảm hallucination** rất hiệu quả.

#### Demo live

**Kịch bản demo:** GV upload 3–4 tài liệu liên quan đến AI trong giáo dục
1. Mở `notebooklm.google.com` → tạo Notebook mới
2. Upload 3 file (PDF paper + 1 bài viết web)
3. Đặt câu hỏi: *"Các tài liệu này đồng ý với nhau về điểm nào? Mâu thuẫn ở đâu?"*
4. Demo tính năng tạo FAQ tự động
5. Demo tính năng Audio Overview (podcast AI)

[GV: tính năng Audio Overview thường gây ấn tượng mạnh — để dành demo cuối cùng]

---

### 4.G — Chia sẻ + Thảo luận + Giao BT3 (10 phút)

**Câu hỏi thảo luận nhanh:**
- Perplexity và SciSpace — cái nào bạn thấy hữu ích hơn trong bài tập hàng ngày? Tại sao?
- Bạn có phát hiện điểm nào AI tóm tắt sai hoặc thiếu so với tài liệu gốc không?

**Giao BT3:**

```
Bài tập tuần 4 (BT3):

Viết tóm tắt 300 từ về 1 chủ đề liên quan đến ngành của bạn.

Yêu cầu:
1. Dùng Perplexity AI để tìm thông tin → chú thích [Perplexity] sau mỗi thông tin lấy từ đó
2. Dùng SciSpace để tóm tắt ít nhất 1 paper học thuật → trích dẫn đúng cách
3. Viết lại tóm tắt bằng ngôn ngữ của bạn — không copy nguyên văn AI

Nộp:
- File Word/PDF tóm tắt 300 từ
- Danh sách nguồn (tên tài liệu + link)
- Screenshot Perplexity và SciSpace đã dùng

Deadline: Đầu buổi học Tuần 5
Điểm: BT3 / 5 bài tập trong học kỳ
```

---

### 4.H — Tổng kết (10 phút)

**3 điểm cần nhớ:**

1. **Perplexity AI** = Google thông minh hơn — tổng hợp nhiều nguồn + trích dẫn rõ → dùng khi cần thông tin thực tế, cập nhật
2. **SciSpace** = trợ lý đọc paper — đặt câu hỏi bằng tiếng Việt → dùng khi cần đọc tài liệu học thuật tiếng Anh
3. **NotebookLM** = hỏi đáp trên tài liệu của bạn — không bịa, chỉ dùng nguồn bạn cung cấp → dùng khi cần tổng hợp nhiều tài liệu

**Quy tắc vàng:**
> Dù dùng công cụ AI nào để tìm kiếm — **luôn click vào nguồn gốc và đọc** trước khi dùng thông tin trong bài nộp học thuật.

**Xem trước tuần 5:**
> Tuần 5 chuyển sang **AI cho viết lách và dịch thuật** — DeepL, Grammarly, Paperpal.  
> Tuần này bạn sẽ viết 1 đoạn văn tiếng Việt → dịch sang tiếng Anh → chỉnh sửa → so sánh với bản dịch của người thật.

---

## 5. Câu hỏi thảo luận mở rộng

1. *"Nếu Perplexity dẫn nguồn sai (link còn đó nhưng nội dung bài đã thay đổi) — ai chịu trách nhiệm về thông tin đó trong bài nộp của bạn?"*
2. *"SciSpace giúp bạn 'đọc' paper mà không đọc. Điều đó tốt hay xấu cho việc học nghiên cứu?"*
3. *"Trong ngành của bạn, loại thông tin nào cần tìm kiếm nhiều nhất? Công cụ nào hôm nay phù hợp nhất?"*

---

## 6. Hướng dẫn Trích dẫn Nguồn khi dùng AI

### Nguyên tắc cơ bản

```
KHI SỬ DỤNG AI ĐỂ TÌM KIẾM / TÓM TẮT:
  → Trích dẫn nguồn gốc (bài báo, trang web gốc) — không trích "Perplexity AI nói..."
  → Ghi thêm: "Tóm tắt với hỗ trợ của [tên công cụ AI]"
  → Đọc nguồn gốc trước khi trích dẫn — không dùng mù quáng

KHI SỬ DỤNG AI ĐỂ VIẾT / PHÂN TÍCH:
  → Khai báo trong phần ghi chú: "Bài viết có sử dụng AI để hỗ trợ [viết/chỉnh sửa/dịch]"
  → Không khai báo là vi phạm liêm chính học thuật
```

### Format trích dẫn gợi ý

```
Nguồn từ Perplexity:
[Tên tác giả/tổ chức] (năm). Tên bài. Tên trang web. [Truy cập qua Perplexity AI, ngày]

Nguồn từ SciSpace:
[Tên tác giả] (năm). Tên paper. Tên tạp chí, số(tập), trang. [Đọc với SciSpace]
```

---

## 7. Phụ lục — Gợi ý Paper Demo cho SciSpace

Nếu GV chưa có paper cụ thể, có thể tìm nhanh trên Google Scholar:

```
Tìm kiếm:
"generative AI higher education" site:scholar.google.com
→ Lọc 2023–2025, chọn bài có PDF free

Gợi ý từ khóa phù hợp:
- "AI tools student learning 2024"
- "ChatGPT academic writing"
- "large language models education"
```

---

## 8. Ghi chú cho Giảng viên

- **Lab 1 (Perplexity)** là trọng tâm — đảm bảo mọi SV có tài khoản hoạt động trước khi bắt đầu
- **Lab 2 (SciSpace)** có thể gặp vấn đề nếu kết nối Internet chậm → chuẩn bị paper sẵn trên máy chủ hoặc USB
- **NotebookLM chỉ demo** trong buổi này — SV sẽ thực hành kỹ hơn ở Tuần 8
- BT3 có yêu cầu trích dẫn nguồn — đây là lần đầu SV phải trích dẫn → hướng dẫn rõ ràng trong phần giao bài
- Nếu lớp có SV CNTT — có thể gợi ý thêm: Semantic Scholar, ArXiv cho tìm kiếm paper kỹ thuật
