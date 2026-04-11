# BÀI TOÁN PHÂN BỔ RAU CỦ QUẢ — HIỂU AGENT & MULTI-AGENT QUA VÍ DỤ THỰC TẾ
**Tài liệu dành cho sinh viên tiếp cận Agent và Multi-Agent System lần đầu**

> **Mục tiêu của tài liệu này:** Giúp bạn trả lời 6 câu hỏi cơ bản khi nhìn một bài toán thực tế dưới lăng kính Agent:
> 1. Ai là Agent?
> 2. Môi trường (Environment) là gì?
> 3. State gồm những gì?
> 4. Action có thể làm gì?
> 5. Reward tính ra sao?
> 6. Khi nào cần Multi-Agent, khi nào Single-Agent là đủ?
>
> Tài liệu **không dạy thuật toán RL**. Tài liệu chỉ giúp bạn **hiểu cách mô hình hóa** một bài toán thực tế thành bài toán Agent.

---

## PHẦN 1 — BÀI TOÁN THỰC TẾ

### 1.1 Bối cảnh

Một chuỗi siêu thị ở Đà Nẵng (gọi là **Siêu thị X**) bán rau củ quả tươi. Mỗi ngày:
- **Buổi sáng:** Nhập hàng từ nông dân ở Đà Lạt (cà chua, xà lách, dưa leo...)
- **Trong ngày:** Bán cho khách
- **Cuối ngày:** Hàng không bán được sẽ hỏng (rau tươi chỉ giữ được 2–3 ngày)

### 1.2 Vấn đề

Siêu thị X đang gặp **3 vấn đề nhức đầu**:

| # | Vấn đề | Chi phí gây ra |
|---|--------|----------------|
| 1 | **Nhập quá nhiều** → rau hỏng cuối ngày phải vứt | Lãng phí 15% doanh thu |
| 2 | **Nhập quá ít** → khách đến không có hàng, mất khách | Mất doanh thu + mất niềm tin |
| 3 | **Giá cố định** → khi gần hết hạn vẫn bán giá cao, không ai mua | Không đẩy được hàng cuối ngày |

### 1.3 Câu hỏi cốt lõi

> **Mỗi ngày, Siêu thị X cần quyết định:**  
> **(a)** Nhập bao nhiêu kg mỗi loại rau?  
> **(b)** Bán với giá bao nhiêu?  
> **(c)** Khi nào thì giảm giá, giảm bao nhiêu?
>
> **Mục tiêu:** Tối đa hóa lợi nhuận + giảm lãng phí.

### 1.4 Tại sao không dùng quy tắc cố định (if-else)?

Một lập trình viên không có kiến thức AI sẽ viết:
```
NẾU tồn kho > 80% VÀ còn 2 giờ đóng cửa THÌ giảm 20%
NẾU tồn kho > 50% VÀ còn 1 giờ THÌ giảm 40%
...
```

**Vấn đề của cách này:**
- Con số "80%", "20%" **lấy từ đâu**? → Đoán thôi
- Không thích ứng được khi **thời tiết thay đổi** (trời mưa ít khách đến hơn)
- Không thích ứng được khi **mùa vụ thay đổi** (Tết, cuối tuần, ngày lễ)
- Không học được từ **sai lầm quá khứ**

→ Đây là lý do cần **Agent biết học từ kinh nghiệm**: bạn không cần viết ra quy tắc, Agent tự tìm ra quy tắc tối ưu thông qua thử-và-sai.

---

## PHẦN 2 — MÔ HÌNH HÓA DƯỚI DẠNG AGENT (SINGLE-AGENT)

Trước khi đi đến Multi-Agent, ta bắt đầu với trường hợp đơn giản nhất: **chỉ có Siêu thị X là Agent**, còn nông dân và khách hàng coi như "môi trường bên ngoài".

### 2.1 Environment (Môi trường) là gì?

**Environment = toàn bộ thế giới mà Agent tương tác với, NHƯNG Agent không kiểm soát được.**

Trong bài toán rau củ, môi trường gồm:

