# THIẾT KẾ DEMO — BÀI TOÁN PHÂN BỔ RAU CỦ QUẢ
**Hướng dẫn triển khai demo với dữ liệu giả lập và baseline PPO**

> **Đối tượng:** Sinh viên đã đọc `BAI-TOAN-RAU-CU-QUA.md` và muốn bắt tay vào code.  
> **Mục tiêu:** Có một demo chạy được trong **1 tuần** (40 giờ làm việc), từ zero đến có thể so sánh 3 baseline.  
> **Không cần:** GPU, dữ liệu thật, thuật toán MARL phức tạp.  
> **Cần:** Python cơ bản, đọc hiểu được tài liệu tiếng Anh, kiên nhẫn debug.

---

## 1. MỤC TIÊU CỦA DEMO

Sau khi hoàn thành demo, bạn phải có:

1. ✅ Một **môi trường giả lập** (Gymnasium Env) cho siêu thị bán rau củ 1 ngày
2. ✅ Một bộ **dữ liệu giả lập** (synthetic data) cho 90 ngày bán hàng
3. ✅ **3 agent baseline** để so sánh:
   - **Random Agent** — hành động ngẫu nhiên (cận dưới)
   - **Rule-based Agent** — theo luật if-else (baseline thực tế)
   - **PPO Agent** — học từ môi trường (mục tiêu vượt qua rule-based)
4. ✅ **Biểu đồ so sánh** 3 agent theo: lợi nhuận, lãng phí, doanh số
5. ✅ Một **báo cáo ngắn** (10 trang) giải thích kết quả

**Phạm vi:** Chỉ làm **Single-Agent** (1 siêu thị). Multi-Agent để dành cho giai đoạn sau.

**Tại sao chỉ Single-Agent?**
- PPO cho single-agent có thể train xong trong **15 phút trên laptop** (không cần GPU)
- Multi-Agent PPO (MAPPO) cần 6–10 giờ train + code phức tạp hơn 3–5 lần
- Nếu không làm được Single-Agent thì Multi-Agent cũng không làm được

---

## 2. STACK CÔNG NGHỆ

| Thành phần | Thư viện | Phiên bản đề xuất | Ghi chú |
|-----------|----------|-------------------|---------|
| Ngôn ngữ | Python | 3.10+ | 3.11 ổn định nhất |
| Môi trường RL | `gymnasium` | 0.29+ | Thay thế cho `gym` cũ |
| Thuật toán | `stable-baselines3` | 2.3+ | Có sẵn PPO, DQN, A2C |
| Tính toán | `numpy`, `pandas` | — | Xử lý dữ liệu |
| Vẽ biểu đồ | `matplotlib`, `seaborn` | — | Phân tích kết quả |
| Theo dõi training | `tensorboard` | — | Đi kèm SB3 |
| (Tùy chọn) | `jupyter` | — | Viết báo cáo demo |

**Cài đặt một phát:**
```bash
pip install gymnasium stable-baselines3[extra] matplotlib seaborn pandas tensorboard jupyter
```

**Kiểm tra:**
```bash
python -c "import gymnasium, stable_baselines3; print(stable_baselines3.__version__)"
# Kết quả mong đợi: 2.3.x hoặc cao hơn
```

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```
agent-multiagent-for-jp/
│
├── BAI-TOAN-RAU-CU-QUA.md      ← tài liệu khái niệm (đã có)
├── DEMO-DESIGN.md               ← file này
│
└── demo/
    ├── data/
    │   ├── synthetic_generator.py   ← tạo dữ liệu giả lập
    │   └── vegetable_90days.csv     ← dữ liệu đã generate
    │
    ├── env/
    │   └── vegetable_env.py         ← Gymnasium environment
    │
    ├── agents/
    │   ├── random_agent.py          ← baseline 1
    │   ├── rule_based_agent.py      ← baseline 2
    │   └── ppo_train.py             ← train PPO (baseline 3)
    │
    ├── evaluation/
    │   ├── evaluate.py              ← chạy 3 agent, lưu kết quả
    │   └── plot_results.py          ← vẽ biểu đồ so sánh
    │
    ├── results/                     ← output sau khi chạy
    │   ├── random_results.csv
    │   ├── rule_results.csv
    │   ├── ppo_results.csv
    │   └── comparison.png
    │
    ├── models/                      ← checkpoint PPO
    │   └── ppo_vegetable.zip
    │
    └── README.md                    ← hướng dẫn chạy
```

