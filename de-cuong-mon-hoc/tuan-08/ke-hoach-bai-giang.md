# Kế hoạch Bài giảng — Tuần 8
# AI cho Năng suất và Tự động hóa

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 8 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO3, CLO4

> **Đây là tuần cuối của Phần II — Công cụ AI Thực hành.**  
> Từ tuần 9 chuyển sang Phần III — AI và Trách nhiệm.

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] Dùng **NotebookLM** để upload nhiều tài liệu và đặt câu hỏi tổng hợp
- [ ] Mô tả được AI đang được tích hợp vào các công cụ hàng ngày như thế nào (Microsoft 365, Google Workspace)
- [ ] Hiểu được khái niệm **AI workflow** — kết nối nhiều công cụ AI thành quy trình
- [ ] Biết về AI hỗ trợ code (GitHub Copilot, Cursor) — dành cho SV CNTT
- [ ] Bổ sung được ít nhất 1 sản phẩm vào **AI Portfolio** từ hoạt động buổi học hôm nay

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Tài khoản NotebookLM (free, đăng nhập Google)
- [ ] Chuẩn bị 3–4 tài liệu mẫu để demo NotebookLM (PDF + 1 link URL + 1 Google Doc)
- [ ] Nếu có Microsoft 365: chuẩn bị demo Copilot trong Word
- [ ] Đây là tuần cuối Phần II — chuẩn bị nhắc SV về deadline AI Portfolio (tuần 10)

### Không có bài tập mới tuần này
- BT5 là bài tập cuối trong 5 bài bắt buộc
- Tuần này tập trung: thực hành NotebookLM + bổ sung AI Portfolio

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Khởi động + tổng kết Phần II | Cả lớp |
| 10–30 phút | Lý thuyết: AI tích hợp vào công cụ hàng ngày | Giảng + demo |
| 30–75 phút | Lab chính: NotebookLM — Tổng hợp nhiều tài liệu | Cá nhân |
| 75–95 phút | Demo: Copilot trong Word/Excel + AI Workflow | Giảng |
| 95–110 phút | Giới thiệu: AI cho Code (GitHub Copilot, Cursor) | Giảng + demo ngắn |
| 110–125 phút | Thời gian AI Portfolio — bổ sung sản phẩm | Cá nhân |
| 125–135 phút | Tổng kết Phần II + xem trước tuần 9 | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Khởi động: Tổng kết Phần II (10 phút)

**Nhìn lại hành trình Phần II (Tuần 4–8):**

```
Tuần 4 — Tìm kiếm & Nghiên cứu:  Perplexity AI, SciSpace
Tuần 5 — Viết lách & Dịch thuật:  DeepL, Grammarly
Tuần 6 — Hình ảnh & Trực quan:    DALL-E 3, Canva AI
Tuần 7 — Slides & Thuyết trình:   Gamma.app
Tuần 8 — Năng suất & Tự động hóa: NotebookLM, Copilot ← hôm nay
```

**Câu hỏi kiểm tra nhanh (không tính điểm):**
> *"Trong 5 nhóm công cụ vừa học — nhóm nào bạn thấy hữu ích nhất với công việc học tập hiện tại?"*

Ghi kết quả lên bảng → thảo luận nhanh 2 phút.

**Kết nối vào bài:**
> *"Các công cụ tuần 4–7 đều là tool độc lập — bạn dùng từng cái cho từng việc.*  
> *Tuần 8 học cách AI được **tích hợp sẵn** vào công cụ bạn đang dùng hàng ngày — và cách **kết nối nhiều công cụ lại với nhau** để làm việc hiệu quả hơn."*

---

### 4.B — Lý thuyết: AI tích hợp vào công cụ hàng ngày (20 phút)

#### Xu hướng: AI embedded — AI nhúng vào sẵn

**Trước 2023:** AI là tool riêng biệt — bạn phải mở tab mới để dùng.  
**Từ 2023 đến nay:** AI được nhúng trực tiếp vào công cụ bạn đã dùng hàng ngày.

