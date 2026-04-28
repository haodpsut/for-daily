FROM python:3.11-slim

# Install XeLaTeX + Vietnamese support + Liberation fonts (Times New Roman compatible)
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
ENV DATABASE_URL="sqlite:////tmp/cdr_steward.db"

# Render.com / Railway / Fly inject PORT env. Local default 8000.
EXPOSE 8000

# Seed background (idempotent) — uvicorn start ngay không bị block
# Để wipe + reseed: redeploy + bypass DB (tạm xóa DATABASE_URL → seed full)
CMD ["sh", "-c", "python -u scripts/seed_demo.py & exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
