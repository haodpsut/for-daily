# Kế hoạch Bài giảng — Tuần 2
# Prompt Engineering (Phần 1): Viết Prompt Hiệu quả với CRAC

**Học phần:** Ứng dụng Trí tuệ Nhân tạo trong Học tập và Thực hành Nghề nghiệp  
**Tuần:** 2 / 10  
**Thời lượng:** 3 tiết (135 phút)  
**Hình thức:** Trực tiếp tại phòng máy  
**CLO liên quan:** CLO2, CLO3

---

## 1. Mục tiêu buổi học

Kết thúc buổi học, sinh viên có thể:

- [ ] Giải thích được tại sao cách đặt câu hỏi quyết định chất lượng câu trả lời của AI
- [ ] Áp dụng được framework CRAC để viết prompt cho các tình huống học tập cụ thể
- [ ] Nhận biết được sự khác biệt giữa prompt "kém" và prompt "tốt" qua so sánh trực tiếp
- [ ] Viết được ít nhất 5 prompt theo CRAC cho tình huống thực tế của bản thân

---

## 2. Chuẩn bị

### Giảng viên chuẩn bị
- [ ] Chuẩn bị sẵn bộ 5 cặp prompt "kém vs tốt" để demo (xem Phụ lục)
- [ ] Mở sẵn ChatGPT hoặc Gemini trên màn hình chiếu
- [ ] In hoặc chia sẻ: Thẻ tham chiếu CRAC (xem Phụ lục)
- [ ] Chuẩn bị bài tập BT2 (xem mục 7)

### Kiểm tra bài tập tuần trước
- Thu BT1 (screenshot + mô tả dùng AI trong tuần)
- Mời 2–3 SV chia sẻ nhanh — tạo kết nối từ trải nghiệm thực tế vào bài mới

---

## 3. Cấu trúc buổi học

| Thời gian | Hoạt động | Hình thức |
|---|---|---|
| 0–10 phút | Kiểm tra BT1 + khởi động | Cả lớp |
| 10–20 phút | Lý thuyết: Tại sao prompt quan trọng | Giảng + demo |
| 20–45 phút | Lý thuyết: Framework CRAC chi tiết | Giảng + demo |
| 45–60 phút | Thực hành 1: Phân tích prompt kém → viết lại | Cá nhân |
| 60–100 phút | Thực hành 2: Viết 5 prompt CRAC cho tình huống thực | Cá nhân |
| 100–120 phút | Chia sẻ + phản hồi chéo | Cặp đôi + cả lớp |
| 120–135 phút | Tổng kết + giao BT2 | Cả lớp |

---

## 4. Nội dung chi tiết

### 4.A — Khởi động: Kiểm tra BT1 (10 phút)

**Thu bài tập:**
- SV nộp screenshot + mô tả (file hoặc giấy tùy GV quy định)
- GV ghi nhanh điểm danh nộp bài

**Chia sẻ nhanh (5 phút):**
Mời 2–3 SV chia sẻ trải nghiệm dùng AI trong tuần:
- *"Bạn đã dùng AI để làm gì?"*
- *"AI có trả lời đúng ý bạn ngay không?"*

**Kết nối vào bài mới:**
> *"Rất nhiều bạn nói AI trả lời không đúng ý, hoặc phải hỏi lại nhiều lần. Hôm nay chúng ta tìm hiểu tại sao — và cách khắc phục."*

---

### 4.B — Lý thuyết: Tại sao Prompt quan trọng? (10 phút)

**Demo mở đầu — GV làm trực tiếp trên màn hình chiếu:**

Dùng cùng 1 chủ đề, 2 cách hỏi khác nhau:

**Prompt A (kém):**
```
viết về biến đổi khí hậu
```

**Prompt B (tốt):**
```
Bạn là giảng viên đại học. Hãy viết 1 đoạn mở đầu khoảng 150 từ 
cho bài thuyết trình về biến đổi khí hậu dành cho sinh viên năm nhất, 
giọng văn gần gũi, có 1 số liệu gây ấn tượng để mở đầu.
```

**Chiếu kết quả 2 prompt cạnh nhau** → để SV tự nhận xét sự khác biệt.

**Điểm cần rút ra:**

> AI không đọc được suy nghĩ của bạn.  
> AI chỉ làm đúng với những gì bạn nói.  
> **Garbage in → Garbage out. Quality in → Quality out.**

**Nguyên lý cốt lõi:**

