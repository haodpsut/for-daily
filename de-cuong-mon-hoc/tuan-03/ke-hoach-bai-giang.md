# Kế hoạch Bài giảng — Tuần 3
# Prompt Engineering (Phần 2): Kỹ thuật Nâng cao

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 3 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO2, CLO3

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] Áp dụng kỹ thuật **Few-shot** để cho AI học từ ví dụ mẫu
- [ ] Dùng **Chain-of-thought** để bắt AI suy luận từng bước thay vì trả lời vội
- [ ] Duy trì ngữ cảnh xuyên suốt qua **multi-turn prompting**
- [ ] Nhận biết và xử lý được **AI hallucination** — khi AI bịa thông tin tự tin

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Chuẩn bị 2 ví dụ few-shot demo (xem Phụ lục A)
- [ ] Chuẩn bị 1 ví dụ hallucination thực tế để demo (xem Phụ lục B)
- [ ] Chuẩn bị bài tập Lab tổng hợp (xem mục 4.E)

### Kiểm tra bài tập tuần trước
- Thu BT2 (3 prompt CRAC + kết quả + nhận xét)
- Mời 2 SV chia sẻ: prompt nào hiệu quả nhất, tại sao

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Kiểm tra BT2 + khởi động | Cả lớp |
| 10–30 phút | Lý thuyết: Few-shot Prompting | Giảng + demo |
| 30–50 phút | Lý thuyết: Chain-of-thought + Multi-turn | Giảng + demo |
| 50–65 phút | Lý thuyết: Hallucination — nhận biết và xử lý | Giảng + demo |
| 65–110 phút | Lab tổng hợp: Giải bài toán phức tạp bằng chuỗi prompt | Cá nhân |
| 110–125 phút | Chia sẻ kết quả + thảo luận | Cả lớp |
| 125–135 phút | Tổng kết + giao Quiz tuần 3 | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Khởi động (10 phút)

**Thu BT2 + chia sẻ nhanh:**
- Mời 2 SV đọc prompt CRAC tốt nhất của họ
- Cả lớp nhận xét: Yếu tố nào mạnh nhất trong prompt đó?

**Kết nối vào bài mới:**
> *"Tuần trước các bạn học CRAC — đủ dùng cho 80% tình huống hàng ngày.  
> Hôm nay học 3 kỹ thuật cho 20% còn lại — khi bài toán phức tạp hơn, hoặc khi AI trả lời sai."*

---

### 4.B — Kỹ thuật 1: Few-shot Prompting (20 phút)

#### Khái niệm

**Few-shot** là kỹ thuật cung cấp cho AI **một vài ví dụ mẫu** trước khi đưa ra yêu cầu thực tế.

```
Zero-shot:  Không có ví dụ mẫu → AI tự đoán format và phong cách
One-shot:   Có 1 ví dụ mẫu
Few-shot:   Có 2–5 ví dụ mẫu → AI học pattern và làm theo
```

**Khi nào dùng Few-shot:**
- Bạn muốn AI viết theo một **phong cách cụ thể** của bạn
- Bạn cần **định dạng đầu ra** rất cụ thể
- Zero-shot cho kết quả không nhất quán

#### Demo live — GV chiếu màn hình

**Tình huống:** Muốn AI tạo thêm câu hỏi ôn tập theo đúng format của giảng viên.

**Zero-shot (không ví dụ):**
```
Tạo 3 câu hỏi ôn tập môn Xây dựng Dân dụng về móng nhà.
```
→ AI tạo câu hỏi theo format tự chọn — có thể không phù hợp.

**Few-shot (có ví dụ mẫu):**
```
Tôi cần tạo thêm câu hỏi ôn tập theo đúng format sau:

Ví dụ 1:
Câu hỏi: Móng đơn thường được dùng trong trường hợp nào?
Đáp án: Móng đơn dùng cho công trình nhỏ, tải trọng nhẹ, 
        nền đất tốt và đồng đều.
Mức độ: Nhớ

Ví dụ 2:
Câu hỏi: Phân biệt móng băng và móng bè. Khi nào chọn móng bè?
Đáp án: Móng băng chạy thành dải dưới tường/cột. Móng bè trải 
        rộng toàn bộ đáy công trình, dùng khi đất yếu hoặc 
        tải trọng lớn và phân bố đều.
Mức độ: Hiểu

Hãy tạo thêm 3 câu hỏi tương tự về chủ đề "cọc móng và thi công đóng cọc".
```

