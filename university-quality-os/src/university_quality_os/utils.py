"""Shared utility functions across MVP-0 scripts."""

import json
import logging
import sys
from pathlib import Path
from typing import Any, Iterator


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Setup logging with UTF-8 output (fixes Windows cp1252 issues with Vietnamese)."""
    # Force stdout to UTF-8 — needed on Windows for Vietnamese diacritics
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%H:%M:%S",
        )
    )

    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    # Replace existing handlers to avoid duplicates
    root.handlers = [handler]

    return logging.getLogger("uqos")


def write_jsonl(records: list[dict], path: Path) -> int:
    """Write records as JSONL. Returns count."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return len(records)


def read_jsonl(path: Path) -> Iterator[dict]:
    """Iterate JSONL records."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def write_json(data: Any, path: Path, indent: int = 2) -> None:
    """Write JSON with Vietnamese-friendly encoding."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)


def read_json(path: Path) -> Any:
    """Read JSON file."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def slugify(text: str, max_len: int = 50) -> str:
    """Make a filesystem-safe ID from arbitrary text."""
    import re

    # Vietnamese: keep diacritics out, transliterate
    # Simple version: lowercase, replace non-alnum with -
    s = re.sub(r"[^\w\s-]", "", text.lower())
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s[:max_len] if max_len else s


def estimate_tokens(text: str) -> int:
    """Rough token estimate (Vietnamese ~1.5 chars/token)."""
    return len(text) // 3


def estimate_cost_vnd(input_tokens: int, output_tokens: int, model: str = "sonnet") -> float:
    """Estimate API cost in VND.

    Pricing (USD per 1M tokens, as of 2026):
      Sonnet 4.x:   input $3,  output $15
      Haiku  4.5:   input $0.8, output $4
      GPT-4o-mini:  input $0.15, output $0.60

    USD/VND ≈ 25,000 (rough)
    """
    USD_TO_VND = 25_000

    rates = {
        "sonnet": (3.0, 15.0),
        "haiku": (0.8, 4.0),
        "gpt-4o-mini": (0.15, 0.60),
    }
    in_rate, out_rate = rates.get(model.split("-")[0] if "-" in model else model, rates["sonnet"])

    cost_usd = (input_tokens * in_rate + output_tokens * out_rate) / 1_000_000
    return cost_usd * USD_TO_VND
