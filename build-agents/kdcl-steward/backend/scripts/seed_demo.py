"""Seed demo data cho kdcl-steward.

Yêu cầu: cdr-steward đã được seed trước (có user demo + Programs + Courses + CLOs).

Tạo:
- 1 MeasSession cho BAS101 (Nguyên lý kinh tế học, QTKD)
- 30 sinh viên cohort 21QT01
- 5 câu hỏi (mỗi câu map 1-2 CLO)
- 4 rubrics cho 1 câu mẫu
- 150 điểm fake theo phân phối thực tế (Bloom level càng cao → điểm thấp hơn)

Idempotent: chạy nhiều lần không tạo trùng (dựa vào unique constraint).
"""
from __future__ import annotations

import os
import random
import sys
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

# Ensure parent path importable
HERE = Path(__file__).resolve().parent
APP_PARENT = HERE.parent  # backend/
sys.path.insert(0, str(APP_PARENT))

# Allow override via env, fallback to absolute path of cdr-steward DB
os.environ.setdefault(
    "DATABASE_URL",
    f"sqlite:///{APP_PARENT.parent.parent / 'cdr-steward' / 'backend' / 'cdr_steward.db'}",
)

from app.db import Base, SessionLocal, engine  # noqa: E402
from app import models  # noqa: F401, E402 — register all
from app.models.meas import (  # noqa: E402
    BloomLevel,
    MeasQuestion,
    MeasQuestionCLO,
    MeasRubric,
    MeasScore,
    MeasSession,
    MeasSessionStudent,
    MeasStudent,
    RubricLevel,
    SessionStatus,
)
from app.models.ref import CLO, Course, Program, User  # noqa: E402
from app.services.compute import compute_session  # noqa: E402

random.seed(42)  # reproducible


