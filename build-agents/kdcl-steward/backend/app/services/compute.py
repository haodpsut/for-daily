"""Compute engine — tính % đạt CLO/PLO từ raw scores.

Thuật toán (xem `docs/DATA_MODEL.md` mục "Compute logic"):

Per Student per CLO:
  clo_pct(s, c) = sum_{q ∈ Q_c}(score_q × weight_qc / max_q × 100)
                 ─────────────────────────────────────────────────
                 sum_{q ∈ Q_c}(weight_qc)

  achieved_clo(s, c) = (clo_pct(s, c) >= session.clo_threshold_pct)

Per Session per CLO:
  pct_achieved_clo(c) = | { s : achieved_clo(s, c) } | / n_eligible × 100
  avg_score_pct(c) = mean over students of clo_pct(s, c)

Per Session per PLO:
  Lấy CLO_PI level IN (M, A) trong cùng course → list CLOs đo PLO này
  pct_plo = mean(pct_achieved_clo(c)) cho các CLO đó
  pi_count = số PI dưới PLO mà có ≥1 CLO đo trong session

Note: Default level filter là (M, A). Triết lý:
  I = Introduce — chỉ giới thiệu, chưa đo
  R = Reinforce — củng cố, chưa kiểm tra chính thức
  M = Master   — đã thành thạo, ĐO được
  A = Assess   — đánh giá chính thức (level cao nhất)
Có thể override qua param `assess_levels` của `compute_session()`.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from typing import NamedTuple

from sqlalchemy.orm import Session as DbSession

from ..models.meas import (
    MeasResultCLO,
    MeasResultPLO,
    MeasScore,
    MeasSession,
    MeasSessionStudent,
    SessionStatus,
)
from ..models.ref import CLO_PI, IRMALevel, PI


class ComputeWarning(NamedTuple):
    code: str
    message: str


DEFAULT_ASSESS_LEVELS = (IRMALevel.M, IRMALevel.A)


def compute_session(
    db: DbSession,
    session: MeasSession,
    assess_levels: tuple[IRMALevel, ...] = DEFAULT_ASSESS_LEVELS,
) -> dict:
    """Compute & cache MeasResultCLO + MeasResultPLO cho 1 session.

    Args:
        assess_levels: Levels của CLO_PI dùng để roll-up PLO. Default (M, A).
            Strict mode: (A,). Permissive: (R, M, A).

    Returns dict {clo_results, plo_results, warnings, n_students_total, ...}
    """
    warnings: list[ComputeWarning] = []

    # 1. Lấy danh sách students đang enroll, không vắng
    enrolled = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=session.id, absent=False)
        .all()
    )
    n_students = len(enrolled)
    if n_students == 0:
        warnings.append(
            ComputeWarning("NO_STUDENTS", "Session không có sinh viên hợp lệ")
        )

    # 2. Lấy questions + clo_links + max_score
    questions = list(session.questions)
    n_questions = len(questions)
    if n_questions == 0:
        warnings.append(
            ComputeWarning("NO_QUESTIONS", "Session không có câu hỏi")
        )

    # Map: clo_id -> list[(question_id, weight, max_score)]
    clo_questions: dict[str, list[tuple[str, Decimal, Decimal]]] = defaultdict(list)
    for q in questions:
        if not q.clo_links:
            warnings.append(
                ComputeWarning(
                    "QUESTION_NO_CLO",
                    f"Question {q.number} không map CLO nào → bỏ qua khỏi compute",
                )
            )
            continue
        for link in q.clo_links:
            clo_questions[link.clo_id].append((q.id, link.weight, q.max_score))

    if not clo_questions:
        warnings.append(
            ComputeWarning("NO_CLO_MAPPING", "Không có question nào map CLO")
        )

    # 3. Lấy raw scores: (student_id, question_id) -> raw_score
    scores_raw = db.query(MeasScore).filter_by(session_id=session.id).all()
    score_map: dict[tuple[str, str], Decimal] = {}
    for sc in scores_raw:
        if sc.raw_score is not None:
            score_map[(sc.student_id, sc.question_id)] = sc.raw_score

    threshold = session.clo_threshold_pct  # %, e.g. 50.0

    # 4. Per student per CLO compute
    # student_clo_pct[(student_id, clo_id)] = pct
    student_clo_pct: dict[tuple[str, str], Decimal] = {}
    for clo_id, ql in clo_questions.items():
        sum_weight = sum((w for _, w, _ in ql), start=Decimal("0"))
        if sum_weight == 0:
            continue
        for link in enrolled:
            sid = link.student_id
            num = Decimal("0")
            for qid, w, max_score in ql:
                raw = score_map.get((sid, qid))
                if raw is None or max_score == 0:
                    # Treat missing as 0
                    continue
                num += (raw * w / max_score) * Decimal("100")
            student_clo_pct[(sid, clo_id)] = num / sum_weight

    # 5. Aggregate per CLO
    clo_results: list[dict] = []
    db.query(MeasResultCLO).filter_by(session_id=session.id).delete()

    for clo_id in clo_questions.keys():
        pcts = [
            student_clo_pct.get((link.student_id, clo_id), Decimal("0"))
            for link in enrolled
        ]
        if not pcts:
            continue
        n_achieved = sum(1 for p in pcts if p >= threshold)
        avg = sum(pcts, start=Decimal("0")) / Decimal(len(pcts))
        pct_achieved = (
            Decimal(n_achieved) / Decimal(len(pcts)) * Decimal("100")
            if pcts
            else Decimal("0")
        )
        result = MeasResultCLO(
            session_id=session.id,
            clo_id=clo_id,
            n_students=len(pcts),
            n_achieved=n_achieved,
            pct_achieved=pct_achieved.quantize(Decimal("0.01")),
            avg_score_pct=avg.quantize(Decimal("0.01")),
            computed_at=datetime.utcnow(),
        )
        db.add(result)
        clo_results.append(
            {
                "session_id": session.id,
                "clo_id": clo_id,
                "n_students": len(pcts),
                "n_achieved": n_achieved,
                "pct_achieved": result.pct_achieved,
                "avg_score_pct": result.avg_score_pct,
                "computed_at": result.computed_at,
            }
        )

    # 6. Roll-up PLO via PI weighting
    # Lấy CLO_PI level=A cho các CLO đã compute → group theo PLO
    db.query(MeasResultPLO).filter_by(session_id=session.id).delete()

    clo_pct_map: dict[str, Decimal] = {r["clo_id"]: r["pct_achieved"] for r in clo_results}
    clo_pi_links = (
        db.query(CLO_PI)
        .filter(CLO_PI.clo_id.in_(list(clo_pct_map.keys())))
        .filter(CLO_PI.level.in_(assess_levels))
        .all()
    )
    if not clo_pi_links:
        levels_str = ", ".join(lv.value for lv in assess_levels)
        warnings.append(
            ComputeWarning(
                "NO_CLO_PI_ASSESS",
                f"Không có CLO_PI ở level ({levels_str}) cho các CLO đã đo → "
                "không thể roll-up PLO",
            )
        )

    # plo_id -> list[clo_pct]
    plo_clos: dict[str, list[Decimal]] = defaultdict(list)
    plo_pis: dict[str, set[str]] = defaultdict(set)
    pi_to_plo: dict[str, str] = {}
    for pi in db.query(PI).all():
        pi_to_plo[pi.id] = pi.plo_id

    for link in clo_pi_links:
        plo_id = pi_to_plo.get(link.pi_id)
        if not plo_id:
            continue
        if link.clo_id in clo_pct_map:
            plo_clos[plo_id].append(clo_pct_map[link.clo_id])
            plo_pis[plo_id].add(link.pi_id)

    plo_results: list[dict] = []
    for plo_id, pcts in plo_clos.items():
        if not pcts:
            continue
        avg = sum(pcts, start=Decimal("0")) / Decimal(len(pcts))
        result = MeasResultPLO(
            session_id=session.id,
            plo_id=plo_id,
            pi_count=len(plo_pis[plo_id]),
            pct_achieved=avg.quantize(Decimal("0.01")),
            computed_at=datetime.utcnow(),
        )
        db.add(result)
        plo_results.append(
            {
                "session_id": session.id,
                "plo_id": plo_id,
                "pi_count": len(plo_pis[plo_id]),
                "pct_achieved": result.pct_achieved,
                "computed_at": result.computed_at,
            }
        )

    # 7. Mark session COMPUTED
    session.status = SessionStatus.COMPUTED
    db.commit()

    return {
        "session_id": session.id,
        "n_students_total": n_students,
        "n_questions_total": n_questions,
        "n_clos_evaluated": len(clo_results),
        "n_plos_evaluated": len(plo_results),
        "clo_results": clo_results,
        "plo_results": plo_results,
        "warnings": [{"code": w.code, "message": w.message} for w in warnings],
    }