| Thành phần | Ví dụ | Agent có kiểm soát không? |
|-----------|-------|---------------------------|
| Thời tiết | Hôm nay mưa, nhiệt độ 28°C | ❌ Không |
| Ngày trong tuần | Thứ 7, cuối tuần | ❌ Không |
| Giá nhập từ nông dân | Cà chua 12,000đ/kg | ❌ Không |
| Số khách ghé siêu thị | ~500 khách/ngày | ❌ Không (nhưng bị ảnh hưởng bởi giá) |
| Hành vi khách | Giá quá cao → không mua | ❌ Không (nhưng có quy luật) |
| Tốc độ hư hỏng | Rau tươi: 3 ngày là hỏng | ❌ Không (quy luật sinh học) |

> **Ghi nhớ:** Environment **phản hồi lại** hành động của Agent. Agent giảm giá → khách mua nhiều hơn → tồn kho giảm. Nhưng Agent **không ra lệnh** được cho khách.

### 2.2 Agent là ai?

**Agent = thực thể ra quyết định, có mục tiêu rõ ràng.**

Trong bài toán này: **Agent = "bộ não" của Siêu thị X** (có thể hình dung là một phần mềm quản lý tự động).

Agent có:
- **Cảm biến (Sensor):** đọc được tồn kho, thời tiết, doanh số hiện tại
- **Bộ não (Policy):** quyết định phải làm gì tiếp theo
- **Tay chân (Actuator):** thực hiện quyết định (đặt giá mới, đặt đơn hàng mới)

### 2.3 State (Trạng thái) — "Agent nhìn thấy gì?"

**State = bức tranh hiện tại của môi trường mà Agent dùng để ra quyết định.**

Với bài toán rau củ, mỗi khi Agent cần ra quyết định, nó nhìn vào một **vector state** gồm các con số:

```
state = [
    tồn_kho_cà_chua,          # ví dụ: 45 kg
    tồn_kho_xà_lách,           # ví dụ: 20 kg
    tồn_kho_dưa_leo,           # ví dụ: 30 kg
    giá_cà_chua_hiện_tại,      # ví dụ: 25,000 đ/kg
    giá_xà_lách_hiện_tại,      # ví dụ: 30,000 đ/kg
    giá_dưa_leo_hiện_tại,      # ví dụ: 18,000 đ/kg
    số_giờ_còn_mở_cửa,         # ví dụ: 3 (giờ)
    ngày_trong_tuần,           # ví dụ: 6 (thứ 7)
    nhiệt_độ,                  # ví dụ: 28 (°C)
    có_mưa_không,              # ví dụ: 1 (có)
    số_khách_đã_đến_hôm_nay,   # ví dụ: 320
    tuổi_cà_chua,              # ví dụ: 2 (ngày tuổi, hỏng khi = 3)
    tuổi_xà_lách,              # ví dụ: 1
    tuổi_dưa_leo,              # ví dụ: 1
]
```

**14 con số này = state.**

> **Câu hỏi kiểm tra hiểu:** Nếu bạn đổi "tuổi cà chua" thành "ngày nhập cà chua", thông tin có đổi không?  
> **Trả lời:** Không đổi về bản chất. Nhưng đổi cách biểu diễn có thể làm Agent học dễ hơn/khó hơn. **Chọn state là nghệ thuật** — phần quan trọng nhất của mô hình hóa bài toán.

**Quy tắc chọn state:**
1. **Đủ thông tin:** Agent phải biết đủ để ra quyết định đúng. Nếu thiếu "còn mấy giờ đóng cửa", Agent không biết khi nào phải xả hàng.
2. **Không dư thông tin:** State càng to, Agent càng khó học. Không cần đưa "tên siêu thị" vào state vì nó cố định.
3. **Đo được ngay:** State phải lấy được từ hệ thống POS + cảm biến nhiệt độ + API thời tiết. Không đưa vào state thứ bạn không đo được (ví dụ: "tâm trạng khách").

### 2.4 Action (Hành động) — "Agent làm gì được?"

**Action = tập hợp các quyết định mà Agent có thể chọn.**

Với bài toán rau củ, Agent có 2 nhóm hành động:

**Nhóm A — Điều chỉnh giá (chạy mỗi giờ):**
```
action_gia = {
    cà_chua:  [giữ nguyên, -10%, -20%, -30%, -50%],
    xà_lách:  [giữ nguyên, -10%, -20%, -30%, -50%],
    dưa_leo:  [giữ nguyên, -10%, -20%, -30%, -50%],
}
```
→ Mỗi loại có 5 lựa chọn, tổng cộng 5×5×5 = **125 tổ hợp action**.

