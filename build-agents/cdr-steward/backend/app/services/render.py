"""LaTeX → PDF render engine cho 5 template DAU.

- Jinja2 với delimiter custom tránh đụng độ LaTeX:
    \\VAR{x}     → variable interpolation
    \\BLOCK{...} → control flow (if/for)
    %# ...       → line comment
- Output: ghi .tex + chạy xelatex 2 lần (longtable refs).
- Mọi text từ DB phải qua filter |latex để escape ký tự đặc biệt.
"""
from __future__ import annotations

import os
import subprocess
from datetime import date
from pathlib import Path

# Font name passed to LaTeX \setmainfont. On Linux Docker, override via env to "Liberation Serif".
LATEX_FONT = os.getenv("LATEX_FONT", "Times New Roman")

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from sqlalchemy.orm import Session

from ..models import (
    Program, PLO, PO, PI, PLO_PO,
    VQFItem, PLO_VQF, VQFDomain,
    Course, CO, CLO, CLO_CO, CLO_PI, IRMALevel, KnowledgeGroup,
    Assessment, Assessment_CLO,
    WeeklyPlan, WeeklyPlan_CLO,
)


# ─────────────────────────────────────────────────────────────
# Institution-level constants (multi-tenant: chuyển sang bảng Institution)
# ─────────────────────────────────────────────────────────────

INSTITUTION = {
    "ministry": "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
    "name_short_upper": "TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG",
    "name_short": "Trường Đại học Kiến trúc Đà Nẵng",
    "country_line1": "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
    "country_line2": "Độc lập - Tự do - Hạnh phúc",
    "president_title": "HIỆU TRƯỞNG",
    "president_title_en": "President",
    "president_name": "PHẠM ANH TUẤN",
    "president_name_with_degree": "TS.KTS PHẠM ANH TUẤN",
    "dean_name": "Trần Mạnh Huy",
    "dean_title": "Trưởng Khoa Công nghệ Thông tin",
    "dept_head_name": "Nguyễn Tất Phú Cường",
    "dept_head_title": "Trưởng Bộ môn Công nghệ Thông tin",
    "city": "Đà Nẵng",
}

PROGRAM_LEVEL_TEXT = {
    "DAI_HOC": "Đại học",
    "THAC_SI": "Thạc sĩ",
    "TIEN_SI": "Tiến sĩ",
}

KNOWLEDGE_GROUP_LABEL = {
    KnowledgeGroup.DAI_CUONG: "1. Kiến thức giáo dục đại cương",
    KnowledgeGroup.CO_SO: "2.1. Kiến thức cơ sở",
    KnowledgeGroup.CHUYEN_NGANH: "2.2. Kiến thức chuyên ngành",
    KnowledgeGroup.TU_CHON: "Tự chọn",
    KnowledgeGroup.TOT_NGHIEP: "2.4. Tốt nghiệp",
}

# Thang điểm 10 → chữ → 4 (theo Quy chế DAU 347/QĐ-ĐHKTĐN)
GRADE_SCALE = [
    ("Đạt", "Từ 9,5 đến 10,0", "A+", "4,0"),
    ("Đạt", "Từ 8,5 đến dưới 9,5", "A", "4,0"),
    ("Đạt", "Từ 8,0 đến dưới 8,5", "B+", "3,5"),
    ("Đạt", "Từ 7,0 đến dưới 8,0", "B", "3,0"),
    ("Đạt", "Từ 6,5 đến dưới 7,0", "C+", "2,5"),
    ("Đạt", "Từ 5,5 đến dưới 6,5", "C", "2,0"),
    ("Đạt", "Từ 5,0 đến dưới 5,5", "D+", "1,5"),
    ("Đạt", "Từ 4,0 đến dưới 5,0", "D", "1,0"),
    ("Không đạt", "Từ 0,0 đến dưới 4,0", "F", "0"),
]

