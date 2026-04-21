"""CLI runner for MVP-2 Evidence Finder batch evaluation.

Run: python scripts/09_run_finder_eval.py [--max N] [--model haiku|sonnet]
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings
from university_quality_os.mvp2 import EvidenceFinder
from university_quality_os.mvp2.evaluator import run_evaluation
from university_quality_os.utils import read_json, setup_logging


def main():
    parser = argparse.ArgumentParser(description="MVP-2 finder evaluation")
    parser.add_argument("--max", type=int, default=None, help="Max criteria to evaluate")
    parser.add_argument(
        "--model",
        choices=["haiku", "sonnet"],
        default="haiku",
    )
    args = parser.parse_args()

    log = setup_logging(settings.log_level)

    model = settings.claude_model_fast if args.model == "haiku" else settings.claude_model_primary

    log.info(f"Model: {model}")
    log.info(f"Max criteria: {args.max or 'all with ground truth'}")
    log.info("")

    criteria = read_json(settings.data_dir / "criteria.json")

    finder = EvidenceFinder(criteria_data=criteria, model=model)

    try:
        out = run_evaluation(finder, max_criteria=args.max, verbose=True)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    log.info("")
    log.info("=" * 60)
    log.info("EVALUATION REPORT")
    log.info("=" * 60)
    log.info("")
    print(out["report"])


if __name__ == "__main__":
    main()