---

## 4. SINH DỮ LIỆU MẪU (SYNTHETIC DATA)

### 4.1 Tại sao dùng dữ liệu giả lập?

- **Không có dữ liệu thật:** Dữ liệu POS của siêu thị là bí mật thương mại
- **Kiểm soát được:** Bạn **biết trước** quy luật → biết khi nào agent học đúng
- **Không tốn kém:** Generate 90 ngày dữ liệu trong vài giây
- **Chuyển sang dữ liệu thật sau:** Khi có dữ liệu thật, chỉ cần thay file CSV

### 4.2 Các quy luật giả lập cần mô phỏng

Dữ liệu 90 ngày cần thể hiện đủ các quy luật sau để agent **có cái để học**:

| Quy luật | Ví dụ | Tại sao cần? |
|----------|-------|-------------|
| **Nhu cầu cơ bản** | Ngày thường: 60 kg cà chua bán được | Baseline để agent đo độ lệch |
| **Hiệu ứng cuối tuần** | Thứ 7, CN: +30% nhu cầu | Agent học "cuối tuần nhập nhiều" |
| **Hiệu ứng mưa** | Ngày mưa: -20% khách đến | Agent học "mưa → phải giảm giá" |
| **Độ nhạy giá** | Giá tăng 10% → nhu cầu giảm 15% | Agent học "đặt giá hợp lý" |
| **Độ tươi quan trọng** | Rau 2 ngày tuổi: -30% nhu cầu | Agent học "xả hàng cũ sớm" |
| **Hiệu ứng ngày lễ** | Ngày lễ (ngẫu nhiên): +50% | Agent học thích ứng đột biến |
| **Nhiễu ngẫu nhiên** | ±10% | Mô phỏng bất định thực tế |

### 4.3 Công thức tổng hợp nhu cầu

```python
demand_t = base_demand
         × weekday_multiplier     # 0.8 .. 1.3
         × weather_multiplier      # 0.7 .. 1.0
         × price_elasticity(price_t)   # giá cao → cầu thấp
         × freshness_factor(age)        # rau già → cầu thấp
         × holiday_bonus               # 1.0 hoặc 1.5
         × noise                       # 0.9 .. 1.1
```

### 4.4 Code skeleton — `synthetic_generator.py`

```python
import numpy as np
import pandas as pd

np.random.seed(42)

N_DAYS = 90
BASE_DEMAND = {"ca_chua": 60, "xa_lach": 30, "dua_leo": 40}  # kg/ngày
BASE_COST   = {"ca_chua": 12000, "xa_lach": 18000, "dua_leo": 8000}  # đ/kg nhập
BASE_PRICE  = {"ca_chua": 25000, "xa_lach": 35000, "dua_leo": 18000}  # đ/kg bán

def generate_day(day_idx):
    weekday = day_idx % 7  # 0=Mon, 6=Sun
    is_weekend = weekday >= 5
    is_holiday = np.random.rand() < 0.05  # 5% là ngày lễ
    is_rainy = np.random.rand() < 0.3     # 30% ngày mưa
    temperature = np.random.uniform(22, 34)

    weekday_mult = 1.3 if is_weekend else 1.0
    weather_mult = 0.75 if is_rainy else 1.0
    holiday_mult = 1.5 if is_holiday else 1.0

    record = {
        "day": day_idx,
        "weekday": weekday,
        "is_weekend": int(is_weekend),
        "is_holiday": int(is_holiday),
        "is_rainy": int(is_rainy),
        "temperature": round(temperature, 1),
    }
    for veg, base in BASE_DEMAND.items():
        demand = base * weekday_mult * weather_mult * holiday_mult
        demand *= np.random.uniform(0.9, 1.1)  # noise
        record[f"demand_{veg}"] = round(demand, 1)
        record[f"cost_{veg}"]   = BASE_COST[veg]
        record[f"price_{veg}"]  = BASE_PRICE[veg]
    return record

df = pd.DataFrame([generate_day(i) for i in range(N_DAYS)])
df.to_csv("data/vegetable_90days.csv", index=False)
print(df.head())
```

Sau khi chạy, bạn có file CSV 90 dòng với đầy đủ thông tin thời tiết, cầu mong đợi, giá nhập, giá bán.

