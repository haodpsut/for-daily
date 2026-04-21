# University Quality OS

Agentic AI layer for Vietnamese university quality management.

**Status:** 🧪 Vibe MVP — Week 0 (data preparation)

Tài liệu chi tiết: [../de-an-thanh-lap-cong-ty/mvp/](../de-an-thanh-lap-cong-ty/mvp/)

## Quick start (MVP-0 Data Preparation)

```bash
# 1. Setup
cd university-quality-os
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt

# 2. Copy .env
cp .env.example .env
# Edit .env: add ANTHROPIC_API_KEY, OPENAI_API_KEY

# 3. Start Postgres with pgvector
docker compose up -d

# 4. Run MVP-0 pipeline (in order)
python scripts/01_sample_docs.py       # Sample 100 ISO docs
python scripts/02_extract_text.py      # PDF/DOCX → text
python scripts/03_build_iso_metadata.py  # Scan ISO structure
python scripts/04_build_criteria.py    # Parse KĐCLGD markdown → JSON
python scripts/05_link_criteria_processes.py  # Map criteria ↔ processes
python scripts/06_smoke_test.py        # Test Claude API

# 5. Ground truth labeling (Hảo does this — ~2-3 hours)
streamlit run scripts/labeler.py
```

## Project structure

```
university-quality-os/
├── scripts/                  # MVP-0 standalone scripts (run in order)
│   ├── 01_sample_docs.py
│   ├── 02_extract_text.py
│   ├── 03_build_iso_metadata.py
│   ├── 04_build_criteria.py
│   ├── 05_link_criteria_processes.py
│   ├── 06_smoke_test.py
│   └── labeler.py            # Streamlit labeling app
├── src/
│   └── university_quality_os/
│       ├── config.py          # Env + settings
│       └── utils.py           # Shared helpers
├── data/
│   ├── raw/                  # Original files (gitignored, populated by scripts)
│   │   └── iso/
│   ├── extracted/            # Text + metadata
│   │   ├── iso_texts.jsonl
│   │   └── congvan_texts.jsonl
│   ├── criteria.json         # 60 KĐCLGD criteria
│   ├── iso_processes.json    # 40+ ISO processes
│   └── ground_truth.json     # Labeled docs (Hảo)
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

## MVP Roadmap

See [mvp/README.md](../de-an-thanh-lap-cong-ty/mvp/README.md) for full roadmap.

- **MVP-0** (this week) — Data preparation ← *we are here*
- **MVP-1** (weekend 1) — Document Classifier
- **MVP-2** (weekend 2) — Evidence Finder
- **MVP-3** (weekend 3) — Biểu 04 Drafter

## Data sources

Scripts expect these paths (relative to project root):

```
../de-an-thanh-lap-cong-ty/university/iso/      # 819 ISO files, 11 departments
../de-an-thanh-lap-cong-ty/university/congvan/  # KĐCLGD reference docs
../kiem-dinh-chat-luong/PHAN-TICH-TONG-THE.md   # Pre-analyzed 60 criteria
```

If paths differ, update in `src/university_quality_os/config.py`.

## License & confidentiality

Internal CAIRA-DAU project. Do not share externally.
