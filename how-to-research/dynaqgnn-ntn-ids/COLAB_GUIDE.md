# Colab Pro+ Guide --- DynaQGNN-IDS

Hướng dẫn chạy code trên Google Colab Pro+ và quy trình chia sẻ kết quả.

---

## 0. Chuẩn bị (một lần)

| Yêu cầu | Ghi chú |
|---|---|
| Colab Pro+ account | Đã có |
| GitHub Personal Access Token (PAT) | Cần nếu repo **private**. Tạo tại <https://github.com/settings/tokens> --- scope: `repo` (read). Ghi lại token. |
| Weights & Biases account | Miễn phí tại <https://wandb.ai/> --- lấy API key tại <https://wandb.ai/authorize>. |

---

## 1. Mở notebook bootstrap

Trong Colab, chọn **File > Open notebook > GitHub tab**, paste URL:

```
https://github.com/haodpsut/for-daily
```

→ chọn branch `main` → mở `how-to-research/dynaqgnn-ntn-ids/notebooks/colab_bootstrap.ipynb`.

Hoặc mở link trực tiếp (sau khi repo public):
```
https://colab.research.google.com/github/haodpsut/for-daily/blob/main/how-to-research/dynaqgnn-ntn-ids/notebooks/colab_bootstrap.ipynb
```

---

## 2. Đặt runtime GPU

**Runtime > Change runtime type > Hardware accelerator**:
- **A100 40 GB** (ưu tiên, có khi không available) — dùng cho simulator 24–28 qubits.
- **L4 / V100 16 GB** — OK cho ≤ 20 qubits.
- **T4 16 GB** — OK cho ≤ 16 qubits (đủ cho smoke test và paper A warm-up).

Kiểm tra bằng `!nvidia-smi` — phải thấy GPU được cấp.

---

## 3. Sửa 2 dòng config trước khi chạy bootstrap

Trong cell đầu của notebook:

```python
REPO_URL = 'https://<YOUR_PAT>@github.com/haodpsut/for-daily.git'   # nếu private
# REPO_URL = 'https://github.com/haodpsut/for-daily.git'             # nếu public
REPO_DIR = 'for-daily'
```

Sau khi clone xong, notebook `cd` vào:
```
for-daily/how-to-research/dynaqgnn-ntn-ids/
```

> Lưu ý: notebook gốc có `REPO_DIR = 'dynaqgnn-ntn-ids'` vì trước đây dự kiến tách repo riêng. Bây giờ repo cha là `for-daily/`, cần đổi như trên hoặc dùng phiên bản đã chỉnh tương ứng.

---

## 4. Chạy các cell bootstrap (theo thứ tự)

1. **Clone repo** → OK khi thấy `Already cloned` hoặc `Cloning into 'for-daily'...`
2. **Install dependencies** → `pip install -q -r requirements.txt` (mất ~2 phút)
3. **Verify stack**:
   ```
   torch     : 2.3.x
   CUDA      : True NVIDIA A100-SXM4-40GB
   pennylane : 0.36.x
   qiskit    : 1.1.x
   ```
4. **Smoke test**:
   ```
   !python experiments/exp01_classical_baselines/run.py --smoke
   ```
   Output mong đợi:
   ```
   [smoke] Seeding OK.
   [smoke] torch 2.3.x, CUDA available: True
   [smoke] pennylane 0.36.x
   [smoke] All imports succeeded. Scaffold is live.
   ```
5. **W&B login** → dán API key khi được hỏi.

---

## 5. Sau smoke test — roadmap

Khi scaffold chạy, thứ tự tuần tiếp theo (file 04):
- **Tuần 2**: `src/data/hypatia_pipeline.py` — tích hợp Hypatia + DoS extension. Tôi sẽ draft trong phiên tới.
- **Tuần 3**: baseline classical (E-GraphSAGE + MLP).
- **Tuần 5**: DynaQGNN v0 (8 qubits).
- **Tuần 6–8**: ablation + chạy seeds.

---

## 6. Chia sẻ kết quả với trợ lý — Tiered workflow

