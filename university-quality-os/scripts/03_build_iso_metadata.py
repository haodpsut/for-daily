"""Scan full ISO folder structure → build iso_processes.json.

Doesn't need extracted text — just folder/file structure.

Output: data/iso_processes.json
{
  "version": "...",
  "total": 50,
  "processes": [
    {
      "id": "KHAOTHI-001",
      "name": "1. XAY DUNG VA QUAN LY NGAN HANG CAU HOI THI",
      "department": "KHAO THI",
      "dept_full": "Phòng Khảo thí và Đảm bảo chất lượng",
      "folder_path": "KHAO THI/1. XAY DUNG VA QUAN LY...",
      "qt_files": ["QT_XAY DUNG VA QUAN LY...pdf"],
      "templates": ["Hướng dẫn đưa câu hỏi...docx", ...],
      "regulations": ["Quy định về việc xây dựng...pdf", ...],
      "keywords": ["ngân", "hàng", "câu", "hỏi", "thi"]
    }
  ]
}

Run: python scripts/03_build_iso_metadata.py
"""

import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from university_quality_os.config import settings, DEPT_NAME_MAP
from university_quality_os.utils import setup_logging, write_json

log = setup_logging(settings.log_level)

# Vietnamese stopwords (basic)
VN_STOPWORDS = {
    "quy", "trình", "trinh", "về", "ve", "và", "va", "của", "cua", "cho",
    "các", "cac", "cuối", "cuoi", "có", "co", "với", "voi", "tại", "tai",
    "trong", "ngoài", "ngoai", "đến", "den", "từ", "tu", "khi", "bằng",
    "bang", "của", "thuộc", "thuoc", "do", "đối", "doi", "việc", "viec",
    "nội", "noi", "ngoài", "ngoai", "theo", "đối", "doi", "với", "voi",
    "QT", "qt",
}


def extract_keywords(name: str, max_keywords: int = 8) -> list[str]:
    """Get meaningful keywords from process name."""
    # Remove leading numbers
    name = re.sub(r"^\d+\.\s*", "", name)
    # Lowercase + tokenize
    words = re.findall(r"\b\w+\b", name.lower(), flags=re.UNICODE)
    keywords = []
    seen = set()
    for w in words:
        if w in VN_STOPWORDS or len(w) < 2 or w in seen:
            continue
        keywords.append(w)
        seen.add(w)
        if len(keywords) >= max_keywords:
            break
    return keywords


def is_quy_trinh(filename: str) -> bool:
    name_upper = filename.upper()
    return name_upper.startswith("QT") or "QUY TRÌNH" in name_upper or "QUY TRINH" in name_upper


def scan_process_folder(proc_folder: Path) -> dict:
    """Scan one process folder → metadata."""
    qt_files = []
    other_files = []

    # Top-level files
    for f in proc_folder.iterdir():
        if f.is_file() and f.suffix.lower() in {".pdf", ".docx", ".doc"}:
            if is_quy_trinh(f.name):
                qt_files.append(f.name)
            else:
                other_files.append(f.name)

    # Subfolder: Bieu mau (templates)
    bieu_mau_folder = proc_folder / "Bieu mau"
    if not bieu_mau_folder.exists():
        bieu_mau_folder = proc_folder / "Bieu Mau"
    templates = []
    if bieu_mau_folder.exists():
        for f in bieu_mau_folder.iterdir():
            if f.is_file() and f.suffix.lower() in {".docx", ".doc", ".pdf", ".xlsx", ".xls"}:
                templates.append(f.name)

    # Subfolder: Van ban (regulations)
    van_ban_folder = proc_folder / "Van ban"
    if not van_ban_folder.exists():
        van_ban_folder = proc_folder / "van ban"
    regulations = []
    if van_ban_folder.exists():
        for f in van_ban_folder.iterdir():
            if f.is_file() and f.suffix.lower() in {".pdf", ".docx", ".doc"}:
                regulations.append(f.name)

    return {
        "qt_files": qt_files,
        "templates": templates,
        "regulations": regulations,
        "extra_files": other_files,
    }


def main():
    src = settings.iso_source_path

    if not src.exists():
        log.error(f"ISO source not found: {src}")
        sys.exit(1)

    log.info(f"Scanning: {src}")

    processes = []
    counter_per_dept = {}

    dept_folders = sorted([f for f in src.iterdir() if f.is_dir()])
    for dept_folder in dept_folders:
        dept_code = dept_folder.name
        dept_full = DEPT_NAME_MAP.get(dept_code, dept_code)

        proc_folders = sorted([f for f in dept_folder.iterdir() if f.is_dir()])
        for proc_folder in proc_folders:
            counter_per_dept[dept_code] = counter_per_dept.get(dept_code, 0) + 1
            idx = counter_per_dept[dept_code]

            # Build ID: KHAOTHI-001 etc.
            dept_id_part = re.sub(r"[^A-Z0-9]", "", dept_code.upper())
            proc_id = f"{dept_id_part}-{idx:03d}"

            files_info = scan_process_folder(proc_folder)

            process = {
                "id": proc_id,
                "name": proc_folder.name,
                "department": dept_code,
                "dept_full": dept_full,
                "folder_path": str(proc_folder.relative_to(src)).replace("\\", "/"),
                "qt_files": files_info["qt_files"],
                "templates": files_info["templates"],
                "regulations": files_info["regulations"],
                "extra_files": files_info["extra_files"],
                "num_qt": len(files_info["qt_files"]),
                "num_templates": len(files_info["templates"]),
                "num_regulations": len(files_info["regulations"]),
                "keywords": extract_keywords(proc_folder.name),
            }
            processes.append(process)

    # Build output
    output = {
        "version": "1.0",
        "generated_at": datetime.now().isoformat(),
        "source": str(src),
        "total": len(processes),
        "by_department": {
            dept: sum(1 for p in processes if p["department"] == dept)
            for dept in DEPT_NAME_MAP
        },
        "processes": processes,
    }

    out_path = settings.data_dir / "iso_processes.json"
    write_json(output, out_path)

    log.info("")
    log.info(f"📊 ISO processes summary:")
    log.info(f"  Total processes: {len(processes)}")
    log.info(f"  Departments:     {len(dept_folders)}")
    log.info("")
    log.info("Per-department:")
    for dept, count in output["by_department"].items():
        if count > 0:
            log.info(f"  {dept:25s}: {count}")
    log.info("")
    log.info(f"📁 Output: {out_path}")


if __name__ == "__main__":
    main()
