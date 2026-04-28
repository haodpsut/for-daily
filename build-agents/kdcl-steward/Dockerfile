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

# Seed chạy BACKGROUND — uvicorn start ngay (cold-start chỉ ~5s, không phải 60s).
# Seed log → /tmp/seed.log (xem qua Render Logs sau khi service Live).
# `exec` thay shell bằng uvicorn để signals (SIGTERM) deliver đúng.
CMD ["sh", "-c", "python -u scripts/seed_demo.py & exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