> **Lưu ý:** Demand ở file này là **nhu cầu tiềm năng ở giá gốc**. Khi Agent đổi giá, nhu cầu thực tế sẽ khác — xử lý trong Environment ở phần 5.

---

## 5. THIẾT KẾ ENVIRONMENT (Gymnasium)

### 5.1 Tóm tắt spec

| Thành phần | Giá trị |
|-----------|---------|
| **Observation space** | `Box(low=-inf, high=inf, shape=(14,))` — 14 chiều |
| **Action space** | `Discrete(5)` — 5 mức giảm giá cho 1 loại rau (demo chỉ 1 loại!) |
| **Episode length** | 14 steps (mỗi step = 1 giờ, 8h→22h) |
| **Reward range** | ≈ [-500000, +500000] đồng mỗi step |
| **Reset** | Mỗi lần reset chọn ngẫu nhiên 1 ngày trong 90 ngày |

> **Đơn giản hóa quan trọng:** Demo này **chỉ quản lý 1 loại rau** (cà chua). Khi chạy tốt, bạn mở rộng lên 3 loại sau.

### 5.2 State vector (14 chiều)

```python
obs = [
    stock,                    # 0: tồn kho hiện tại (kg)
    current_price,            # 1: giá bán hiện tại (nghìn đồng)
    hours_remaining,          # 2: số giờ còn đến đóng cửa (0-14)
    weekday,                  # 3: ngày trong tuần (0-6)
    is_weekend,               # 4: 0 hoặc 1
    is_rainy,                 # 5: 0 hoặc 1
    temperature,              # 6: nhiệt độ (°C)
    age_days,                 # 7: tuổi rau (0, 1, 2 — hỏng khi ≥3)
    cumulative_revenue,       # 8: doanh thu đã kiếm được (nghìn đồng)
    cumulative_waste,         # 9: lãng phí (kg)
    customers_arrived,        # 10: số khách đã đến
    customers_bought,         # 11: số khách đã mua
    avg_price_today,          # 12: giá trung bình hôm nay (nghìn)
    price_change_count,       # 13: số lần đổi giá hôm nay
]
```

### 5.3 Action space (5 lựa chọn)

```python
action_map = {
    0: 1.00,   # giữ nguyên giá
    1: 0.90,   # giảm 10%
    2: 0.80,   # giảm 20%
    3: 0.70,   # giảm 30%
    4: 0.50,   # giảm 50% (xả hàng)
}
```

### 5.4 Reward function

```python
reward = (
    + revenue_this_step                       # doanh thu bước này
    - cost_this_step                          # chi phí bị khấu hao (nếu có)
    - waste_penalty * kg_wasted_this_step     # 15000 × kg hỏng
    - stockout_penalty * customers_lost       # 20000 × khách không có hàng
    - volatility_penalty * abs(price_change)  # 500 × độ đổi giá (nghìn)
)
```

**Các hằng số đề xuất:**
```python
WASTE_PENALTY       = 15000   # đ/kg (≥ chi phí nhập + phạt)
STOCKOUT_PENALTY    = 20000   # đ/khách mất
VOLATILITY_PENALTY  = 500     # hệ số phạt thay đổi giá
```

### 5.5 Mô hình phản ứng của khách hàng

Đây là **trái tim** của environment. Agent chọn giá → bao nhiêu khách mua?

**Công thức đơn giản:**
```python
def customer_demand(state, current_price, base_price):
    # Giá rẻ hơn gốc → cầu tăng; giá đắt hơn → cầu giảm
    price_ratio = current_price / base_price
    price_elasticity = np.exp(-2.0 * (price_ratio - 1.0))  # elasticity = -2

    # Rau cũ → ít người mua
    freshness = max(0, 1 - 0.3 * state['age_days'])

    # Số khách đến trong 1 giờ này
    hourly_customers = state['expected_daily_customers'] / 14
    hourly_customers *= (0.8 if state['is_rainy'] else 1.0)

    # Nhu cầu thực = khách × độ nhạy giá × độ tươi
    demand_kg = hourly_customers * 0.3 * price_elasticity * freshness
    demand_kg += np.random.normal(0, demand_kg * 0.1)  # noise
    return max(0, demand_kg)
```

