# Kế hoạch Bài giảng — Tuần 6
# AI tạo Hình ảnh và Nội dung Trực quan

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 6 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO4

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] Giải thích được cách AI tạo ảnh hoạt động (ở mức độ người dùng, không cần kỹ thuật)
- [ ] Viết được **image prompt** đúng cấu trúc: chủ thể + phong cách + ánh sáng + màu sắc + góc nhìn
- [ ] Dùng **DALL-E 3** (trong ChatGPT) tạo ảnh minh họa cho nội dung học tập
- [ ] Dùng **Canva AI** tạo infographic đơn giản từ nội dung văn bản
- [ ] Phân tích được vấn đề bản quyền ảnh AI trong bối cảnh học tập

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Tài khoản ChatGPT (có DALL-E 3 trong gói free giới hạn) hoặc Copilot Designer
- [ ] Tài khoản Canva (free, đăng nhập Google)
- [ ] Chuẩn bị 5–6 ví dụ ảnh AI tốt và xấu để demo so sánh
- [ ] Chuẩn bị nội dung demo infographic (dùng nội dung từ BT4/tuần 5)

### Kiểm tra bài tập tuần trước
- Thu BT4 (file Word + 2 screenshot)
- Nhận xét nhanh: chỗ nào SV chỉnh tốt nhất sau khi dịch DeepL

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Thu BT4 + khởi động | Cả lớp |
| 10–30 phút | Lý thuyết: AI tạo ảnh hoạt động như thế nào | Giảng + demo |
| 30–45 phút | Lý thuyết: Cú pháp Image Prompt | Giảng + demo so sánh |
| 45–80 phút | Lab 1: DALL-E 3 — tạo ảnh minh họa với 5 prompt | Cá nhân |
| 80–100 phút | Demo + Lab 2: Canva AI — tạo infographic | Giảng + cá nhân |
| 100–115 phút | Thảo luận: Bản quyền ảnh AI | Cả lớp |
| 115–125 phút | Chia sẻ kết quả + giao BT5 | Cả lớp |
| 125–135 phút | Tổng kết + xem trước tuần 7 | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Khởi động (10 phút)

**Thu BT4 + nhận xét nhanh:**
- Mời 1 SV chia sẻ: chỗ nào DeepL dịch tốt hơn Google Translate?
- Nhận xét 1 ví dụ trước/sau chỉnh sửa

**Câu hỏi kích hoạt:**

Chiếu 4 ảnh cạnh nhau — không nói gì, để SV đoán:
- 2 ảnh chụp thật
- 2 ảnh AI tạo ra

> *"Cái nào là ảnh thật? Cái nào là AI tạo?"*

Sau khi SV đoán → tiết lộ đáp án → kết nối:
> *"5 năm trước không thể tạo ảnh như thế này chỉ bằng văn bản. Hôm nay bạn sẽ làm được điều đó trong vài giây."*

---

### 4.B — Lý thuyết: AI tạo ảnh hoạt động như thế nào (20 phút)

#### Cơ chế đơn giản (không cần hiểu sâu kỹ thuật)

**AI tạo ảnh hoạt động theo 3 bước:**

```
Bước 1 — Đọc hiểu:
AI đọc văn bản prompt → hiểu: chủ thể là gì, phong cách nào, màu sắc gì

Bước 2 — Tìm pattern:
AI đã học từ hàng tỷ ảnh + caption → tìm những yếu tố thị giác phù hợp

Bước 3 — Tạo ra:
AI "tưởng tượng" và tạo ra ảnh mới — không copy từ ảnh có sẵn
```

**Tại sao điều này quan trọng để biết:**
- AI không tra cứu hay copy ảnh từ internet
- AI tạo ra ảnh **hoàn toàn mới** — nhưng dựa trên pattern đã học
- Ảnh đôi khi có lỗi kỳ lạ (ngón tay sai, chữ viết sai) — vì AI không "hiểu" logic thật

#### Các mô hình AI tạo ảnh phổ biến

| Mô hình | Tool tiếp cận | Điểm mạnh | Miễn phí? |
|---|---|---|---|
| DALL-E 3 | ChatGPT, Copilot Designer | Dễ dùng, hiểu ngữ cảnh tốt | Giới hạn |
| Stable Diffusion | Adobe Firefly, nhiều nền tảng | Linh hoạt, phong cách đa dạng | Có bản free |
| Imagen (Google) | Canva AI (Magic Media) | Tích hợp thiết kế đồ họa | Freemium |
| Midjourney | Discord | Chất lượng nghệ thuật cao nhất | Trả phí |