IRMA_LEGEND = [
    ("I", "Introduced", "Học phần có các CLO hỗ trợ đạt được PLO ở mức giới thiệu/bắt đầu"),
    ("R", "Reinforced", "Học phần có các CLO hỗ trợ đạt được PLO ở mức nâng cao hơn mức bắt đầu"),
    ("M", "Mastery", "Học phần có các CLO hỗ trợ đạt được PLO ở mức thuần thục/thông hiểu"),
    ("A", "Assessment", "Học phần quan trọng cần thu thập minh chứng để đánh giá CĐR CTĐT"),
]


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def latex_escape(s) -> str:
    if s is None:
        return ""
    s = str(s)
    replacements = [
        ("\\", r"\textbackslash{}"),
        ("{", r"\{"), ("}", r"\}"),
        ("&", r"\&"), ("%", r"\%"), ("$", r"\$"),
        ("#", r"\#"), ("_", r"\_"),
        ("~", r"\textasciitilde{}"), ("^", r"\textasciicircum{}"),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    return s


def format_date_vn(d: date | None) -> str:
    if d is None:
        return ""
    return f"{d.day:02d} tháng {d.month:02d} năm {d.year}"


def make_jinja_env(template_dir: Path) -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(template_dir)),
        block_start_string=r"\BLOCK{", block_end_string="}",
        variable_start_string=r"\VAR{", variable_end_string="}",
        comment_start_string=r"\#{", comment_end_string="}",
        line_statement_prefix="%-", line_comment_prefix="%#",
        trim_blocks=True, lstrip_blocks=True,
        autoescape=False, undefined=StrictUndefined,
    )
    env.filters["latex"] = latex_escape
    return env


def _run_xelatex(tex_path: Path, runs: int = 2) -> Path:
    cwd = tex_path.parent
    for i in range(runs):
        result = subprocess.run(
            ["xelatex", "-interaction=nonstopmode", "-halt-on-error", tex_path.name],
            cwd=str(cwd), capture_output=True, text=True,
            encoding="utf-8", errors="replace",
        )
        if result.returncode != 0:
            log_path = cwd / (tex_path.stem + ".log")
            log_excerpt = log_path.read_text(encoding="utf-8", errors="replace")[-3000:] if log_path.exists() else ""
            raise RuntimeError(
                f"xelatex failed (run {i+1}/{runs}, returncode={result.returncode}).\n"
                f"--- last 3KB of {log_path.name} ---\n{log_excerpt}"
            )
    pdf_path = cwd / (tex_path.stem + ".pdf")
    if not pdf_path.exists():
        raise RuntimeError(f"xelatex finished but PDF not found: {pdf_path}")
    return pdf_path


def _cleanup_aux(output_dir: Path, stem: str):
    for ext in (".aux", ".out", ".toc"):
        f = output_dir / f"{stem}{ext}"
        if f.exists():
            f.unlink()


# ─────────────────────────────────────────────────────────────
# Context builders
# ─────────────────────────────────────────────────────────────

def _build_plo_po_map(db: Session, program_id: str) -> dict[str, list[int]]:
    rows = (db.query(PLO_PO.plo_id, PO.order)
              .join(PO, PLO_PO.po_id == PO.id)
              .join(PLO, PLO_PO.plo_id == PLO.id)
              .filter(PLO.program_id == program_id).all())
    out: dict[str, list[int]] = {}
    for plo_id, po_order in rows:
        out.setdefault(plo_id, []).append(po_order)
    return out


def _build_plo_vqf_map(db: Session, program_id: str) -> dict[str, set[str]]:
    rows = (db.query(PLO_VQF.plo_id, VQFItem.code)
              .join(VQFItem, PLO_VQF.vqf_item_id == VQFItem.id)
              .join(PLO, PLO_VQF.plo_id == PLO.id)
              .filter(PLO.program_id == program_id).all())
    out: dict[str, set[str]] = {}
    for plo_id, code in rows:
        out.setdefault(plo_id, set()).add(code)
    return out


def _common_program_ctx(program: Program) -> dict:
    return {
        "code": program.code,
        "name_vn": program.name_vn,
        "name_en": program.name_en or "",
        "name_vn_upper": (program.name_vn or "").upper(),
        "name_en_upper": (program.name_en or "").upper(),
        "level_text": PROGRAM_LEVEL_TEXT.get(program.level.value, "Đại học"),
        "level_text_upper": PROGRAM_LEVEL_TEXT.get(program.level.value, "Đại học").upper(),
        "duration_years": program.duration_years,
        "total_credits": program.total_credits or "",
        "language": program.language,
        "decision_no": program.decision_no or "",
        "decision_date_vn": format_date_vn(program.decision_date),
        "issuing_authority": program.issuing_authority or "",
        "version": program.version,
    }