**Câu hỏi cho SV:** Nếu elasticity = -2 nghĩa là gì? Giảm giá 10% thì cầu tăng bao nhiêu? Thử thay -1, -3 xem kết quả khác thế nào.

### 5.6 Code skeleton — `vegetable_env.py`

```python
import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd

class VegetableMarketEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    def __init__(self, data_path="data/vegetable_90days.csv"):
        super().__init__()
        self.df = pd.read_csv(data_path)
        self.action_space = spaces.Discrete(5)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(14,), dtype=np.float32
        )
        self.action_to_discount = [1.0, 0.9, 0.8, 0.7, 0.5]

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        # Chọn ngẫu nhiên 1 ngày
        self.day_data = self.df.sample(1).iloc[0]
        self.step_idx = 0
        self.base_price = 25000  # cà chua
        self.current_price = self.base_price
        self.stock = 80.0  # nhập 80 kg đầu ngày
        self.initial_stock = self.stock
        self.cum_revenue = 0
        self.cum_waste = 0
        self.customers_arrived = 0
        self.customers_bought = 0
        self.price_change_count = 0
        self.age_days = np.random.choice([0, 1])  # 0: mới, 1: ngày trước
        return self._get_obs(), {}

    def step(self, action):
        # 1. Áp dụng discount
        new_price = self.base_price * self.action_to_discount[action]
        price_change = abs(new_price - self.current_price) / 1000  # nghìn đồng
        if new_price != self.current_price:
            self.price_change_count += 1
        self.current_price = new_price

        # 2. Tính cầu khách hàng
        demand = self._compute_demand()
        sold = min(demand, self.stock)
        lost_customers = max(0, demand - sold) / 0.3  # 0.3 kg/khách

        # 3. Cập nhật trạng thái
        self.stock -= sold
        revenue = sold * self.current_price
        self.cum_revenue += revenue
        self.customers_arrived += demand / 0.3
        self.customers_bought += sold / 0.3

        # 4. Tính reward
        reward = (
            revenue
            - 15000 * 0  # waste tính ở cuối episode
            - 20000 * lost_customers
            - 500 * price_change
        )

        # 5. Chuyển step
        self.step_idx += 1
        terminated = self.step_idx >= 14  # hết giờ

        if terminated:
            # Phạt lãng phí cuối ngày
            self.cum_waste = self.stock
            reward -= 15000 * self.cum_waste

        return self._get_obs(), reward, terminated, False, {}

    def _compute_demand(self):
        price_ratio = self.current_price / self.base_price
        elasticity = np.exp(-2.0 * (price_ratio - 1.0))
        freshness = max(0, 1 - 0.3 * self.age_days)
        expected = self.day_data["demand_ca_chua"]  # từ CSV
        hourly = expected / 14
        if self.day_data["is_rainy"]:
            hourly *= 0.75
        demand = hourly * elasticity * freshness
        demand += np.random.normal(0, demand * 0.1)
        return max(0, demand)

    def _get_obs(self):
        return np.array([
            self.stock,
            self.current_price / 1000,
            14 - self.step_idx,
            self.day_data["weekday"],
            self.day_data["is_weekend"],
            self.day_data["is_rainy"],
            self.day_data["temperature"],
            self.age_days,
            self.cum_revenue / 1000,
            self.cum_waste,
            self.customers_arrived,
            self.customers_bought,
            (self.cum_revenue / max(self.customers_bought, 1)) / 1000,
            self.price_change_count,
        ], dtype=np.float32)

    def render(self):
        print(f"Step {self.step_idx} | Stock: {self.stock:.1f}kg | "
              f"Price: {self.current_price:.0f} | Revenue: {self.cum_revenue:.0f}")
```

**Kiểm tra Environment chạy được:**
```python
env = VegetableMarketEnv()
obs, _ = env.reset()
print("Initial obs:", obs)
for _ in range(14):
    action = env.action_space.sample()
    obs, reward, done, _, _ = env.step(action)
    print(f"Action {action} → reward {reward:.0f}")
    if done:
        break
print(f"Total revenue: {env.cum_revenue:.0f}, Waste: {env.cum_waste:.1f}kg")
```

---

## 6. BA BASELINE AGENT

### 6.1 Random Agent (`random_agent.py`)

Mục đích: **cận dưới**. Nếu PPO không vượt qua Random, code của bạn chắc chắn có bug.