Một prompt hiệu quả cần trả lời 4 câu hỏi:
1. AI đang ở **vai trò** gì? *(chuyên gia, giáo viên, trợ lý...)*
2. **Bối cảnh** là gì? *(tôi là ai, tình huống ra sao)*
3. AI cần **làm gì** cụ thể? *(hành động rõ ràng)*
4. Kết quả cần đạt **tiêu chí** gì? *(độ dài, giọng văn, định dạng...)*

→ Đó chính là **CRAC**.

---

### 4.C — Lý thuyết: Framework CRAC (25 phút)

---

#### C là gì? — Context (Bối cảnh)

**Định nghĩa:** Cho AI biết bạn là ai, tình huống của bạn là gì, mục đích là gì.

**Tại sao cần:**  
AI phục vụ hàng triệu người khác nhau. Nếu không có context, AI sẽ đưa ra câu trả lời "trung bình" — không sai nhưng cũng không phù hợp với bạn.

**Các yếu tố của Context:**
- Bạn là ai? *(sinh viên năm mấy, ngành gì, trình độ ra sao)*
- Mục đích là gì? *(để học, để nộp bài, để thuyết trình...)*
- Đối tượng nhận kết quả là ai? *(thầy giáo, bạn bè, khách hàng...)*
- Có ràng buộc gì không? *(giới hạn thời gian, quy định định dạng...)*

**Ví dụ:**
```
Không có context:   "Giải thích machine learning"
Có context:         "Tôi là sinh viên năm 2 ngành Kiến trúc, chưa có nền tảng 
                    lập trình. Giải thích machine learning bằng ngôn ngữ 
                    đơn giản, dùng ví dụ từ ngành xây dựng."
```

---

#### R là gì? — Role (Vai trò)

**Định nghĩa:** Giao cho AI một vai trò, một persona cụ thể.

**Tại sao cần:**  
Khi AI "đóng vai" một chuyên gia, nó sẽ điều chỉnh:
- Từ ngữ chuyên ngành phù hợp
- Góc nhìn của người có kinh nghiệm trong lĩnh vực đó
- Mức độ chi tiết và cách trình bày

**Các role phổ biến:**
| Role | Dùng khi nào |
|---|---|
| Giảng viên / Chuyên gia [lĩnh vực] | Cần giải thích rõ ràng, có chiều sâu |
| Biên tập viên / Copywriter | Cần viết lách, sửa văn bản |
| Cố vấn / Mentor | Cần lời khuyên, định hướng |
| Sinh viên giỏi [môn học] | Cần giải bài tập, ôn thi |
| Người phản biện | Cần tìm điểm yếu trong lập luận |

**Ví dụ:**
```
Không có role:   "Kiểm tra bài viết của tôi"
Có role:         "Bạn là biên tập viên có 10 năm kinh nghiệm. 
                 Hãy đọc và nhận xét bài viết sau, tập trung vào 
                 cấu trúc lập luận và sự mạch lạc."
```

---

#### A là gì? — Action (Hành động)

**Định nghĩa:** Chỉ rõ AI cần làm gì — động từ hành động cụ thể.

**Tại sao cần:**  
Yêu cầu mơ hồ → AI tự suy đoán → kết quả ngẫu nhiên.  
Yêu cầu rõ ràng → AI thực thi đúng → kết quả có thể đoán trước.

**Các động từ action thường dùng:**

| Nhóm | Động từ |
|---|---|
| Tạo nội dung | Viết, Tạo, Soạn, Thiết kế, Lên ý tưởng |
| Phân tích | Phân tích, Đánh giá, So sánh, Tóm tắt, Liệt kê |
| Chỉnh sửa | Sửa lỗi, Cải thiện, Rút gọn, Mở rộng, Dịch |
| Giải thích | Giải thích, Hướng dẫn, Ví dụ hóa, Đơn giản hóa |

**Ví dụ:**
```
Mơ hồ:    "Bài viết của tôi"
Rõ ràng:  "Tóm tắt bài viết sau thành 5 gạch đầu dòng, 
           mỗi gạch không quá 20 từ."
```

---

#### C là gì? — Criteria (Tiêu chí)

**Định nghĩa:** Chỉ định định dạng, độ dài, giọng văn, ngôn ngữ và các ràng buộc khác của kết quả.

**Tại sao cần:**  
Không có criteria → AI tự quyết định format → có thể không phù hợp mục đích của bạn.

**Các tiêu chí phổ biến:**