**Trong buổi học này:** Tập trung DALL-E 3 (qua ChatGPT/Copilot) và Canva AI — miễn phí, dễ tiếp cận nhất.

#### Demo nhanh — GV chiếu

Tạo 1 ảnh đơn giản với prompt ngắn:
```
A student studying at a desk with books and a laptop, warm lighting
```
→ Chiếu kết quả → cho lớp nhận xét.

---

### 4.C — Lý thuyết: Cú pháp Image Prompt (15 phút)

#### Tại sao cần học cú pháp?

**Thực tế:**
- Prompt ngắn → AI tự đoán → kết quả không đúng ý
- Prompt đúng cú pháp → AI hiểu đúng → ảnh gần với ý tưởng

#### 5 thành phần cú pháp Image Prompt

```
[CHỦ THỂ] + [PHONG CÁCH/NGHỆ THUẬT] + [ÁNH SÁNG] + [MÀU SẮC/TÂM TRẠNG] + [GÓC NHÌN]
```

**Giải thích từng thành phần:**

| Thành phần | Mô tả | Ví dụ từ khóa |
|---|---|---|
| **Chủ thể** | Ai/cái gì trong ảnh, đang làm gì | "a young architect presenting blueprints" |
| **Phong cách** | Trường phái nghệ thuật / loại hình ảnh | digital art, watercolor, photorealistic, 3D render, flat design |
| **Ánh sáng** | Nguồn sáng, không khí | golden hour, studio lighting, soft natural light, dramatic shadows |
| **Màu sắc/Tâm trạng** | Bảng màu, cảm xúc | warm tones, monochromatic blue, vibrant, muted palette |
| **Góc nhìn** | Vị trí máy ảnh | close-up portrait, wide angle, aerial view, eye level |

#### So sánh trực tiếp — Demo live

**Prompt kém:**
```
Sinh viên đang học
```

**Prompt đúng cú pháp:**
```
A Vietnamese university student studying at a modern library,
surrounded by open textbooks and a laptop, 
photorealistic style, warm soft lighting from a window,
calm and focused mood, eye-level shot
```

→ Chạy cả 2 prompt → chiếu kết quả cạnh nhau → thảo luận sự khác biệt.

#### Từ khóa quan trọng nhất cần nhớ

**Phong cách hay dùng:**
- `photorealistic` — ảnh trông như chụp thật
- `digital art` — ảnh vẽ kỹ thuật số
- `flat design` — thiết kế phẳng, icon-style
- `watercolor illustration` — màu nước
- `3D render` — ảnh 3D máy tính

**Chất lượng:**
- `high quality, detailed` — chi tiết cao
- `sharp focus` — nét, không mờ
- `professional photography` — như ảnh chuyên nghiệp

**Không nên dùng:**
- Prompt quá dài (>100 từ) — AI bị rối
- Nhiều chủ thể phức tạp trong 1 prompt
- Yêu cầu chữ viết trong ảnh (AI thường viết sai)

---

### 4.D — Lab 1: DALL-E 3 — 5 Prompt Khác nhau (35 phút)

#### Cách truy cập DALL-E 3 miễn phí

**Cách 1 — Qua ChatGPT (giới hạn ~3–5 ảnh/ngày bản free):**
- Mở ChatGPT → gõ yêu cầu tạo ảnh → ChatGPT tự dùng DALL-E

**Cách 2 — Qua Microsoft Copilot Designer (không giới hạn, hoàn toàn free):**
- Truy cập `designer.microsoft.com` → tab Image Creator
- Hoặc `bing.com/images/create` → đăng nhập Microsoft
- Sử dụng cùng mô hình DALL-E 3, miễn phí hoàn toàn

[GV: nếu SV gặp lỗi giới hạn ChatGPT → chuyển qua Copilot Designer ngay]

#### Kịch bản Lab 1

> Chọn 1 chủ đề liên quan đến ngành học của bạn.  
> Tạo **5 ảnh khác nhau** về cùng chủ đề đó bằng cách thay đổi các yếu tố trong prompt.

**5 prompt có chủ đề thay đổi dần:**

```
Ảnh 1 — Thử prompt đơn giản (benchmark):
[Chủ thể cơ bản] — xem AI tự đoán ra sao

Ảnh 2 — Thêm phong cách:
[Chủ thể] + [phong cách nghệ thuật cụ thể]

Ảnh 3 — Thêm ánh sáng + màu sắc:
[Chủ thể] + [phong cách] + [ánh sáng] + [màu sắc/tâm trạng]

Ảnh 4 — Thêm góc nhìn:
[Chủ thể] + [phong cách] + [ánh sáng] + [màu sắc] + [góc nhìn]

Ảnh 5 — Thay phong cách hoàn toàn:
Cùng chủ thể ảnh 4, đổi sang phong cách khác (ví dụ: từ photorealistic → watercolor)
```

