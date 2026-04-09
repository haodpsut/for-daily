# Outline Slide — Tuần 2
# Prompt Engineering (Phần 1): Framework CRAC

> Tổng: ~22 slide | 3 tiết | Phòng máy  
> [GV] = ghi chú riêng cho giảng viên, không hiển thị trên slide

---

## SLIDE 1 — Trang bìa

**Tiêu đề:** Tuần 2 — Viết Prompt Hiệu quả  
**Phụ đề:** Framework CRAC — Kỹ năng cốt lõi để dùng AI đúng cách  
**Hình ảnh gợi ý:** Hai chat bubble — một mờ nhạt (prompt kém), một sắc nét (prompt tốt)

---

## SLIDE 2 — Kiểm tra BT1

**Tiêu đề:** Tuần vừa rồi bạn đã dùng AI như thế nào?

- 📋 Thu bài tập BT1
- 🎤 2–3 bạn chia sẻ trải nghiệm nhanh:
  - Dùng AI để làm gì?
  - AI có trả lời đúng ý ngay không?

[GV: ghi nhanh phản hồi lên bảng — kết nối vào bài học hôm nay]

---

## SLIDE 3 — Demo mở đầu

**Tiêu đề:** Cùng 1 chủ đề — 2 cách hỏi — 2 kết quả hoàn toàn khác

**Cột trái — Prompt A:**
```
viết về biến đổi khí hậu
```
→ *(chiếu kết quả AI)*

**Cột phải — Prompt B:**
```
Bạn là giảng viên đại học. Viết 1 đoạn 
mở đầu ~150 từ cho bài thuyết trình về 
biến đổi khí hậu, dành cho SV năm nhất, 
giọng gần gũi, có 1 số liệu gây ấn tượng.
```
→ *(chiếu kết quả AI)*

[GV: demo live — chiếu kết quả cạnh nhau để SV tự nhận xét trước]

---

## SLIDE 4 — Nguyên lý cốt lõi

**Tiêu đề:** Tại sao Prompt quan trọng?

**Hình ảnh gợi ý:** Sơ đồ: Prompt → AI → Kết quả

**3 điểm lớn:**

- 🧠 AI **không đọc được suy nghĩ** của bạn — nó chỉ làm đúng những gì bạn nói
- ♻️ **Garbage in → Garbage out** — input mơ hồ → output vô dụng
- 🎯 Cách bạn hỏi **quyết định 80% chất lượng** câu trả lời

**Câu hỏi cho lớp:**
> *"Khi prompt của bạn không rõ, AI sẽ làm gì?"*

[GV: để SV đoán → câu trả lời: AI sẽ tự "suy đoán" theo hướng phổ biến nhất, thường không phù hợp với bạn]

---

## SLIDE 5 — Giới thiệu CRAC

**Tiêu đề:** Framework CRAC — 4 yếu tố của một prompt hiệu quả

**Sơ đồ 4 ô lớn:**

```
┌─────────────────┬─────────────────┐
│   C — Context   │    R — Role     │
│   Bối cảnh      │    Vai trò      │
├─────────────────┼─────────────────┤
│   A — Action    │  C — Criteria   │
│   Hành động     │    Tiêu chí     │
└─────────────────┴─────────────────┘
```

**Một câu ghi nhớ:**
> *Cho AI biết BẠN LÀ AI → AI ĐÓNG VAI GÌ → CẦN LÀM GÌ → KẾT QUẢ THẾ NÀO*

---

## SLIDE 6 — C: Context (Bối cảnh)

**Tiêu đề:** C — Context · Cho AI biết bạn là ai

**Màu nền:** Xanh lam nhạt (phân biệt từng chữ cái)

**Cần trả lời:**
- Bạn là ai? *(SV năm mấy, ngành gì, trình độ thế nào)*
- Mục đích là gì? *(để học, nộp bài, thuyết trình...)*
- Đối tượng nhận kết quả là ai? *(thầy, bạn bè, sếp...)*