```
Microsoft 365 Copilot  →  AI trong Word, Excel, PowerPoint, Outlook, Teams
Google Workspace AI    →  AI trong Google Docs, Sheets, Gmail, Meet
Notion AI              →  AI ngay trong công cụ ghi chú
GitHub Copilot         →  AI ngay trong editor code
Canva AI               →  AI ngay trong thiết kế (đã học tuần 6–7)
```

**Ý nghĩa thực tế:**
- Không cần copy-paste qua lại giữa ChatGPT và Word nữa
- AI hiểu **ngữ cảnh** tài liệu bạn đang làm việc
- Tốc độ làm việc tăng đáng kể

#### Microsoft 365 Copilot — Demo (nếu có tài khoản)

**Trong Word:**
```
"Tóm tắt tài liệu này thành 5 điểm chính"
"Viết phần mở đầu cho báo cáo dựa trên nội dung đã có"
"Chuyển đoạn văn bản này thành bảng so sánh"
```

**Trong Excel:**
```
"Phân tích dữ liệu trong bảng này và tìm xu hướng"
"Tạo biểu đồ phù hợp nhất cho dữ liệu này"
"Giải thích công thức trong ô B12"
```

[GV: nếu không có Microsoft 365 Copilot → demo qua video YouTube (~2 phút) + chú thích "tính năng này đang được triển khai dần tại các trường ĐH"]

#### Google Workspace AI — Thực tế hơn cho SV

Nhiều SV đã có Google account → các tính năng AI đang được mở dần:

| Tính năng | Có sẵn bản free? |
|---|---|
| **Help me write** (Google Docs) | Đang mở rộng |
| **Duet AI** trong Google Meet | Tài khoản trả phí |
| **Smart compose** trong Gmail | ✅ Có sẵn |
| **NotebookLM** | ✅ Miễn phí hoàn toàn |

**NotebookLM là công cụ Google AI duy nhất miễn phí hoàn toàn và mạnh nhất cho sinh viên — đây là trọng tâm buổi học hôm nay.**

---

### 4.C — Lab chính: NotebookLM (45 phút)

#### NotebookLM là gì — nhắc lại nhanh

*(Đã giới thiệu sơ ở Tuần 4 — hôm nay thực hành thật)*

**NotebookLM** (notebooklm.google.com) cho phép:
- Upload nhiều tài liệu (PDF, Google Docs, link URL, YouTube, audio)
- AI đọc tất cả → bạn đặt câu hỏi → AI trả lời **chỉ dựa trên tài liệu của bạn**
- Tạo **Audio Overview** — 2 giọng AI podcast thảo luận về nội dung
- Tạo tóm tắt, FAQ, study guide, timeline tự động

**Điểm khác biệt cốt lõi:**
> Không bịa — nếu thông tin không có trong tài liệu bạn upload → AI nói thẳng.

#### Kịch bản Lab — Ôn tập tổng hợp môn học

> Bạn đang chuẩn bị ôn tập cuối kỳ. Dùng NotebookLM để tổng hợp tài liệu từ nhiều nguồn và tạo bộ câu hỏi ôn tập.

**Bước 1 — Đăng ký và tạo Notebook mới (5 phút):**
- Truy cập `notebooklm.google.com` → đăng nhập Google
- Click "New Notebook" → đặt tên (ví dụ: "Ôn tập AI môn học")

**Bước 2 — Upload tài liệu (10 phút):**

SV upload ít nhất 3 trong các nguồn sau:

```
Nguồn gợi ý:
  - Slide/tài liệu từ 1 môn học đang học (PDF)
  - Đề cương môn học (PDF)
  - 1 bài báo từ SciSpace (tuần 4) đã tải về
  - Link URL bài viết liên quan đến chủ đề đang học
  - YouTube video bài giảng liên quan
```

[GV: nếu SV không có tài liệu sẵn → chuẩn bị bộ 3–4 PDF mẫu chia sẻ qua Google Drive lớp]

**Bước 3 — Đặt câu hỏi tổng hợp (20 phút):**

SV thử các dạng câu hỏi sau:

```
Dạng 1 — Tóm tắt:
"Tóm tắt các điểm chính từ tất cả tài liệu trong notebook này"

Dạng 2 — So sánh:
"Các tài liệu này có quan điểm khác nhau về [chủ đề X] không?"

Dạng 3 — Kết nối:
"Khái niệm nào xuất hiện trong nhiều tài liệu nhất?
 Giải thích mối liên hệ giữa chúng."

Dạng 4 — Tạo câu hỏi ôn tập:
"Tạo 10 câu hỏi trắc nghiệm để ôn tập nội dung trong các tài liệu này"

Dạng 5 — Giải thích theo cách dễ hiểu:
"Giải thích [khái niệm khó] trong tài liệu số [X] bằng ngôn ngữ đơn giản"
```

**Bước 4 — Tính năng tự động (10 phút):**

Thử các nút tự động trong NotebookLM:
- **Study Guide** → AI tạo bộ câu hỏi + đáp án từ toàn bộ tài liệu
- **FAQ** → AI liệt kê câu hỏi thường gặp về chủ đề
- **Audio Overview** → 2 giọng AI thảo luận về tài liệu (tiếng Anh)
- **Briefing Doc** → Tóm tắt dạng văn bản ngắn

**Bảng ghi chép:**

| Câu hỏi đã hỏi | Câu trả lời có hữu ích không? | Ghi chú |
|---|---|---|
| | | |
| | | |
| | | |

**Câu hỏi phản ánh sau lab:**
- AI trả lời có bịa không (so với tài liệu gốc)?
- Tính năng nào hữu ích nhất — Chat / Study Guide / Audio Overview?
- Notebook này có thể dùng được cho việc gì trong học tập của bạn?

---

### 4.D — Demo: Copilot trong Word/Excel + AI Workflow (20 phút)

#### Demo Copilot trong Word (10 phút)

[Nếu có tài khoản Microsoft 365 Education — GV demo trực tiếp]  
[Nếu không có — chiếu video demo ~3 phút từ Microsoft, sau đó giải thích]

**Những gì Copilot làm được trong Word:**

```
Lệnh thực tế:
"Tóm tắt tài liệu này thành 5 gạch đầu dòng"
"Viết email xin lỗi vì nộp muộn, dựa trên ngữ cảnh tài liệu"
"Đề xuất phần kết luận cho báo cáo này"
"Chuyển đoạn văn dài thành bảng so sánh"
```

**Điểm khác biệt so với ChatGPT:**
- Copilot **đọc tài liệu đang mở** → không cần copy-paste nội dung vào chat
- Thay đổi được áp dụng trực tiếp vào file → không cần copy kết quả ra ngoài

#### Khái niệm AI Workflow (10 phút)

**AI Workflow là gì:**

> Kết nối nhiều công cụ AI theo chuỗi để hoàn thành 1 nhiệm vụ phức tạp — đầu ra của công cụ này là đầu vào của công cụ tiếp theo.

**Ví dụ AI Workflow thực tế cho sinh viên:**

```
Workflow 1 — Nghiên cứu và viết báo cáo:
Perplexity AI (tìm nguồn)
  → SciSpace (đọc paper)
  → NotebookLM (tổng hợp nhiều tài liệu)
  → ChatGPT (viết báo cáo)
  → Grammarly (kiểm tra tiếng Anh)
  → Gamma.app (tạo slide thuyết trình)

Workflow 2 — Tạo nội dung truyền thông:
ChatGPT (viết nội dung)
  → DeepL (dịch sang tiếng Anh)
  → DALL-E 3 (tạo ảnh minh họa)
  → Canva AI (thiết kế đồ họa hoàn chỉnh)

Workflow 3 — Chuẩn bị thuyết trình:
Perplexity (tìm số liệu mới)
  → NotebookLM (tổng hợp tài liệu)
  → Gamma.app (tạo slide)
  → ChatGPT (tạo script thuyết trình)
```

**Điểm chốt:**
> Mỗi tool có điểm mạnh riêng. Người dùng AI giỏi không tìm 1 tool làm được tất cả — họ **kết hợp đúng tool đúng việc**.

#### Công cụ tự động hóa nâng cao (giới thiệu nhanh)

**Zapier AI / Make.com** — tự động hóa quy trình không cần code:
- Khi nhận email → tự động tóm tắt và lưu vào Notion
- Khi có form mới → tự động gửi email xác nhận
- Khi upload file → tự động chuyển đổi định dạng