**Chiếu kết quả cạnh nhau** → thấy rõ few-shot cho output nhất quán và phù hợp hơn.

#### Thực hành nhanh (5 phút)

> SV thử ngay: Tìm 2 ví dụ mẫu từ bất kỳ lĩnh vực nào họ quan tâm → tạo few-shot prompt → chạy thử.

---

### 4.C — Kỹ thuật 2: Chain-of-Thought (20 phút)

#### Khái niệm

**Chain-of-thought (CoT)** là kỹ thuật **buộc AI suy luận từng bước** trước khi đưa ra kết quả cuối cùng.

**Vấn đề với prompt thông thường:**
AI có xu hướng trả lời ngay lập tức → với bài toán phức tạp → dễ bỏ qua bước trung gian → kết quả sai.

**Giải pháp:**  
Thêm cụm từ kích hoạt suy luận từng bước vào prompt:
- `"Hãy suy nghĩ từng bước trước khi trả lời."`
- `"Trình bày quá trình suy luận của bạn."`
- `"Phân tích lần lượt từng khía cạnh, sau đó đưa ra kết luận."`

#### So sánh trực tiếp — Demo

**Tình huống:** Phân tích ưu/nhược điểm để lựa chọn công nghệ.

**Không có CoT:**
```
Tôi nên dùng React hay Vue.js để xây dựng web app cho dự án 
nhỏ 1 người làm, thời gian 2 tháng?
```
→ AI thường trả lời chung chung, hoặc chọn 1 cái mà không giải thích kỹ.

**Có CoT:**
```
Tôi cần chọn giữa React và Vue.js để xây dựng web app.
Bối cảnh: dự án nhỏ, 1 mình làm, thời hạn 2 tháng, 
tôi đã biết JavaScript cơ bản nhưng chưa dùng framework nào.

Hãy suy nghĩ từng bước:
1. Phân tích độ khó học ban đầu của từng framework với người mới
2. So sánh ecosystem và tài liệu tiếng Việt
3. Xem xét tốc độ phát triển và deploy cho dự án nhỏ
4. Sau đó đưa ra khuyến nghị có lý do rõ ràng
```
→ AI đi qua từng bước → kết quả có căn cứ hơn, dễ verify hơn.

#### Biến thể: "Làm trợ lý Socrates"

Một cách dùng CoT đặc biệt hữu ích khi học:
```
Đừng cho tôi đáp án ngay. Hãy đặt câu hỏi gợi mở 
từng bước để giúp tôi tự tìm ra câu trả lời cho bài toán sau: [...]
```
→ AI trở thành gia sư, không làm bài hộ mà dẫn dắt tư duy.

#### Multi-turn Prompting — Chuỗi hội thoại

**Khái niệm:** Một cuộc hội thoại AI là một chuỗi prompt liên tiếp — mỗi lượt sau có thể **tinh chỉnh, bổ sung hoặc đổi hướng** dựa trên kết quả trước.

**Kỹ thuật duy trì ngữ cảnh:**

| Lượt | Mục đích | Ví dụ |
|---|---|---|
| 1 | Thiết lập bối cảnh + yêu cầu ban đầu | "Hãy giúp tôi lên outline cho báo cáo..." |
| 2 | Làm sâu hơn 1 phần | "Mục 2.3 bạn vừa đề xuất — hãy triển khai chi tiết hơn" |
| 3 | Chỉnh sửa theo ý | "Phần mở đầu quá học thuật — viết lại thân thiện hơn" |
| 4 | Yêu cầu phiên bản khác | "Bây giờ tóm tắt toàn bộ thành 5 gạch đầu dòng" |

**Lưu ý quan trọng:**
- Mỗi cuộc hội thoại mới → AI **không nhớ** cuộc trước
- Nếu muốn tiếp tục ngữ cảnh → **đừng mở tab mới**, hãy tiếp tục trong cùng 1 hội thoại
- Nếu hội thoại quá dài → AI có thể "quên" thông tin đầu → cần nhắc lại ngữ cảnh

---

### 4.D — Hallucination: Nhận biết và Xử lý (15 phút)

#### Hallucination là gì?

**Định nghĩa:** AI tạo ra thông tin **nghe có vẻ đúng nhưng thực ra sai** — và trình bày với mức độ tự tin như thể đó là sự thật.

**Tại sao xảy ra:**  
AI được huấn luyện để tạo ra văn bản nghe tự nhiên và mạch lạc — không phải để kiểm chứng sự thật. Khi không có đủ thông tin, nó **điền vào chỗ trống** bằng cách suy diễn từ pattern đã học.

