#!/bin/bash
# Sprint 1 smoke test — verify Qwen 2.5 hiểu được CLO Vietnamese + output JSON đúng format
# Chạy SAU khi setup_ollama.sh xong và model đã pull xuống.

set -e

MODEL="qwen2.5:14b"
OLLAMA_URL="http://localhost:11434"

echo "════════════════════════════════════════════════════════"
echo "Smoke test 1: Parse 1 đoạn CLO ngắn"
echo "════════════════════════════════════════════════════════"

INPUT='Bảng 2: Chuẩn đầu ra của học phần (CLOs)
CLO1: Mô tả được các nguyên lý cung cầu và cân bằng thị trường.
CLO2: Phân tích hành vi tối ưu của người tiêu dùng và doanh nghiệp.
CLO3: Đánh giá ảnh hưởng của chính sách tài khóa lên các biến vĩ mô.'

PROMPT=$(cat <<EOF
Bạn là chuyên gia kiểm định chất lượng giáo dục đại học Việt Nam.

Trích xuất từ đoạn text dưới đây, trả về JSON với schema chính xác:
{
  "clos": [
    {"code": "CLO1", "text_vn": "...", "bloom_level": "REMEMBER|UNDERSTAND|APPLY|ANALYZE|EVALUATE|CREATE"}
  ]
}

bloom_level dựa vào động từ Bloom: nhớ/mô tả/liệt kê = REMEMBER, hiểu/giải thích = UNDERSTAND,
áp dụng/tính = APPLY, phân tích/so sánh = ANALYZE, đánh giá/phản biện = EVALUATE, tạo ra/thiết kế = CREATE.

Text:
$INPUT
EOF
)

time curl -s "$OLLAMA_URL/api/chat" -d "$(jq -n --arg m "$MODEL" --arg p "$PROMPT" '{
  model: $m,
  messages: [{role: "user", content: $p}],
  stream: false,
  format: "json",
  options: {temperature: 0.1, num_ctx: 4096}
}')" | jq '.message.content | fromjson'

echo ""
echo "════════════════════════════════════════════════════════"
echo "Smoke test 2: Parse Program info từ tiêu đề CTĐT"
echo "════════════════════════════════════════════════════════"

INPUT2='CHUẨN ĐẦU RA
CHƯƠNG TRÌNH ĐÀO TẠO TRÌNH ĐỘ ĐẠI HỌC
Hệ chính quy theo hệ thống tín chỉ ngành Công nghệ thông tin
(Ban hành kèm theo Quyết định số 346/QĐ-ĐHKTĐN ngày 25 tháng 06 năm 2024
của Hiệu trưởng Trường Đại học Kiến trúc Đà Nẵng)

Ngành (Program): Công nghệ thông tin
Mã ngành (Program Code): 7480201
Trình độ đào tạo: Đại học
Thời gian đào tạo: 4 năm
Tổng số tín chỉ: 144'

PROMPT2=$(cat <<EOF
Trích xuất thông tin chương trình đào tạo từ text dưới, trả về JSON:
{
  "code": "...",
  "name_vn": "...",
  "name_en": "...",
  "level": "DAI_HOC|THAC_SI|TIEN_SI",
  "duration_years": 0,
  "total_credits": 0,
  "decision_no": "...",
  "decision_date": "YYYY-MM-DD",
  "issuing_authority": "..."
}

Text:
$INPUT2
EOF
)

time curl -s "$OLLAMA_URL/api/chat" -d "$(jq -n --arg m "$MODEL" --arg p "$PROMPT2" '{
  model: $m,
  messages: [{role: "user", content: $p}],
  stream: false,
  format: "json",
  options: {temperature: 0.1}
}')" | jq '.message.content | fromjson'

echo ""
echo "════════════════════════════════════════════════════════"
echo "✓ Smoke test xong"
echo "════════════════════════════════════════════════════════"
echo "Latency benchmark (RTX 4090):"
echo "  - Test 1 (3 CLOs):    ~2-4s"
echo "  - Test 2 (Program):   ~1-2s"
echo ""
echo "Nếu chậm hơn 10s → kiểm tra GPU usage: nvidia-smi"
echo "Nếu output sai format → có thể cần thử model lớn hơn (qwen2.5:32b)"
