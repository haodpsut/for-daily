"""Build pgvector index from extracted ISO docs.

This is the MVP-2 setup step. Run once (or re-run after extracting new docs).

Run: python scripts/08_build_index.py [--chunk-size 800] [--overlap 150] [--no-clear]
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings
from university_quality_os.mvp2.indexer import index_corpus
from university_quality_os.utils import setup_logging


def main():
    parser = argparse.ArgumentParser(description="Build pgvector index for MVP-2")
    parser.add_argument("--chunk-size", type=int, default=800, help="Target chars/chunk")
    parser.add_argument("--overlap", type=int, default=150, help="Overlap chars between chunks")
    parser.add_argument("--no-clear", action="store_true", help="Don't truncate existing chunks")
    parser.add_argument("--no-index", action="store_true", help="Skip HNSW index creation")
    args = parser.parse_args()

    log = setup_logging(settings.log_level)

    # Preflight
    if not settings.openai_api_key or settings.openai_api_key.startswith("sk-xxx"):
        log.error("OPENAI_API_KEY missing in .env (needed for embeddings)")
        sys.exit(1)

    log.info("=" * 60)
    log.info("BUILD INDEX — MVP-2 Evidence Finder")
    log.info("=" * 60)
    log.info(f"  Chunk size: {args.chunk_size} chars")
    log.info(f"  Overlap: {args.overlap} chars")
    log.info(f"  Clear first: {not args.no_clear}")
    log.info(f"  Create HNSW: {not args.no_index}")
    log.info("")

    try:
        result = index_corpus(
            chunk_size=args.chunk_size,
            overlap=args.overlap,
            clear_first=not args.no_clear,
            create_index=not args.no_index,
        )
    except Exception as e:
        log.error(f"Indexing failed: {e}")
        sys.exit(1)

    log.info("")
    log.info("=" * 60)
    log.info("INDEX COMPLETE")
    log.info("=" * 60)
    log.info(f"  Documents: {result['n_docs']}")
    log.info(f"  Chunks indexed: {result['indexed_total']}")
    log.info(f"  Total chars: {result['total_chars']:,}")
    log.info(f"  Cost: ~{result['total_cost_vnd']:,.0f} VND")
    log.info("")
    log.info("🎉 Ready to search! Run `streamlit run apps/mvp2_finder.py`")


if __name__ == "__main__":
    main()