**Bảng ghi chép SV điền:**

| Ảnh | Prompt đã dùng | Kết quả có đúng ý không? | Yếu tố nào tạo ra sự khác biệt lớn nhất? |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

**GV theo dõi:** Lưu ý SV nào tạo ra ảnh thú vị → mời chia sẻ màn hình sau lab

---

### 4.E — Demo + Lab 2: Canva AI — Infographic (20 phút)

#### Canva AI là gì?

**Canva** (canva.com) là công cụ thiết kế đồ họa không cần kỹ năng thiết kế chuyên nghiệp.  
**Canva AI (Magic Media + Magic Design)** cho phép:
- Tạo ảnh từ văn bản (Magic Media)
- Tự động tạo layout thiết kế từ nội dung (Magic Design)
- Gợi ý template phù hợp với nội dung bạn có

#### Demo live — GV chiếu (5 phút)

**Kịch bản:** Tạo infographic từ 5 thông tin đã viết ở tuần 5 (hoặc 5 điểm chính về 1 chủ đề)

**Quy trình:**
1. Mở `canva.com` → New Design → Infographic
2. Chọn 1 template đơn giản
3. Nhập nội dung → Canva AI (Magic Design) gợi ý cách sắp xếp
4. Thay ảnh bằng Magic Media: nhập prompt → AI tạo ảnh phù hợp với thiết kế
5. Xuất file PNG hoặc PDF

#### Lab 2 — Thực hành (15 phút)

> Tạo 1 infographic đơn giản về chủ đề bạn đã nghiên cứu ở Tuần 4 hoặc Tuần 5.  
> Infographic có: tiêu đề + 3–5 điểm chính + ít nhất 1 ảnh do AI tạo

**Yêu cầu tối thiểu:**
- Có bố cục rõ ràng (dùng template Canva)
- Có 1 ảnh tạo bằng Canva AI (Magic Media)
- Đọc được, không bị chữ chồng chữ

**GV lưu ý:** Canva free có đủ tính năng cho bài tập này — không cần nâng cấp.

---

### 4.F — Thảo luận: Bản quyền Ảnh AI (15 phút)

#### Vấn đề thực tế

**3 câu hỏi lớn hiện đang được tranh luận:**

**1. Ai sở hữu ảnh AI tạo ra?**

| Quan điểm | Lý luận |
|---|---|
| Người dùng sở hữu | Người viết prompt là người sáng tạo |
| Công ty AI sở hữu | Mô hình AI là tài sản của họ |
| Không ai sở hữu | Không có "tác giả" theo nghĩa pháp lý |

→ **Thực tế hiện nay:** Tùy theo Terms of Service của từng tool và luật pháp từng quốc gia.

**2. AI học từ ảnh của nghệ sĩ — có hợp pháp không?**

- Nhiều nghệ sĩ đã kiện các công ty AI (Getty Images vs Stability AI, v.v.)
- Tranh luận vẫn chưa có kết luận pháp lý rõ ràng
- Một số nghệ sĩ đã tự xóa tác phẩm khỏi internet vì lo ngại

**3. Khi nào dùng ảnh AI là ổn, khi nào không?**

```
✅ AN TOÀN:
  Dùng cho bài tập học tập cá nhân
  Dùng cho slide thuyết trình nội bộ
  Dùng làm ảnh minh họa khi ghi rõ "AI generated"

⚠️ CẦN CẨN THẬN:
  Đăng lên mạng xã hội — nên ghi rõ nguồn AI
  Dùng trong báo cáo học thuật — hỏi thầy cô trước

❌ TRÁNH:
  Bán ảnh AI mà không khai báo
  Dùng ảnh AI mô phỏng style của nghệ sĩ cụ thể cho mục đích thương mại
  Tạo ảnh giả mạo người thật
```

#### Case study thảo luận nhanh

> *Tình huống: Bạn tạo ảnh bằng AI → dùng làm ảnh bìa cho báo cáo môn học → nộp cho GV. Bạn có cần khai báo không?*

→ Không có đáp án tuyệt đối, nhưng nguyên tắc: **minh bạch tốt hơn che giấu**.

---

### 4.G — Chia sẻ + Giao BT5 (10 phút)

**Chia sẻ Lab 1:**
- Mời 2–3 SV chiếu màn hình, cho lớp xem 5 ảnh của mình
- Câu hỏi: Yếu tố nào trong prompt tạo ra sự khác biệt lớn nhất?

**Giao BT5:**

