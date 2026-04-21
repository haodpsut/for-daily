"""CLI runner for MVP-1 classifier batch evaluation.

Run: python scripts/07_run_classifier_eval.py [--max N] [--model haiku|sonnet]

Output:
  data/evaluations/evaluation_YYYY-MM-DD_HHMM.json  (full)
  data/evaluations/evaluation_YYYY-MM-DD_HHMM.md   (report)
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings
from university_quality_os.mvp1 import DocumentClassifier
from university_quality_os.mvp1.evaluator import run_evaluation
from university_quality_os.utils import read_json, setup_logging


def main():
    parser = argparse.ArgumentParser(description="MVP-1 classifier evaluation")
    parser.add_argument("--max", type=int, default=None, help="Max docs to evaluate (default: all ground truth)")
    parser.add_argument(
        "--model",
        choices=["haiku", "sonnet"],
        default="haiku",
        help="LLM model (haiku=fast/cheap, sonnet=quality)",
    )
    args = parser.parse_args()

    log = setup_logging(settings.log_level)

    # Resolve model
    if args.model == "haiku":
        model = settings.claude_model_fast
    else:
        model = settings.claude_model_primary

    log.info(f"Model: {model}")
    log.info(f"Max docs: {args.max or 'all'}")
    log.info("")

    # Load metadata
    criteria = read_json(settings.data_dir / "criteria.json")
    processes = read_json(settings.data_dir / "iso_processes.json")

    # Build classifier
    classifier = DocumentClassifier(
        criteria_data=criteria,
        processes_data=processes,
        model=model,
    )

    # Run eval
    try:
        out = run_evaluation(classifier, max_docs=args.max, verbose=True)
    except FileNotFoundError as e:
        log.error(str(e))
        sys.exit(1)

    # Print report
    log.info("")
    log.info("=" * 60)
    log.info("EVALUATION REPORT")
    log.info("=" * 60)
    log.info("")
    print(out["report"])


if __name__ == "__main__":
    main()