```python
class RandomAgent:
    def __init__(self, env):
        self.env = env
    def predict(self, obs):
        return self.env.action_space.sample(), None
```

### 6.2 Rule-based Agent (`rule_based_agent.py`)

Mục đích: **baseline thực tế**. Đây là logic mà một người quản lý siêu thị có kinh nghiệm sẽ làm. PPO phải **vượt qua** cái này để có giá trị.

```python
class RuleBasedAgent:
    def predict(self, obs):
        stock = obs[0]
        hours_remaining = obs[2]
        age_days = obs[7]

        stock_ratio = stock / 80.0  # so với nhập ban đầu

        # Luật 1: Rau cũ → giảm mạnh
        if age_days >= 2:
            return 4, None  # giảm 50%

        # Luật 2: Sắp đóng cửa + còn nhiều hàng
        if hours_remaining <= 2 and stock_ratio > 0.4:
            return 3, None  # giảm 30%
        if hours_remaining <= 4 and stock_ratio > 0.6:
            return 2, None  # giảm 20%

        # Luật 3: Giữa ngày, tồn kho bình thường
        if stock_ratio > 0.8:
            return 1, None  # giảm nhẹ 10%

        # Mặc định: giữ giá
        return 0, None
```

### 6.3 PPO Agent (`ppo_train.py`)

```python
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.monitor import Monitor
from env.vegetable_env import VegetableMarketEnv

def make_env():
    return Monitor(VegetableMarketEnv())

env = DummyVecEnv([make_env])

model = PPO(
    "MlpPolicy",
    env,
    learning_rate=3e-4,
    n_steps=2048,
    batch_size=64,
    n_epochs=10,
    gamma=0.99,
    verbose=1,
    tensorboard_log="./results/tb_logs/",
)

model.learn(total_timesteps=200_000)
model.save("models/ppo_vegetable")

print("Training done. Run TensorBoard with:")
print("  tensorboard --logdir ./results/tb_logs/")
```

**Thời gian train dự kiến:** 10–15 phút trên laptop CPU. Reward trung bình mỗi episode nên tăng từ ~200k → ~1.2 triệu sau 200k steps.

---

## 7. ĐÁNH GIÁ & SO SÁNH

### 7.1 Chạy đánh giá — `evaluate.py`

```python
import numpy as np
import pandas as pd
from env.vegetable_env import VegetableMarketEnv
from agents.random_agent import RandomAgent
from agents.rule_based_agent import RuleBasedAgent
from stable_baselines3 import PPO

def evaluate(agent, env, n_episodes=100, name="agent"):
    results = []
    for ep in range(n_episodes):
        obs, _ = env.reset()
        total_reward = 0
        done = False
        while not done:
            action, _ = agent.predict(obs)
            obs, reward, done, _, _ = env.step(action)
            total_reward += reward
        results.append({
            "episode": ep,
            "total_reward": total_reward,
            "revenue": env.cum_revenue,
            "waste_kg": env.cum_waste,
            "customers_bought": env.customers_bought,
            "price_changes": env.price_change_count,
        })
    df = pd.DataFrame(results)
    df.to_csv(f"results/{name}_results.csv", index=False)
    print(f"\n=== {name.upper()} ===")
    print(df[["total_reward", "revenue", "waste_kg"]].describe())
    return df

env = VegetableMarketEnv()
evaluate(RandomAgent(env), env, name="random")
evaluate(RuleBasedAgent(), env, name="rule")
evaluate(PPO.load("models/ppo_vegetable"), env, name="ppo")
```

### 7.2 Metric quan trọng

| Metric | Công thức | Ý nghĩa |
|--------|-----------|---------|
| **Total Reward** | Tổng reward 1 episode | Tiêu chí tối ưu |
| **Revenue** | Doanh thu thực | Tiêu chí kinh doanh |
| **Waste kg** | Rau hỏng cuối ngày | Càng thấp càng tốt |
| **Sell-through rate** | `(80 - waste) / 80` | Tỉ lệ bán hết |
| **Customer satisfaction** | `bought / arrived` | Tỉ lệ khách mua được |
| **Profit margin** | `revenue - cost - waste_cost` | Lợi nhuận thực |

### 7.3 Kết quả mong đợi

Nếu demo chạy đúng, bạn nên thấy:

| Agent | Total Reward TB | Waste TB | Ghi chú |
|-------|-----------------|----------|---------|
| Random | ~200k | ~25 kg | Cận dưới |
| Rule-based | ~900k | ~10 kg | Baseline thực tế |
| **PPO** | **~1.2M** | **~5 kg** | **Phải vượt Rule-based** |

> Nếu PPO **không vượt** Rule-based: có thể do (a) reward sai, (b) chưa train đủ, (c) state thiếu thông tin, (d) bug trong environment. Debug theo thứ tự này.

### 7.4 Vẽ biểu đồ so sánh — `plot_results.py`

```python
import pandas as pd
import matplotlib.pyplot as plt

random_df = pd.read_csv("results/random_results.csv")
rule_df   = pd.read_csv("results/rule_results.csv")
ppo_df    = pd.read_csv("results/ppo_results.csv")

fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Biểu đồ 1: Distribution of total reward
for df, name in [(random_df, "Random"), (rule_df, "Rule"), (ppo_df, "PPO")]:
    axes[0].hist(df["total_reward"] / 1e6, bins=20, alpha=0.5, label=name)
axes[0].set_xlabel("Total reward (triệu đồng)")
axes[0].set_ylabel("Số episode")
axes[0].set_title("Phân phối Total Reward")
axes[0].legend()

# Biểu đồ 2: Waste comparison (box plot)
axes[1].boxplot(
    [random_df["waste_kg"], rule_df["waste_kg"], ppo_df["waste_kg"]],
    labels=["Random", "Rule", "PPO"]
)
axes[1].set_ylabel("Lãng phí (kg)")
axes[1].set_title("So sánh Lãng phí")

# Biểu đồ 3: Revenue vs Waste scatter
for df, name, color in [
    (random_df, "Random", "red"),
    (rule_df, "Rule", "blue"),
    (ppo_df, "PPO", "green"),
]:
    axes[2].scatter(df["waste_kg"], df["revenue"] / 1e6, alpha=0.5, label=name, c=color)
axes[2].set_xlabel("Lãng phí (kg)")
axes[2].set_ylabel("Doanh thu (triệu)")
axes[2].set_title("Trade-off Revenue vs Waste")
axes[2].legend()

plt.tight_layout()
plt.savefig("results/comparison.png", dpi=150)
plt.show()
```

---

## 8. LỘ TRÌNH TRIỂN KHAI 5 NGÀY

| Ngày | Công việc | Output | Kiểm tra |
|------|-----------|--------|---------|
| **Ngày 1** | Setup môi trường + generate dữ liệu | `vegetable_90days.csv` | In ra được 5 dòng đầu |
| **Ngày 2** | Viết `VegetableMarketEnv` + test manual | `vegetable_env.py` | Chạy 1 episode random không lỗi |
| **Ngày 3** | Random + Rule-based + evaluate | 2 file CSV kết quả | Rule > Random ~3 lần reward |
| **Ngày 4** | Train PPO + evaluate | `ppo_vegetable.zip` + CSV | PPO ≥ Rule |
| **Ngày 5** | Vẽ biểu đồ + viết báo cáo ngắn | `comparison.png` + MD report | 3 biểu đồ + phân tích |

---

## 9. CÁC LỖI THƯỜNG GẶP VÀ CÁCH DEBUG

| Triệu chứng | Nguyên nhân khả dĩ | Cách sửa |
|-------------|---------------------|----------|
| PPO reward không tăng | Learning rate quá lớn/nhỏ | Thử 1e-4, 5e-4 |
| PPO reward âm mãi | Reward scale quá lớn | Chia reward cho 1000 hoặc 10000 |
| PPO thua Rule-based | State thiếu thông tin quan trọng | Thêm feature: tồn kho ban đầu, xu hướng cầu |
| Training chậm | `n_steps` quá lớn | Giảm từ 2048 → 1024 |
| Rule-based reward = 0 | Luật điều kiện sai | In obs ra mỗi step, kiểm tra logic |
| Cầu = 0 mọi step | Elasticity quá âm | Thử -1.0 thay vì -2.0 |
| Random > Rule | Rule có bug hoặc environment bug | Dừng lại debug environment trước |

**Nguyên tắc debug:**
1. In **obs mỗi step** — xem state có đúng không
2. In **reward từng thành phần riêng** — xem component nào lấn át
3. Train với **10k step trước** — nếu không tăng thì không chờ 200k
4. So sánh **PPO vs Random với seed cố định** — đảm bảo sự khác biệt không ngẫu nhiên