| Tiêu chí | Ví dụ |
|---|---|
| Độ dài | "khoảng 200 từ", "tối đa 5 gạch đầu dòng", "1 đoạn văn" |
| Định dạng | "dạng bảng", "dạng outline", "dạng bullet point", "dạng email" |
| Giọng văn | "chính thức", "thân thiện", "học thuật", "đơn giản" |
| Ngôn ngữ | "bằng tiếng Việt", "tiếng Anh học thuật" |
| Đối tượng | "dành cho người không biết kỹ thuật", "dành cho sinh viên năm 1" |
| Cấm làm gì | "không dùng thuật ngữ kỹ thuật", "không đề xuất giải pháp, chỉ phân tích" |

**Ví dụ:**
```
Không có criteria:   "Viết email cho thầy"
Có criteria:         "Viết email xin thầy gia hạn nộp bài 3 ngày. 
                     Giọng lịch sự, chân thành. Dưới 100 từ. 
                     Tiếng Việt. Không giải thích lý do quá dài dòng."
```

---

#### Tổng hợp — Một prompt CRAC hoàn chỉnh

**Ví dụ 1 — Tóm tắt tài liệu:**
```
[C] Tôi là sinh viên năm 2, đang chuẩn bị thuyết trình 10 phút về 
    chuyển đổi số trong giáo dục.
[R] Bạn là chuyên gia giáo dục có kinh nghiệm nghiên cứu về EdTech.
[A] Hãy tóm tắt tài liệu sau và rút ra 3 điểm quan trọng nhất mà 
    tôi nên đề cập trong phần mở đầu bài thuyết trình.
[C] Mỗi điểm không quá 2 câu. Ngôn ngữ đơn giản, không thuật ngữ 
    kỹ thuật. Tiếng Việt.

[DÁN TÀI LIỆU VÀO ĐÂY]
```

**Ví dụ 2 — Lên dàn ý bài tập:**
```
[C] Tôi đang viết tiểu luận môn Xã hội học, chủ đề: "Tác động của 
    mạng xã hội đến quan hệ gia đình ở Việt Nam". Tiểu luận 2000 từ, 
    nộp cho giảng viên đại học.
[R] Bạn là giảng viên Xã hội học có 10 năm kinh nghiệm hướng dẫn 
    sinh viên viết tiểu luận.
[A] Hãy gợi ý dàn ý chi tiết cho tiểu luận này.
[C] Bao gồm: mở bài, 3 phần thân bài chính, kết luận. Mỗi phần 
    ghi rõ ý chính sẽ viết gì. Định dạng outline có đánh số.
```

**Lưu ý:** Không cần ghi nhãn [C] [R] [A] [C] trong prompt thật — đó chỉ là cách học framework. Khi quen rồi, viết tự nhiên hơn.

---

### 4.D — Thực hành 1: Phân tích và Viết lại Prompt (15 phút)

**Hướng dẫn:**
> GV chiếu 5 prompt "kém" lên màn hình. SV làm 2 việc:
> 1. Phân tích: prompt này thiếu yếu tố nào trong CRAC?
> 2. Viết lại prompt tốt hơn theo CRAC

**5 prompt kém cần viết lại:**

```
Prompt 1: "giải thích thuật toán"
Prompt 2: "giúp tôi viết báo cáo"
Prompt 3: "dịch cái này sang tiếng Anh"
Prompt 4: "cho tôi ví dụ về AI"
Prompt 5: "review bài của tôi"
```

**Gợi ý đáp án mẫu (GV tham khảo, không chiếu ngay):**

```
Prompt 1 → tốt hơn:
"Tôi là sinh viên ngành Kiến trúc, chưa có nền tảng lập trình.
Bạn là giảng viên CNTT. Hãy giải thích thuật toán tìm đường ngắn nhất 
(Dijkstra) bằng 1 ví dụ thực tế liên quan đến giao thông đô thị. 
Dưới 200 từ, không dùng ký hiệu toán học."

Prompt 2 → tốt hơn:
"Tôi là sinh viên năm 3, đang viết báo cáo thực tập tại công ty xây dựng.
Bạn là chuyên gia tư vấn viết báo cáo kỹ thuật.
Hãy tạo bố cục (outline) cho báo cáo thực tập 20 trang.
Bao gồm các mục chính, tiêu đề phụ, ghi chú nội dung mỗi phần. 
Định dạng outline có đánh số thứ tự."
```