**Nhóm B — Đặt hàng ngày mai (chạy mỗi tối):**
```
action_dat_hang = {
    cà_chua:  [0, 10, 20, 30, 50, 80, 100] (kg),
    xà_lách:  [0, 10, 20, 30, 50] (kg),
    dưa_leo:  [0, 10, 20, 30, 50] (kg),
}
```

> **Lưu ý:** Action phải **rời rạc hóa** (discretize) hoặc **liên tục** (continuous). Ở đây tôi dùng rời rạc cho dễ hiểu. Thuật toán Q-Learning dùng action rời rạc, thuật toán PPO dùng được action liên tục.

### 2.5 Reward (Phần thưởng) — "Agent được chấm điểm thế nào?"

**Reward = con số phản hồi sau mỗi bước. Đây là "giáo viên" dạy Agent biết tốt/xấu.**

Đây là phần **quan trọng nhất** — và cũng **khó nhất** — của mô hình hóa. Nếu thiết kế sai reward, Agent sẽ học sai mục tiêu.

**Công thức reward cho Siêu thị X:**

```
reward_mỗi_bước = 
      (+) doanh_thu_bước_này
      (−) chi_phí_nhập_hàng_bước_này
      (−) chi_phí_lãng_phí × khối_lượng_hàng_hỏng
      (−) phạt_hết_hàng × số_khách_bỏ_đi
      (−) phạt_biến_động_giá × |giá_mới − giá_cũ|
```

**Giải thích từng thành phần:**

| Thành phần | Ý nghĩa | Ví dụ tính |
|-----------|---------|-----------|
| `+doanh_thu` | Agent được thưởng khi bán được hàng | Bán 5 kg cà chua × 25,000đ = +125,000 |
| `-chi_phí_nhập` | Trừ chi phí mua từ nông dân | Nhập 50 kg × 12,000đ = -600,000 |
| `-lãng_phí` | Phạt nặng khi vứt hàng | 3 kg hỏng × 15,000đ (= giá nhập + phạt) = -45,000 |
| `-hết_hàng` | Phạt khi khách đến không có hàng | 10 khách bỏ đi × 20,000đ = -200,000 |
| `-biến_động` | Phạt khi giá nhảy múa quá mạnh | Giá tăng 5,000 × hệ số 0.5 = -2,500 |

> **Tại sao phạt "biến động giá"?** Vì nếu Agent chỉ quan tâm lợi nhuận, nó sẽ thay đổi giá mỗi phút → khách hàng mất niềm tin. Reward phải **phản ánh đúng mục tiêu kinh doanh thực tế**, không chỉ "bán được nhiều".

**Bài học quan trọng:**
> Reward = **hợp đồng giữa bạn và Agent**.  
> Bạn viết gì vào reward → Agent sẽ tối ưu đúng thứ đó (kể cả khi nó không phải thứ bạn thực sự muốn).

**Ví dụ thiết kế reward SAI:**
```
reward = doanh_thu
```
→ Agent sẽ giảm giá 90% để "doanh thu" tăng (bán được nhiều lượng) nhưng **lợi nhuận âm**.

**Ví dụ thiết kế reward SAI khác:**
```
reward = doanh_thu - chi_phí_nhập
```
→ Agent sẽ **không nhập hàng nữa** (chi phí = 0) → siêu thị không có gì bán → doanh thu = 0 → reward = 0 (vẫn tốt hơn âm!).

→ Phải thêm **phạt hết hàng** để Agent hiểu "không bán được cũng bị phạt".

### 2.6 Tóm tắt vòng lặp Single-Agent

```
┌──────────────────────────────────────────────────────┐
│                    Vòng lặp 1 giờ                    │
│                                                       │
│  1. Agent nhìn STATE hiện tại                        │
│     (tồn kho, thời tiết, giờ...)                     │
│                                                       │
│  2. Agent chọn ACTION                                │
│     (ví dụ: giảm giá cà chua 20%)                    │
│                                                       │
│  3. Environment phản hồi:                            │
│     - Khách đến → mua hàng (giảm tồn kho)            │
│     - Doanh thu tăng/giảm                            │
│     - Hàng già đi 1 giờ                              │
│     - Thời tiết thay đổi                             │
│                                                       │
│  4. Agent nhận REWARD                                │
│     (ví dụ: +50,000 nhờ bán được, -10,000 phạt)     │
│                                                       │
│  5. Agent học: "À, trong state này, action giảm     │
│     giá là tốt → lần sau làm như vậy"               │
│                                                       │
│  6. STATE mới → quay lại bước 1                      │
└──────────────────────────────────────────────────────┘
```

