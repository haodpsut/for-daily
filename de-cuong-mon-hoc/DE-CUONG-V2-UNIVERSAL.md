# Đề cương Học phần (Phiên bản 2.0)
# Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp
> Khoa Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng  
> Dành cho sinh viên tất cả các ngành — Phổ quát, thực hành, dùng được ngay

---

## I. Định vị môn học

### Tại sao phiên bản này khác V1?

| V1 (đã đề xuất) | V2 (phiên bản này) |
|---|---|
| Custom sâu cho kiến trúc/xây dựng | **Phổ quát** — áp dụng được mọi ngành |
| Có module BIM/CAD chuyên biệt | Bỏ module ngành — giữ công cụ chung |
| Ví dụ lab thiên về thiết kế/đồ án | Ví dụ đa dạng, SV tự áp dụng vào ngành mình |
| Nặng AI hình ảnh | **Cân bằng** các nhóm công cụ AI |

### Triết lý thiết kế V2

```
MỤC TIÊU DUY NHẤT: Sinh viên ra khỏi lớp biết DÙNG được AI — không chỉ biết AI là gì.

CÁCH TIẾP CẬN:
  → Dạy CÔNG CỤ trước, lý thuyết sau (hoặc lồng ghép)
  → Mỗi buổi = 1 nhóm công cụ + thực hành ngay trên máy
  → SV tự chọn áp dụng vào ngành của mình trong các bài tập
  → Không dạy "AI cho kiến trúc" hay "AI cho CNTT" — dạy "AI cho bạn"
```

---

## II. Thông tin học phần

| Thuộc tính | Nội dung |
|---|---|
| Tên học phần | Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp |
| Tên tiếng Anh | Applied AI for Learning and Professional Practice |
| Mã học phần | *(do trường quy định)* |
| Số tín chỉ | **2 tín chỉ** (30 tiết: 20 lý thuyết + 10 thực hành lab) |
| Hình thức | Trực tiếp tại phòng máy — ưu tiên thực hành |
| Tính chất | Bắt buộc (đại cương) |
| Tiên quyết | Không |
| Đối tượng | SV năm 1–2, **tất cả các ngành** trong trường |
| Đơn vị giảng dạy | Khoa Công nghệ Thông tin |

---

## III. Mục tiêu và Chuẩn đầu ra

### Mục tiêu tổng quát
Trang bị cho sinh viên **khả năng sử dụng thành thạo các công cụ AI phổ biến** trong học tập, nghiên cứu và công việc; đồng thời hình thành thái độ **sử dụng AI có trách nhiệm và hiệu quả**.

### Chuẩn đầu ra (CLO)

| CLO | Sau khi học xong, sinh viên có thể... | Mức độ |
|---|---|---|
| **CLO1** | Giải thích được AI tạo sinh là gì, phân biệt các nhóm công cụ AI chính hiện nay | Hiểu |
| **CLO2** | Viết được prompt hiệu quả theo framework CRAC cho các tình huống học tập và công việc | Vận dụng |
| **CLO3** | Sử dụng được các công cụ AI chatbot (ChatGPT/Gemini/Copilot) để hỗ trợ học tập, tìm kiếm, viết lách | Vận dụng |
| **CLO4** | Tạo được nội dung số bằng AI (hình ảnh, slides, video ngắn, báo cáo) phục vụ học tập và nghề nghiệp | Vận dụng |
| **CLO5** | Phân tích được các vấn đề đạo đức, bản quyền, liêm chính học thuật khi sử dụng AI | Phân tích |
| **CLO6** | Chủ động tìm hiểu và cập nhật các công cụ AI mới phù hợp với lĩnh vực chuyên ngành | Thái độ |

---

## IV. Cấu trúc nội dung (10 tuần)

```
PHẦN I  — NỀN TẢNG AI           (Tuần 1–3)   → Biết AI là gì, biết dùng chatbot, biết viết prompt
PHẦN II — CÔNG CỤ AI THỰC HÀNH  (Tuần 4–8)   → Thực hành 5 nhóm công cụ AI quan trọng nhất
PHẦN III— AI VÀ TRÁCH NHIỆM     (Tuần 9–10)  → Dùng đúng cách, đạo đức, bước tiếp theo
```

---

