# Outline Slide — Tuần 3
# Prompt Engineering (Phần 2): Kỹ thuật Nâng cao

> Tổng: ~22–24 slide | 3 tiết | Phòng máy  
> Ghi chú: [GV] = ghi chú riêng cho giảng viên, không hiển thị trên slide

---

## SLIDE 1 — Trang bìa

**Tiêu đề:** Tuần 3 — Prompt Engineering Nâng cao  
**Phụ đề:** Few-shot · Chain-of-thought · Multi-turn · Hallucination  
**Hình ảnh gợi ý:** Chuỗi bong bóng chat được xâu lại thành một luồng — thể hiện multi-turn  
[GV: tạo bằng Midjourney/DALL-E hoặc dùng icon đơn giản]

---

## SLIDE 2 — Kiểm tra BT2

**Tiêu đề:** BT2 — Bạn đã viết prompt CRAC như thế nào?

**Hình thức:**
- Thu bài tập (screenshot + nhận xét)
- Mời 2 SV chia sẻ: prompt CRAC tốt nhất của bạn

**Câu hỏi cho lớp:**
> Yếu tố CRAC nào khó viết nhất? Role hay Criteria?

[GV: 5–7 phút — không kéo dài, chuyển nhanh vào bài mới]

---

## SLIDE 3 — Hôm nay học gì?

**Tiêu đề:** Từ "dùng được" → "dùng thật sự hiệu quả"

**Dòng kết nối:**
> *"Tuần 1: Biết AI là gì.*  
> *Tuần 2: Biết hỏi AI đúng cách (CRAC).*  
> *Tuần 3: Hỏi AI khi bài toán phức tạp hơn — và khi AI trả lời sai."*

**3 kỹ thuật hôm nay:**
1. 🎯 **Few-shot** — cho AI học từ ví dụ mẫu của bạn
2. 🧠 **Chain-of-thought** — bắt AI suy luận từng bước
3. ⚠️ **Hallucination** — nhận biết khi AI bịa thông tin

---

## SLIDE 4 — Few-shot là gì?

**Tiêu đề:** Few-shot Prompting — Dạy AI bằng ví dụ

**3 mức:**

```
Zero-shot   →  Không ví dụ → AI tự đoán phong cách
One-shot    →  1 ví dụ mẫu
Few-shot    →  2–5 ví dụ mẫu → AI học pattern → làm theo
```

**Khi nào nên dùng few-shot:**
- Cần AI viết đúng **phong cách riêng** của bạn
- Cần **định dạng đầu ra** rất cụ thể
- Zero-shot cho kết quả không nhất quán

---

## SLIDE 5 — Cấu trúc Few-shot Prompt

**Tiêu đề:** Format chuẩn của Few-shot Prompt

**Khung code:**
```
[Mô tả nhiệm vụ]

Ví dụ 1:
[Input mẫu 1]
[Output mẫu 1]

Ví dụ 2:
[Input mẫu 2]
[Output mẫu 2]

Bây giờ hãy làm tương tự với:
[Input thực tế của bạn]
```

**Dòng nhấn mạnh:**
> Ví dụ mẫu = bộ lọc — AI "nhìn" vào đó để biết bạn muốn gì

---

## SLIDE 6 — [DEMO] Zero-shot vs Few-shot

**Tiêu đề:** Demo Trực tiếp — Cùng yêu cầu, khác kết quả

**Hai cột song song:**

| Zero-shot | Few-shot |
|---|---|
| "Tạo 3 câu hỏi ôn tập về móng nhà" | + 2 ví dụ mẫu có đáp án và mức độ |
| Format tự do, không nhất quán | Format đồng đều, đúng chuẩn GV |
| AI đoán độ khó | Độ khó khớp với ví dụ mẫu |

[GV: demo live trên màn hình — chạy cả 2 prompt, chiếu kết quả cạnh nhau]

---

## SLIDE 7 — [THỰC HÀNH NHANH] Few-shot

**Tiêu đề:** Thử ngay — 5 phút

**Hướng dẫn:**
> 1. Chọn 1 loại nội dung bạn thường tạo (caption, câu hỏi, email...)
> 2. Tìm 2 ví dụ mẫu bạn thích từ trước
> 3. Tạo few-shot prompt → chạy thử