**Demo thực tế — GV chiếu:**

Hỏi AI về một nhân vật/công trình/nghiên cứu ít nổi tiếng:
```
Hãy tóm tắt luận văn tiến sĩ của [tên giả] về [chủ đề cụ thể].
```
→ AI rất có thể sẽ tạo ra tóm tắt hoàn toàn bịa — tên tác giả, năm, tên trường, nội dung chính — mà không hề có thật.

#### Dấu hiệu nhận biết Hallucination

| Dấu hiệu | Ví dụ |
|---|---|
| Số liệu cụ thể không có nguồn | "Theo nghiên cứu năm 2023, 78.3% sinh viên..." |
| Tên người/tổ chức/địa điểm nghe lạ | Tên tác giả, tên công ty, tên dự án cụ thể |
| Trích dẫn tài liệu với đầy đủ tiêu đề + tác giả + năm | Luôn verify trước khi dùng |
| AI trả lời rất tự tin về điều bạn biết là sai | Tín hiệu rõ nhất |

#### Quy tắc bắt buộc khi dùng AI cho học thuật

```
BẮT BUỘC FACT-CHECK trước khi dùng:
  □ Số liệu thống kê cụ thể
  □ Tên tác giả và năm xuất bản
  □ Trích dẫn tài liệu
  □ Sự kiện lịch sử có ngày tháng cụ thể
  □ Thông tin về người thật, tổ chức thật

KHÔNG CẦN fact-check (AI thường đúng):
  □ Giải thích khái niệm phổ biến
  □ Cấu trúc, outline, dàn ý
  □ Viết lách, chỉnh sửa văn bản
  □ Ý tưởng, brainstorm
  □ Dịch thuật (vẫn nên đọc lại)
```

#### Kỹ thuật giảm Hallucination

**1. Yêu cầu AI thừa nhận giới hạn:**
```
"Nếu bạn không chắc chắn về điều gì, hãy nói rõ 
'Tôi không chắc về điều này' thay vì đoán."
```

**2. Yêu cầu AI trích dẫn nguồn (và verify lại):**
```
"Hãy trích dẫn nguồn cụ thể cho mỗi số liệu bạn đưa ra."
```
→ Sau đó **tự verify** các nguồn đó trên Google Scholar / Perplexity.

**3. Dùng công cụ có search thật:**
- **Perplexity AI**: search web thật, có trích dẫn nguồn URL → ít hallucinate hơn nhiều
- **Gemini với Search**: có thể bật chế độ tìm kiếm web

**4. Hỏi lại để kiểm chứng:**
```
"Bạn vừa nói [X]. Bạn có chắc chắn về điều này không? 
Có nguồn cụ thể nào không?"
```
→ AI đôi khi sẽ tự sửa lại nếu được hỏi thẳng.

---

### 4.E — Lab Tổng hợp: Giải Bài Toán Phức Tạp (45 phút)

**Đây là phần quan trọng nhất của buổi học — tích hợp cả 3 kỹ thuật.**

#### Kịch bản Lab

> Bạn cần chuẩn bị một bài thuyết trình 10 phút về một chủ đề thuộc ngành học của bạn — bài này sẽ nộp cho giảng viên môn học. Dùng AI để hoàn thành toàn bộ quy trình từ đầu đến cuối trong 45 phút.

#### Quy trình 5 bước (mỗi bước là 1 prompt riêng)

**Bước 1 — Chọn chủ đề và khám phá (Chain-of-thought):**
```
[Áp dụng CRAC + CoT]
Tôi là SV ngành [ngành của bạn], cần thuyết trình 10 phút cho GV.
Hãy suy nghĩ từng bước:
1. Gợi ý 5 chủ đề phù hợp với ngành [ngành] cho SV năm [năm]
2. Với mỗi chủ đề, đánh giá: mức độ thú vị, lượng tài liệu có sẵn, 
   độ phù hợp với 10 phút
3. Đề xuất chủ đề tốt nhất với lý do rõ ràng
```

**Bước 2 — Xây dựng cấu trúc:**
```
[Tiếp tục cùng hội thoại]
Tốt. Tôi chọn chủ đề [chủ đề từ bước 1].
Hãy tạo cấu trúc chi tiết cho bài thuyết trình 10 phút:
- Mở đầu ấn tượng (1–2 phút)
- 3 điểm nội dung chính (5–6 phút)  
- Kết luận + câu hỏi gợi ý (2 phút)
Với mỗi phần, ghi rõ thời gian và 2–3 ý chính sẽ nói.
```

