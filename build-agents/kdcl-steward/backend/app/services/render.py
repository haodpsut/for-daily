"""LaTeX → PDF render cho báo cáo TT04-2025.

Reuse pattern của cdr-steward (Jinja2 với delimiter custom + xelatex).
Output:
- `{output_dir}/{session_id}/tt04_report.tex` (Jinja-rendered, có thể edit tay)
- `{output_dir}/{session_id}/tt04_report.pdf` (xelatex)
"""
from __future__ import annotations

import os
import shutil
import subprocess
from datetime import date, datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from sqlalchemy.orm import Session as DbSession

from ..models.meas import MeasResultCLO, MeasResultPLO, MeasSession
from ..models.ref import CLO, PLO, Course, Program

LATEX_FONT = os.getenv("LATEX_FONT", "Times New Roman")
TEMPLATE_DIR_DEFAULT = Path(__file__).resolve().parent.parent.parent.parent / "templates"
OUTPUT_DIR_DEFAULT = Path(__file__).resolve().parent.parent.parent / "output"

INSTITUTION = {
    "ministry": "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
    "name_short_upper": "TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG",
    "name_short": "Trường Đại học Kiến trúc Đà Nẵng",
    "country_line1": "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "country_line2": "Độc lập - Tự do - Hạnh phúc",
    "city": "Đà Nẵng",
}