**So sánh:**

| ❌ Không có Context | ✅ Có Context |
|---|---|
| "Giải thích machine learning" | "Tôi là SV năm 2 ngành KT, chưa biết lập trình. Giải thích ML dùng ví dụ từ ngành xây dựng." |

---

## SLIDE 7 — R: Role (Vai trò)

**Tiêu đề:** R — Role · Giao cho AI một danh tính

**Màu nền:** Xanh lá nhạt

**Tại sao?**
> Khi AI "đóng vai" chuyên gia → nó điều chỉnh từ ngữ, góc nhìn, mức độ chi tiết phù hợp với lĩnh vực đó

**Các Role phổ biến:**

| Role | Dùng khi |
|---|---|
| Giảng viên [môn học] | Cần giải thích rõ, có chiều sâu |
| Biên tập viên | Cần viết lách, sửa văn bản |
| Cố vấn / Mentor | Cần lời khuyên, định hướng |
| Người phản biện | Cần tìm điểm yếu lập luận |

**So sánh:**

| ❌ Role chung | ✅ Role cụ thể |
|---|---|
| "Bạn là chuyên gia" | "Bạn là GV đại học chuyên ngành Xã hội học, 10 năm hướng dẫn SV viết tiểu luận" |

---

## SLIDE 8 — A: Action (Hành động)

**Tiêu đề:** A — Action · Chỉ rõ AI cần làm gì

**Màu nền:** Cam nhạt

**Quy tắc:** Luôn dùng **động từ hành động cụ thể**

**Bảng động từ hay dùng:**

| Nhóm | Động từ |
|---|---|
| Tạo nội dung | Viết · Tạo · Soạn · Lên ý tưởng |
| Phân tích | Phân tích · Tóm tắt · So sánh · Liệt kê |
| Chỉnh sửa | Sửa · Cải thiện · Rút gọn · Dịch |
| Giải thích | Giải thích · Hướng dẫn · Đơn giản hóa |

**So sánh:**

| ❌ Mơ hồ | ✅ Rõ ràng |
|---|---|
| "Bài viết của tôi" | "Tóm tắt bài viết sau thành 5 gạch đầu dòng, mỗi gạch ≤ 20 từ" |

---

## SLIDE 9 — C: Criteria (Tiêu chí)

**Tiêu đề:** C — Criteria · Định nghĩa kết quả mong muốn

**Màu nền:** Tím nhạt

**Các tiêu chí hay dùng:**

| Tiêu chí | Ví dụ |
|---|---|
| Độ dài | "~200 từ" · "tối đa 5 gạch" · "1 đoạn văn" |
| Định dạng | "dạng bảng" · "outline có số" · "dạng email" |
| Giọng văn | "chính thức" · "thân thiện" · "học thuật" |
| Ngôn ngữ | "tiếng Việt" · "tiếng Anh học thuật" |
| Cấm làm gì | "không dùng thuật ngữ kỹ thuật" · "không đề xuất giải pháp" |

**So sánh:**

| ❌ Không có Criteria | ✅ Có Criteria |
|---|---|
| "Viết email cho thầy" | "Email ≤ 100 từ · tiếng Việt · lịch sự chân thành · không giải thích dài dòng" |

---

## SLIDE 10 — Ví dụ Prompt CRAC Hoàn chỉnh (1)

**Tiêu đề:** Prompt CRAC trong thực tế — Ví dụ 1: Tóm tắt tài liệu

```
[C] Tôi là sinh viên năm 2, đang chuẩn bị thuyết trình 10 phút 
    về chuyển đổi số trong giáo dục.

[R] Bạn là chuyên gia giáo dục có kinh nghiệm nghiên cứu EdTech.

[A] Hãy tóm tắt tài liệu sau và rút ra 3 điểm quan trọng nhất 
    tôi nên đề cập trong phần mở đầu.

[C] Mỗi điểm không quá 2 câu. Ngôn ngữ đơn giản, không thuật ngữ 
    kỹ thuật. Tiếng Việt.

[DÁN TÀI LIỆU VÀO ĐÂY]
```