Lặp lại vòng lặp này hàng triệu lần → Agent dần dần tìm ra **Policy tối ưu** = quy tắc "trong state nào thì action nào là tốt nhất".

---

## PHẦN 3 — KHI NÀO CẦN MULTI-AGENT?

### 3.1 Single-Agent có giải được không?

Ở phần 2, ta giả định **chỉ Siêu thị X là Agent**, còn nông dân và khách hàng là "một phần của environment". Điều này **hoạt động được** khi:

- Bạn coi hành vi nông dân là **cố định** (ngày nào cũng cung cấp giá cố định)
- Bạn coi hành vi khách hàng là **cố định** (giảm giá X% → tăng doanh số Y%)

Nhưng thực tế thì **không đúng**:
- Nông dân cũng **cân nhắc:** giá thấp quá thì không bán, giữ lại ngày mai
- Khách hàng cũng **cân nhắc:** giá cao quá thì sang siêu thị khác
- Có **nhiều siêu thị cạnh tranh** trong cùng khu vực

→ Khi **nhiều bên cùng ra quyết định và ảnh hưởng lẫn nhau**, ta cần **Multi-Agent**.

### 3.2 3 Agent trong bài toán rau củ quả

| Agent | Mục tiêu riêng | Action | Thông tin quan sát |
|-------|----------------|--------|---------------------|
| **Siêu thị** (Platform) | Tối đa lợi nhuận + giảm lãng phí | Đặt giá bán, đặt lượng nhập | Tồn kho, số khách, thời tiết |
| **Nông dân** (Supplier) | Bán hàng với giá cao nhất | Đặt giá bán buôn, quyết định cung cấp bao nhiêu | Thời tiết, thu hoạch, dự báo giá |
| **Khách hàng** (Consumer) | Mua được giá hời + hàng tươi | Quyết định mua/không mua, mua bao nhiêu | Giá hiện tại, độ tươi của hàng |

### 3.3 State khác nhau cho mỗi Agent

Đây là điểm quan trọng: **mỗi Agent nhìn thấy một state khác nhau** (còn gọi là "Partial Observation" — quan sát một phần).

**State của Siêu thị (như ở Phần 2.3):**
```
state_siêu_thị = [tồn_kho, giá, giờ, ngày_trong_tuần, thời_tiết, ...]
```

**State của Nông dân:**
```
state_nông_dân = [
    lượng_rau_vừa_thu_hoạch,
    giá_thu_mua_trung_bình_tuần_qua,
    dự_báo_thời_tiết_7_ngày_tới,
    giá_vận_chuyển_đến_siêu_thị,
    số_ngày_rau_còn_giữ_được,
]
```

**State của Khách hàng:**
```
state_khách_hàng = [
    giá_cà_chua_siêu_thị_X,
    giá_cà_chua_siêu_thị_Y,      # siêu thị đối thủ
    độ_tươi_cà_chua_siêu_thị_X,
    ngân_sách_còn_lại_tuần_này,
    nhu_cầu_nấu_ăn_hôm_nay,
]
```

> **Ghi nhớ:** Khách hàng **không thấy** tồn kho nội bộ của siêu thị. Siêu thị **không thấy** ngân sách khách hàng. Đây là **Partial Observable Markov Game (POMG)** — một trong những trường hợp khó nhất trong RL.

### 3.4 Reward khác nhau cho mỗi Agent

**Đây là điểm phân biệt cốt lõi giữa Single-Agent và Multi-Agent.**

| Agent | Reward công thức | Điều nó "thích" |
|-------|------------------|-----------------|
| **Siêu thị** | Lợi nhuận − lãng phí − phạt biến động giá | Bán hết hàng, giá ổn định |
| **Nông dân** | Doanh thu bán buôn − phí lưu kho − phạt rau hỏng | Siêu thị mua nhiều, giá cao |
| **Khách hàng** | Chất lượng hàng mua − giá phải trả | Giá rẻ, hàng tươi |