def latex_escape(s) -> str:
    if s is None:
        return ""
    s = str(s)
    replacements = [
        ("\\", r"\textbackslash{}"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("~", r"\textasciitilde{}"),
        ("^", r"\textasciicircum{}"),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    return s


def format_date_vn(d: date | None) -> str:
    if d is None:
        return "(chưa nhập)"
    return f"{d.day:02d}/{d.month:02d}/{d.year}"


def make_jinja_env(template_dir: Path) -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        block_start_string=r"\BLOCK{",
        block_end_string="}",
        variable_start_string=r"\VAR{",
        variable_end_string="}",
        comment_start_string=r"\#{",
        comment_end_string="}",
        line_statement_prefix="%-",
        line_comment_prefix="%#",
        trim_blocks=True,
        lstrip_blocks=True,
        autoescape=False,
        undefined=StrictUndefined,
    )
    env.filters["latex"] = latex_escape
    return env


def _run_xelatex(tex_path: Path, runs: int = 2) -> Path:
    """Compile TeX → PDF. Tự detect Tectonic (modern, conda) vs xelatex (TeX Live)."""
    cwd = tex_path.parent

    if shutil.which("tectonic"):
        result = subprocess.run(
            ["tectonic", "--keep-logs", "--keep-intermediates",
             "-X", "compile", tex_path.name],
            cwd=str(cwd), capture_output=True, text=True,
            encoding="utf-8", errors="replace",
        )
        if result.returncode != 0:
            log_path = cwd / (tex_path.stem + ".log")
            log_excerpt = (log_path.read_text(encoding="utf-8", errors="replace")[-3000:]
                           if log_path.exists() else result.stderr[-3000:])
            raise RuntimeError(
                f"tectonic failed (returncode={result.returncode}).\n"
                f"--- last 3KB of log ---\n{log_excerpt}"
            )
    else:
        for i in range(runs):
            result = subprocess.run(
                ["xelatex", "-interaction=nonstopmode", "-halt-on-error", tex_path.name],
                cwd=str(cwd), capture_output=True, text=True,
                encoding="utf-8", errors="replace",
            )
            if result.returncode != 0:
                log_path = cwd / (tex_path.stem + ".log")
                log_excerpt = (log_path.read_text(encoding="utf-8", errors="replace")[-3000:]
                               if log_path.exists() else "")
                raise RuntimeError(
                    f"xelatex failed (run {i+1}/{runs}, returncode={result.returncode}).\n"
                    f"--- last 3KB of {log_path.name} ---\n{log_excerpt}"
                )
    pdf_path = cwd / (tex_path.stem + ".pdf")
    if not pdf_path.exists():
        raise RuntimeError(f"LaTeX engine finished but PDF not found: {pdf_path}")
    return pdf_path


def _cleanup_aux(output_dir: Path, stem: str) -> None:
    for ext in (".aux", ".log", ".out", ".toc", ".nav", ".snm"):
        p = output_dir / f"{stem}{ext}"
        if p.exists():
            try:
                p.unlink()
            except OSError:
                pass


def build_context(db: DbSession, session: MeasSession) -> dict:
    """Lấy data cho template từ DB.

    Tự fetch CLO/PLO codes; tự đọc cached results (gọi compute_session trước nếu cần).
    """
    program = db.query(Program).filter_by(id=session.program_id).first()
    course = db.query(Course).filter_by(id=session.course_id).first()

    clo_meta = {c.id: (c.code, c.text_vn) for c in db.query(CLO).all()}
    plo_meta = {p.id: (p.code, p.text_vn) for p in db.query(PLO).all()}

    clo_results_raw = (
        db.query(MeasResultCLO)
        .filter_by(session_id=session.id)
        .all()
    )
    plo_results_raw = (
        db.query(MeasResultPLO)
        .filter_by(session_id=session.id)
        .all()
    )

    clo_results = [
        {
            "clo_code": clo_meta.get(r.clo_id, (None, None))[0] or r.clo_id[:8],
            "clo_text": clo_meta.get(r.clo_id, (None, None))[1] or "",
            "n_students": r.n_students,
            "n_achieved": r.n_achieved,
            "pct_achieved": str(r.pct_achieved),
            "avg_score_pct": str(r.avg_score_pct),
        }
        for r in sorted(
            clo_results_raw,
            key=lambda x: clo_meta.get(x.clo_id, (None, None))[0] or "",
        )
    ]
    plo_results = [
        {
            "plo_code": plo_meta.get(r.plo_id, (None, None))[0] or r.plo_id[:8],
            "plo_text": plo_meta.get(r.plo_id, (None, None))[1] or "",
            "pi_count": r.pi_count,
            "pct_achieved": str(r.pct_achieved),
        }
        for r in sorted(
            plo_results_raw,
            key=lambda x: plo_meta.get(x.plo_id, (None, None))[0] or "",
        )
    ]

    n_students = len(
        [link for link in session.students if not link.absent]
    )
    n_questions = len(session.questions)

    return {
        "institution": INSTITUTION,
        "font_name": LATEX_FONT,
        "program": {
            "code": program.code if program else "",
            "name_vn": program.name_vn if program else "",
        },
        "course": {
            "code": course.code if course else "",
            "name_vn": course.name_vn if course else "",
        },
        "session": {
            "name": session.name,
            "semester": session.semester,
            "cohort_code": session.cohort_code,
            "exam_date_vn": format_date_vn(session.exam_date),
        },
        "n_students_total": n_students,
        "n_questions_total": n_questions,
        "clo_threshold_pct": str(session.clo_threshold_pct),
        "clo_results": clo_results,
        "plo_results": plo_results,
        "warnings": [],  # TODO: persist warnings từ compute, hiện tại empty
        "report_date_vn": format_date_vn(date.today()),
    }


def render_tt04_report(
    db: DbSession,
    session: MeasSession,
    template_dir: Path = TEMPLATE_DIR_DEFAULT,
    output_dir: Path = OUTPUT_DIR_DEFAULT,
    run_pdf: bool = True,
) -> tuple[Path, Path | None]:
    """Render báo cáo TT04-2025 cho 1 session.

    Returns (tex_path, pdf_path or None nếu xelatex không có / fail).
    """
    out = output_dir / session.id
    out.mkdir(parents=True, exist_ok=True)

    env = make_jinja_env(template_dir)
    tpl = env.get_template("tt04_report.tex.j2")
    ctx = build_context(db, session)
    rendered = tpl.render(**ctx)

    tex_path = out / "tt04_report.tex"
    tex_path.write_text(rendered, encoding="utf-8")

    pdf_path: Path | None = None
    if run_pdf:
        try:
            pdf_path = _run_xelatex(tex_path)
            _cleanup_aux(out, "tt04_report")
        except (RuntimeError, FileNotFoundError) as exc:
            # xelatex không có / fail — vẫn trả .tex
            (out / "tt04_report.error.txt").write_text(
                f"{datetime.utcnow().isoformat()}\n{exc}\n", encoding="utf-8"
            )
            pdf_path = None
    return tex_path, pdf_path