[GV: chạy demo live với tài liệu thật]

---

## SLIDE 11 — Ví dụ Prompt CRAC Hoàn chỉnh (2)

**Tiêu đề:** Prompt CRAC trong thực tế — Ví dụ 2: Lên dàn ý tiểu luận

```
[C] Tôi đang viết tiểu luận môn Xã hội học, chủ đề: 
    "Tác động của MXH đến quan hệ gia đình ở VN". 
    2000 từ, nộp cho GV đại học.

[R] Bạn là GV Xã hội học 10 năm hướng dẫn SV viết tiểu luận.

[A] Hãy gợi ý dàn ý chi tiết cho tiểu luận này.

[C] Bao gồm: mở bài, 3 phần thân bài, kết luận. 
    Ghi rõ ý chính mỗi phần. Outline đánh số thứ tự.
```

**Lưu ý nhỏ ở cuối slide:**
> Không cần ghi nhãn [C][R][A][C] trong prompt thật —  
> đó chỉ là cách học. Khi quen, viết tự nhiên.

---

## SLIDE 12 — Checklist CRAC

**Tiêu đề:** Trước khi gửi prompt — Kiểm tra nhanh

**4 câu hỏi checklist (lớn, dễ nhìn):**

```
□  AI biết tôi là ai và mục đích của tôi chưa?      → Context
□  AI biết mình đang đóng vai trò gì chưa?          → Role  
□  Yêu cầu có đủ rõ ràng? Có động từ hành động?    → Action
□  Tôi đã nói rõ định dạng và độ dài mong muốn?    → Criteria
```

**Câu nói nhớ:**
> Nếu trả lời "Chưa" cho bất kỳ câu nào → prompt của bạn cần bổ sung.

---

## SLIDE 13 — [CHUYỂN SANG THỰC HÀNH 1]

**Tiêu đề:** Thực hành 1 — Phân tích và Viết lại Prompt

**Nền tối / màu nhấn**

> ⏱ 15 phút  
> 🎯 Nhận diện lỗi trong prompt kém → viết lại theo CRAC

---

## SLIDE 14 — 5 Prompt cần viết lại

**Tiêu đề:** Những prompt này thiếu gì?

**Chiếu từng cái — SV phân tích và viết lại:**

```
1. "giải thích thuật toán"

2. "giúp tôi viết báo cáo"

3. "dịch cái này sang tiếng Anh"

4. "cho tôi ví dụ về AI"

5. "review bài của tôi"
```

**Hướng dẫn làm:**
1. Prompt này **thiếu** yếu tố nào trong CRAC?
2. **Viết lại** prompt tốt hơn

[GV: sau 10 phút mời 2 SV đọc bản viết lại → cả lớp nhận xét]

---

## SLIDE 15 — [CHUYỂN SANG THỰC HÀNH 2]

**Tiêu đề:** Thực hành 2 — Viết Prompt cho Tình huống của BẠN

**Nền tối / màu nhấn**

> ⏱ 40 phút  
> 🎯 Viết 5 prompt CRAC cho 5 tình huống học tập thực tế của bạn

---

## SLIDE 16 — Gợi ý tình huống

**Tiêu đề:** Chưa nghĩ ra tình huống? Thử những cái này

| Tình huống | Dùng AI để... |
|---|---|
| Đang học môn khó | Giải thích khái niệm cụ thể |
| Cần viết báo cáo | Lên dàn ý, gợi ý cấu trúc |
| Sắp thuyết trình | Tạo cấu trúc, gợi ý mở đầu ấn tượng |
| Tài liệu tiếng Anh | Tóm tắt, dịch đoạn khó |
| Chuẩn bị phỏng vấn | Liệt kê câu hỏi thường gặp |

**Nhắc nhở:**
> Dùng tình huống **thật của bạn** — không cần bịa  
> Thử chạy ít nhất **2 trong 5 prompt** trên ChatGPT/Gemini