**Câu hỏi kiểm tra nhanh:**
> AI có làm theo đúng format ví dụ của bạn không?

⏱ 5 phút

---

## SLIDE 8 — Chain-of-Thought là gì?

**Tiêu đề:** Chain-of-Thought (CoT) — Bắt AI "nghĩ trước, trả lời sau"

**Vấn đề thông thường:**
> AI hay trả lời ngay → bỏ qua bước trung gian → bài toán phức tạp → sai

**Giải pháp — thêm cụm từ kích hoạt:**

```
"Hãy suy nghĩ từng bước trước khi trả lời."
"Trình bày quá trình suy luận của bạn."
"Phân tích lần lượt từng khía cạnh, sau đó kết luận."
```

**Hình ảnh gợi ý:** Sơ đồ 2 đường → đường thẳng (no-CoT) vs đường có trạm dừng (CoT)

---

## SLIDE 9 — [DEMO] Không CoT vs Có CoT

**Tiêu đề:** Demo — Chọn công nghệ: React hay Vue.js?

**Hai cột:**

| Không CoT | Có CoT |
|---|---|
| "Tôi nên dùng React hay Vue.js?" | + "Hãy suy nghĩ từng bước: phân tích độ khó học, ecosystem, tốc độ dev, rồi khuyến nghị" |
| Câu trả lời chung chung | Phân tích có căn cứ từng điểm |
| Khó verify | Dễ đồng ý hoặc phản biện từng bước |

[GV: demo live — cho thấy sự khác biệt rõ ràng trong chất lượng lập luận]

---

## SLIDE 10 — CoT đặc biệt: "Trợ lý Socrates"

**Tiêu đề:** Dùng AI để học — Không phải để làm bài hộ

**Prompt mẫu:**
```
Đừng cho tôi đáp án ngay.
Hãy đặt câu hỏi gợi mở từng bước
để giúp tôi tự tìm ra câu trả lời cho:
[bài toán / câu hỏi của bạn]
```

**Kết quả:** AI thành gia sư, không làm bài thay bạn

> Bạn hiểu sâu hơn khi tự tìm ra đáp án.

[GV: nhắc SV — đây là cách dùng AI **tốt cho việc học** nhất]

---

## SLIDE 11 — Multi-turn Prompting

**Tiêu đề:** Multi-turn — Xây dựng nội dung qua nhiều lượt

**Bảng quy trình:**

| Lượt | Mục đích | Ví dụ |
|---|---|---|
| 1 | Bối cảnh + yêu cầu ban đầu | "Giúp tôi outline báo cáo..." |
| 2 | Làm sâu 1 phần | "Mục 2.3 — triển khai chi tiết hơn" |
| 3 | Chỉnh theo ý | "Phần mở đầu quá học thuật — viết lại thân thiện hơn" |
| 4 | Yêu cầu phiên bản khác | "Tóm tắt toàn bộ thành 5 gạch đầu dòng" |

---

## SLIDE 12 — Quy tắc Multi-turn

**Tiêu đề:** 3 Quy tắc Giữ Ngữ cảnh

**3 quy tắc:**

- 🔴 **Mỗi cuộc hội thoại mới = AI không nhớ gì** từ lần trước
- ✅ **Đừng mở tab mới** khi cần tiếp tục → hội thoại mới = mất ngữ cảnh
- ⚠️ **Hội thoại quá dài** → AI có thể "quên" đầu → nhắc lại ngữ cảnh nếu cần

**Dòng nhấn mạnh:**
> Một hội thoại tốt = nhiều lượt trong 1 tab, không phải 1 lượt trong nhiều tab

---

## SLIDE 13 — Hallucination: AI Biết Bịa

**Tiêu đề:** Hallucination — Vấn đề quan trọng nhất khi dùng AI

**Định nghĩa:**
> AI tạo ra thông tin **nghe có vẻ đúng nhưng thực ra sai** — và trình bày với sự tự tin như thể đó là sự thật.

**Tại sao xảy ra:**
AI được huấn luyện để tạo văn bản tự nhiên, mạch lạc — không phải để kiểm chứng sự thật.  
Khi thiếu thông tin → **AI điền vào chỗ trống** bằng cách suy diễn từ pattern đã học.

---

## SLIDE 14 — [DEMO LIVE] Hallucination

**Tiêu đề:** Demo — AI bịa ra luận văn tiến sĩ