[GV: chỉ giới thiệu khái niệm — không thực hành trong buổi này, đây là nội dung nâng cao]

---

### 4.E — AI cho Code: GitHub Copilot và Cursor (15 phút)

> *Phần này đặc biệt hữu ích cho SV ngành CNTT — nhưng tất cả SV nên biết khái niệm.*

#### GitHub Copilot là gì?

**GitHub Copilot** là AI viết code ngay trong editor:
- Gợi ý code tiếp theo khi bạn đang gõ
- Tự hoàn thành function từ comment tiếng Anh
- Giải thích đoạn code khó hiểu
- Tạo unit test tự động

**Ví dụ thực tế:**
```python
# Tạo hàm đọc file CSV và tính trung bình cột "điểm"
# ← Copilot tự viết đoạn code hoàn chỉnh từ comment này
```

**Truy cập:** GitHub Student Pack → Copilot miễn phí cho sinh viên có email .edu

#### Cursor — Editor AI-native

**Cursor** là editor code được xây dựng xung quanh AI:
- Chat với AI về toàn bộ codebase
- "Sửa bug này" → AI tự sửa trực tiếp trong file
- Giải thích logic của cả project lớn

**So sánh nhanh:**

| | GitHub Copilot | Cursor |
|---|---|---|
| Mô hình | Gợi ý inline | Chat + edit trực tiếp |
| Tích hợp | Trong VS Code, JetBrains | Editor riêng |
| Miễn phí | SV có email .edu | Bản free giới hạn |
| Phù hợp | Đã quen VS Code | Muốn AI làm chủ hơn |

#### Demo ngắn (5 phút)

GV chiếu ví dụ GitHub Copilot gợi ý code từ comment:

```python
# Viết hàm kiểm tra email hợp lệ
def validate_email(email):
    # ← Copilot tự điền phần này
```

→ Copilot gợi ý regex hoặc import thư viện phù hợp.

[GV: nếu lớp không có SV CNTT nhiều → rút ngắn phần này còn 5 phút, chỉ giải thích khái niệm]

---

### 4.F — Thời gian AI Portfolio (15 phút)

**Đây là thời gian có cấu trúc để SV bổ sung portfolio — không phải thời gian tự do.**

**Nhắc lại yêu cầu AI Portfolio:**

```
Portfolio cần ít nhất 5 sản phẩm, mỗi sản phẩm gồm:
  1. Sản phẩm thực tế (file, screenshot, link)
  2. Công cụ AI đã dùng
  3. Prompt quan trọng đã dùng
  4. Nhận xét: khó khăn, cách xử lý, bài học rút ra
```

**Deadline:** Nộp cùng Báo cáo cuối kỳ ở Tuần 10.

**Gợi ý sản phẩm từ các tuần đã học:**

| Tuần | Gợi ý sản phẩm portfolio |
|---|---|
| 1 | Screenshot so sánh 3 chatbot trả lời cùng 1 câu |
| 2 | 3 prompt CRAC tốt nhất + phân tích điểm mạnh |
| 3 | Quy trình 5 prompt giải bài toán phức tạp |
| 4 | Tóm tắt chủ đề có trích dẫn nguồn Perplexity + SciSpace |
| 5 | Đoạn văn trước/sau chỉnh sửa với AI + ghi chú |
| 6 | Bộ 5 ảnh AI + prompt đã dùng (BT5 — đã nộp) |
| 7 | Bộ slide mini project |
| **8** | **Notebook NotebookLM + Study Guide đã tạo hôm nay** |

**Nhiệm vụ 15 phút:**
> Mở file portfolio của bạn (Word/Google Docs).  
> Thêm ít nhất 1 sản phẩm từ buổi học hôm nay — chụp screenshot NotebookLM, ghi prompt đã dùng, viết 2–3 câu nhận xét.

[GV: đi vòng quanh lớp xem SV có bắt đầu portfolio chưa — ai chưa có → hỗ trợ bắt đầu ngay]

---

### 4.G — Tổng kết Phần II + Xem trước Tuần 9 (10 phút)

