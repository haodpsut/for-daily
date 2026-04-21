"""Indexing pipeline — chunk + embed + store into pgvector.

Run once (offline) to build searchable index from MVP-0 extracted docs.
"""

import logging
from pathlib import Path
from typing import Optional

import psycopg2
from psycopg2.extras import execute_values
from openai import OpenAI

from ..config import settings
from ..utils import read_jsonl, setup_logging, estimate_cost_vnd
from .chunker import chunk_document

log = logging.getLogger("uqos.mvp2.index")


# Using text-embedding-3-small (1536 dims) for HNSW compatibility + cost
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
EMBEDDING_BATCH = 96   # docs per API call


# ─── Database helpers ────────────────────────────────────────

SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS chunks (
    id SERIAL PRIMARY KEY,
    chunk_id TEXT UNIQUE NOT NULL,
    doc_id TEXT NOT NULL,
    doc_path TEXT,
    doc_filename TEXT,
    dept TEXT,
    chunk_idx INTEGER,
    text TEXT NOT NULL,
    text_len INTEGER,
    embedding vector({dim}),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chunks_doc_id_idx ON chunks(doc_id);
CREATE INDEX IF NOT EXISTS chunks_dept_idx ON chunks(dept);
CREATE INDEX IF NOT EXISTS chunks_text_trgm ON chunks USING gin (text gin_trgm_ops);

-- HNSW vector index (cosine similarity). Create after bulk insert for speed.
-- CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
""".format(dim=EMBEDDING_DIM)


def get_db_connection(dsn: Optional[str] = None) -> psycopg2.extensions.connection:
    """Connect to Postgres, check pgvector is available."""
    dsn = dsn or settings.database_url
    try:
        conn = psycopg2.connect(dsn, connect_timeout=5)
    except psycopg2.OperationalError as e:
        raise RuntimeError(
            f"Cannot connect to Postgres at {dsn}. "
            f"Did you run `docker compose up -d`?\n  Error: {e}"
        )
    return conn


def ensure_schema(conn) -> None:
    """Create tables + extensions if needed."""
    with conn.cursor() as cur:
        cur.execute(SCHEMA_SQL)
    conn.commit()
    log.info("Schema ensured (extension + table)")


def create_vector_index(conn) -> None:
    """Create HNSW index on embeddings (do after bulk insert)."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw
            ON chunks USING hnsw (embedding vector_cosine_ops);
        """)
    conn.commit()
    log.info("HNSW vector index created")


def clear_chunks(conn) -> None:
    """Wipe all chunks — for re-indexing."""
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE chunks RESTART IDENTITY;")
    conn.commit()
    log.info("Cleared existing chunks")


# ─── Embedding ────────────────────────────────────────────────


def embed_batch(texts: list[str], client: Optional[OpenAI] = None) -> list[list[float]]:
    """Embed batch of texts via OpenAI API."""
    client = client or OpenAI(api_key=settings.openai_api_key)
    resp = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in resp.data]


def estimate_embedding_cost_vnd(total_chars: int) -> float:
    """OpenAI text-embedding-3-small: $0.02 per 1M tokens.
    ~4 chars/token → $0.005 per 1M chars."""
    tokens = total_chars // 4
    cost_usd = (tokens / 1_000_000) * 0.02
    return cost_usd * 25_000  # USD → VND


# ─── Main indexing pipeline ───────────────────────────────────


def index_corpus(
    source_jsonl: Optional[Path] = None,
    chunk_size: int = 800,
    overlap: int = 150,
    clear_first: bool = True,
    create_index: bool = True,
) -> dict:
    """Full offline indexing pipeline.

    Steps:
    1. Read all OK docs from iso_texts.jsonl
    2. Chunk each doc
    3. Embed all chunks (batched)
    4. Insert into pgvector
    5. Create HNSW index

    Returns: {n_docs, n_chunks, total_chars, total_cost_vnd}
    """
    source_jsonl = source_jsonl or (settings.extracted_dir / "iso_texts.jsonl")
    if not source_jsonl.exists():
        raise FileNotFoundError(f"{source_jsonl} not found. Run 02_extract_text.py first.")

    conn = get_db_connection()
    ensure_schema(conn)

    if clear_first:
        clear_chunks(conn)

    # 1. Read + chunk
    log.info(f"Reading {source_jsonl}")
    all_chunks: list[dict] = []
    n_docs = 0
    for doc in read_jsonl(source_jsonl):
        if doc.get("extract_status") != "ok":
            continue
        n_docs += 1
        doc_chunks = chunk_document(doc, chunk_size=chunk_size, overlap=overlap)
        all_chunks.extend(doc_chunks)

    log.info(f"  {n_docs} docs → {len(all_chunks)} chunks")

    total_chars = sum(c["text_len"] for c in all_chunks)
    est_cost = estimate_embedding_cost_vnd(total_chars)
    log.info(f"  Total chars: {total_chars:,}, est. embedding cost: {est_cost:.0f} VND")

    if not all_chunks:
        log.warning("No chunks to index")
        conn.close()
        return {"n_docs": 0, "n_chunks": 0, "total_chars": 0, "total_cost_vnd": 0}

    # 2. Embed in batches
    client = OpenAI(api_key=settings.openai_api_key)

    for i in range(0, len(all_chunks), EMBEDDING_BATCH):
        batch = all_chunks[i:i + EMBEDDING_BATCH]
        texts = [c["text"] for c in batch]
        try:
            embeddings = embed_batch(texts, client=client)
        except Exception as e:
            log.error(f"Embed batch {i}-{i+len(batch)} failed: {e}")
            raise
        for c, emb in zip(batch, embeddings):
            c["embedding"] = emb
        log.info(f"  Embedded {i + len(batch)}/{len(all_chunks)} chunks")

    # 3. Insert
    log.info("Inserting chunks into Postgres...")
    insert_sql = """
        INSERT INTO chunks (chunk_id, doc_id, doc_path, doc_filename, dept,
                            chunk_idx, text, text_len, embedding)
        VALUES %s
        ON CONFLICT (chunk_id) DO UPDATE SET
            text = EXCLUDED.text,
            embedding = EXCLUDED.embedding;
    """
    with conn.cursor() as cur:
        values = [
            (
                c["chunk_id"], c["doc_id"], c["doc_path"], c["doc_filename"],
                c.get("dept", ""), c["chunk_idx"], c["text"], c["text_len"],
                c["embedding"],
            )
            for c in all_chunks
        ]
        execute_values(cur, insert_sql, values, page_size=100)
    conn.commit()
    log.info(f"  Inserted {len(all_chunks)} chunks")

    # 4. Create HNSW index
    if create_index:
        create_vector_index(conn)

    # Stats
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM chunks;")
        count = cur.fetchone()[0]
    conn.close()

    return {
        "n_docs": n_docs,
        "n_chunks": len(all_chunks),
        "indexed_total": count,
        "total_chars": total_chars,
        "total_cost_vnd": est_cost,
    }


if __name__ == "__main__":
    setup_logging(settings.log_level)
    result = index_corpus()
    print(f"\n✅ Indexed: {result}")