**Prompt demo:**
```
Tóm tắt luận văn tiến sĩ của Nguyễn Văn Minh Tuấn
về ứng dụng BIM trong quản lý dự án xây dựng
tại ĐH Kiến trúc Đà Nẵng, bảo vệ năm 2022.
```

**Kết quả dự kiến:** AI tạo ra tóm tắt đầy đủ, tên chương, kết quả nghiên cứu... hoàn toàn bịa

**Sau demo — hỏi lại:**
```
"Bạn có chắc chắn về thông tin này không? Nguồn ở đâu?"
```
→ AI thường tự thừa nhận không chắc

[GV: chọn tên và trường thực tế trong demo để hiệu ứng mạnh hơn]

---

## SLIDE 15 — Nhận biết Hallucination

**Tiêu đề:** 4 Dấu hiệu Cảnh báo

| Dấu hiệu ⚠️ | Ví dụ |
|---|---|
| Số liệu cụ thể không có nguồn | "Theo nghiên cứu 2023, 78.3% sinh viên..." |
| Tên người / tổ chức / địa điểm lạ | Tên tác giả, tên công ty, tên dự án |
| Trích dẫn đầy đủ: tiêu đề + tác giả + năm | Luôn Google trước khi dùng |
| AI tự tin về điều **bạn biết là sai** | Tín hiệu rõ nhất |

**Dòng cuối:**
> Tin tưởng AI với ý tưởng — Nghi ngờ AI với số liệu cụ thể

---

## SLIDE 16 — Khi nào cần Fact-check?

**Tiêu đề:** Checklist: Verify hay Không cần Verify?

**Hai cột:**

| 🔴 BẮT BUỘC fact-check | ✅ Thường không cần |
|---|---|
| Số liệu thống kê cụ thể | Giải thích khái niệm phổ biến |
| Tên tác giả và năm xuất bản | Cấu trúc, outline, dàn ý |
| Trích dẫn tài liệu | Viết lách, chỉnh sửa văn bản |
| Sự kiện lịch sử có ngày tháng | Ý tưởng, brainstorm |
| Thông tin về người thật / tổ chức thật | Dịch thuật *(vẫn nên đọc lại)* |

---

## SLIDE 17 — Giảm Hallucination: 4 Kỹ thuật

**Tiêu đề:** Làm thế nào để AI ít bịa hơn?

**4 kỹ thuật:**

**1.** Yêu cầu AI thừa nhận giới hạn:
```
"Nếu không chắc, hãy nói 'Tôi không chắc' thay vì đoán."
```

**2.** Yêu cầu trích nguồn → rồi tự verify:
```
"Trích nguồn cụ thể cho mỗi số liệu."
```

**3.** Dùng **Perplexity AI** — search web thật, có link nguồn → ít hallucinate

**4.** Hỏi lại để kiểm chứng:
```
"Bạn vừa nói [X]. Bạn có chắc không? Nguồn cụ thể?"
```

---

## SLIDE 18 — Perplexity AI — Công cụ Giảm Hallucination

**Tiêu đề:** Khi nào dùng Perplexity thay vì ChatGPT/Gemini?

**So sánh:**

| | ChatGPT / Gemini | Perplexity AI |
|---|---|---|
| Nguồn thông tin | Dữ liệu huấn luyện | Tìm kiếm web thật |
| Trích dẫn | Không tự động | Có link nguồn cụ thể |
| Hallucination | Cao hơn với số liệu | Thấp hơn |
| Dùng tốt cho | Viết, phân tích, outline | Số liệu, nghiên cứu, sự kiện mới |

**Kết luận:**
> Dùng **Perplexity** khi cần số liệu thật → dán kết quả vào **ChatGPT/Gemini** để xử lý tiếp

---

## SLIDE 19 — [LAB] Tổng hợp: Bài Toán Phức Tạp

**Tiêu đề:** Lab — Chuẩn bị Thuyết trình 10 phút bằng AI

**Kịch bản:**
> Bạn cần chuẩn bị bài thuyết trình 10 phút về một chủ đề thuộc ngành học của bạn.  
> Dùng AI để hoàn thành **toàn bộ quy trình** từ đầu đến cuối.

**5 bước — mỗi bước là 1 prompt riêng:**