### PHẦN I — NỀN TẢNG AI (Tuần 1–3)

---

#### Tuần 1 — Toàn cảnh AI và bắt đầu ngay

**CLO liên quan:** CLO1, CLO3  
**Lý thuyết (1 tiết):**
- AI tạo sinh (GenAI) là gì — không cần học toán, không cần code
- Sơ đồ phân loại: Chatbot AI / AI hình ảnh / AI âm thanh / AI video / AI code
- Tại sao AI quan trọng với sinh viên ngay bây giờ — không phải tương lai xa

**Thực hành (2 tiết):**
- Đăng ký tài khoản: ChatGPT, Google Gemini, Microsoft Copilot
- Thực hành đầu tiên: hỏi cùng 1 câu trên 3 tool → so sánh kết quả
- Bài tập về nhà: dùng 1 trong 3 tool hỗ trợ 1 việc học tập thực tế, chụp màn hình nộp

---

#### Tuần 2 — Prompt Engineering (Phần 1): Cơ bản

**CLO liên quan:** CLO2, CLO3  
**Lý thuyết (1 tiết):**
- Tại sao cùng yêu cầu nhưng prompt khác nhau → kết quả khác hoàn toàn
- Framework **CRAC**: **C**ontext (bối cảnh) + **R**ole (vai trò AI) + **A**ction (yêu cầu cụ thể) + **C**riteria (tiêu chí kết quả)
- Nguyên tắc: Rõ ràng, Cụ thể, Có ví dụ, Biết lặp lại/tinh chỉnh

**Thực hành (2 tiết):**
- Viết lại 5 prompt "kém" → "tốt" theo CRAC
- Tình huống thực tế: tóm tắt tài liệu, giải thích khái niệm, lên dàn ý bài tập
- Bài tập: viết prompt giải quyết 1 vấn đề học tập của bản thân

---

#### Tuần 3 — Prompt Engineering (Phần 2): Nâng cao

**CLO liên quan:** CLO2, CLO3  
**Lý thuyết (1 tiết):**
- Kỹ thuật nâng cao: Zero-shot / Few-shot / Chain-of-thought / Role-playing
- Prompt nhiều vòng (multi-turn): cách duy trì ngữ cảnh và tinh chỉnh dần
- Giới hạn của AI: hallucination, bias, knowledge cutoff — cần biết để dùng đúng

**Thực hành (2 tiết):**
- Thực hành few-shot: cho AI vài ví dụ mẫu → yêu cầu tạo thêm theo cùng phong cách
- Thực hành role-playing: "Bạn là chuyên gia X, hãy phân tích vấn đề Y theo góc độ Z"
- Lab tổng hợp: giải quyết 1 bài toán phức tạp qua 5 vòng hội thoại liên tiếp

---

### PHẦN II — CÔNG CỤ AI THỰC HÀNH (Tuần 4–8)

> Mỗi tuần = 1 nhóm công cụ AI. SV tự chọn ngữ cảnh áp dụng phù hợp với ngành mình.

---

#### Tuần 4 — AI cho Tìm kiếm và Nghiên cứu

**CLO liên quan:** CLO3, CLO5  
**Lý thuyết (1 tiết):**
- Tìm kiếm thông minh hơn với AI: khác gì Google truyền thống
- Đánh giá độ tin cậy nguồn; nhận diện AI "bịa" số liệu (hallucination)
- AI tìm tài liệu học thuật: cách trích dẫn đúng khi dùng AI hỗ trợ nghiên cứu

**Công cụ thực hành:**
| Công cụ | Mục đích | Miễn phí? |
|---|---|---|
| Perplexity AI | Search có dẫn nguồn, tóm tắt web | Freemium |
| ChatGPT / Gemini | Tổng hợp thông tin, giải thích | Miễn phí |
| SciSpace | Đọc và hỏi đáp về paper học thuật | Freemium |
| Google Scholar + AI | Tìm tài liệu học thuật | Miễn phí |

**Thực hành (2 tiết):**
- Tìm kiếm 1 chủ đề liên quan đến ngành: so sánh kết quả Google vs Perplexity
- Dùng SciSpace đọc 1 bài báo tiếng Anh và đặt câu hỏi bằng tiếng Việt
- Bài tập: viết tóm tắt 300 từ về 1 chủ đề, ghi rõ nguồn AI đã dùng