def _build_plos_ctx(db: Session, program: Program) -> list[dict]:
    plo_po = _build_plo_po_map(db, program.id)
    out = []
    for plo in sorted(program.plos, key=lambda p: p.order):
        out.append({
            "code": plo.code,
            "text_vn": plo.text_vn,
            "po_indices": sorted(plo_po.get(plo.id, [])),
            "pis": [{"code": pi.code, "text_vn": pi.text_vn}
                    for pi in sorted(plo.pis, key=lambda x: x.order)],
        })
    return out


def _build_courses_grouped(program: Program) -> list[dict]:
    """Group courses by knowledge_group, ordered."""
    group_order = [KnowledgeGroup.DAI_CUONG, KnowledgeGroup.CO_SO,
                   KnowledgeGroup.CHUYEN_NGANH, KnowledgeGroup.TU_CHON,
                   KnowledgeGroup.TOT_NGHIEP]
    groups = []
    for grp in group_order:
        courses = sorted(
            [c for c in program.courses if c.knowledge_group == grp],
            key=lambda c: c.code,
        )
        if courses:
            groups.append({
                "label": KNOWLEDGE_GROUP_LABEL.get(grp, grp.value),
                "courses": [{
                    "code": c.code, "name_vn": c.name_vn, "name_en": c.name_en or "",
                    "credits": c.credits,
                    "hours_lt": c.hours_lt, "hours_th": c.hours_th,
                    "semester": c.semester_default or "",
                } for c in courses],
            })
    return groups


def _build_vqf_ctx(db: Session, program: Program) -> dict:
    vqf_items = db.query(VQFItem).order_by(VQFItem.code).all()
    plo_vqf = _build_plo_vqf_map(db, program.id)
    knowledge = [v for v in vqf_items if v.domain == VQFDomain.KNOWLEDGE]
    skill = [v for v in vqf_items if v.domain == VQFDomain.SKILL]
    attitude = [v for v in vqf_items if v.domain == VQFDomain.ATTITUDE]
    plos = sorted(program.plos, key=lambda p: p.order)
    matrix = []
    for plo in plos:
        row = {"code": plo.code, "marks": {}}
        for v in vqf_items:
            row["marks"][v.code] = v.code in plo_vqf.get(plo.id, set())
        matrix.append(row)
    return {
        "knowledge": [{"code": v.code, "text_vn": v.text_vn} for v in knowledge],
        "skill": [{"code": v.code, "text_vn": v.text_vn} for v in skill],
        "attitude": [{"code": v.code, "text_vn": v.text_vn} for v in attitude],
        "all_codes": [v.code for v in vqf_items],
        "matrix": matrix,
    }


def _build_course_pi_matrix(db: Session, program: Program) -> list[dict]:
    """Course × CLO × PI matrix for CT_CTDH/CT_MOTA section 5/2.2."""
    plos = sorted(program.plos, key=lambda p: p.order)
    pi_codes = [pi.code for plo in plos for pi in sorted(plo.pis, key=lambda x: x.order)]

    out = []
    for course in sorted(program.courses, key=lambda c: c.code):
        clos = sorted(course.clos, key=lambda x: x.order)
        if not clos:
            continue
        course_block = {"code": course.code, "name_vn": course.name_vn, "clos": []}
        for clo in clos:
            level_by_pi = {pi_code: "" for pi_code in pi_codes}
            for cp in db.query(CLO_PI).filter_by(clo_id=clo.id).all():
                pi = db.query(PI).get(cp.pi_id)
                if pi:
                    level_by_pi[pi.code] = cp.level.value
            course_block["clos"].append({
                "code": clo.code,
                "text_vn": clo.text_vn,
                "levels": [level_by_pi[pc] for pc in pi_codes],
            })
        out.append(course_block)
    return out


# ─────────────────────────────────────────────────────────────
# Render functions (one per template)
# ─────────────────────────────────────────────────────────────