**Bước 3 — Nghiên cứu nội dung (chuyển sang Perplexity):**
```
[Mở Perplexity AI — tab mới]
[CRAC đầy đủ]
Tìm 3 thông tin/số liệu thực tế, có nguồn đáng tin cậy, 
về chủ đề [chủ đề]. Ưu tiên nguồn trong 3 năm gần đây.
Ghi rõ: thông tin, nguồn, năm xuất bản.
```
→ Dùng Perplexity để giảm hallucination khi cần số liệu thật.

**Bước 4 — Viết nội dung chi tiết (Few-shot):**
```
[Quay lại ChatGPT/Gemini — cùng hội thoại cũ]
Đây là ví dụ về cách tôi muốn viết slide notes:

Ví dụ slide "Mở đầu":
"Bạn có biết rằng [số liệu ấn tượng]? Đây là lý do tại sao 
[chủ đề] quan trọng với chúng ta ngay hôm nay. Trong 10 phút 
tới, tôi sẽ chia sẻ 3 điều bạn cần biết về [chủ đề]."

Hãy viết slide notes cho phần [phần cụ thể] theo phong cách tương tự.
Tích hợp số liệu sau vào nội dung: [số liệu từ Perplexity ở bước 3]
```

**Bước 5 — Kiểm tra và tinh chỉnh:**
```
[Tiếp tục cùng hội thoại]
Đọc lại toàn bộ nội dung tôi vừa xây dựng.
Với tư cách là GV đại học sẽ nghe bài thuyết trình này:
1. Điểm nào còn yếu hoặc chưa thuyết phục?
2. Thiếu thông tin quan trọng nào?
3. Gợi ý 2–3 cải thiện cụ thể.
```

#### SV tự thực hiện 5 bước này với chủ đề của mình

**GV theo dõi** — chú ý các điểm:
- SV có biết chuyển sang Perplexity ở bước 3 không?
- SV có duy trì hội thoại hay mở tab mới (làm mất ngữ cảnh)?
- SV có verify số liệu trước khi dùng không?

---

### 4.F — Chia sẻ kết quả (15 phút)

**Hình thức:** Mời 2–3 SV trình chiếu màn hình, chia sẻ quy trình của mình.

**Câu hỏi thảo luận:**
- Bước nào khó nhất? Tại sao?
- Kỹ thuật nào (few-shot / CoT / multi-turn) hữu ích nhất trong bài toán này?
- Bạn có phát hiện hallucination không? Xử lý như thế nào?

---

### 4.G — Tổng kết và Đánh giá (10 phút)

**Tổng kết 3 điểm chính:**

1. **Few-shot** — cho AI ví dụ mẫu → kết quả nhất quán và đúng format
2. **Chain-of-thought** — bắt AI suy luận từng bước → phù hợp bài toán phức tạp
3. **Hallucination** — luôn verify số liệu, tên, trích dẫn; dùng Perplexity khi cần nguồn thật

**Quiz nhanh cuối buổi (5 phút — 5 câu):**

```
Quiz Tuần 3 — Trả lời nhanh:

1. Kỹ thuật nào cho AI "học" từ ví dụ bạn cung cấp?
   a) Zero-shot   b) Few-shot   c) Chain-of-thought

2. Cụm từ nào kích hoạt Chain-of-thought?
   a) "Trả lời ngắn gọn"  
   b) "Hãy suy nghĩ từng bước trước khi trả lời"  
   c) "Bạn là chuyên gia"

3. AI hallucinate nhiều nhất với loại thông tin nào?
   a) Giải thích khái niệm phổ biến  
   b) Số liệu thống kê cụ thể và tên tác giả  
   c) Ý tưởng brainstorm

4. Công cụ nào ít hallucinate hơn vì có tìm kiếm web thật?
   a) ChatGPT   b) Perplexity AI   c) Gemini (không bật search)

5. Khi muốn AI tiếp tục nhớ ngữ cảnh, bạn nên làm gì?
   a) Mở tab chatbot mới  
   b) Tiếp tục trong cùng 1 hội thoại  
   c) Copy toàn bộ hội thoại vào prompt mới
```

**Đáp án:** 1-b / 2-b / 3-b / 4-b / 5-b

**Xem trước tuần sau:**
> Tuần 4 chuyển sang nhóm công cụ hoàn toàn mới: **AI cho tìm kiếm và nghiên cứu** — Perplexity, SciSpace, NotebookLM.

