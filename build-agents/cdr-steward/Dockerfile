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

# Seed-on-start (idempotent — nếu data đã tồn tại sẽ skip, không phá user edit)
# Để wipe + reseed: vào Render Shell chạy `python scripts/seed_demo.py --force`
CMD ["sh", "-c", "python scripts/seed_demo.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
