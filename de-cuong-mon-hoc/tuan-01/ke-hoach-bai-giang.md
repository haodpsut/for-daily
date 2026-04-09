# Kế hoạch Bài giảng — Tuần 1
# Toàn cảnh AI và Bắt đầu ngay

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 1 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO1, CLO3

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] Giải thích được AI tạo sinh (GenAI) là gì theo cách đơn giản, không kỹ thuật
- [ ] Phân biệt được ít nhất 4 nhóm công cụ AI chính hiện nay
- [ ] Có tài khoản hoạt động trên ChatGPT, Gemini và Copilot
- [ ] Thực hiện được hội thoại cơ bản với AI để giải quyết 1 việc học tập thực tế

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Kiểm tra tốc độ Internet phòng máy trước giờ học
- [ ] Chuẩn bị sẵn 3 tab: chat.openai.com / gemini.google.com / copilot.microsoft.com
- [ ] Chuẩn bị 1 câu hỏi demo để so sánh kết quả 3 tool (xem mục 4.2)
- [ ] In hoặc chia sẻ link: Bảng so sánh 3 công cụ (ở cuối file này)

### Sinh viên cần có
- Laptop hoặc điện thoại có kết nối Internet
- 1 tài khoản Google (để đăng ký Gemini)
- Email cá nhân (để đăng ký ChatGPT)

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Khởi động: câu hỏi mở + khảo sát nhanh | Cả lớp |
| 10–45 phút | Lý thuyết: Toàn cảnh AI (Phần A) | Giảng + demo |
| 45–60 phút | Thực hành 1: Đăng ký tài khoản 3 tool | Cá nhân |
| 60–90 phút | Thực hành 2: Lab so sánh 3 tool | Cá nhân + chia sẻ |
| 90–120 phút | Thực hành 3: Giải quyết việc học tập thực tế | Cá nhân |
| 120–135 phút | Tổng kết + giao bài tập về nhà | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Lý thuyết: Toàn cảnh AI (35 phút)

---

#### 4.A.1 — Khởi động (10 phút)

**Câu hỏi mở cho cả lớp (không cần trả lời đúng):**

> *"Trong 1 tuần qua, bạn có dùng AI không? Dùng để làm gì?"*

Giảng viên ghi nhanh lên bảng / màn hình — tạo word cloud hoặc liệt kê.  
Mục đích: kích hoạt kiến thức nền, tạo không khí, hiểu xuất phát điểm lớp.

**Khảo sát nhanh bằng tay giơ lên:**
- "Ai đã dùng ChatGPT ít nhất 1 lần?"
- "Ai dùng AI thường xuyên (hơn 3 lần/tuần)?"
- "Ai chưa bao giờ dùng?"

---

#### 4.A.2 — AI tạo sinh là gì? (10 phút)

**Nội dung giảng:**

AI tạo sinh (**Generative AI / GenAI**) là nhóm AI có khả năng **tạo ra nội dung mới** — văn bản, hình ảnh, âm thanh, video, code — dựa trên dữ liệu đã được học.

Điểm khác biệt với AI truyền thống:

| AI truyền thống | AI tạo sinh (GenAI) |
|---|---|
| Phân loại, nhận dạng, dự đoán | Tạo ra nội dung mới |
| Trả lời Yes/No hoặc một con số | Trả lời bằng văn bản tự nhiên, hình ảnh, video |
| Ví dụ: nhận diện khuôn mặt, lọc spam | Ví dụ: ChatGPT, Midjourney, Suno |

**Giải thích đơn giản (không cần toán):**

> GenAI giống như một người đã đọc hàng tỷ cuốn sách, bài viết, hình ảnh — và từ đó học được quy luật ngôn ngữ, hình ảnh. Khi bạn hỏi, nó **tạo ra câu trả lời mới** từ những gì đã học, không phải copy-paste từ đâu đó.

**Lưu ý quan trọng cần nhấn ngay từ đầu:**
- AI **không phải** tra cứu từ internet theo thời gian thực (trừ khi có tính năng search riêng)
- AI **có thể sai** — đặc biệt với số liệu cụ thể, ngày tháng, tên người
- AI **không có ý kiến thật** — nó mô phỏng ngôn ngữ con người

---

#### 4.A.3 — Bản đồ công cụ AI hiện nay (15 phút)

**Sơ đồ phân loại 5 nhóm chính:**

```
                        CÔNG CỤ AI HIỆN NAY
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   CHATBOT AI           AI HÌNH ẢNH            AI ÂM THANH
  (Text ↔ Text)        (Text → Image)         (Text → Audio)
   ChatGPT              Midjourney              Suno
   Gemini               DALL-E 3                ElevenLabs
   Copilot              Stable Diffusion        Whisper
        │                     │
   AI VIDEO              AI CODE
  (Text → Video)       (Text → Code)
   Sora                  GitHub Copilot
   Runway ML             Cursor
   Kling AI              Replit AI
```

**Nhóm quan trọng nhất trong học phần này:**