**Chia sẻ nhanh:** GV mời 2 SV đọc bản viết lại của mình → cả lớp nhận xét.

---

### 4.E — Thực hành 2: Viết 5 Prompt CRAC Thực tế (40 phút)

**Đây là phần quan trọng nhất của buổi học.**

**Hướng dẫn:**
> Hãy nghĩ đến 5 tình huống học tập hoặc công việc thực tế của bạn trong học kỳ này.  
> Với mỗi tình huống, viết 1 prompt theo framework CRAC.  
> Sau khi viết xong, thử chạy ít nhất 2 trong số 5 prompt trên ChatGPT/Gemini.

**Gợi ý tình huống nếu SV chưa nghĩ ra:**

| Tình huống | Gợi ý hướng dùng AI |
|---|---|
| Đang học môn khó hiểu | Nhờ AI giải thích khái niệm cụ thể |
| Cần viết báo cáo / tiểu luận | Nhờ AI lên dàn ý, gợi ý cấu trúc |
| Sắp thuyết trình | Nhờ AI tạo cấu trúc bài, gợi ý điểm mở đầu ấn tượng |
| Đang đọc tài liệu tiếng Anh | Nhờ AI tóm tắt hoặc dịch đoạn khó |
| Cần chuẩn bị câu hỏi phỏng vấn | Nhờ AI lên danh sách câu hỏi thường gặp |
| Cần giải thích cho bạn/em | Nhờ AI giải thích theo ngôn ngữ đơn giản |

**Template SV điền:**

```
TÌNH HUỐNG 1:
Context:  _______________________________________________
Role:     _______________________________________________
Action:   _______________________________________________
Criteria: _______________________________________________

Prompt hoàn chỉnh:
_______________________________________________________
_______________________________________________________

Kết quả khi chạy (tốt / cần chỉnh / không phù hợp):
_______________________________________________________
```

*(nhân 5 lần)*

---

### 4.F — Chia sẻ và Phản hồi chéo (20 phút)

**Hình thức:** Làm việc theo cặp (2 SV ngồi cạnh nhau)

**Hướng dẫn:**
1. Mỗi SV đọc 5 prompt của bạn mình
2. Chọn **1 prompt tốt nhất** và **1 prompt cần cải thiện** của bạn
3. Giải thích tại sao — dùng framework CRAC để phân tích
4. Bạn kia ghi nhận và chỉnh sửa lại nếu cần

**GV quan sát** — đi quanh phòng, chú ý các lỗi phổ biến để tổng kết.

**Tổng kết lỗi phổ biến (GV rút ra từ quan sát):**

Các lỗi thường gặp khi viết prompt:
- ❌ **Action quá mơ hồ** — "giúp tôi với bài này" thay vì "tóm tắt / phân tích / viết lại"
- ❌ **Thiếu criteria** — không nói độ dài, định dạng mong muốn
- ❌ **Context không đủ** — AI không biết bạn cần kết quả để làm gì
- ❌ **Role quá chung** — "bạn là chuyên gia" vs "bạn là giảng viên đại học chuyên ngành X có 10 năm kinh nghiệm"

---

### 4.G — Tổng kết và Bài tập về nhà (15 phút)

**Tổng kết 3 điểm chính:**

1. **Prompt quyết định chất lượng kết quả** — AI chỉ làm đúng với những gì bạn nói
2. **CRAC là framework** — không phải công thức cứng nhắc, là checklist để kiểm tra
3. **Thực hành là cách học duy nhất** — viết prompt, chạy, đánh giá, viết lại

**Giao bài tập về nhà (BT2):**

> Trong 1 tuần tới, hãy thực hành viết prompt CRAC cho ít nhất **3 tình huống thực tế**.
>
> **Nộp:** File ghi lại:
> - 3 prompt CRAC hoàn chỉnh (có ghi rõ C / R / A / C từng phần)
> - Kết quả AI trả lời (screenshot hoặc copy text)
> - Nhận xét ngắn: Prompt có hiệu quả không? Bạn đã phải chỉnh sửa gì?
>
> **Bonus (không bắt buộc):** Thử cùng 1 prompt nhưng thay đổi Role hoặc Criteria → so sánh sự khác biệt.
>
> **Deadline:** Đầu buổi học Tuần 3  
> **Điểm:** BT2 / 5

**Xem trước tuần sau:**
> Tuần 3 học các kỹ thuật prompt nâng cao: Few-shot, Chain-of-thought, và cách xử lý khi AI trả lời sai.