def main() -> None:
    # Idempotent table create (just meas_*)
    meas_tables = [t for n, t in Base.metadata.tables.items() if n.startswith("meas_")]
    Base.metadata.create_all(bind=engine, tables=meas_tables)

    db = SessionLocal()
    try:
        # 1. Tìm user demo
        user = db.query(User).filter_by(email="demo@cdr-steward.com").first()
        if not user:
            print("✗ Demo user not found. Run cdr-steward/backend/scripts/seed_demo.py first.")
            return  # graceful — let uvicorn start anyway
        print(f"✓ Demo user: {user.email}")

        # 2. Tìm program QTKD + course BAS101
        program = (
            db.query(Program)
            .filter_by(code="7340101", owner_id=user.id)
            .first()
        )
        if not program:
            print("✗ Program 7340101 (QTKD) not found.")
            return  # graceful — let uvicorn start anyway
        course = (
            db.query(Course).filter_by(code="BAS101", program_id=program.id).first()
        )
        if not course:
            print("✗ Course BAS101 not found.")
            return  # graceful — let uvicorn start anyway
        print(f"✓ Course: {course.code} -- {course.name_vn}")

        clos = sorted(
            db.query(CLO).filter_by(course_id=course.id).all(),
            key=lambda c: c.code,
        )
        if len(clos) < 3:
            print(f"✗ BAS101 expected 3 CLOs, found {len(clos)}.")
            return  # graceful — let uvicorn start anyway
        clo1, clo2, clo3 = clos[0], clos[1], clos[2]
        print(f"✓ CLOs: {clo1.code}, {clo2.code}, {clo3.code}")

        # 3. Tạo (hoặc reuse) Session
        sess = (
            db.query(MeasSession)
            .filter_by(
                program_id=program.id,
                course_id=course.id,
                semester="HKII 2024-2025",
                cohort_code="21QT01",
                assessment_id=None,
            )
            .first()
        )
        if not sess:
            sess = MeasSession(
                program_id=program.id,
                course_id=course.id,
                assessment_id=None,
                name="BAS101 -- Cuối kỳ HKII 2024-2025 -- 21QT01",
                semester="HKII 2024-2025",
                cohort_code="21QT01",
                exam_date=date(2025, 5, 20),
                max_total_score=Decimal("10.0"),
                pass_threshold=Decimal("5.0"),
                clo_threshold_pct=Decimal("50.0"),
                status=SessionStatus.SCORING,
                created_by=user.id,
            )
            db.add(sess)
            db.commit()
            db.refresh(sess)
            print(f"✓ Created session: {sess.name}")
        else:
            print(f"✓ Reused session: {sess.name}")

        # 4. Questions (5 câu, total 10đ)
        question_specs = [
            # (number, text, max_score, bloom, [(clo, weight)])
            ("1", "Định nghĩa cung cầu và vẽ đồ thị cân bằng.", 1.5, BloomLevel.REMEMBER, [(clo1, 1.0)]),
            ("2", "Giải thích co giãn cầu theo giá; áp dụng số liệu đề bài.", 2.0, BloomLevel.UNDERSTAND, [(clo1, 1.0)]),
            ("3", "Phân tích lựa chọn tối ưu của người tiêu dùng (max U s.t. budget).", 2.5, BloomLevel.APPLY, [(clo2, 1.0)]),
            ("4", "So sánh độc quyền vs cạnh tranh hoàn hảo qua case study.", 2.0, BloomLevel.ANALYZE, [(clo2, 0.7), (clo3, 0.3)]),
            ("5", "Đánh giá tác động chính sách tài khóa lên GDP và lạm phát.", 2.0, BloomLevel.EVALUATE, [(clo3, 1.0)]),
        ]
        existing_q = {q.number: q for q in sess.questions}
        for number, text, max_s, bloom, clo_links in question_specs:
            if number in existing_q:
                continue
            q = MeasQuestion(
                session_id=sess.id,
                number=number,
                order=int(number) if number.isdigit() else 0,
                text=text,
                max_score=Decimal(str(max_s)),
                bloom_level=bloom,
            )
            db.add(q)
            db.flush()
            for clo, w in clo_links:
                db.add(
                    MeasQuestionCLO(
                        question_id=q.id, clo_id=clo.id, weight=Decimal(str(w))
                    )
                )
        db.commit()
        questions = sorted(sess.questions, key=lambda q: q.order)
        print(f"✓ Questions: {len(questions)} câu")

        # 5. Rubric mẫu cho Q3
        q3 = next((q for q in questions if q.number == "3"), None)
        if q3 and not q3.rubrics:
            for i, (lv, lbl, lo, hi, txt) in enumerate(
                [
                    (RubricLevel.EXCELLENT, "Xuất sắc", 2.25, 2.5, "Giải đầy đủ + diễn giải kinh tế"),
                    (RubricLevel.GOOD, "Tốt", 1.75, 2.24, "Đúng số liệu, thiếu diễn giải"),
                    (RubricLevel.PASS, "Đạt", 1.25, 1.74, "Thiết lập đúng nhưng tính sai"),
                    (RubricLevel.FAIL, "Chưa đạt", 0.0, 1.24, "Không thiết lập được mô hình"),
                ]
            ):
                db.add(
                    MeasRubric(
                        question_id=q3.id,
                        level=lv,
                        label=lbl,
                        criteria_text=txt,
                        score_range_min=Decimal(str(lo)),
                        score_range_max=Decimal(str(hi)),
                        order=i,
                    )
                )
            db.commit()
            print(f"✓ Rubrics for Q3: 4 levels")

        # 6. Sinh viên (30 SV cohort 21QT01)
        existing_codes = {s.code for s in db.query(MeasStudent).filter_by(program_id=program.id).all()}
        students = []
        first_names = ["An", "Bình", "Chi", "Dũng", "Hà", "Hùng", "Lan", "Linh", "Minh", "Nam"]
        last_names = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đỗ", "Bùi", "Đặng", "Phan"]
        for i in range(1, 31):
            code = f"21QT01{i:03d}"
            if code in existing_codes:
                st = db.query(MeasStudent).filter_by(program_id=program.id, code=code).first()
            else:
                st = MeasStudent(
                    program_id=program.id,
                    code=code,
                    full_name=f"{random.choice(last_names)} {random.choice(first_names)} {chr(ord('A') + i % 5)}",
                    cohort_code="21QT01",
                    email=f"{code.lower()}@dau.edu.vn",
                )
                db.add(st)
                db.flush()
            students.append(st)
        db.commit()
        print(f"✓ Students: {len(students)} SV")

        # 7. Enroll students vào session
        existing_enrolled = {link.student_id for link in sess.students}
        for st in students:
            if st.id not in existing_enrolled:
                db.add(MeasSessionStudent(session_id=sess.id, student_id=st.id))
        db.commit()
        print(f"✓ Enrolled {len(sess.students)} students")

        # 8. Sinh điểm fake — Bloom level cao hơn → điểm thấp hơn
        bloom_difficulty = {
            BloomLevel.REMEMBER: 0.85,    # avg 85%
            BloomLevel.UNDERSTAND: 0.78,  # avg 78%
            BloomLevel.APPLY: 0.65,       # avg 65%
            BloomLevel.ANALYZE: 0.58,     # avg 58%
            BloomLevel.EVALUATE: 0.52,    # avg 52%
            BloomLevel.CREATE: 0.45,
        }
        existing_score_keys = {
            (s.student_id, s.question_id)
            for s in db.query(MeasScore).filter_by(session_id=sess.id).all()
        }
        n_added = 0
        for st in students:
            # Per-student skill multiplier để có distribution thực tế
            skill = random.gauss(1.0, 0.18)  # avg 1.0, σ 0.18
            skill = max(0.3, min(1.3, skill))
            for q in questions:
                if (st.id, q.id) in existing_score_keys:
                    continue
                target_pct = bloom_difficulty.get(q.bloom_level, 0.6) * skill
                # noise
                target_pct += random.gauss(0, 0.08)
                target_pct = max(0.0, min(1.0, target_pct))
                raw = float(q.max_score) * target_pct
                # Round 0.25
                raw = round(raw * 4) / 4
                db.add(
                    MeasScore(
                        session_id=sess.id,
                        student_id=st.id,
                        question_id=q.id,
                        raw_score=Decimal(str(raw)),
                        graded_at=datetime.utcnow(),
                        graded_by=user.id,
                    )
                )
                n_added += 1
        db.commit()
        print(f"✓ Scores: {n_added} new (existing {len(existing_score_keys)})")

        # 9. Auto compute
        result = compute_session(db, sess)
        print()
        print("=== COMPUTE RESULT ===")
        print(f"  Session: {sess.name}")
        print(f"  Students: {result['n_students_total']}")
        print(f"  Questions: {result['n_questions_total']}")
        print(f"  CLOs evaluated: {result['n_clos_evaluated']}")
        print(f"  PLOs evaluated: {result['n_plos_evaluated']}")
        print()
        for r in result["clo_results"]:
            clo_obj = db.query(CLO).filter_by(id=r["clo_id"]).first()
            print(
                f"  CLO {clo_obj.code if clo_obj else r['clo_id']}: "
                f"{r['n_achieved']}/{r['n_students']} đạt = {r['pct_achieved']}%, "
                f"avg {r['avg_score_pct']}%"
            )
        print()
        for r in result["plo_results"]:
            from app.models.ref import PLO

            plo_obj = db.query(PLO).filter_by(id=r["plo_id"]).first()
            print(
                f"  PLO {plo_obj.code if plo_obj else r['plo_id']}: "
                f"{r['pct_achieved']}% (qua {r['pi_count']} PI)"
            )
        if result["warnings"]:
            print()
            print("  Warnings:")
            for w in result["warnings"]:
                print(f"    - {w['code']}: {w['message']}")
        print()
        print(f"✓ DONE — session_id = {sess.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
