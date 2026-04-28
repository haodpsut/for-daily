FROM python:3.11-slim

# XeLaTeX cho render báo cáo TT04-2025
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-xetex \
    texlive-fonts-recommended \
    texlive-lang-other \
    fonts-liberation \
    fontconfig \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -f

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY templates ./templates

WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1
ENV LATEX_FONT="Liberation Serif"
# Default ephemeral SQLite — production override DATABASE_URL với Postgres connection (cùng DB với cdr-steward)
ENV DATABASE_URL="sqlite:////tmp/kdcl_steward.db"

EXPOSE 8001

# Auto-seed measurement demo trên startup (idempotent + graceful):
# - Khi share Postgres với cdr-steward: tìm thấy demo user + Program QTKD → seed Session/Q/SV/Score.
#   Restart sau đó: data đã có → seed skip.
# - Nếu cdr chưa seed: seed_demo print warning + return → uvicorn vẫn start (app boot OK, empty UI).
# Dùng `;` (không phải `&&`) để uvicorn chạy bất kể seed exit code.
CMD ["sh", "-c", "python scripts/seed_demo.py ; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
