"""Sample ~100 ISO documents from 11 departments.

Strategy:
- For each dept folder, pick 5 quy trình (QT_*.pdf) + 5 random other files
- Total: ~100 files (varies by dept size)
- Copy to data/raw/iso/ preserving folder structure

Run: python scripts/01_sample_docs.py
"""

import shutil
import random
import sys
from pathlib import Path

# Make src/ importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings, DEPT_NAME_MAP
from university_quality_os.utils import setup_logging

log = setup_logging(settings.log_level)


def is_quy_trinh(filename: str) -> bool:
    """Detect QT_*.pdf or 'QUY TRÌNH *' filenames."""
    name_upper = filename.upper()
    return (
        name_upper.startswith("QT")
        or "QUY TRÌNH" in name_upper
        or "QUY TRINH" in name_upper
    )


def sample_dept(dept_folder: Path, target_per_dept: int) -> list[Path]:
    """Sample files from a department folder.

    Strategy:
    - Take half as QT files (procedures)
    - Take half as other (forms, regulations)
    """
    all_docs = []
    for ext in ("*.pdf", "*.PDF", "*.docx", "*.DOCX"):
        all_docs.extend(dept_folder.rglob(ext))

    if not all_docs:
        log.warning(f"No documents in {dept_folder.name}")
        return []

    qt_files = [f for f in all_docs if is_quy_trinh(f.name)]
    other_files = [f for f in all_docs if not is_quy_trinh(f.name)]

    half = target_per_dept // 2
    chosen_qt = random.sample(qt_files, min(half, len(qt_files)))
    chosen_other = random.sample(other_files, min(target_per_dept - len(chosen_qt), len(other_files)))

    return chosen_qt + chosen_other


def main():
    src = settings.iso_source_path
    dst = settings.raw_iso_dir
    target_per_dept = settings.sample_docs_per_dept

    if not src.exists():
        log.error(f"ISO source not found: {src}")
        log.error("Check ISO_SOURCE in .env or pass correct path.")
        sys.exit(1)

    random.seed(settings.sample_seed)
    log.info(f"Source: {src}")
    log.info(f"Destination: {dst}")
    log.info(f"Target per dept: {target_per_dept}")
    log.info("")

    dept_folders = sorted([f for f in src.iterdir() if f.is_dir()])
    log.info(f"Found {len(dept_folders)} departments:")

    total_copied = 0
    summary = []
    for dept_folder in dept_folders:
        sampled = sample_dept(dept_folder, target_per_dept)
        log.info(f"  {dept_folder.name:25s} → {len(sampled)} files")
        summary.append((dept_folder.name, len(sampled)))

        for src_file in sampled:
            try:
                rel_path = src_file.relative_to(src)
                dst_path = dst / rel_path
                dst_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_file, dst_path)
                total_copied += 1
            except Exception as e:
                log.error(f"Failed to copy {src_file}: {e}")

    log.info("")
    log.info(f"✅ Copied {total_copied} files from {len(dept_folders)} departments")
    log.info(f"📁 Output: {dst}")

    # Print summary
    log.info("")
    log.info("Per-department breakdown:")
    for dept, count in summary:
        full_name = DEPT_NAME_MAP.get(dept, dept)
        log.info(f"  {dept:25s} ({full_name}): {count}")


if __name__ == "__main__":
    main()