---

#### Tuần 5 — AI cho Viết lách và Ngôn ngữ

**CLO liên quan:** CLO3, CLO5  
**Lý thuyết (1 tiết):**
- AI hỗ trợ viết: khi nào nên dùng, khi nào không nên dùng
- Ranh giới giữa "hỗ trợ" và "đạo văn" — quy định thực tế
- AI dịch thuật: DeepL vs Google Translate vs ChatGPT — khi nào dùng cái gì

**Công cụ thực hành:**
| Công cụ | Mục đích | Miễn phí? |
|---|---|---|
| ChatGPT / Gemini | Viết, chỉnh sửa, tóm tắt | Miễn phí |
| DeepL | Dịch thuật chất lượng cao | Freemium |
| Grammarly AI | Sửa ngữ pháp tiếng Anh | Freemium |
| Paperpal | Viết học thuật | Freemium |

**Thực hành (2 tiết):**
- Dùng ChatGPT viết → tự chỉnh sửa → so sánh bản gốc và bản đã chỉnh
- Dùng DeepL dịch 1 đoạn tài liệu kỹ thuật tiếng Anh, chỉnh lại cho tự nhiên
- Lab: viết email xin thầy hướng dẫn đồ án — phiên bản không AI vs có AI

---

#### Tuần 6 — AI tạo Hình ảnh và Nội dung Trực quan

**CLO liên quan:** CLO4  
**Lý thuyết (1 tiết):**
- Cách AI tạo ảnh hoạt động (không cần hiểu sâu kỹ thuật)
- Cú pháp prompt cho ảnh: chủ thể + phong cách + ánh sáng + màu sắc + góc nhìn
- Ứng dụng thực tế: minh họa báo cáo, tạo hình nền thuyết trình, concept ý tưởng

**Công cụ thực hành:**
| Công cụ | Mục đích | Miễn phí? |
|---|---|---|
| DALL-E 3 (trong ChatGPT) | Tạo ảnh từ văn bản | Miễn phí (giới hạn) |
| Adobe Firefly | Tạo ảnh, chỉnh sửa ảnh AI | Freemium |
| Canva AI (Magic Media) | Tạo ảnh + thiết kế đồ họa | Freemium |
| Microsoft Designer | Tạo poster, banner nhanh | Miễn phí |

**Thực hành (2 tiết):**
- Thực hành tạo ảnh minh họa cho 1 chủ đề tự chọn với 5 prompt khác nhau
- Dùng Canva AI tạo 1 infographic đơn giản từ nội dung đã viết ở tuần 5
- Thảo luận: ảnh AI có bản quyền không? — dẫn ví dụ thực tế

---

#### Tuần 7 — AI tạo Slides và Thuyết trình

**CLO liên quan:** CLO4  
**Lý thuyết (1 tiết):**
- Quy trình: ý tưởng thô → AI tạo cấu trúc → bổ sung nội dung → chỉnh thiết kế
- So sánh các tool: điểm mạnh từng công cụ, khi nào dùng cái gì
- Sai lầm thường gặp: lấy nguyên slide AI mà không chỉnh → nhìn là biết "AI làm"

**Công cụ thực hành:**
| Công cụ | Mục đích | Miễn phí? |
|---|---|---|
| Gamma.app | Tạo slide/trang web từ văn bản hoặc URL | Freemium |
| Canva AI | Thiết kế slide với AI suggestions | Freemium |
| Tome.app | Tạo bài thuyết trình dạng tường thuật | Freemium |
| Beautiful.ai | Slide tự điều chỉnh layout | Freemium |

**Thực hành (2 tiết):**
- Dùng Gamma.app: nhập 1 đoạn văn ngắn → xuất ra 8–10 slide hoàn chỉnh
- Chỉnh sửa slide do AI tạo: thêm nội dung riêng, thay ảnh, điều chỉnh thiết kế
- **Mini project:** Tạo bộ slide giới thiệu bản thân / ngành học / 1 chủ đề tự chọn

---

#### Tuần 8 — AI cho Năng suất và Tự động hóa