---

## 5. Câu hỏi thảo luận mở rộng (nếu còn thời gian)

1. *"Có loại công việc nào mà dù prompt tốt đến đâu cũng không nên giao cho AI không?"*
2. *"Nếu AI trả lời sai, lỗi đó thuộc về ai — người hỏi hay AI?"*
3. *"Prompt của bạn có thể tiết lộ thông tin nhạy cảm không? Cần lưu ý gì?"*

---

## 6. Phụ lục A — Thẻ tham chiếu CRAC (tài liệu phát tay)

```
┌─────────────────────────────────────────────────────┐
│                  CRAC FRAMEWORK                      │
├─────────┬───────────────────────────────────────────┤
│ C       │ CONTEXT — Bối cảnh                         │
│ ontext  │ Tôi là ai? Mục đích là gì?                 │
│         │ Đối tượng nhận kết quả là ai?               │
├─────────┼───────────────────────────────────────────┤
│ R       │ ROLE — Vai trò                              │
│ ole     │ AI đóng vai trò gì?                         │
│         │ Ví dụ: giảng viên / biên tập / cố vấn...   │
├─────────┼───────────────────────────────────────────┤
│ A       │ ACTION — Hành động                          │
│ ction   │ AI cần làm gì cụ thể?                       │
│         │ Động từ rõ ràng: viết / tóm tắt / phân tích│
├─────────┼───────────────────────────────────────────┤
│ C       │ CRITERIA — Tiêu chí                         │
│ riteria │ Độ dài? Định dạng? Giọng văn?               │
│         │ Ngôn ngữ? Cấm làm gì?                       │
└─────────┴───────────────────────────────────────────┘

Checklist trước khi gửi prompt:
□ AI biết tôi là ai và mục đích của tôi chưa?
□ AI biết mình đang đóng vai trò gì chưa?
□ Yêu cầu có đủ rõ ràng chưa? (có động từ hành động)
□ Tôi đã nói rõ định dạng và độ dài mong muốn chưa?
```

---

## 7. Phụ lục B — Bộ 5 cặp Prompt kém vs tốt (GV demo)

| # | Prompt kém | Prompt tốt |
|---|---|---|
| 1 | `giải thích thuật toán` | `Tôi là SV ngành KT chưa biết lập trình. Bạn là GV CNTT. Giải thích thuật toán Dijkstra qua ví dụ tìm đường trong thành phố. Dưới 150 từ, không ký hiệu toán.` |
| 2 | `giúp tôi viết báo cáo` | `Tôi SV năm 3 viết báo cáo thực tập 20 trang. Bạn là chuyên gia tư vấn viết kỹ thuật. Tạo outline chi tiết có đánh số. Ghi rõ nội dung chính mỗi phần.` |
| 3 | `dịch cái này` | `Bạn là dịch giả kỹ thuật. Dịch đoạn sau sang tiếng Việt, giữ nguyên thuật ngữ chuyên ngành xây dựng, giọng văn chính thức học thuật: [đoạn văn]` |
| 4 | `cho ví dụ về AI` | `Tôi là SV ngành Nội thất chưa biết gì về AI. Cho 3 ví dụ ứng dụng AI trong ngành thiết kế nội thất đang được dùng thực tế hiện nay. Mỗi ví dụ 2 câu, có tên tool cụ thể.` |
| 5 | `review bài của tôi` | `Bạn là GV tiếng Việt. Đọc bài viết sau và chỉ ra 3 điểm cần cải thiện về: cấu trúc câu, sự mạch lạc giữa các đoạn, và tính thuyết phục của lập luận. Đừng viết lại — chỉ nhận xét và giải thích tại sao: [bài viết]` |

---

## 8. Ghi chú cho Giảng viên

- **Trọng tâm buổi này là Thực hành 2** — đảm bảo SV có đủ 40 phút làm việc thật
- Khi SV hỏi *"Viết prompt tiếng Việt hay tiếng Anh tốt hơn?"* → câu trả lời: đều được, nhưng tiếng Anh thường cho kết quả chi tiết hơn với ChatGPT; Gemini thì tiếng Việt rất tốt
- Nhắc SV: CRAC không phải template cứng nhắc — khi quen rồi viết tự nhiên, không cần ghi nhãn
- **Lỗi GV cần phòng tránh:** đừng "giải cứu" SV quá nhanh khi họ gặp khó — để họ thử trước, thất bại, rồi mới gợi ý