| Bước | Kỹ thuật | Tool |
|---|---|---|
| 1. Chọn chủ đề | CoT | ChatGPT/Gemini |
| 2. Xây dựng cấu trúc | Multi-turn | (tiếp tục hội thoại) |
| 3. Tìm số liệu thật | CRAC | Perplexity AI |
| 4. Viết nội dung | Few-shot | ChatGPT/Gemini |
| 5. Tự kiểm tra | Multi-turn | (tiếp tục hội thoại) |

⏱ 45 phút

---

## SLIDE 20 — Hướng dẫn từng bước Lab

**Tiêu đề:** Prompt mẫu cho từng bước

**Bước 1 (CoT):**
```
Tôi là SV ngành [ngành]. Hãy suy nghĩ từng bước:
1. Gợi ý 5 chủ đề thuyết trình phù hợp
2. Đánh giá từng chủ đề: thú vị / tài liệu / phù hợp 10 phút
3. Đề xuất chủ đề tốt nhất với lý do rõ ràng
```

**Bước 3 (Perplexity — tab mới):**
```
Tìm 3 số liệu thực tế có nguồn đáng tin cậy về [chủ đề].
Ưu tiên nguồn trong 3 năm gần đây.
Ghi rõ: thông tin, nguồn, năm.
```

**Bước 5 (kiểm tra — multi-turn):**
```
Với tư cách GV nghe bài thuyết trình này:
1. Điểm nào còn yếu?  2. Thiếu gì?  3. Gợi ý cải thiện cụ thể.
```

[GV: in slide này hoặc để SV chụp lại làm cheat sheet]

---

## SLIDE 21 — Chia sẻ kết quả Lab

**Tiêu đề:** Bạn làm đến đâu?

**3 câu hỏi thảo luận:**
- Bước nào khó nhất trong quy trình 5 bước?
- Kỹ thuật nào (few-shot / CoT / multi-turn) hữu ích nhất?
- Có phát hiện hallucination không? Xử lý như thế nào?

[GV: mời 2–3 SV trình chiếu màn hình — chú ý xem SV có dùng Perplexity ở bước 3 không]

---

## SLIDE 22 — Quiz Tuần 3

**Tiêu đề:** Quiz — 5 câu · 5 phút

**(Hình thức: giơ tay / Google Forms / giấy — GV chọn)**

```
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

4. Công cụ nào ít hallucinate hơn vì tìm kiếm web thật?
   a) ChatGPT   b) Perplexity AI   c) Gemini (không bật search)

5. Muốn AI tiếp tục nhớ ngữ cảnh, bạn nên:
   a) Mở tab chatbot mới
   b) Tiếp tục trong cùng 1 hội thoại
   c) Copy toàn bộ hội thoại vào prompt mới
```

**Đáp án:** 1-b · 2-b · 3-b · 4-b · 5-b

---

## SLIDE 23 — Tóm tắt Tuần 3

**Tiêu đề:** 3 điều cần nhớ hôm nay

**3 điểm lớn:**

1. **Few-shot** — Cho AI ví dụ mẫu → output nhất quán và đúng định dạng
2. **Chain-of-thought** — "Hãy suy nghĩ từng bước" → phù hợp bài toán phức tạp, cần lập luận
3. **Hallucination** — Luôn verify số liệu, tên, trích dẫn · Dùng Perplexity khi cần nguồn thật

**Dòng cuối:**
> Kết hợp cả 3 kỹ thuật trong 1 quy trình → đó là cách làm việc với AI ở mức độ chuyên nghiệp.

---

## SLIDE 24 — Xem trước Tuần 4

**Tiêu đề:** Tuần sau — AI cho Tìm kiếm và Nghiên cứu

**Hình ảnh gợi ý:** Kính lúp + các biểu tượng tài liệu học thuật

**Teaser:**
> *"Bạn đã biết cách tạo nội dung với AI.*  
> *Tuần 4 bạn sẽ học cách dùng AI để **tìm thông tin đáng tin cậy** —*  
> *Perplexity AI · SciSpace · NotebookLM: bộ công cụ nghiên cứu miễn phí tốt nhất hiện nay."*

**Nhắc BT3:** Xem thông báo trên LMS — nộp trước buổi học Tuần 4

---

*Outline slide — Tuần 3 | Phiên bản 1.0*  
*Khoa CNTT — ĐH Kiến trúc Đà Nẵng*