**CLO liên quan:** CLO3, CLO4  
**Lý thuyết (1 tiết):**
- AI tích hợp trong công cụ hàng ngày: Microsoft 365 Copilot, Google Workspace AI
- Khái niệm AI workflow: kết nối nhiều tool AI để tự động hóa quy trình
- Tổng quan AI cho code (dành cho SV quan tâm): GitHub Copilot, Cursor

**Công cụ thực hành:**
| Công cụ | Mục đích | Miễn phí? |
|---|---|---|
| Microsoft Copilot (Word/Excel) | AI trong bộ Office | Freemium |
| NotebookLM (Google) | Đọc và hỏi đáp nhiều tài liệu cùng lúc | Miễn phí |
| Otter.ai / Whisper | Chuyển âm thanh → văn bản | Freemium |
| Zapier AI / Make | Tự động hóa quy trình (demo) | Freemium |

**Thực hành (2 tiết):**
- Dùng **NotebookLM**: upload 3–5 tài liệu học tập → đặt câu hỏi tổng hợp
- Demo Copilot trong Word: giao tác vụ viết tóm tắt, tạo bảng, phân tích văn bản
- Bài tập tự chọn: dùng bất kỳ tool nào ở tuần này để giải 1 vấn đề học tập thực tế

---

### PHẦN III — AI VÀ TRÁCH NHIỆM (Tuần 9–10)

---

#### Tuần 9 — Đạo đức, Bản quyền và Liêm chính khi dùng AI

**CLO liên quan:** CLO5  
**Lý thuyết (2 tiết, không có lab riêng — thảo luận là chính):**

- **Bản quyền nội dung AI:** Văn bản, hình ảnh do AI tạo ra — ai sở hữu? Pháp luật Việt Nam và quốc tế nói gì?
- **Liêm chính học thuật:** Ranh giới rõ ràng:

  ```
  ĐƯỢC PHÉP:          Dùng AI gợi ý ý tưởng, dịch thuật, chỉnh sửa ngữ pháp
  CẦN KHAI BÁO:       Dùng AI viết một phần bài nộp
  KHÔNG ĐƯỢC PHÉP:    Nộp nguyên bài do AI viết hoàn toàn mà không khai báo
  ```

- **AI Hallucination:** Tại sao AI "bịa" tự tin — cách fact-check bắt buộc
- **Bảo mật thông tin cá nhân:** Không đưa dữ liệu nhạy cảm (CMND, mật khẩu, tài liệu mật) vào AI

**Hoạt động:**
- Case study thảo luận nhóm: 3 tình huống thực tế — SV phân tích đúng/sai, vì sao
- Mỗi nhóm trình bày quan điểm → cả lớp tranh luận

---

#### Tuần 10 — Tổng kết, Roadmap và Báo cáo cuối kỳ

**CLO liên quan:** CLO6  
**Lý thuyết (1 tiết):**
- Những gì AI đang **không làm được** — và vẫn cần con người
- Roadmap tự học AI tiếp theo: nguồn học uy tín, miễn phí
- Xu hướng AI 2025–2026 và tác động đến các ngành nghề

**Thực hành / Báo cáo (2 tiết):**
- SV trình bày **AI Portfolio** cá nhân (xem mục VI)
- Chia sẻ 1 công cụ AI mới mà bạn tự tìm hiểu — demo ngắn 3 phút

---

## V. Phương pháp giảng dạy

| Phương pháp | Mô tả | Tỷ lệ |
|---|---|---|
| **Thực hành lab** | Mỗi buổi 2 tiết làm việc trực tiếp với công cụ AI trên máy | ~60% |
| **Lý thuyết ngắn** | 30–45 phút đầu mỗi buổi — chỉ những gì cần biết để thực hành | ~20% |
| **Thảo luận / Case study** | Tình huống thực tế, tranh luận quan điểm (đặc biệt tuần 9) | ~10% |
| **Tự học có hướng dẫn** | Bài tập về nhà khuyến khích SV tự khám phá tool mới | ~10% |

> **Nguyên tắc:** Lý thuyết chỉ đủ để thực hành — không giảng dài, không đọc slide.  
> Mỗi công cụ được giới thiệu → thực hành ngay trong cùng buổi học.

---

## VI. Kiểm tra, Đánh giá

### Bảng điểm