| Nhóm | Học phần này dạy | Ứng dụng trong học tập |
|---|---|---|
| Chatbot AI | Tuần 1–5 | Tìm kiếm, viết lách, giải thích, tóm tắt |
| AI hình ảnh | Tuần 6 | Minh họa, thiết kế, thuyết trình |
| AI slides/docs | Tuần 7 | Báo cáo, thuyết trình, portfolio |
| AI năng suất | Tuần 8 | Tổng hợp tài liệu, tự động hóa |

**Demo live ngắn 3 phút:**
Giảng viên gõ lệnh đơn giản vào ChatGPT ngay trên màn hình chiếu:
> *"Giải thích trí tuệ nhân tạo bằng 3 câu đơn giản nhất có thể"*

Sau đó thử lại câu đó trên Gemini → thấy ngay sự khác biệt.

---

#### 4.A.4 — Tại sao quan trọng với sinh viên ngay bây giờ? (5 phút)

**Không phải chuyện tương lai xa — là ngay hôm nay:**

- Người tuyển dụng bắt đầu hỏi: *"Bạn dùng AI như thế nào trong công việc?"*
- Sinh viên biết dùng AI tốt → làm việc nhanh hơn 3–5 lần so với người không dùng
- Không biết dùng AI không có nghĩa là "sạch hơn" — chỉ có nghĩa là chậm hơn

**Thông điệp cốt lõi của môn học:**

> *"AI không thay thế bạn. Nhưng người biết dùng AI sẽ thay thế người không biết dùng."*

**Môn học này dạy gì và KHÔNG dạy gì:**

| Môn học này DẠY | Môn học này KHÔNG dạy |
|---|---|
| Cách dùng công cụ AI hiệu quả | Cách lập trình AI |
| Kỹ năng viết prompt tốt | Toán học / thuật toán ML |
| Tư duy sử dụng AI có trách nhiệm | Cách xây dựng mô hình AI |
| Áp dụng AI vào học tập thực tế | Lý thuyết deep learning |

---

### 4.B — Thực hành 1: Đăng ký tài khoản (15 phút)

**Hướng dẫn từng bước — GV chiếu màn hình, SV làm theo:**

#### Đăng ký ChatGPT
1. Truy cập: `chat.openai.com`
2. Click **Sign up** → dùng email cá nhân hoặc đăng nhập bằng Google/Microsoft
3. Xác nhận email nếu cần
4. Chọn gói **Free** — đủ dùng cho toàn bộ môn học
5. Thử gõ 1 câu bất kỳ để test

#### Đăng ký Google Gemini
1. Truy cập: `gemini.google.com`
2. Đăng nhập bằng tài khoản Google (Gmail) — không cần đăng ký thêm
3. Chấp nhận điều khoản
4. Sẵn sàng dùng ngay

#### Đăng ký Microsoft Copilot
1. Truy cập: `copilot.microsoft.com`
2. Có thể dùng không cần đăng nhập (chế độ khách)
3. Hoặc đăng nhập bằng tài khoản Microsoft/Outlook để lưu lịch sử

**Lưu ý:** Một số SV có thể gặp lỗi do IP hoặc số điện thoại với ChatGPT. GV cần có phương án dự phòng: dùng Gemini hoặc Copilot thay thế trong lab.

---

### 4.C — Thực hành 2: Lab so sánh 3 công cụ (30 phút)

**Mục tiêu:** SV cảm nhận trực tiếp sự khác biệt giữa 3 tool — không chỉ nghe mô tả.

**Câu hỏi demo do GV chuẩn bị sẵn — dùng cùng 1 câu trên cả 3 tool:**

*Gợi ý câu hỏi phù hợp (GV chọn 1):*

> a) *"Tôi là sinh viên năm 1. Hãy gợi ý cho tôi 5 thói quen học tập hiệu quả."*
> 
> b) *"Giải thích khái niệm biến đổi khí hậu cho một học sinh lớp 10 hiểu được."*
>
> c) *"Tôi cần viết email xin thầy hướng dẫn cho phép nộp bài muộn 2 ngày. Hãy viết giúp tôi."*

**Bảng so sánh SV điền trong khi thực hành:**

| Tiêu chí so sánh | ChatGPT | Gemini | Copilot |
|---|---|---|---|
| Độ dài câu trả lời | | | |
| Dễ đọc / dễ hiểu | | | |
| Có dẫn nguồn không? | | | |
| Câu trả lời hữu ích không? (1–5) | | | |
| Nhận xét thêm | | | |

**Chia sẻ kết quả (5 phút cuối):**
- GV mời 2–3 SV chia sẻ nhận xét của mình
- Gợi ý thảo luận: *"Bạn thích tool nào nhất và tại sao?"*

---

### 4.D — Thực hành 3: Giải quyết việc học tập thực tế (30 phút)

**Mục tiêu:** SV lần đầu tiên dùng AI để giải quyết vấn đề thật của bản thân — không phải ví dụ giả.

**Hướng dẫn:**

> *"Hãy nghĩ đến 1 việc học tập bạn đang cần làm hoặc đang gặp khó khăn — có thể là đề cương bài tập, tóm tắt tài liệu, giải thích khái niệm khó, chuẩn bị bài thuyết trình... Dùng ChatGPT (hoặc Gemini) để AI giúp bạn."*

