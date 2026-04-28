"""CSV evidence export — báo cáo TT04-2025/ABET dạng spreadsheet.

3 dạng export:
- Score matrix:  student × question (raw scores)
- CLO mastery:   student × CLO (% achieved)
- Evidence summary: 1 row per student gồm tất cả info đo
"""
from __future__ import annotations

import csv
from collections import defaultdict
from decimal import Decimal
from io import StringIO

from sqlalchemy.orm import Session as DbSession

from ..models.measurement import MeasScore, MeasSession, MeasSessionStudent
from ..models import CLO


def _bom_writer() -> tuple[StringIO, "csv.writer"]:
    """StringIO with UTF-8 BOM for Excel compatibility."""
    buf = StringIO()
    buf.write("﻿")
    return buf, csv.writer(buf)


def export_score_matrix(db: DbSession, session: MeasSession) -> str:
    """student_code | full_name | Q1 raw | Q1 max | Q2 raw | Q2 max | ... | total | total_max"""
    buf, w = _bom_writer()
    questions = sorted(session.questions, key=lambda q: q.order)
    enrolled = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=session.id, absent=False)
        .all()
    )
    students = sorted([link.student for link in enrolled], key=lambda s: s.code)

    header = ["student_code", "full_name"]
    for q in questions:
        header += [f"Q{q.number}", f"Q{q.number}_max"]
    header += ["total", "total_max", "total_pct"]
    w.writerow(header)

    score_map: dict[tuple[str, str], Decimal] = {}
    for s in db.query(MeasScore).filter_by(session_id=session.id).all():
        if s.raw_score is not None:
            score_map[(s.student_id, s.question_id)] = s.raw_score

    for st in students:
        row = [st.code, st.full_name]
        total = Decimal("0")
        total_max = Decimal("0")
        for q in questions:
            raw = score_map.get((st.id, q.id))
            row.append(str(raw) if raw is not None else "")
            row.append(str(q.max_score))
            if raw is not None:
                total += raw
            total_max += q.max_score
        pct = (total / total_max * Decimal("100")) if total_max > 0 else Decimal("0")
        row += [str(total), str(total_max), f"{pct.quantize(Decimal('0.01'))}"]
        w.writerow(row)
    return buf.getvalue()


def export_clo_mastery(db: DbSession, session: MeasSession) -> str:
    """student_code | full_name | CLO1_pct | CLO1_achieved | CLO2_pct | ... per CLO."""
    buf, w = _bom_writer()
    questions = list(session.questions)

    # CLO ids in this session
    clo_ids: list[str] = []
    for q in questions:
        for link in q.clo_links:
            if link.clo_id not in clo_ids:
                clo_ids.append(link.clo_id)
    if not clo_ids:
        # Empty matrix — header only
        w.writerow(["student_code", "full_name", "(no CLOs mapped)"])
        return buf.getvalue()
    clos = sorted(
        db.query(CLO).filter(CLO.id.in_(clo_ids)).all(), key=lambda c: c.code
    )

    enrolled = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=session.id, absent=False)
        .all()
    )
    students = sorted([link.student for link in enrolled], key=lambda s: s.code)

    threshold = session.clo_threshold_pct

    # Build per-(student, clo) pct using same algo as compute
    clo_questions: dict[str, list[tuple[str, Decimal, Decimal]]] = defaultdict(list)
    for q in questions:
        for link in q.clo_links:
            clo_questions[link.clo_id].append((q.id, link.weight, q.max_score))

    score_map: dict[tuple[str, str], Decimal] = {}
    for s in db.query(MeasScore).filter_by(session_id=session.id).all():
        if s.raw_score is not None:
            score_map[(s.student_id, s.question_id)] = s.raw_score

    student_clo_pct: dict[tuple[str, str], Decimal] = {}
    for clo_id, ql in clo_questions.items():
        sum_weight = sum((w_ for _, w_, _ in ql), start=Decimal("0"))
        if sum_weight == 0:
            continue
        for st in students:
            num = Decimal("0")
            for qid, weight, max_score in ql:
                raw = score_map.get((st.id, qid))
                if raw is None or max_score == 0:
                    continue
                num += (raw * weight / max_score) * Decimal("100")
            student_clo_pct[(st.id, clo_id)] = num / sum_weight

    header = ["student_code", "full_name"]
    for c in clos:
        header += [f"{c.code}_pct", f"{c.code}_achieved"]
    w.writerow(header)
    for st in students:
        row = [st.code, st.full_name]
        for c in clos:
            pct = student_clo_pct.get((st.id, c.id), Decimal("0"))
            achieved = "YES" if pct >= threshold else "NO"
            row += [f"{pct.quantize(Decimal('0.01'))}", achieved]
        w.writerow(row)
    return buf.getvalue()


def export_evidence_summary(db: DbSession, session: MeasSession) -> str:
    """1 row per student với toàn bộ info đo — dùng làm evidence trail TT04-2025."""
    buf, w = _bom_writer()
    enrolled = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=session.id)
        .all()
    )
    students = sorted([link.student for link in enrolled], key=lambda s: s.code)
    absent_map = {link.student_id: link.absent for link in enrolled}

    header = [
        "student_code",
        "full_name",
        "cohort",
        "absent",
        "session_name",
        "course",
        "semester",
        "exam_date",
        "total_score",
        "max_total",
        "total_pct",
        "passed",
    ]
    w.writerow(header)

    questions = list(session.questions)
    score_map: dict[tuple[str, str], Decimal] = {}
    for s in db.query(MeasScore).filter_by(session_id=session.id).all():
        if s.raw_score is not None:
            score_map[(s.student_id, s.question_id)] = s.raw_score

    pass_threshold = session.pass_threshold

    for st in students:
        total = Decimal("0")
        total_max = Decimal("0")
        for q in questions:
            raw = score_map.get((st.id, q.id))
            if raw is not None:
                total += raw
            total_max += q.max_score
        pct = (total / total_max * Decimal("100")) if total_max > 0 else Decimal("0")
        passed = "YES" if total >= pass_threshold else "NO"
        w.writerow(
            [
                st.code,
                st.full_name,
                st.cohort_code or "",
                "YES" if absent_map.get(st.id) else "NO",
                session.name,
                "",  # course code, populate by caller if needed
                session.semester,
                session.exam_date.isoformat() if session.exam_date else "",
                str(total),
                str(total_max),
                f"{pct.quantize(Decimal('0.01'))}",
                passed,
            ]
        )
    return buf.getvalue()