| Thành phần | Trọng số | Mô tả |
|---|---|---|
| **Tham gia + Quiz nhanh** | **20%** | Điểm danh + quiz cuối buổi (5 câu, 5 phút) đánh giá hiểu bài |
| **Bài tập tuần** | **20%** | 5 bài tập nhỏ (tuần 1, 2, 4, 5, 6) — nộp file/screenshot |
| **AI Portfolio** | **30%** | Bộ sưu tập sản phẩm AI cá nhân tích lũy suốt khóa học |
| **Báo cáo cuối kỳ** | **30%** | Dự án ứng dụng AI giải quyết 1 vấn đề thực tế của bản thân |

---

### AI Portfolio là gì?

Portfolio là tập hợp **ít nhất 5 sản phẩm** SV tạo ra trong suốt khóa học, kèm **ghi chú phản ánh** (reflection):

```
Mỗi sản phẩm trong portfolio cần có:
  1. Sản phẩm thực tế (file, screenshot, link)
  2. Công cụ AI đã dùng
  3. Prompt quan trọng đã dùng
  4. Nhận xét: khó khăn gặp phải, cách xử lý, rút ra bài học gì
```

**Ví dụ sản phẩm portfolio:**
- Bộ 5 ảnh AI minh họa cho 1 chủ đề tự chọn + nhận xét quá trình
- Bộ slide 10 trang do AI tạo (đã chỉnh sửa) + ghi chú những gì đã sửa và tại sao
- Bản tóm tắt tài liệu học thuật dài bằng AI + đánh giá độ chính xác
- Chuỗi prompt 5 vòng giải quyết 1 bài toán phức tạp + phân tích quá trình tinh chỉnh

---

### Dự án cuối kỳ

**Yêu cầu:** Chọn 1 vấn đề thực tế trong học tập hoặc cuộc sống → ứng dụng ít nhất 3 công cụ AI → tạo ra sản phẩm cụ thể → trình bày 5 phút.

**Tự do chọn đề tài** — SV áp dụng vào ngành mình đang học:

| Ví dụ đề tài | Sản phẩm kỳ vọng |
|---|---|
| Nghiên cứu tài liệu cho báo cáo môn học | Báo cáo 1000 từ + slide thuyết trình, ghi rõ AI đã hỗ trợ bước nào |
| Tạo nội dung truyền thông cho câu lạc bộ | Bộ 10 ảnh + 5 caption + 1 slide giới thiệu CLB |
| Tóm tắt và phân tích 5 bài báo nước ngoài | Bản phân tích so sánh + bảng tổng hợp |
| Chuẩn bị portfolio xin việc/thực tập | CV + thư xin việc + slide giới thiệu bản thân |
| *(Tự đề xuất)* | *(SV tự mô tả sản phẩm)* |

---

## VII. Danh sách công cụ AI theo học phần

> Tất cả đều **web-based**, không cần cài đặt, có bản miễn phí sử dụng được.

### Nhóm Chatbot AI (Tuần 1–3)
| Công cụ | Link | Ghi chú |
|---|---|---|
| ChatGPT | chat.openai.com | Tài khoản free đủ dùng |
| Google Gemini | gemini.google.com | Tích hợp tốt với Google Drive |
| Microsoft Copilot | copilot.microsoft.com | Miễn phí, tích hợp Bing |

### Nhóm Nghiên cứu (Tuần 4)
| Công cụ | Link | Ghi chú |
|---|---|---|
| Perplexity AI | perplexity.ai | Tốt nhất cho search có nguồn |
| SciSpace | typeset.io | Đọc paper học thuật |
| NotebookLM | notebooklm.google.com | Hỏi đáp nhiều tài liệu cùng lúc |

### Nhóm Viết và Dịch (Tuần 5)
| Công cụ | Link | Ghi chú |
|---|---|---|
| DeepL | deepl.com | Dịch chất lượng cao |
| Grammarly | grammarly.com | Sửa tiếng Anh |

### Nhóm Hình ảnh (Tuần 6)
| Công cụ | Link | Ghi chú |
|---|---|---|
| DALL-E 3 | Trong ChatGPT | 3–5 ảnh/ngày miễn phí |
| Canva AI | canva.com | Tạo ảnh + thiết kế đồ họa |
| Microsoft Designer | designer.microsoft.com | Miễn phí hoàn toàn |
| Adobe Firefly | firefly.adobe.com | Tốt cho ảnh sáng tạo |