**Chú ý sự xung đột:**
- Nông dân **muốn giá cao** ↔ Siêu thị **muốn mua rẻ**
- Siêu thị **muốn bán giá cao** ↔ Khách hàng **muốn giá rẻ**
- Nhưng **cả 3 đều muốn:** giao dịch xảy ra (nếu không ai mua, không ai được gì)

→ Đây gọi là **Mixed Cooperative-Competitive Setting** — vừa hợp tác vừa cạnh tranh. Đây là loại bài toán khó nhất trong MARL.

### 3.5 Ví dụ một bước simulation Multi-Agent

**Bối cảnh:** 17h00 thứ 7, trời mưa, tồn kho cà chua của Siêu thị còn 40 kg (nhập lúc sáng 100 kg), còn 3 giờ đóng cửa.

**Bước 1 — Tất cả Agent cùng quan sát state của mình:**
```
Siêu thị:     [tồn_kho=40, giờ=17, ngày=7, mưa=1, tuổi=1, ...]
Nông dân:     [thu_hoạch_ngày_mai=120, dự_báo_mưa_3_ngày=1, ...]
Khách hàng:   [giá_cà_chua_X=25k, giá_cà_chua_Y=23k, ngân_sách=200k, ...]
```

**Bước 2 — Tất cả Agent đồng thời chọn action:**
```
Siêu thị:     giảm giá cà chua 20%  → giá mới 20,000đ/kg
Nông dân:     giữ lại 30 kg cho ngày mai (vì dự báo mưa sẽ hết)
Khách hàng 1: mua 2 kg cà chua ở siêu thị X (vì 20k < 23k)
Khách hàng 2: không mua (không có nhu cầu)
Khách hàng 3: mua 1 kg ở siêu thị Y
```

**Bước 3 — Environment tính kết quả:**
```
Siêu thị X bán được: 2+? kg cà chua
Doanh thu: 2 × 20,000 = 40,000
Tồn kho mới: 40 - 2 = 38 kg
Còn 2 giờ → có thể vẫn lãng phí
```

**Bước 4 — Mỗi Agent nhận reward khác nhau:**
```
Siêu thị:     +40,000 (doanh thu) - 2,500 (biến động giá) = +37,500
Nông dân:     0 (không giao dịch ở bước này) - 1,000 (phí lưu 30 kg) = -1,000
Khách hàng 1: +50,000 (giá trị sử dụng cà chua) - 40,000 (chi tiền) = +10,000
Khách hàng 2: 0
```

**Bước 5 — Mỗi Agent học từ kinh nghiệm của riêng mình:**
```
Siêu thị:     "À, giảm 20% lúc mưa chiều thứ 7 cho kết quả +37,500 → OK"
Nông dân:     "Giữ hàng khi trời mưa để bán ngày mai có thể tốt hơn"
Khách hàng 1: "Siêu thị X lúc 17h thứ 7 có cà chua rẻ → lần sau ghé"
```

Lặp lại **hàng triệu bước** → cả 3 Agent dần dần học được **chiến lược tối ưu cho riêng mình**, nhưng vẫn tương tác cân bằng với nhau.

---

## PHẦN 4 — NHỮNG KHÁI NIỆM PHỤ CẦN BIẾT

### 4.1 Policy (Chính sách)

**Policy = quy tắc "trong state nào thì chọn action nào".**

Có 2 loại:
- **Deterministic policy:** state → action duy nhất. Ví dụ: "tồn kho > 80% → luôn giảm 20%"
- **Stochastic policy:** state → xác suất cho từng action. Ví dụ: "tồn kho > 80% → 70% chọn giảm 20%, 30% chọn giảm 30%"

Mục tiêu cuối cùng của mọi thuật toán RL là **tìm ra Policy tối ưu** — Policy cho tổng reward lớn nhất theo thời gian dài.

### 4.2 Episode (Một lượt)

**Episode = một chuỗi từ bắt đầu đến kết thúc.**

Với bài toán rau củ: **1 ngày = 1 episode** (từ 8h sáng đến 22h tối). Mỗi episode có ~14 bước (mỗi giờ 1 bước).

Agent sẽ chạy hàng **chục nghìn episodes** (hàng chục nghìn ngày giả lập) để học.

### 4.3 Exploration vs Exploitation