---

## SLIDE 17 — Template viết Prompt

**Tiêu đề:** Template điền vào

```
TÌNH HUỐNG: ________________________________

Context:   Tôi là ________________________
           Mục đích: _____________________

Role:      Bạn là ________________________

Action:    Hãy [động từ] __________________
           ________________________________

Criteria:  [Độ dài] _______________________
           [Định dạng] ____________________
           [Giọng văn / Ngôn ngữ] _________

─────────────────────────────────────────
PROMPT HOÀN CHỈNH:
________________________________
________________________________
________________________________
```

*(×5 tình huống)*

---

## SLIDE 18 — Phản hồi Chéo

**Tiêu đề:** Chia sẻ với người ngồi cạnh

**Hình thức:** Làm việc theo cặp · 10 phút

**Mỗi người làm:**
1. Đọc 5 prompt của bạn mình
2. Chỉ ra: **1 prompt tốt nhất** + **1 prompt cần cải thiện**
3. Giải thích tại sao dùng CRAC để phân tích
4. Bạn kia ghi nhận, chỉnh sửa nếu cần

[GV: đi quanh phòng, quan sát — ghi nhớ lỗi phổ biến để tổng kết]

---

## SLIDE 19 — Lỗi Phổ biến khi Viết Prompt

**Tiêu đề:** 4 lỗi hay gặp nhất

**4 lỗi lớn:**

- ❌ **Action quá mơ hồ** → "giúp tôi với bài này" vs "tóm tắt / phân tích / viết lại"
- ❌ **Thiếu Criteria** → không nói độ dài, định dạng mong muốn
- ❌ **Context không đủ** → AI không biết bạn cần kết quả để làm gì
- ❌ **Role quá chung** → "bạn là chuyên gia" vs "GV đại học chuyên ngành X, 10 năm kinh nghiệm"

[GV: bổ sung lỗi thực tế quan sát được từ bài của SV]

---

## SLIDE 20 — Tóm tắt buổi học

**Tiêu đề:** 3 điều cần nhớ hôm nay

**3 điểm lớn:**

1. **Prompt quyết định chất lượng kết quả** — AI chỉ làm đúng với những gì bạn nói
2. **CRAC là checklist** — không phải template cứng, là 4 câu hỏi cần trả lời trước khi gửi
3. **Thực hành là cách học duy nhất** — viết prompt → chạy → đánh giá → viết lại

---

## SLIDE 21 — Bài tập về nhà (BT2)

**Tiêu đề:** Bài tập tuần 2

**Yêu cầu:**
> Thực hành CRAC cho ít nhất **3 tình huống thực tế** trong tuần này.

**Nộp:**
- 3 prompt CRAC có ghi rõ từng phần C / R / A / C
- Screenshot kết quả AI trả lời
- Nhận xét ngắn: hiệu quả không? Phải chỉnh sửa gì?

**Bonus (không bắt buộc):**
> Thử thay đổi chỉ phần Role hoặc Criteria trong cùng 1 prompt → so sánh kết quả khác nhau như thế nào

**Deadline:** Đầu buổi Tuần 3 · Điểm: BT2 / 5

---

## SLIDE 22 — Xem trước Tuần 3

**Tiêu đề:** Tuần sau — Khi CRAC chưa đủ

**Teaser:**
> *"Bạn đã biết viết prompt tốt.*  
> *Tuần sau học cách prompt cho bài toán phức tạp hơn —*  
> *khi cần AI suy luận từng bước, hoặc học từ ví dụ của bạn."*

**Preview nội dung tuần 3:**
- Few-shot prompting — cho AI học từ ví dụ
- Chain-of-thought — bắt AI suy luận từng bước
- Xử lý khi AI trả lời sai hoặc hallucinate

---

*Outline slide — Tuần 2 | Phiên bản 1.0*  
*Khoa CNTT — ĐH Kiến trúc Đà Nẵng*