### Nhóm Slides và Nội dung (Tuần 7)
| Công cụ | Link | Ghi chú |
|---|---|---|
| Gamma.app | gamma.app | Dễ dùng nhất, khuyến nghị |
| Canva AI | canva.com | Đa năng |
| Tome.app | tome.app | Tốt cho storytelling |

### Nhóm Năng suất (Tuần 8)
| Công cụ | Link | Ghi chú |
|---|---|---|
| NotebookLM | notebooklm.google.com | Tổng hợp nhiều tài liệu |
| Microsoft 365 Copilot | Trong Word/Excel | Cần tài khoản trường |

---

## VIII. Lịch trình chi tiết

| Tuần | Chủ đề | Công cụ chính | Bài tập / Đánh giá |
|---|---|---|---|
| 1 | Toàn cảnh AI + bắt đầu ngay | ChatGPT, Gemini, Copilot | BT1: Dùng AI hỗ trợ 1 việc học tập |
| 2 | Prompt cơ bản (CRAC) | ChatGPT | BT2: Viết 5 prompt theo CRAC |
| 3 | Prompt nâng cao | ChatGPT, Gemini | Quiz tuần 3 |
| 4 | AI tìm kiếm & nghiên cứu | Perplexity, SciSpace, NotebookLM | BT3: Tóm tắt chủ đề + ghi nguồn |
| 5 | AI viết lách & dịch thuật | DeepL, ChatGPT, Grammarly | BT4: Viết & dịch tài liệu kỹ thuật |
| 6 | AI tạo hình ảnh | DALL-E, Canva AI, Designer | BT5: Tạo bộ 5 ảnh minh họa |
| 7 | AI slides & thuyết trình | Gamma, Canva, Tome | **Mini project:** slide 10 trang |
| 8 | AI năng suất & tự động hóa | NotebookLM, Copilot | Bổ sung portfolio |
| 9 | Đạo đức, bản quyền, liêm chính | *(thảo luận)* | Case study nhóm |
| 10 | Tổng kết + báo cáo cuối kỳ | Tự chọn | **Nộp Portfolio + Báo cáo cuối kỳ** |

---

## IX. Tài liệu tham khảo

**Bắt buộc:**
- Bài giảng và hướng dẫn lab do giảng viên biên soạn (cập nhật theo học kỳ)

**Tham khảo:**
1. UNESCO (2024). *AI Competency Framework for Students*
2. Colin de la Higuera & Jotsna Iyer (2024). *AI for Teachers: An Open Textbook* — miễn phí
3. Beth Buyserie & Travis Thurston (2024). *Teaching and Generative AI*
4. Thông tư 02/2025/TT-BGDĐT — Khung năng lực số cho người học

**Cập nhật tools:**
- Blog của Anthropic, OpenAI, Google DeepMind
- Kênh YouTube: AI Explained, Two Minute Papers

---

## X. Lưu ý triển khai

### Cập nhật nội dung
> AI thay đổi rất nhanh. **Danh sách công cụ và tính năng nên được review mỗi học kỳ.**  
> Nên dành 1–2 buổi cuối học kỳ cho SV tự giới thiệu tool mới họ tìm được — vừa học vừa cập nhật lẫn nhau.

### Cơ sở vật chất tối thiểu
- Phòng máy tính có Internet ổn định (bắt buộc)
- Không cần cài phần mềm — tất cả web-based
- 1 máy chiếu để demo live

### Linh hoạt theo lớp
- Lớp SV CNTT: có thể thêm **GitHub Copilot** và **Cursor AI** vào tuần 8
- Lớp SV thiên thiết kế: có thể dành thêm 1 tuần cho AI hình ảnh nâng cao
- Nếu 3 tín chỉ: thêm 5 tuần, mở rộng lab và thêm 1 dự án nhóm giữa kỳ

---

*Phiên bản 2.0 — Phổ quát cho tất cả sinh viên*  
*Khoa Công nghệ Thông tin — Trường Đại học Kiến trúc Đà Nẵng*  
*Tham khảo: VNU1001 (ĐHQGHN, 2025) | UNESCO AI Framework (2024)*