---

## 5. Câu hỏi thảo luận mở rộng

1. *"Nếu AI hallucinate trong bài nộp của bạn mà bạn không biết và GV phát hiện — lỗi đó thuộc về ai?"*
2. *"Chain-of-thought làm AI 'chậm lại' để suy nghĩ — điều đó có ý nghĩa gì với cách chúng ta cũng nên học không?"*
3. *"Bạn sẽ dùng kỹ thuật nào trong 3 kỹ thuật hôm nay nhiều nhất? Tại sao?"*

---

## 6. Phụ lục A — Ví dụ Few-shot Demo

### Ví dụ 1: Tạo câu hỏi ôn tập theo format chuẩn

```
Hãy tạo thêm câu hỏi ôn tập theo đúng format dưới đây:

Ví dụ 1:
Câu hỏi: Nêu 3 đặc điểm chính của kiến trúc Bauhaus.
Gợi ý trả lời: Đơn giản hóa hình thức, kết hợp nghệ thuật 
và thủ công, tập trung vào chức năng.
Mức độ: Nhớ

Ví dụ 2:  
Câu hỏi: So sánh phong cách Art Deco và Modernism về 
triết lý thiết kế và đặc trưng hình thức.
Gợi ý trả lời: Art Deco: trang trí phong phú, đường nét 
hình học, vật liệu sang trọng. Modernism: tối giản, 
"form follows function", vật liệu công nghiệp.
Mức độ: Hiểu/Phân tích

Tạo 3 câu hỏi tương tự về phong trào kiến trúc Postmodernism.
```

### Ví dụ 2: Tạo caption mạng xã hội theo phong cách riêng

```
Tôi cần tạo caption cho Instagram của câu lạc bộ sinh viên.
Đây là phong cách tôi muốn:

Ví dụ 1: "Bạn không cần phải hoàn hảo để bắt đầu — 
bạn chỉ cần bắt đầu để trở nên hoàn hảo hơn. 
CLB CNTT mở đăng ký thành viên mới! 🚀 #CNTT #ĐHKienTruc"

Ví dụ 2: "Code một mình thì nhanh, code cùng nhau thì đi xa hơn. 
Workshop React cơ bản — Thứ 7 tuần này. DM để đăng ký 💻 #Workshop"

Tạo 3 caption tương tự để thông báo cuộc thi lập trình 
diễn ra vào cuối tháng.
```

---

## 7. Phụ lục B — Ví dụ Hallucination để Demo

### Cách tạo demo hallucination an toàn

Hỏi AI về thứ **có thật nhưng ít nổi tiếng** hoặc **hoàn toàn bịa** — xem AI phản ứng thế nào:

```
Prompt demo 1 (tên giả):
"Tóm tắt luận văn tiến sĩ của Nguyễn Văn Minh Tuấn 
về ứng dụng BIM trong quản lý dự án xây dựng tại Đà Nẵng, 
bảo vệ năm 2022 tại ĐH Kiến trúc Đà Nẵng."
→ AI rất có thể tạo ra tóm tắt hoàn toàn bịa

Prompt demo 2 (số liệu):
"Tỷ lệ sinh viên ĐH Kiến trúc Đà Nẵng có việc làm sau 
6 tháng tốt nghiệp năm 2023 là bao nhiêu?"
→ AI sẽ đưa ra số liệu cụ thể mà không có cơ sở
```

**Sau demo:** Hỏi lại AI:
```
"Bạn có chắc chắn về thông tin vừa cung cấp không? 
Nguồn cụ thể ở đâu?"
```
→ AI thường sẽ thừa nhận là không chắc chắn — cho thấy nó biết giới hạn của mình nếu được hỏi thẳng.

---

## 8. Ghi chú cho Giảng viên

- **Lab 4.E là trọng tâm** — đảm bảo SV có đủ 45 phút, không bị cắt ngắn
- Khi demo hallucination, **chọn ví dụ an toàn** — không dùng tên người thật, tránh thông tin nhạy cảm
- Nhắc SV: Perplexity AI là công cụ **bổ sung**, không thay thế hoàn toàn ChatGPT/Gemini
- **Quiz cuối buổi** nằm trong 20% điểm tham gia — nhắc SV nộp trước khi ra về
- Tuần này kết thúc Phần I (Nền tảng AI) — nhắc SV: từ tuần 4 chuyển sang thực hành công cụ chuyên biệt