**Tình huống kinh điển:**
- **Exploitation (khai thác):** Agent đã biết "giảm 20% là tốt" → luôn chọn giảm 20%
- **Exploration (khám phá):** Agent thử "giảm 30%" xem có tốt hơn không

**Cân bằng:** Nếu chỉ exploit → Agent mắc kẹt ở giải pháp trung bình. Nếu chỉ explore → Agent không bao giờ dùng được thứ đã học.

→ Chiến lược phổ biến: **ε-greedy** — 90% lần chọn action tốt nhất (exploit), 10% lần chọn ngẫu nhiên (explore).

### 4.4 Non-stationarity (Môi trường không tĩnh) — vấn đề đặc biệt của MARL

Trong Single-Agent: Environment có quy luật cố định → Agent học được.

Trong Multi-Agent: **Các Agent khác cũng đang học** → hành vi của họ thay đổi theo thời gian → với góc nhìn của một Agent, environment **không còn cố định**.

**Ví dụ:**
- Tuần 1: Siêu thị học "giảm 20% lúc 17h luôn bán được hết"
- Tuần 2: Khách hàng học "đợi đến 17h để mua rẻ"
- Tuần 3: Siêu thị giảm 20% lúc 17h → không ai mua buổi sáng nữa → doanh thu sụt

→ Chiến lược của Siêu thị ở tuần 1 không còn đúng ở tuần 3. Đây là **vấn đề non-stationarity**, khiến MARL khó hơn Single-Agent rất nhiều.

### 4.5 CTDE — Centralized Training, Decentralized Execution

Đây là ý tưởng khéo léo trong MARL hiện đại, và cũng là từ khóa xuất hiện trong file `02.tex`.

**Trong lúc huấn luyện (Training):**
- Có một "Critic tập trung" nhìn thấy **TẤT CẢ** state và action của mọi Agent
- Nhờ đó, Critic biết được "siêu thị hành động X + nông dân hành động Y → kết quả chung tốt"
- Dùng thông tin này để dạy từng Agent

**Trong lúc chạy thật (Execution):**
- Mỗi Agent chỉ dùng state cục bộ của mình để ra quyết định
- Không cần biết các Agent khác đang làm gì
- → Chạy nhanh, không cần kết nối mạng liên tục

**Tại sao hay:** Vừa tận dụng được thông tin toàn cục khi học, vừa giữ được tính phân tán khi triển khai thực tế.

---

## PHẦN 5 — BẢNG TỔNG KẾT: MAP BÀI TOÁN → KHÁI NIỆM AGENT

| Khái niệm RL/MARL | Ý nghĩa trong bài toán rau củ quả |
|-------------------|-----------------------------------|
| **Environment** | Thị trường rau củ: thời tiết, khách hàng, tồn kho, thời gian, giá nhập |
| **Agent** | (Single) Siêu thị X / (Multi) Siêu thị + Nông dân + Khách hàng |
| **State** | Vector số: tồn kho, giá, giờ, thời tiết, tuổi hàng... |
| **Action** | Điều chỉnh giá (−10%, −20%...), đặt số lượng nhập hàng |
| **Reward** | Doanh thu − chi phí − lãng phí − phạt hết hàng − phạt biến động giá |
| **Policy** | Quy tắc "trong tình huống này thì nên làm gì" mà Agent học ra |
| **Episode** | 1 ngày bán hàng (từ 8h sáng đến 22h tối) |
| **Step** | 1 giờ (hoặc 1 quyết định) trong ngày |
| **Exploration** | Agent thử nghiệm giảm 50% xem có tốt hơn giảm 20% không |
| **Exploitation** | Agent dùng chiến lược đã biết là tốt nhất cho đến giờ |
| **Partial Observation** | Siêu thị không biết ngân sách khách, khách không biết tồn kho |
| **Non-stationarity** | Khi khách học "đợi giảm giá", chiến lược cũ của siêu thị không còn đúng |
| **CTDE** | Lúc train: thấy hết. Lúc chạy thật: mỗi Agent tự quyết định |

---

## PHẦN 6 — CÂU HỎI ĐỂ BẠN TỰ KIỂM TRA HIỂU

Sau khi đọc xong tài liệu này, bạn nên **trả lời được** các câu hỏi sau. Nếu không trả lời được, hãy đọc lại phần tương ứng.