```
Bài tập tuần 6 (BT5):

Tạo bộ 5 ảnh AI minh họa cho 1 chủ đề tự chọn
(liên quan đến ngành học hoặc cuộc sống của bạn).

Yêu cầu:
1. Mỗi ảnh dùng 1 phong cách khác nhau (photorealistic, digital art, 
   watercolor, flat design, 3D render — hoặc 5 phong cách tự chọn)
2. Ghi lại prompt đã dùng cho từng ảnh
3. Với mỗi ảnh: ghi 1 câu nhận xét — kết quả có đúng ý không? Điều gì bất ngờ?

Công cụ: DALL-E 3 (qua ChatGPT hoặc Copilot Designer), Canva AI,
          Adobe Firefly, hoặc bất kỳ tool AI tạo ảnh nào bạn muốn thử.

Nộp:
  - 5 ảnh (file ảnh hoặc screenshot)
  - File ghi chép: chủ đề + 5 prompt + 5 nhận xét
  
Deadline: Đầu buổi học Tuần 7
Điểm: BT5 / 5 bài tập trong học kỳ
Lưu ý: Đây là bài tập cuối cùng trong 5 bài — hoàn thành đủ để có điểm BT
```

---

### 4.H — Tổng kết (10 phút)

**3 điểm cần nhớ:**

1. **Image prompt cần 5 thành phần** — chủ thể + phong cách + ánh sáng + màu sắc + góc nhìn → thêm chi tiết = kết quả tốt hơn
2. **Canva AI** — không chỉ tạo ảnh mà còn thiết kế đồ họa hoàn chỉnh — mạnh nhất khi cần infographic/poster nhanh
3. **Bản quyền ảnh AI** — luật pháp chưa rõ ràng → nguyên tắc thực hành: khai báo khi dùng, không mô phỏng style nghệ sĩ cụ thể để kiếm tiền

**Xem trước tuần 7:**
> Tuần 7 học cách dùng AI tạo **slide thuyết trình hoàn chỉnh** — Gamma.app sẽ tạo ra bộ slide 10 trang chỉ từ 1 đoạn văn bản.

---

## 5. Câu hỏi thảo luận mở rộng

1. *"Nếu một nghệ sĩ trực quan thấy AI tạo ra ảnh giống hệt phong cách của họ — và điều đó ảnh hưởng đến thu nhập của họ — bạn nghĩ AI nên bị hạn chế như thế nào?"*
2. *"Trong 5 năm nữa, ảnh chụp thật và ảnh AI có còn phân biệt được không? Điều đó tác động gì đến niềm tin vào hình ảnh?"*
3. *"Ngành của bạn sử dụng hình ảnh như thế nào? AI tạo ảnh có thể thay đổi điều gì?"*

---

## 6. Phụ lục — Ví dụ Prompt Chất lượng cao

### Ví dụ 1: Ảnh học thuật/giáo dục

```
A diverse group of university students collaborating on a project 
in a modern campus library, 
photorealistic photography style, 
warm natural daylight streaming through large windows, 
bright and energetic atmosphere, 
medium shot from slightly above eye level,
high quality, sharp focus
```

### Ví dụ 2: Ảnh minh họa kỹ thuật

```
A futuristic smart city skyline with interconnected data networks 
visualized as glowing blue lines between buildings,
digital art / concept illustration style,
cool blue and cyan color palette with neon accents,
nighttime scene, 
wide-angle panoramic view,
highly detailed
```

### Ví dụ 3: Poster sự kiện đơn giản

```
Clean minimal poster design for a university tech event,
flat design style with geometric shapes,
modern professional color scheme: navy blue and orange,
centered composition with space for text overlay,
no text in the image
```

*(Lưu ý cuối: thêm "no text in the image" để tránh AI viết chữ sai)*

---

## 7. Ghi chú cho Giảng viên

- **Lab 1 là trọng tâm** — đảm bảo SV thực sự thử đủ 5 prompt, không chỉ dừng ở 2–3
- Nhắc SV: thêm `"no text in the image"` vào prompt nếu không muốn chữ trong ảnh (AI hay viết sai)
- Nếu ChatGPT hết giới hạn tạo ảnh → dùng **Copilot Designer** (`designer.microsoft.com`) — hoàn toàn miễn phí, cùng mô hình DALL-E 3
- Buổi thảo luận bản quyền: không cần đưa ra đáp án tuyệt đối — mục tiêu là SV nhận thức được sự phức tạp
- **BT5 là bài tập cuối cùng trong 5 bài** — nhắc SV hoàn thành đủ 5 bài để có 20% điểm bài tập
- Nếu lớp thiên về thiết kế: có thể dành thêm thời gian cho Canva AI và giới thiệu Adobe Firefly
