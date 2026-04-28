"""Bulk upsert + query điểm theo session."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..models.meas import MeasQuestion, MeasScore, MeasStudent
from ..schemas import BulkScoreUpsert, ScoreOut

router = APIRouter()


@router.post("/scores/bulk", response_model=dict)
def bulk_upsert_scores(
    payload: BulkScoreUpsert,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upsert hàng loạt điểm. Tạo `MeasScore` mới hoặc update raw_score nếu đã có.

    Validate:
    - Session phải thuộc owner
    - Mỗi (student, question) phải tồn tại và thuộc session
    - raw_score nếu không null → phải nằm trong [0, max_score]
    """
    sess = assert_session_owner(payload.session_id, user, db)

    # Pre-load valid question + student maps
    q_map = {q.id: q for q in sess.questions}
    student_ids_in_session = {link.student_id for link in sess.students}

    n_created = 0
    n_updated = 0
    n_skipped = 0
    errors: list[str] = []

    for s in payload.scores:
        if s.question_id not in q_map:
            n_skipped += 1
            errors.append(f"Question {s.question_id} không thuộc session")
            continue
        if s.student_id not in student_ids_in_session:
            n_skipped += 1
            errors.append(f"Student {s.student_id} chưa enroll vào session")
            continue
        question = q_map[s.question_id]
        if s.raw_score is not None and (
            s.raw_score < 0 or s.raw_score > question.max_score
        ):
            n_skipped += 1
            errors.append(
                f"Score {s.raw_score} ngoài range [0, {question.max_score}] "
                f"cho question {question.number}"
            )
            continue

        existing = (
            db.query(MeasScore)
            .filter_by(student_id=s.student_id, question_id=s.question_id)
            .first()
        )
        if existing:
            existing.raw_score = s.raw_score
            existing.graded_at = datetime.utcnow()
            existing.graded_by = user.id
            n_updated += 1
        else:
            db.add(
                MeasScore(
                    session_id=sess.id,
                    student_id=s.student_id,
                    question_id=s.question_id,
                    raw_score=s.raw_score,
                    graded_at=datetime.utcnow(),
                    graded_by=user.id,
                )
            )
            n_created += 1

    db.commit()
    return {
        "created": n_created,
        "updated": n_updated,
        "skipped": n_skipped,
        "errors": errors[:20],  # cap to avoid huge response
    }


@router.get("/sessions/{session_id}/scores", response_model=list[ScoreOut])
def list_session_scores(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    return db.query(MeasScore).filter_by(session_id=sess.id).all()