### Mức cơ bản (Hiểu khái niệm)
1. **Environment** là gì? Trong bài toán rau củ, những gì thuộc về environment?
2. **State** khác gì với **Environment**?
3. Tại sao cần **Reward âm** (phạt)? Nếu chỉ có reward dương thì sao?
4. Sự khác nhau cơ bản giữa **Single-Agent** và **Multi-Agent** là gì?
5. **Policy** là gì? Tại sao Agent cần học Policy thay vì được lập trình trực tiếp?

### Mức áp dụng (Map sang bài toán mới)
6. Nếu thêm **"độ tươi của rau"** vào state, điều gì thay đổi trong cách Agent ra quyết định?
7. Nếu bỏ **phạt biến động giá** khỏi reward, bạn dự đoán Agent sẽ hành xử ra sao?
8. Tại sao **khách hàng** không nhất thiết phải là 1 Agent mà có thể là **quần thể nhiều Agent**?
9. Trong bài toán rau củ, khi nào **Single-Agent đã đủ**, khi nào **phải dùng Multi-Agent**?
10. Giả sử thêm **chính quyền** (đặt giá trần để chống lạm phát) — nó nên là Agent hay là ràng buộc trong environment? Tại sao?

### Mức phản biện (Thiết kế)
11. Nếu bạn là người thiết kế hệ thống, bạn sẽ **thiết kế reward** của Siêu thị thế nào để Agent **không lạm dụng giảm giá cuối ngày** (vì về lâu dài sẽ dạy khách "chỉ đến lúc cuối ngày")?
12. Nếu dữ liệu thời tiết có **độ trễ 1 ngày** (hôm nay chỉ biết thời tiết hôm qua), bạn có đưa nó vào state không? Đưa thế nào?
13. Tại sao thiết kế **3 Agent riêng biệt** (siêu thị + nông dân + khách) lại khó hơn nhiều so với **1 Agent duy nhất** điều khiển cả 3?

---

## PHẦN 7 — LIÊN HỆ VỚI DỰ ÁN SALOS (file 02.tex)

Sau khi hiểu được bài toán đơn giản ở trên, bạn có thể đọc lại file `02.tex` (đề xuất SALOS cho Nagoya Seika). Bạn sẽ nhận ra:

| Trong SALOS | Tương ứng với khái niệm đã học |
|-------------|--------------------------------|
| 3 tác tử: Platform + Supplier + Consumer | Chính là 3 Agent ở Phần 3 |
| Data từ JMA (thời tiết Nhật) | Là một phần của **state** |
| GDD (Growing Degree Days) | Feature phụ đưa vào **state** của nông dân |
| Reward: "Lợi nhuận + Giảm Food Loss - Phạt biến động giá" | Đúng công thức reward ở Phần 2.5 |
| CTDE (Centralized Training, Decentralized Execution) | Khái niệm ở Phần 4.5 |
| QMIX / MAPPO | Hai thuật toán **cụ thể** để giải bài toán 3-Agent này |
| 3D Bin Packing | Là một **bài toán phụ** (optimization) — không phải RL |

> SALOS = bài toán rau củ quả + dữ liệu sinh học cây trồng + tối ưu đóng gói xe tải.  
> Ý tưởng cốt lõi **giống hệt** bài toán bạn vừa đọc, chỉ khác ở **quy mô** và **dữ liệu đầu vào**.

---

## PHẦN 8 — ĐỌC THÊM

Để hiểu sâu hơn, bạn có thể đọc:
- **Sutton & Barto** — *Reinforcement Learning: An Introduction* (2nd ed.) — Chương 1, 3, 6 (miễn phí tại incompleteideas.net/book)
- **OpenAI Spinning Up** — spinningup.openai.com (hướng dẫn thực hành RL)
- **PettingZoo** — pettingzoo.farama.org (thư viện môi trường Multi-Agent có sẵn)
- **Gymnasium** — gymnasium.farama.org (thư viện Single-Agent RL)

---

*Tài liệu: Phân tích bài toán phân bổ rau củ quả dưới lăng kính Agent & Multi-Agent*  
*Phục vụ: Sinh viên nghiên cứu dự án SALOS (Nagoya Seika)*  
*Cập nhật: 2026-04-11 | Phiên bản 1.0*