def _render_template(
    db: Session, program: Program,
    template_name: str, output_name: str,
    template_dir: Path, output_dir: Path,
    extra_ctx: dict | None = None,
) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    env = make_jinja_env(template_dir)
    tpl = env.get_template(template_name)

    ctx = {
        "inst": INSTITUTION,
        "program": _common_program_ctx(program),
        "pos": [{"code": p.code, "text_vn": p.text_vn, "order": p.order}
                for p in sorted(program.pos, key=lambda x: x.order)],
        "plos": _build_plos_ctx(db, program),
        "po_count": len(program.pos),
        "grade_scale": GRADE_SCALE,
        "irma_legend": IRMA_LEGEND,
        "font_name": LATEX_FONT,
    }
    if extra_ctx:
        ctx.update(extra_ctx)

    tex_source = tpl.render(**ctx)
    tex_path = output_dir / f"{output_name}.tex"
    tex_path.write_text(tex_source, encoding="utf-8")
    pdf_path = _run_xelatex(tex_path)
    _cleanup_aux(output_dir, output_name)
    return tex_path, pdf_path


def render_ct_cdr(db, program, template_dir, output_dir):
    return _render_template(db, program, "ct_cdr.tex.j2", "CT_CDR",
                            template_dir, output_dir)


def render_ct_ctdt(db, program, template_dir, output_dir):
    extra = {"course_groups": _build_courses_grouped(program)}
    return _render_template(db, program, "ct_ctdt.tex.j2", "CT_CTDT",
                            template_dir, output_dir, extra)


def _all_pi_codes(program: Program) -> list[str]:
    plos = sorted(program.plos, key=lambda p: p.order)
    return [pi.code for plo in plos for pi in sorted(plo.pis, key=lambda x: x.order)]


def render_ct_ctdh(db, program, template_dir, output_dir):
    extra = {
        "course_groups": _build_courses_grouped(program),
        "vqf": _build_vqf_ctx(db, program),
        "course_pi_matrix": _build_course_pi_matrix(db, program),
        "pi_codes_ordered": _all_pi_codes(program),
    }
    return _render_template(db, program, "ct_ctdh.tex.j2", "CT_CTDH",
                            template_dir, output_dir, extra)


def render_ct_mota(db, program, template_dir, output_dir):
    courses_brief = [{
        "code": c.code, "name_vn": c.name_vn, "credits": c.credits,
        "description": c.description or "",
    } for c in sorted(program.courses, key=lambda x: x.code)]
    extra = {
        "course_groups": _build_courses_grouped(program),
        "vqf": _build_vqf_ctx(db, program),
        "course_pi_matrix": _build_course_pi_matrix(db, program),
        "pi_codes_ordered": _all_pi_codes(program),
        "courses_brief": courses_brief,
    }
    return _render_template(db, program, "ct_mota.tex.j2", "CT_MOTA",
                            template_dir, output_dir, extra)


