"""CRUD câu hỏi trong session + map question → CLO."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import assert_session_owner, get_current_user
from ..models import User
from ..models.meas import MeasQuestion, MeasQuestionCLO, MeasRubric
from ..models.ref import CLO
from ..schemas import (
    QuestionCLOLink,
    QuestionCreate,
    QuestionOut,
    QuestionUpdate,
    RubricCreate,
    RubricOut,
)

router = APIRouter()


def _question_to_out(q: MeasQuestion) -> QuestionOut:
    return QuestionOut(
        id=q.id,
        session_id=q.session_id,
        number=q.number,
        order=q.order,
        text=q.text,
        max_score=q.max_score,
        bloom_level=q.bloom_level,
        weight_in_session=q.weight_in_session,
        clo_links=[
            QuestionCLOLink(clo_id=link.clo_id, weight=link.weight) for link in q.clo_links
        ],
    )


@router.post("/sessions/{session_id}/questions", response_model=QuestionOut)
def create_question(
    session_id: str,
    payload: QuestionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)

    # Validate CLO links: tất cả CLO phải thuộc cùng course với session
    for link in payload.clo_links:
        clo = db.query(CLO).filter_by(id=link.clo_id).first()
        if not clo or clo.course_id != sess.course_id:
            raise HTTPException(
                400, f"CLO {link.clo_id} không thuộc course của session"
            )

    q = MeasQuestion(
        session_id=session_id,
        number=payload.number,
        order=payload.order,
        text=payload.text,
        max_score=payload.max_score,
        bloom_level=payload.bloom_level,
        weight_in_session=payload.weight_in_session,
    )
    db.add(q)
    db.flush()  # get q.id

    for link in payload.clo_links:
        db.add(MeasQuestionCLO(question_id=q.id, clo_id=link.clo_id, weight=link.weight))

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Conflict: {exc}")
    db.refresh(q)
    return _question_to_out(q)


@router.get("/sessions/{session_id}/questions", response_model=list[QuestionOut])
def list_questions(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = assert_session_owner(session_id, user, db)
    return [_question_to_out(q) for q in sorted(sess.questions, key=lambda x: x.order)]


@router.patch("/questions/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: str,
    payload: QuestionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasQuestion).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    assert_session_owner(q.session_id, user, db)

    data = payload.model_dump(exclude_unset=True)
    clo_links = data.pop("clo_links", None)
    for field, value in data.items():
        setattr(q, field, value)

    if clo_links is not None:
        # Replace all clo_links
        db.query(MeasQuestionCLO).filter_by(question_id=q.id).delete()
        for link in clo_links:
            db.add(MeasQuestionCLO(question_id=q.id, clo_id=link["clo_id"], weight=link["weight"]))

    db.commit()
    db.refresh(q)
    return _question_to_out(q)


@router.delete("/questions/{question_id}", status_code=204)
def delete_question(
    question_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasQuestion).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    assert_session_owner(q.session_id, user, db)
    db.delete(q)
    db.commit()


# ---------------------------------------------------------------------------
# Rubrics
# ---------------------------------------------------------------------------
@router.post("/questions/{question_id}/rubrics", response_model=RubricOut)
def create_rubric(
    question_id: str,
    payload: RubricCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasQuestion).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    assert_session_owner(q.session_id, user, db)

    rubric = MeasRubric(
        question_id=question_id,
        level=payload.level,
        label=payload.label,
        criteria_text=payload.criteria_text,
        score_range_min=payload.score_range_min,
        score_range_max=payload.score_range_max,
        order=payload.order,
    )
    db.add(rubric)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Conflict: {exc}")
    db.refresh(rubric)
    return rubric


@router.get("/questions/{question_id}/rubrics", response_model=list[RubricOut])
def list_rubrics(
    question_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasQuestion).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(404, "Question not found")
    assert_session_owner(q.session_id, user, db)
    return sorted(q.rubrics, key=lambda r: r.order)