**Tổng kết Phần II — 5 nhóm công cụ đã học:**

```
✅ Tuần 4: Perplexity + SciSpace → Tìm thông tin đáng tin cậy
✅ Tuần 5: DeepL + Grammarly    → Viết và dịch tốt hơn
✅ Tuần 6: DALL-E + Canva AI    → Tạo nội dung trực quan
✅ Tuần 7: Gamma.app            → Tạo slide thuyết trình
✅ Tuần 8: NotebookLM + Copilot → Tổng hợp tài liệu, năng suất
```

**3 điểm cần nhớ tuần này:**

1. **NotebookLM** — hỏi đáp chỉ dựa trên tài liệu bạn cung cấp → ít bịa nhất, tốt nhất cho ôn tập và nghiên cứu
2. **AI Workflow** — kết hợp đúng tool đúng việc → hiệu quả hơn tìm 1 tool làm tất cả
3. **AI embedded** — AI đang được nhúng vào công cụ hàng ngày (Word, Excel, Gmail...) → sẽ không còn phải "mở tab AI" nữa

**Xem trước tuần 9:**
> *"Chúng ta đã học cách dùng AI hiệu quả.*  
> *Tuần 9 dừng lại và hỏi: Dùng như vậy có đúng không?*  
> *Bản quyền, liêm chính học thuật, thông tin cá nhân — AI và trách nhiệm của người dùng."*

**Nhắc deadline:**
> AI Portfolio nộp cùng Báo cáo cuối kỳ — Tuần 10.  
> Tuần 9 là tuần thảo luận, tuần 10 là tuần trình bày. Chuẩn bị sớm.

---

## 5. Câu hỏi thảo luận mở rộng

1. *"Khi AI được tích hợp vào Word, Excel — bạn còn cần học các kỹ năng văn phòng cơ bản không? Hay chỉ cần biết ra lệnh cho AI?"*
2. *"NotebookLM chỉ trả lời dựa trên tài liệu bạn cung cấp — điều đó có nghĩa là kiến thức của AI bị giới hạn bởi tài liệu của bạn. Điều này là ưu điểm hay nhược điểm?"*
3. *"AI Workflow kết hợp 5–6 công cụ khác nhau — khi nào thì việc kết hợp nhiều tool trở nên phức tạp hơn là hữu ích?"*

---

## 6. Phụ lục — Bộ Tài liệu Mẫu cho Lab NotebookLM

Nếu SV không có tài liệu sẵn, GV có thể chuẩn bị bộ sau và chia sẻ qua Google Drive lớp:

```
Bộ tài liệu mẫu — chủ đề: AI trong giáo dục

1. paper_AI_education.pdf
   (1 bài báo tiếng Anh về AI trong giáo dục đại học)

2. de_cuong_mon_hoc.pdf
   (Đề cương môn học này — SV đã có)

3. https://[link bài viết tiếng Việt về AI cho sinh viên]
   (GV tìm 1 bài viết phù hợp trên báo/trang giáo dục)

4. https://www.youtube.com/watch?v=[ID video]
   (1 video ngắn giải thích AI cho người mới bắt đầu)
```

NotebookLM đọc được tất cả 4 nguồn trên → SV hỏi câu hỏi so sánh giữa các nguồn.

---

## 7. Ghi chú cho Giảng viên

- **Lab NotebookLM là trọng tâm** — đảm bảo SV có tài liệu để upload trước khi bắt đầu lab
- Tính năng **Audio Overview** của NotebookLM thường gây ấn tượng mạnh — để demo cuối cùng
- **Phần AI cho Code** — linh hoạt theo lớp: lớp CNTT dành 15 phút, lớp khác rút còn 5–7 phút
- **Thời gian AI Portfolio** không thể cắt — đây là lần đầu GV kiểm tra SV có bắt đầu portfolio chưa
- Tuần 9 là tuần thảo luận không có lab → cần chuẩn bị 3 case study trước (xem kế hoạch tuần 9)
- Nhắc SV: 2 tuần còn lại — chuẩn bị tốt AI Portfolio (30%) và Báo cáo cuối kỳ (30%)