---

## 10. MỞ RỘNG SAU DEMO (NẾU CÒN THỜI GIAN)

Các hướng mở rộng theo **mức độ khó tăng dần**:

### Mức 1 — Dễ (2–3 ngày)
- Thêm 2 loại rau (xà lách + dưa leo) → action space trở thành `MultiDiscrete([5, 5, 5])`
- Thêm quyết định "nhập hàng ngày mai" vào cuối episode

### Mức 2 — Trung bình (1 tuần)
- Thêm **inventory decay** (rau tươi → rau già qua đêm) với nhiều ngày
- Thử nghiệm thuật toán khác: DQN, A2C, SAC (discrete)
- Hyperparameter tuning với Optuna

### Mức 3 — Khó (2–3 tuần)
- Chuyển sang **Multi-Agent** với `PettingZoo` + MAPPO
- 2 siêu thị cạnh tranh nhau (competitive)
- Thêm agent nông dân quyết định cung cấp

### Mức 4 — Rất khó (1–2 tháng) — đích SALOS
- Thêm dữ liệu JMA thật (nếu xin được)
- Tích hợp 3D Bin Packing sau PPO
- CTDE với centralized critic

---

## 11. CHECKLIST DEMO HOÀN THÀNH

Demo được coi là thành công khi tất cả mục sau ✅:

- [ ] Chạy được `python demo/data/synthetic_generator.py` không lỗi
- [ ] Chạy được `python -c "from demo.env.vegetable_env import VegetableMarketEnv; env = VegetableMarketEnv(); env.reset()"`
- [ ] Random Agent chạy 100 episode không crash
- [ ] Rule-based Agent có **reward trung bình > Random × 2**
- [ ] PPO train xong trong **< 30 phút** trên laptop
- [ ] PPO có **reward trung bình ≥ Rule-based**
- [ ] File `comparison.png` hiển thị 3 biểu đồ rõ ràng
- [ ] Báo cáo ngắn (10 trang) giải thích được **tại sao PPO tốt hơn Rule-based**
- [ ] Code đã push lên GitHub với README hướng dẫn chạy

---

## 12. CÂU HỎI PHẢN BIỆN (Khi trình bày demo)

Người hướng dẫn có thể hỏi:

1. **Tại sao dùng PPO mà không phải DQN?** → PPO ổn định hơn, ít nhạy hyperparameter, làm việc tốt với action rời rạc hoặc liên tục.
2. **Tại sao không train 1 triệu steps cho chắc?** → Vì dữ liệu giả lập có quy luật đơn giản, 200k là đủ. Train quá nhiều → overfit với môi trường giả lập.
3. **Reward function của bạn có bias gì không?** → Có. Phạt biến động giá có thể khiến agent "ngại đổi giá". Đây là trade-off, không phải lỗi.
4. **Nếu thay synthetic data bằng dữ liệu thật, có chạy được không?** → Cần điều chỉnh: (a) cost/price theo thị trường VN, (b) elasticity phải đo từ dữ liệu, (c) thêm feature context (khuyến mãi, đối thủ).
5. **Sự khác biệt giữa demo này và SALOS là gì?** → Demo = single-agent + 1 loại rau + dữ liệu giả. SALOS = multi-agent + dữ liệu sinh học GDD + 3D bin packing + dữ liệu thật JMA.

---

## 13. TÀI LIỆU THAM KHẢO

- **Stable-Baselines3 Docs:** stable-baselines3.readthedocs.io
- **Gymnasium Custom Env Guide:** gymnasium.farama.org/tutorials/gymnasium_basics/environment_creation/
- **PPO Paper:** Schulman et al. 2017, "Proximal Policy Optimization Algorithms" (arxiv.org/abs/1707.06347)
- **Spinning Up in Deep RL:** spinningup.openai.com
- **PettingZoo (cho bước sau):** pettingzoo.farama.org

---

*Tài liệu: Thiết kế demo bài toán phân bổ rau củ quả với PPO baseline*  
*Đi kèm: `BAI-TOAN-RAU-CU-QUA.md` (tài liệu khái niệm)*  
*Cập nhật: 2026-04-11 | Phiên bản 1.0*