Dùng đúng tier cho đúng loại kết quả — tiết kiệm thời gian hai bên.

### 🟢 Tier 1 — Quick sanity / smoke output
**Khi nào**: check 1 lệnh chạy, verify import, debug.

**Cách gửi**: copy-paste 5–30 dòng terminal output vào chat.

**Ví dụ**:
```
[smoke] Seeding OK.
[smoke] torch 2.3.1, CUDA available: True
...
```

### 🟡 Tier 2 — Training runs (loss curves, metrics)
**Khi nào**: chạy baseline, ablation, training thực sự có số liệu.

**Cách gửi**:
1. Dán **W&B run URL** — tôi xem metrics + loss curves online.
2. Paste **bảng metric cuối** (5–10 dòng) trực tiếp trong chat.

**Ví dụ URL**:
```
https://wandb.ai/<your-user>/dynaqgnn-ntn-ids/runs/abc123xyz
```

**Ví dụ bảng**:
```
model           acc    f1     auc_pr
-------         ----   ----   ------
MLP             0.847  0.812  0.741
E-GraphSAGE     0.901  0.887  0.865
DynaQGNN-v0     0.918  0.905  0.892
```

### 🔵 Tier 3 — Full experiments cần xem file cụ thể
**Khi nào**: bảng ablation lớn, figures cần review, cần kiểm tra code bug.

**Cách gửi**: commit result files vào repo + push:

```bash
# Trong Colab, sau khi training xong:
cd for-daily/how-to-research/dynaqgnn-ntn-ids/
mkdir -p reports/run-$(date +%Y%m%d-%H%M)/
cp results/metrics.csv reports/run-YYYYMMDD-HHMM/
cp results/figures/*.png reports/run-YYYYMMDD-HHMM/

# Commit + push (Colab cần PAT trong REPO_URL như bước 3)
git add reports/
git -c user.email="haodp.ai@gmail.com" -c user.name="Phuc Hao" \
  commit -m "results: <tên experiment> run-YYYYMMDD-HHMM"
git push
```

Rồi trong chat nói với tôi: *"commit \<hash\> — xem giúp"* — tôi pull về, đọc, phản hồi.

> **Lưu ý**: folder `results/` đang bị `.gitignore` chặn (vì quá lớn), nên tôi đã tách riêng folder `reports/` không bị ignore để chứa summary. Đừng push dữ liệu thô (.pt, .npz) — chỉ push CSV, Markdown, PNG figures nhỏ.

### 🔴 Tier 4 — Khi vướng bug khó hoặc cần pair debug
**Khi nào**: stack trace lạ, output không đúng như mong đợi, không biết sai ở đâu.

**Cách gửi**: File → Save a copy in Drive → Share link (view-only hoặc comment) → gửi link. Tôi xem được toàn bộ notebook (code + output + state).

---

## 7. Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `git clone` 403 | PAT sai hoặc hết scope | Tạo lại PAT với scope `repo` |
| `ModuleNotFoundError: pennylane` | Chưa chạy cell pip install | Restart runtime + chạy lại cells 1–2 |
| `lightning.gpu` thất bại | Colab driver không support cuQuantum | Dùng `lightning.qubit` (chậm hơn nhưng vẫn chạy). Edit `configs/base.yaml` → `quantum_backend: lightning.qubit` |
| Session disconnect giữa training | Colab idle timeout | Chạy training trong `!nohup python ... &` + log ra file; nhớ mount Drive để lưu checkpoint. |
| Out of memory (OOM) khi nqubits > 20 | A100 chưa được cấp | Xem Runtime info; nếu chỉ có T4 thì giảm `n_qubits` trong config. |

---

## 8. Cheat sheet

```bash
# Gọi workflow theo tuần
!make test                # kiểm tra imports
!make sanity              # smoke baseline
!make train EXP=exp01_classical_baselines          # tuần 3
!make train EXP=exp03_dynaqgnn_centralized         # tuần 5
!make figures             # build lại TikZ figures trong paper/figures/
```

---

*Tài liệu này là living doc --- cập nhật mỗi khi workflow thay đổi.*
