"""Measurement endpoints — đo CLO/PLO thực tế từ điểm sinh viên.

Gộp toàn bộ kdcl-steward router vào 1 file (đơn giản hoá deploy).

Endpoints:
  Sessions:   POST/GET/PATCH/DELETE  /measurement/sessions[/{id}]
  Questions:  POST/GET                /measurement/sessions/{id}/questions
              PATCH/DELETE            /measurement/questions/{id}
              POST/GET                /measurement/questions/{id}/rubrics
  Students:   POST/GET/PATCH/DELETE  /measurement/students[/{id}]
              POST/GET/DELETE         /measurement/sessions/{id}/students[/...]
  Scores:     POST                    /measurement/scores/bulk
              GET                     /measurement/sessions/{id}/scores
  Import:     POST                    /measurement/sessions/{id}/import   (Excel upload)
  Export:     GET                     /measurement/sessions/{id}/export/{scores|clo_mastery|evidence}.csv
  Compute:    POST                    /measurement/sessions/{id}/compute
              GET                     /measurement/sessions/{id}/results
  Reports:    POST                    /measurement/sessions/{id}/report/tt04
              GET                     /measurement/sessions/{id}/report/tt04.{pdf|tex}
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import (
    assert_course_owner,
    get_current_user,
    get_user_program_by_id,
)
from ..models import (
    BloomLevel,
    CLO,
    Course,
    MeasQuestion,
    MeasQuestionCLO,
    MeasResultCLO,
    MeasResultPLO,
    MeasRubric,
    MeasScore,
    MeasSession,
    MeasSessionStudent,
    MeasStudent,
    PLO,
    Program,
    RubricLevel,
    SessionStatus,
    User,
)
from ..services.measurement_compute import compute_session
from ..services.measurement_export import (
    export_clo_mastery,
    export_evidence_summary,
    export_score_matrix,
)
from ..services.measurement_import import import_gradebook
from ..services.measurement_render import render_tt04_report

router = APIRouter()


# ───────────────────────────────────────────────────────────────────────
# Ownership helpers (use existing cdr-steward dependencies pattern)
# ───────────────────────────────────────────────────────────────────────
def _assert_session_owner(session_id: str, user: User, db: Session) -> MeasSession:
    sess = db.query(MeasSession).filter_by(id=session_id).first()
    if not sess:
        raise HTTPException(404, "Session not found")
    program = db.query(Program).filter_by(id=sess.program_id).first()
    if not program or program.owner_id != user.id:
        raise HTTPException(404, "Session not found or access denied")
    return sess


def _assert_student_owner(student_id: str, user: User, db: Session) -> MeasStudent:
    st = db.query(MeasStudent).filter_by(id=student_id).first()
    if not st:
        raise HTTPException(404, "Student not found")
    program = db.query(Program).filter_by(id=st.program_id).first()
    if not program or program.owner_id != user.id:
        raise HTTPException(404, "Student not found or access denied")
    return st


# ───────────────────────────────────────────────────────────────────────
# Pydantic schemas (inline cho consistency với cdr-steward)
# ───────────────────────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    program_id: str
    course_id: str
    assessment_id: str | None = None
    name: str = Field(..., min_length=1, max_length=255)
    semester: str = Field(..., min_length=1, max_length=50)
    cohort_code: str = Field(..., min_length=1, max_length=50)
    exam_date: date | None = None
    max_total_score: Decimal = Decimal("10.0")
    pass_threshold: Decimal = Decimal("5.0")
    clo_threshold_pct: Decimal = Decimal("50.0")


class SessionUpdate(BaseModel):
    name: str | None = None
    semester: str | None = None
    cohort_code: str | None = None
    exam_date: date | None = None
    max_total_score: Decimal | None = None
    pass_threshold: Decimal | None = None
    clo_threshold_pct: Decimal | None = None
    status: SessionStatus | None = None


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    program_id: str
    course_id: str
    assessment_id: str | None
    name: str
    semester: str
    cohort_code: str
    exam_date: date | None
    max_total_score: Decimal
    pass_threshold: Decimal
    clo_threshold_pct: Decimal
    status: SessionStatus
    created_at: datetime
    updated_at: datetime


class SessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    course_id: str
    course_code: str | None = None
    course_name: str | None = None
    semester: str
    cohort_code: str
    status: SessionStatus
    n_questions: int = 0
    n_students: int = 0
    updated_at: datetime


class QuestionCLOLink(BaseModel):
    clo_id: str
    weight: Decimal = Decimal("1.0")


class QuestionCreate(BaseModel):
    number: str
    order: int = 0
    text: str | None = None
    max_score: Decimal
    bloom_level: BloomLevel | None = None
    weight_in_session: Decimal | None = None
    clo_links: list[QuestionCLOLink] = Field(default_factory=list)


class QuestionUpdate(BaseModel):
    number: str | None = None
    order: int | None = None
    text: str | None = None
    max_score: Decimal | None = None
    bloom_level: BloomLevel | None = None
    weight_in_session: Decimal | None = None
    clo_links: list[QuestionCLOLink] | None = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    number: str
    order: int
    text: str | None
    max_score: Decimal
    bloom_level: BloomLevel | None
    weight_in_session: Decimal | None
    clo_links: list[QuestionCLOLink] = Field(default_factory=list)


class RubricCreate(BaseModel):
    level: RubricLevel
    label: str | None = None
    criteria_text: str | None = None
    score_range_min: Decimal
    score_range_max: Decimal
    order: int = 0


class RubricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    question_id: str
    level: RubricLevel
    label: str | None
    criteria_text: str | None
    score_range_min: Decimal
    score_range_max: Decimal
    order: int


class StudentCreate(BaseModel):
    program_id: str
    code: str
    full_name: str
    date_of_birth: date | None = None
    cohort_code: str | None = None
    email: str | None = None


class StudentUpdate(BaseModel):
    full_name: str | None = None
    date_of_birth: date | None = None
    cohort_code: str | None = None
    email: str | None = None


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    program_id: str
    code: str
    full_name: str
    date_of_birth: date | None
    cohort_code: str | None
    email: str | None


class SessionStudentLink(BaseModel):
    student_id: str
    absent: bool = False
    notes: str | None = None


class ScoreUpsert(BaseModel):
    student_id: str
    question_id: str
    raw_score: Decimal | None = None


class BulkScoreUpsert(BaseModel):
    session_id: str
    scores: list[ScoreUpsert]


class ScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    session_id: str
    student_id: str
    question_id: str
    raw_score: Decimal | None
    graded_at: datetime | None
    graded_by: str | None


class ResultCLOOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    clo_id: str
    clo_code: str | None = None
    clo_text: str | None = None
    n_students: int
    n_achieved: int
    pct_achieved: Decimal
    avg_score_pct: Decimal
    computed_at: datetime


class ResultPLOOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    session_id: str
    plo_id: str
    plo_code: str | None = None
    plo_text: str | None = None
    pi_count: int
    pct_achieved: Decimal
    computed_at: datetime


class ComputeResponse(BaseModel):
    session_id: str
    n_students_total: int
    n_questions_total: int
    n_clos_evaluated: int
    n_plos_evaluated: int
    clo_results: list[ResultCLOOut]
    plo_results: list[ResultPLOOut]
    warnings: list[str] = []


# ───────────────────────────────────────────────────────────────────────
# SESSIONS
# ───────────────────────────────────────────────────────────────────────
@router.post("/sessions", response_model=SessionOut)
def create_session(
    payload: SessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_program_by_id(payload.program_id, user, db)
    course = assert_course_owner(payload.course_id, user, db)
    if course.program_id != payload.program_id:
        raise HTTPException(400, "Course không thuộc Program đã chỉ định")
    sess = MeasSession(
        program_id=payload.program_id,
        course_id=payload.course_id,
        assessment_id=payload.assessment_id,
        name=payload.name,
        semester=payload.semester,
        cohort_code=payload.cohort_code,
        exam_date=payload.exam_date,
        max_total_score=payload.max_total_score,
        pass_threshold=payload.pass_threshold,
        clo_threshold_pct=payload.clo_threshold_pct,
        created_by=user.id,
    )
    db.add(sess)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Session đã tồn tại hoặc dữ liệu không hợp lệ: {exc}")
    db.refresh(sess)
    return sess


@router.get("/sessions", response_model=list[SessionListItem])
def list_sessions(
    program_id: str | None = None,
    course_id: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(MeasSession)
    if program_id:
        get_user_program_by_id(program_id, user, db)
        q = q.filter(MeasSession.program_id == program_id)
    if course_id:
        assert_course_owner(course_id, user, db)
        q = q.filter(MeasSession.course_id == course_id)
    if not program_id:
        owned = db.query(Program.id).filter_by(owner_id=user.id).subquery()
        q = q.filter(MeasSession.program_id.in_(owned))
    sessions = q.order_by(MeasSession.updated_at.desc()).all()
    course_meta = {c.id: (c.code, c.name_vn) for c in db.query(Course).all()}
    return [
        SessionListItem(
            id=s.id,
            name=s.name,
            course_id=s.course_id,
            course_code=course_meta.get(s.course_id, (None, None))[0],
            course_name=course_meta.get(s.course_id, (None, None))[1],
            semester=s.semester,
            cohort_code=s.cohort_code,
            status=s.status,
            n_questions=len(s.questions),
            n_students=len(s.students),
            updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionOut)
def get_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _assert_session_owner(session_id, user, db)


@router.patch("/sessions/{session_id}", response_model=SessionOut)
def update_session(
    session_id: str,
    payload: SessionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sess, field, value)
    db.commit()
    db.refresh(sess)
    return sess


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    db.delete(sess)
    db.commit()


# ───────────────────────────────────────────────────────────────────────
# QUESTIONS + RUBRICS
# ───────────────────────────────────────────────────────────────────────
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
        clo_links=[QuestionCLOLink(clo_id=l.clo_id, weight=l.weight) for l in q.clo_links],
    )


@router.post("/sessions/{session_id}/questions", response_model=QuestionOut)
def create_question(
    session_id: str,
    payload: QuestionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    for link in payload.clo_links:
        clo = db.query(CLO).filter_by(id=link.clo_id).first()
        if not clo or clo.course_id != sess.course_id:
            raise HTTPException(400, f"CLO {link.clo_id} không thuộc course của session")
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
    db.flush()
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
    sess = _assert_session_owner(session_id, user, db)
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
    _assert_session_owner(q.session_id, user, db)
    data = payload.model_dump(exclude_unset=True)
    clo_links = data.pop("clo_links", None)
    for field, value in data.items():
        setattr(q, field, value)
    if clo_links is not None:
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
    _assert_session_owner(q.session_id, user, db)
    db.delete(q)
    db.commit()


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
    _assert_session_owner(q.session_id, user, db)
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
    _assert_session_owner(q.session_id, user, db)
    return sorted(q.rubrics, key=lambda r: r.order)


# ───────────────────────────────────────────────────────────────────────
# STUDENTS
# ───────────────────────────────────────────────────────────────────────
@router.post("/students", response_model=StudentOut)
def create_student(
    payload: StudentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_program_by_id(payload.program_id, user, db)
    st = MeasStudent(**payload.model_dump())
    db.add(st)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(409, f"Sinh viên đã tồn tại trong program: {exc}")
    db.refresh(st)
    return st


@router.get("/students", response_model=list[StudentOut])
def list_students(
    program_id: str,
    cohort_code: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_program_by_id(program_id, user, db)
    q = db.query(MeasStudent).filter_by(program_id=program_id)
    if cohort_code:
        q = q.filter(MeasStudent.cohort_code == cohort_code)
    return q.order_by(MeasStudent.code).all()


@router.patch("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    st = _assert_student_owner(student_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(st, field, value)
    db.commit()
    db.refresh(st)
    return st


@router.delete("/students/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    st = _assert_student_owner(student_id, user, db)
    db.delete(st)
    db.commit()


@router.post("/sessions/{session_id}/students", status_code=201)
def enroll_students(
    session_id: str,
    links: list[SessionStudentLink],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    n_added = n_skipped = 0
    for link in links:
        st = db.query(MeasStudent).filter_by(id=link.student_id).first()
        if not st or st.program_id != sess.program_id:
            n_skipped += 1
            continue
        existing = (
            db.query(MeasSessionStudent)
            .filter_by(session_id=session_id, student_id=link.student_id)
            .first()
        )
        if existing:
            n_skipped += 1
            continue
        db.add(
            MeasSessionStudent(
                session_id=session_id,
                student_id=link.student_id,
                absent=link.absent,
                notes=link.notes,
            )
        )
        n_added += 1
    db.commit()
    return {"added": n_added, "skipped": n_skipped}


@router.get("/sessions/{session_id}/students", response_model=list[StudentOut])
def list_session_students(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    return [link.student for link in sess.students]


@router.delete("/sessions/{session_id}/students/{student_id}", status_code=204)
def unenroll_student(
    session_id: str,
    student_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    link = (
        db.query(MeasSessionStudent)
        .filter_by(session_id=sess.id, student_id=student_id)
        .first()
    )
    if not link:
        raise HTTPException(404, "Student not enrolled")
    db.delete(link)
    db.commit()


# ───────────────────────────────────────────────────────────────────────
# SCORES
# ───────────────────────────────────────────────────────────────────────
@router.post("/scores/bulk")
def bulk_upsert_scores(
    payload: BulkScoreUpsert,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(payload.session_id, user, db)
    q_map = {q.id: q for q in sess.questions}
    student_ids = {link.student_id for link in sess.students}
    n_created = n_updated = n_skipped = 0
    errors: list[str] = []
    for s in payload.scores:
        if s.question_id not in q_map:
            n_skipped += 1
            errors.append(f"Question {s.question_id} không thuộc session")
            continue
        if s.student_id not in student_ids:
            n_skipped += 1
            errors.append(f"Student {s.student_id} chưa enroll")
            continue
        q = q_map[s.question_id]
        if s.raw_score is not None and (s.raw_score < 0 or s.raw_score > q.max_score):
            n_skipped += 1
            errors.append(f"Score {s.raw_score} ngoài [0,{q.max_score}]")
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
        "errors": errors[:20],
    }


@router.get("/sessions/{session_id}/scores", response_model=list[ScoreOut])
def list_session_scores(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    return db.query(MeasScore).filter_by(session_id=sess.id).all()


# ───────────────────────────────────────────────────────────────────────
# IMPORT EXCEL
# ───────────────────────────────────────────────────────────────────────
@router.post("/sessions/{session_id}/import")
async def import_excel(
    session_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(400, "File phải là .xlsx hoặc .xlsm")
    content = await file.read()
    if not content:
        raise HTTPException(400, "File trống")
    try:
        return import_gradebook(db, sess, content, user.id)
    except Exception as exc:
        db.rollback()
        raise HTTPException(400, f"Import thất bại: {exc}") from exc


# ───────────────────────────────────────────────────────────────────────
# EXPORT CSV
# ───────────────────────────────────────────────────────────────────────
def _csv_response(content: str, filename: str) -> StreamingResponse:
    return StreamingResponse(
        BytesIO(content.encode("utf-8")),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/sessions/{session_id}/export/scores.csv")
def export_scores_csv(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    csv_text = export_score_matrix(db, sess)
    fname = f"scores_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)


@router.get("/sessions/{session_id}/export/clo_mastery.csv")
def export_clo_mastery_csv(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    csv_text = export_clo_mastery(db, sess)
    fname = f"clo_mastery_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)


@router.get("/sessions/{session_id}/export/evidence.csv")
def export_evidence_csv(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    csv_text = export_evidence_summary(db, sess)
    fname = f"evidence_{sess.cohort_code}_{sess.semester}.csv".replace(" ", "_")
    return _csv_response(csv_text, fname)


# ───────────────────────────────────────────────────────────────────────
# COMPUTE
# ───────────────────────────────────────────────────────────────────────
def _enrich_results(db: Session, result: dict) -> ComputeResponse:
    clo_meta = {c.id: (c.code, c.text_vn) for c in db.query(CLO).all()}
    plo_meta = {p.id: (p.code, p.text_vn) for p in db.query(PLO).all()}
    clo_outs = []
    for r in result["clo_results"]:
        code, text = clo_meta.get(r["clo_id"], (None, None))
        clo_outs.append(
            ResultCLOOut(
                session_id=r["session_id"],
                clo_id=r["clo_id"],
                clo_code=code,
                clo_text=text,
                n_students=r["n_students"],
                n_achieved=r["n_achieved"],
                pct_achieved=r["pct_achieved"],
                avg_score_pct=r["avg_score_pct"],
                computed_at=r["computed_at"],
            )
        )
    plo_outs = []
    for r in result["plo_results"]:
        code, text = plo_meta.get(r["plo_id"], (None, None))
        plo_outs.append(
            ResultPLOOut(
                session_id=r["session_id"],
                plo_id=r["plo_id"],
                plo_code=code,
                plo_text=text,
                pi_count=r["pi_count"],
                pct_achieved=r["pct_achieved"],
                computed_at=r["computed_at"],
            )
        )
    return ComputeResponse(
        session_id=result["session_id"],
        n_students_total=result["n_students_total"],
        n_questions_total=result["n_questions_total"],
        n_clos_evaluated=result["n_clos_evaluated"],
        n_plos_evaluated=result["n_plos_evaluated"],
        clo_results=clo_outs,
        plo_results=plo_outs,
        warnings=[w["message"] for w in result.get("warnings", [])],
    )


@router.post("/sessions/{session_id}/compute", response_model=ComputeResponse)
def compute(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    result = compute_session(db, sess)
    return _enrich_results(db, result)


@router.get("/sessions/{session_id}/results", response_model=ComputeResponse)
def get_cached_results(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    clo_meta = {c.id: (c.code, c.text_vn) for c in db.query(CLO).all()}
    plo_meta = {p.id: (p.code, p.text_vn) for p in db.query(PLO).all()}
    clo_outs = [
        ResultCLOOut(
            session_id=r.session_id,
            clo_id=r.clo_id,
            clo_code=clo_meta.get(r.clo_id, (None, None))[0],
            clo_text=clo_meta.get(r.clo_id, (None, None))[1],
            n_students=r.n_students,
            n_achieved=r.n_achieved,
            pct_achieved=r.pct_achieved,
            avg_score_pct=r.avg_score_pct,
            computed_at=r.computed_at,
        )
        for r in db.query(MeasResultCLO).filter_by(session_id=sess.id).all()
    ]
    plo_outs = [
        ResultPLOOut(
            session_id=r.session_id,
            plo_id=r.plo_id,
            plo_code=plo_meta.get(r.plo_id, (None, None))[0],
            plo_text=plo_meta.get(r.plo_id, (None, None))[1],
            pi_count=r.pi_count,
            pct_achieved=r.pct_achieved,
            computed_at=r.computed_at,
        )
        for r in db.query(MeasResultPLO).filter_by(session_id=sess.id).all()
    ]
    return ComputeResponse(
        session_id=sess.id,
        n_students_total=len(sess.students),
        n_questions_total=len(sess.questions),
        n_clos_evaluated=len(clo_outs),
        n_plos_evaluated=len(plo_outs),
        clo_results=clo_outs,
        plo_results=plo_outs,
        warnings=[],
    )


# ───────────────────────────────────────────────────────────────────────
# REPORT TT04-2025
# ───────────────────────────────────────────────────────────────────────
@router.post("/sessions/{session_id}/report/tt04")
def generate_tt04(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    tex_path, pdf_path = render_tt04_report(db, sess)
    return {
        "session_id": sess.id,
        "tex_path": str(tex_path),
        "pdf_path": str(pdf_path) if pdf_path else None,
        "pdf_available": pdf_path is not None,
    }


@router.get("/sessions/{session_id}/report/tt04.pdf")
def download_tt04_pdf(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    tex_path, pdf_path = render_tt04_report(db, sess)
    if not pdf_path or not pdf_path.exists():
        raise HTTPException(424, "PDF chưa render được. Tải .tex compile thủ công.")
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.name)


@router.get("/sessions/{session_id}/report/tt04.tex")
def download_tt04_tex(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sess = _assert_session_owner(session_id, user, db)
    tex_path, _ = render_tt04_report(db, sess, run_pdf=False)
    return FileResponse(tex_path, media_type="application/x-tex", filename=tex_path.name)