**Gợi ý nếu SV không biết bắt đầu từ đâu:**

| Tình huống | Câu mẫu để thử |
|---|---|
| Có bài đọc dài không hiểu | *"Tóm tắt đoạn văn sau trong 5 gạch đầu dòng: [dán đoạn văn vào]"* |
| Có khái niệm chưa rõ | *"Giải thích [khái niệm X] bằng ngôn ngữ đơn giản, có ví dụ thực tế"* |
| Cần chuẩn bị thuyết trình | *"Tôi cần trình bày về [chủ đề Y] trong 5 phút. Hãy gợi ý cấu trúc bài thuyết trình"* |
| Cần viết email | *"Viết email [mục đích] gửi cho [người nhận], giọng [chính thức/thân thiện]"* |

**GV quan sát và hỗ trợ** — đi quanh phòng, xem màn hình SV, gợi ý khi SV bí.

**Chia sẻ kết quả (5 phút):**
- 2–3 SV chia sẻ họ đã làm gì và AI giúp được gì
- Câu hỏi phản ánh: *"Kết quả AI đưa ra có dùng được ngay không? Cần chỉnh sửa gì không?"*

---

### 4.E — Tổng kết và Bài tập về nhà (15 phút)

**Tổng kết 3 điểm chính của buổi học:**

1. **GenAI tạo ra nội dung mới** — không tra cứu, không copy, có thể sai
2. **3 chatbot miễn phí** (ChatGPT / Gemini / Copilot) — khác nhau nhưng đều dùng được
3. **AI là công cụ** — hiệu quả phụ thuộc vào cách bạn đặt câu hỏi (sẽ học ở tuần 2–3)

**Giao bài tập về nhà (BT1):**

> Trong 1 tuần tới, hãy dùng bất kỳ công cụ AI nào (ChatGPT/Gemini/Copilot) để **hỗ trợ ít nhất 1 việc học tập thực tế**.
>
> **Nộp:** 1 file ảnh chụp màn hình cuộc hội thoại + 2–3 câu mô tả:
> - Bạn đã dùng AI để làm gì?
> - Kết quả có hữu ích không?
> - Bạn có phải chỉnh sửa gì không?
>
> **Deadline:** Đầu buổi học Tuần 2  
> **Điểm:** Tính vào điểm Bài tập tuần (BT1/5)

**Xem trước tuần sau:**
> Tuần 2 sẽ học cách viết prompt đúng cách — tại sao cùng 1 yêu cầu nhưng cách hỏi khác nhau cho kết quả hoàn toàn khác nhau.

---

## 5. Câu hỏi thảo luận mở rộng (nếu còn thời gian)

1. *"Bạn có lo ngại gì khi dùng AI không? Lo ngại đó có cơ sở không?"*
2. *"Ngành bạn đang học sẽ bị AI ảnh hưởng như thế nào trong 5 năm tới?"*
3. *"Có việc gì bạn nghĩ AI KHÔNG thể làm thay bạn không?"*

---

## 6. Phụ lục — Bảng so sánh 3 công cụ (tài liệu phát tay)

| | **ChatGPT** | **Google Gemini** | **Microsoft Copilot** |
|---|---|---|---|
| **Nhà phát triển** | OpenAI | Google DeepMind | Microsoft + OpenAI |
| **Link** | chat.openai.com | gemini.google.com | copilot.microsoft.com |
| **Miễn phí?** | Có (giới hạn) | Có | Có (không giới hạn) |
| **Tìm kiếm web** | Có (giới hạn) | Có | Có (tích hợp Bing) |
| **Tích hợp với** | Nhiều app bên thứ 3 | Google Drive, Docs | Microsoft 365, Edge |
| **Điểm mạnh** | Viết lách, lý luận, đa năng nhất | Tích hợp Google, xử lý ảnh tốt | Tìm kiếm web, dùng không cần đăng ký |
| **Giới hạn free** | ~10–20 tin/3 giờ | Khá rộng rãi | Không giới hạn tin nhắn |
| **Phù hợp nhất cho** | Viết, phân tích, code | Nghiên cứu, tích hợp Google | Tìm kiếm thông tin nhanh |

> **Khuyến nghị cho SV:** Dùng **Gemini** làm tool chính (miễn phí, không giới hạn, dùng tài khoản Google sẵn có). Dùng **ChatGPT** cho các tác vụ cần chất lượng cao hơn.

---

## 7. Ghi chú cho Giảng viên

- **Không cần** giảng sâu về kỹ thuật AI (LLM, transformer...) — SV không cần biết để dùng
- **Nên** dừng lại tại mỗi demo để hỏi lớp: *"Các bạn thấy kết quả này như thế nào?"*
- Nếu SV gặp lỗi đăng ký ChatGPT do IP → chuyển sang dùng **Gemini** ngay, không mất thời gian xử lý
- Phần thực hành 3 là quan trọng nhất — cố gắng giữ đủ 30 phút cho phần này
- Khuyến khích SV dùng **tiếng Việt** với AI — phá vỡ rào cản "phải dùng tiếng Anh mới tốt"