def render_ct_decuong(db, program, course: Course, template_dir, output_dir):
    """Render syllabus for ONE course."""
    cos = sorted(course.cos, key=lambda x: x.order)
    clos = sorted(course.clos, key=lambda x: x.order)

    # CLO × CO matrix
    clo_co_marks: dict[tuple[str, str], bool] = {}
    for cc in db.query(CLO_CO).all():
        clo = db.query(CLO).get(cc.clo_id)
        co = db.query(CO).get(cc.co_id)
        if clo and co and clo.course_id == course.id:
            clo_co_marks[(clo.code, co.code)] = True

    # CLO × PI matrix with levels
    plos = sorted(program.plos, key=lambda p: p.order)
    pi_codes_ordered = [pi.code for plo in plos for pi in sorted(plo.pis, key=lambda x: x.order)]
    pi_to_plo = {pi.code: plo.code for plo in plos for pi in plo.pis}

    clo_pi_levels: dict[tuple[str, str], str] = {}
    for cp in db.query(CLO_PI).all():
        clo = db.query(CLO).get(cp.clo_id)
        pi = db.query(PI).get(cp.pi_id)
        if clo and pi and clo.course_id == course.id:
            clo_pi_levels[(clo.code, pi.code)] = cp.level.value

    # Aggregate CLO × PLO (highest level wins): I < R < M < A
    LEVEL_RANK = {"I": 1, "R": 2, "M": 3, "A": 4}
    clo_plo_levels: dict[tuple[str, str], str] = {}
    clo_plo_pis: dict[tuple[str, str], list[str]] = {}  # which PIs contributed
    for (clo_code, pi_code), lvl in clo_pi_levels.items():
        plo_code = pi_to_plo.get(pi_code)
        if not plo_code:
            continue
        key = (clo_code, plo_code)
        existing = clo_plo_levels.get(key)
        if existing is None or LEVEL_RANK[lvl] > LEVEL_RANK[existing]:
            clo_plo_levels[key] = lvl
        clo_plo_pis.setdefault(key, []).append(pi_code)

    plo_codes_ordered = [plo.code for plo in plos]

    # Assessments + linked CLOs
    asmts_ctx = []
    for a in sorted(course.assessments, key=lambda x: x.order):
        clo_codes = [db.query(CLO).get(ac.clo_id).code
                     for ac in db.query(Assessment_CLO).filter_by(assessment_id=a.id).all()]
        asmts_ctx.append({
            "name": a.component_name, "weight": a.weight_pct,
            "method": a.method or "", "clo_codes": ", ".join(clo_codes),
        })

    # Weekly plan
    weeks_ctx = []
    for wp in sorted(course.weekly_plans, key=lambda x: x.week):
        clo_codes = [db.query(CLO).get(wc.clo_id).code
                     for wc in db.query(WeeklyPlan_CLO).filter_by(weekly_plan_id=wp.id).all()]
        weeks_ctx.append({
            "week": wp.week, "topic": wp.topic or "",
            "lt": wp.hours_lt, "th": wp.hours_th,
            "clo_codes": ", ".join(clo_codes),
        })

    extra = {
        "course": {
            "code": course.code, "name_vn": course.name_vn, "name_en": course.name_en or "",
            "credits": course.credits,
            "hours_lt": course.hours_lt, "hours_th": course.hours_th,
            "hours_self": course.hours_self,
            "knowledge_group_label": KNOWLEDGE_GROUP_LABEL.get(course.knowledge_group, ""),
            "prerequisites": course.prerequisites or "",
            "corequisites": course.corequisites or "",
            "language": course.language,
            "description": course.description or "",
        },
        "cos": [{"code": c.code, "text_vn": c.text_vn} for c in cos],
        "clos": [{
            "code": c.code, "text_vn": c.text_vn,
            "co_marks": {co.code: clo_co_marks.get((c.code, co.code), False) for co in cos},
            "pi_levels": [clo_pi_levels.get((c.code, pc), "") for pc in pi_codes_ordered],
            "plo_levels": [clo_plo_levels.get((c.code, plo_c), "") for plo_c in plo_codes_ordered],
            "plo_pis": [", ".join(sorted(clo_plo_pis.get((c.code, plo_c), []))) for plo_c in plo_codes_ordered],
        } for c in clos],
        "assessments": asmts_ctx,
        "weeks": weeks_ctx,
        "pi_codes_ordered": pi_codes_ordered,
        "plo_codes_ordered": plo_codes_ordered,
        "plo_count": len(plos),
    }
    return _render_template(db, program, "ct_decuong.tex.j2",
                            f"CT_DECUONG_{course.code}",
                            template_dir, output_dir, extra)


# ─────────────────────────────────────────────────────────────
# Convenience wrappers
# ─────────────────────────────────────────────────────────────

def render_all(db: Session, program_code: str, project_root: Path) -> dict[str, Path]:
    from datetime import datetime as _dt

    program = db.query(Program).filter_by(code=program_code).first()
    if not program:
        raise ValueError(f"Program with code {program_code} not found")

    template_dir = project_root / "templates"
    output_dir = project_root / "backend" / "output" / program_code

    results = {}
    for name, fn in [
        ("CT_CDR", render_ct_cdr),
        ("CT_CTDT", render_ct_ctdt),
        ("CT_CTDH", render_ct_ctdh),
        ("CT_MOTA", render_ct_mota),
    ]:
        _, pdf = fn(db, program, template_dir, output_dir)
        results[name] = pdf

    # CT_DECUONG: render for each course
    for course in sorted(program.courses, key=lambda c: c.code):
        if course.clos:
            _, pdf = render_ct_decuong(db, program, course, template_dir, output_dir)
            results[f"CT_DECUONG_{course.code}"] = pdf

    # Mark snapshot — used by /impact endpoint to detect staleness
    program.last_rendered_version = program.version
    program.last_rendered_at = _dt.utcnow()
    db.commit()

    return results


# Legacy CLI compat
def render_ct_cdr_by_code(db, program_code, project_root):
    program = db.query(Program).filter_by(code=program_code).first()
    if not program:
        raise ValueError(f"Program with code {program_code} not found")
    template_dir = project_root / "templates"
    output_dir = project_root / "backend" / "output" / program_code
    return render_ct_cdr(db, program, template_dir, output_dir)
