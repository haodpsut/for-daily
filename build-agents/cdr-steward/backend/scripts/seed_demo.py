"""Seed DB với dữ liệu CTĐT CNTT 7480201 của DAU.

Trích thủ công từ CT_CDR.pdf của DAU (build-agents/university/chuontrinhdaotao/CT_CDR.pdf).
Gồm: 1 Program + 6 PO + 9 PLO + 25 PI + ma trận PLO×PO + 15 VQF + 3 demo courses.

Idempotent behavior (cho production Postgres):
- Tables không tồn tại → tạo (create_all)
- Program 7480201 đã tồn tại → SKIP (giữ nguyên data user đã sửa)
- Program 7480201 chưa tồn tại → full seed
- `--force` → xóa program 7480201 (cascade) rồi seed lại

Run:
    python scripts/seed_demo.py           # idempotent (default)
    python scripts/seed_demo.py --force   # wipe + reseed
"""
from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

# Windows console: force UTF-8 so we can print Vietnamese + symbols
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Allow running from backend/ directly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import Base, SessionLocal, engine
from app import models
from app.auth import hash_password
from app.models import (
    User,
    Program, PO, PLO, PI, PLO_PO, ProgramLevel,
    VQFItem, PLO_VQF, VQFDomain,
    Course, CO, CLO, CLO_CO, CLO_PI, IRMALevel, KnowledgeGroup,
    Assessment, Assessment_CLO, WeeklyPlan, WeeklyPlan_CLO,
)

DEMO_USER_EMAIL = "demo@cdr-steward.com"
DEMO_USER_PASSWORD = "demo1234"


# ────────────────────────────────────────────────────────
# Dữ liệu CNTT 7480201 — trích từ CT_CDR.pdf của DAU
# ────────────────────────────────────────────────────────

PROGRAM = {
    "code": "7480201",
    "name_vn": "Công nghệ thông tin",
    "name_en": "Information Technology",
    "level": ProgramLevel.DAI_HOC,
    "duration_years": 4,
    "total_credits": 158,
    "language": "Tiếng Việt",
    "decision_no": "346/QĐ-ĐHKTĐN",
    "decision_date": date(2024, 6, 25),
    "issuing_authority": "Hiệu trưởng Trường Đại học Kiến trúc Đà Nẵng",
}

# VQF — Khung trình độ Quốc gia VN bậc 6 (Đại học)
VQF_ITEMS = [
    ("K1", VQFDomain.KNOWLEDGE, "Kiến thức thực tế vững chắc, kiến thức lý thuyết sâu, rộng trong phạm vi của ngành đào tạo."),
    ("K2", VQFDomain.KNOWLEDGE, "Kiến thức cơ bản về khoa học xã hội, khoa học chính trị và pháp luật."),
    ("K3", VQFDomain.KNOWLEDGE, "Kiến thức về công nghệ thông tin đáp ứng yêu cầu công việc."),
    ("K4", VQFDomain.KNOWLEDGE, "Kiến thức về lập kế hoạch, tổ chức và giám sát các quá trình trong lĩnh vực hoạt động cụ thể."),
    ("K5", VQFDomain.KNOWLEDGE, "Kiến thức cơ bản về quản lý, điều hành hoạt động chuyên môn."),
    ("S1", VQFDomain.SKILL, "Kỹ năng cần thiết để có thể giải quyết các vấn đề phức tạp."),
    ("S2", VQFDomain.SKILL, "Kỹ năng dẫn dắt, khởi nghiệp, tạo việc làm cho mình và cho người khác."),
    ("S3", VQFDomain.SKILL, "Kỹ năng phản biện, phê phán và sử dụng các giải pháp thay thế trong điều kiện môi trường không xác định hoặc thay đổi."),
    ("S4", VQFDomain.SKILL, "Kỹ năng đánh giá chất lượng công việc sau khi hoàn thành và kết quả thực hiện của các thành viên trong nhóm."),
    ("S5", VQFDomain.SKILL, "Kỹ năng truyền đạt vấn đề và giải pháp tới người khác tại nơi làm việc."),
    ("S6", VQFDomain.SKILL, "Có năng lực ngoại ngữ tương đương bậc 3/6 Khung năng lực ngoại ngữ của Việt Nam."),
    ("A1", VQFDomain.ATTITUDE, "Làm việc độc lập hoặc theo nhóm trong điều kiện thay đổi, chịu trách nhiệm cá nhân và đối với nhóm."),
    ("A2", VQFDomain.ATTITUDE, "Hướng dẫn, giám sát những người khác thực hiện nhiệm vụ xác định."),
    ("A3", VQFDomain.ATTITUDE, "Tự định hướng, đưa ra kết luận chuyên môn và có thể bảo vệ được quan điểm cá nhân."),
    ("A4", VQFDomain.ATTITUDE, "Lập kế hoạch, điều phối, quản lý các nguồn lực, đánh giá và cải thiện hiệu quả các hoạt động."),
]

# PLO × VQF mapping (từ CT_CTDH DAU)
PLO_VQF_MATRIX = {
    "PLO1": ["K1", "S1"],
    "PLO2": ["K3", "S1", "S2", "A4"],
    "PLO3": ["K2", "K3", "S1", "S2", "A4"],
    "PLO4": ["K4", "S5"],
    "PLO5": ["K2", "S6"],
    "PLO6": ["K1", "K2", "K4"],
    "PLO7": ["K2", "K4", "S4"],
    "PLO8": ["K4", "S4", "S5"],
    "PLO9": ["K1", "K4", "K5", "S4", "A2", "A3"],
}

# 3 demo courses spanning knowledge groups
DEMO_COURSES = [
    {
        "code": "PHI101",
        "name_vn": "Triết học Mác - Lênin",
        "name_en": "Philosophy of Marxism and Leninism",
        "credits": 3, "hours_lt": 45, "hours_th": 0, "hours_self": 90,
        "knowledge_group": KnowledgeGroup.DAI_CUONG,
        "semester_default": 1,
        "description": "Học phần cung cấp những kiến thức nền tảng về triết học Mác – Lênin và vai trò trong đời sống xã hội.",
        "cos": [
            ("CO1", "Trang bị phương pháp tư duy khoa học về lịch sử, kỹ năng lựa chọn tài liệu nghiên cứu, học tập nhóm."),
            ("CO2", "Cung cấp những hiểu biết có tính căn bản, hệ thống về triết học Mác – Lênin."),
            ("CO3", "Xây dựng thế giới quan duy vật và phương pháp luận biện chứng làm nền tảng lý luận."),
        ],
        "clos": [
            ("CLO1", "Quản lý được thời gian học tập; phối hợp làm việc nhóm hiệu quả.", ["CO1"], [("PI2.1", "I"), ("PI4.2", "I")]),
            ("CLO2", "Ghi nhớ được định nghĩa về Vật chất, Ý thức; biết được sự ra đời và phát triển của triết học Mác – Lênin.", ["CO2"], [("PI1.1", "I")]),
            ("CLO3", "Vận dụng được thế giới quan và phương pháp luận biện chứng phục vụ chuyên ngành học.", ["CO3"], [("PI1.1", "R"), ("PI3.1", "I")]),
        ],
        "assessments": [
            ("Chuyên cần", 10, "Điểm danh + quan sát thái độ", "CLO1"),
            ("Kiểm tra giữa kỳ", 30, "Tự luận 60 phút", "CLO2,CLO3"),
            ("Thi cuối kỳ", 60, "Tự luận 90 phút", "CLO1,CLO2,CLO3"),
        ],
        "weeks": [
            (1, "Chương 1: Khái luận về triết học và triết học Mác - Lênin", 4, 0, "CLO1,CLO2"),
            (2, "Chương 2: Chủ nghĩa duy vật biện chứng", 4, 0, "CLO2"),
            (3, "Chương 2: Chủ nghĩa duy vật biện chứng (tiếp)", 4, 0, "CLO2,CLO3"),
            (4, "Chương 3: Chủ nghĩa duy vật lịch sử", 4, 0, "CLO3"),
        ],
    },
    {
        "code": "ITP101",
        "name_vn": "Nhập môn lập trình",
        "name_en": "Introduction to Programming",
        "credits": 4, "hours_lt": 30, "hours_th": 60, "hours_self": 90,
        "knowledge_group": KnowledgeGroup.CO_SO,
        "semester_default": 1,
        "description": "Học phần cung cấp kiến thức cơ bản về lập trình, biến, kiểu dữ liệu, cấu trúc điều khiển, hàm và mảng qua ngôn ngữ C/Python.",
        "cos": [
            ("CO1", "Trình bày được khái niệm cơ bản về lập trình và thuật toán."),
            ("CO2", "Áp dụng các cấu trúc điều khiển, hàm để giải quyết bài toán đơn giản."),
            ("CO3", "Phân tích yêu cầu và thiết kế chương trình cho bài toán vừa và nhỏ."),
        ],
        "clos": [
            ("CLO1", "Sử dụng môi trường lập trình để viết, chạy và debug chương trình đơn giản.", ["CO1"], [("PI7.1", "I"), ("PI6.1", "I")]),
            ("CLO2", "Vận dụng cấu trúc điều khiển và hàm để cài đặt thuật toán.", ["CO2"], [("PI7.1", "R"), ("PI9.1", "I")]),
            ("CLO3", "Thiết kế và cài đặt chương trình giải quyết bài toán thực tế quy mô vừa.", ["CO3"], [("PI7.1", "M"), ("PI9.2", "R"), ("PI9.3", "I")]),
        ],
        "assessments": [
            ("Chuyên cần + Bài tập", 20, "Điểm danh + bài tập tuần", "CLO1,CLO2"),
            ("Đồ án giữa kỳ", 30, "Báo cáo + demo + vấn đáp", "CLO2,CLO3"),
            ("Thi cuối kỳ", 50, "Lập trình trên máy 90 phút", "CLO1,CLO2,CLO3"),
        ],
        "weeks": [
            (1, "Giới thiệu lập trình, môi trường phát triển, biến và kiểu dữ liệu", 2, 4, "CLO1"),
            (2, "Toán tử, biểu thức, nhập/xuất", 2, 4, "CLO1"),
            (3, "Cấu trúc điều kiện if/else, switch", 2, 4, "CLO1,CLO2"),
            (4, "Vòng lặp for/while/do-while", 2, 4, "CLO2"),
            (5, "Hàm, tham trị, tham chiếu", 2, 4, "CLO2"),
        ],
    },
    {
        "code": "SOT301",
        "name_vn": "Kiểm thử phần mềm",
        "name_en": "Software Testing",
        "credits": 3, "hours_lt": 30, "hours_th": 30, "hours_self": 90,
        "knowledge_group": KnowledgeGroup.CHUYEN_NGANH,
        "semester_default": 6,
        "description": "Học phần trình bày các kỹ thuật, quy trình và công cụ kiểm thử phần mềm hiện đại; phương pháp white-box, black-box và automation testing.",
        "cos": [
            ("CO1", "Hiểu vai trò, mục tiêu và quy trình kiểm thử trong vòng đời phần mềm."),
            ("CO2", "Áp dụng các kỹ thuật thiết kế test case (black-box, white-box) cho hệ thống thực."),
            ("CO3", "Sử dụng công cụ test automation và viết báo cáo defect chuyên nghiệp."),
        ],
        "clos": [
            ("CLO1", "Phân loại được các loại kiểm thử và xác định cấp độ phù hợp cho dự án.", ["CO1"], [("PI8.1", "I")]),
            ("CLO2", "Thiết kế bộ test case đảm bảo độ phủ theo equivalence partitioning + boundary value.", ["CO2"], [("PI8.1", "R"), ("PI9.3", "R")]),
            ("CLO3", "Triển khai test automation với JUnit/Selenium và viết defect report rõ ràng.", ["CO3"], [("PI8.1", "M"), ("PI8.3", "M"), ("PI9.2", "M")]),
        ],
        "assessments": [
            ("Bài tập + Quiz", 20, "Quiz hàng tuần + bài tập", "CLO1,CLO2"),
            ("Đồ án giữa kỳ", 30, "Thiết kế test plan + test cases", "CLO2"),
            ("Đồ án cuối kỳ", 50, "Triển khai automation + báo cáo", "CLO2,CLO3"),
        ],
        "weeks": [
            (1, "Giới thiệu kiểm thử phần mềm, V-model, các cấp độ test", 2, 2, "CLO1"),
            (2, "Black-box testing: equivalence partitioning, boundary values", 2, 2, "CLO2"),
            (3, "White-box testing: statement/branch/path coverage", 2, 2, "CLO2"),
        ],
    },
]

POS = [
    ("PO1", 1, "Đào tạo nguồn nhân lực có phẩm chất chính trị, đạo đức xã hội, sức khỏe đáp ứng yêu cầu phát triển kinh tế - xã hội trong lĩnh vực chuyên môn; có trách nhiệm nghề nghiệp, ý thức phục vụ cộng đồng; bảo đảm quốc phòng - an ninh và hội nhập quốc tế."),
    ("PO2", 2, "Đào tạo con người có khả năng sáng tạo và thích nghi với môi trường làm việc trong thời kỳ \"Kỷ nguyên số và Trí tuệ nhân tạo\", có khả năng tự đào tạo để phát triển chuyên môn nghề nghiệp và học tập suốt đời."),
    ("PO3", 3, "Nhận diện và mô tả các kiến thức cơ bản, kiến thức cơ sở ngành và chuyên ngành Công nghệ thông tin; áp dụng và phân tích các phương pháp luận khoa học trong nghiên cứu ngành Công nghệ thông tin"),
    ("PO4", 4, "Phân tích và đánh giá các vấn đề thực tiễn trong các lĩnh vực như Công nghệ phần mềm, Mạng và truyền thông, Hệ thống thông tin; thiết kế và phát triển các giải pháp phù hợp với yêu cầu của thị trường lao động."),
    ("PO5", 5, "Thiết kế, phát triển, và quản lý các hệ thống thông tin và phần mềm máy tính, thực hành kỹ năng nghề nghiệp hiệu quả."),
    ("PO6", 6, "Thể hiện ý thức tổ chức kỷ luật, tác phong làm việc khoa học, nghiêm túc; duy trì đạo đức nghề nghiệp về bảo vệ thông tin và bản quyền."),
]

PLOS = [
    ("PLO1", 1, "Áp dụng các kiến thức cơ bản về khoa học xã hội, kinh tế và pháp luật cho việc học tập, nghiên cứu và làm việc trong lĩnh vực chuyên môn"),
    ("PLO2", 2, "Tương tác hiệu quả trong công việc."),
    ("PLO3", 3, "Tư duy phản biện, sáng tạo và khởi nghiệp trong thời kỳ \"Kỷ nguyên số và Trí tuệ nhân tạo\" và điều kiện môi trường thay đổi."),
    ("PLO4", 4, "Thực hiện trách nhiệm nghề nghiệp, tự chủ tiếp thu và áp dụng kiến thức mới khi cần thiết."),
    ("PLO5", 5, "Đạt chuẩn Ngoại ngữ, công nghệ thông tin cơ bản, giáo dục quốc phòng và an ninh, giáo dục thể chất theo quy định hiện hành."),
    ("PLO6", 6, "Hiểu biết và vận dụng kiến thức về hệ thống phần mềm, phần cứng, mạng máy tính và truyền thông, cũng như vai trò và ứng dụng của CNTT trong kỷ nguyên số."),
    ("PLO7", 7, "Thành thạo kỹ năng lập trình máy tính, thu thập, phân tích và tổng hợp yêu cầu từ người sử dụng để thiết kế và quản lý các dự án phần mềm."),
    ("PLO8", 8, "Đánh giá và đảm bảo chất lượng phần mềm, kiểm thử, bảo trì và xây dựng tài liệu kỹ thuật, hướng dẫn sử dụng hệ thống hiệu quả."),
    ("PLO9", 9, "Áp dụng kiến thức cơ sở, chuyên ngành và quản lý dự án để giải quyết các vấn đề kỹ thuật trong xây dựng và phát triển phần mềm máy tính."),
]

# (pi_code, plo_code, order, text_vn)
PIS = [
    ("PI1.1", "PLO1", 1, "Vận dụng các kiến thức nền tảng về lý luận chính trị để giải quyết các vấn đề có liên quan đến chuyên môn"),
    ("PI1.2", "PLO1", 2, "Áp dụng kiến thức kinh tế và pháp luật phục vụ cho việc học tập và làm việc trong lĩnh vực chuyên ngành."),
    ("PI2.1", "PLO2", 1, "Phối hợp hiệu quả các hoạt động trong một nhóm mà các thành viên cùng nhau hợp tác, lãnh đạo, tạo ra môi trường hợp tác và hòa nhập."),
    ("PI2.2", "PLO2", 2, "Kỹ năng giao tiếp và thuyết trình hiệu quả với nhiều đối tượng."),
    ("PI3.1", "PLO3", 1, "Phản biện được các ý kiến của người khác nêu ra một cách thuyết phục."),
    ("PI3.2", "PLO3", 2, "Đề xuất được các giải pháp mới trong chuyên môn."),
    ("PI3.3", "PLO3", 3, "Hình thành ý tưởng và lập kế hoạch cho các dự án khởi nghiệp."),
    ("PI4.1", "PLO4", 1, "Thực hiện trách nhiệm nghề nghiệp trong xử lý công việc có xét đến cơ sở lợi ích cộng đồng, xã hội và môi trường."),
    ("PI4.2", "PLO4", 2, "Chủ động tiếp thu và áp dụng kiến thức mới trong học tập và trong công việc sau khi tốt nghiệp."),
    ("PI5.1", "PLO5", 1, "Đạt chuẩn ngoại ngữ bậc 3/6 theo khung năng lực ngoại ngữ Việt Nam hoặc tương đương theo Thông tư số 01/2014/TT-BGDĐT của Bộ Giáo dục và Đào tạo ngày 24/01/2014."),
    ("PI5.2", "PLO5", 2, "Đạt chuẩn kỹ năng công nghệ thông tin cơ bản do Bộ Thông tin Truyền thông ban hành tại Thông tư số 03/2014/TT - BTTTT ngày 11/3/2014 hoặc tương đương theo Quyết định số 443/QĐ-ĐHKTĐN ngày 28/8/2023."),
    ("PI5.3", "PLO5", 3, "Đạt chuẩn giáo dục Quốc phòng và an ninh theo Thông tư 05/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo ngày 18/3/2020."),
    ("PI5.4", "PLO5", 4, "Đạt chuẩn về giáo dục thể chất theo Thông tư 25/2015/TT-BGDĐT của Bộ Giáo dục và Đào tạo ngày 14/10/2015."),
    ("PI6.1", "PLO6", 1, "Hiểu biết cơ bản về chức năng của phần mềm và phần cứng."),
    ("PI6.2", "PLO6", 2, "Vận dụng kiến thức về mạng máy tính và truyền thông trong kỷ nguyên số."),
    ("PI6.3", "PLO6", 3, "Áp dụng công nghệ thông tin để giải quyết các vấn đề trong thực tiễn."),
    ("PI7.1", "PLO7", 1, "Sử dụng thành thạo ít nhất một ngôn ngữ lập trình để phát triển phần mềm."),
    ("PI7.2", "PLO7", 2, "Thu thập và phân tích yêu cầu từ người sử dụng để thiết kế hệ thống phần mềm."),
    ("PI7.3", "PLO7", 3, "Quản lý dự án phần mềm từ giai đoạn khởi đầu đến khi hoàn thành."),
    ("PI8.1", "PLO8", 1, "Thực hiện kiểm thử phần mềm để đảm bảo chất lượng."),
    ("PI8.2", "PLO8", 2, "Bảo trì, cập nhật và nâng cấp phần mềm theo yêu cầu người dùng."),
    ("PI8.3", "PLO8", 3, "Xây dựng tài liệu kỹ thuật và hướng dẫn sử dụng hệ thống phần mềm một cách rõ ràng và chi tiết."),
    ("PI9.1", "PLO9", 1, "Vận dụng các kiến thức về khoa học kỹ thuật, chú trọng về Toán chuyên ngành công nghệ thông tin trong việc phát triển phần mềm."),
    ("PI9.2", "PLO9", 2, "Ứng dụng các phương pháp và công cụ trong việc phát triển phần mềm."),
    ("PI9.3", "PLO9", 3, "Đánh giá và phân tích, giải quyết các vấn đề kỹ thuật trong quá trình phát triển phần mềm."),
]

# Ma trận PLO × PO — {plo_code: [po_order, ...]}
PLO_PO_MATRIX = {
    "PLO1": [1, 2],
    "PLO2": [2],
    "PLO3": [2],
    "PLO4": [2],
    "PLO5": [1],
    "PLO6": [4, 6],
    "PLO7": [4],
    "PLO8": [4],
    "PLO9": [4, 5, 6],
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true",
                        help="Xóa Program 7480201 (cascade) rồi seed lại từ đầu")
    args = parser.parse_args()

    # Idempotent: chỉ tạo tables thiếu, không touch tables đã có
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Demo user — idempotent
        demo_user = db.query(User).filter_by(email=DEMO_USER_EMAIL).first()
        if not demo_user:
            demo_user = User(
                email=DEMO_USER_EMAIL,
                password_hash=hash_password(DEMO_USER_PASSWORD),
                full_name="Demo Account",
                institution_name="Trường Đại học Kiến trúc Đà Nẵng",
            )
            db.add(demo_user)
            db.commit()
            print(f"[OK] Created demo user: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}")
        else:
            print(f"[skip] Demo user {DEMO_USER_EMAIL} đã tồn tại")

        existing = db.query(Program).filter_by(
            owner_id=demo_user.id, code=PROGRAM["code"]
        ).first()
        if existing:
            if args.force:
                print(f"[force] Xóa Program {PROGRAM['code']} của demo user (cascade)")
                db.delete(existing)
                db.commit()
            else:
                print(f"[skip] Program {PROGRAM['code']} đã tồn tại. Dùng --force để re-seed.")
                return

        program = Program(owner_id=demo_user.id, **PROGRAM)
        db.add(program)
        db.flush()

        po_by_code = {}
        for code, order, text in POS:
            po = PO(program_id=program.id, code=code, order=order, text_vn=text)
            db.add(po)
            po_by_code[code] = po
        db.flush()

        plo_by_code = {}
        for code, order, text in PLOS:
            plo = PLO(program_id=program.id, code=code, order=order, text_vn=text)
            db.add(plo)
            plo_by_code[code] = plo
        db.flush()

        for pi_code, plo_code, order, text in PIS:
            pi = PI(plo_id=plo_by_code[plo_code].id, code=pi_code, order=order, text_vn=text)
            db.add(pi)
        db.flush()

        for plo_code, po_orders in PLO_PO_MATRIX.items():
            plo = plo_by_code[plo_code]
            for po_order in po_orders:
                po = next(p for p in po_by_code.values() if p.order == po_order)
                db.add(PLO_PO(plo_id=plo.id, po_id=po.id))

        # VQF items (Khung trình độ QG VN) — global reference, idempotent insert
        vqf_by_code = {}
        for code, domain, text in VQF_ITEMS:
            existing_v = db.query(VQFItem).filter_by(code=code).first()
            if existing_v:
                vqf_by_code[code] = existing_v
            else:
                v = VQFItem(code=code, domain=domain, text_vn=text)
                db.add(v)
                vqf_by_code[code] = v
        db.flush()

        for plo_code, vqf_codes in PLO_VQF_MATRIX.items():
            plo = plo_by_code[plo_code]
            for vc in vqf_codes:
                db.add(PLO_VQF(plo_id=plo.id, vqf_item_id=vqf_by_code[vc].id))

        # Demo courses + CLO/CO/Assessment/WeeklyPlan
        for c_data in DEMO_COURSES:
            course = Course(
                program_id=program.id,
                code=c_data["code"],
                name_vn=c_data["name_vn"],
                name_en=c_data["name_en"],
                credits=c_data["credits"],
                hours_lt=c_data["hours_lt"],
                hours_th=c_data["hours_th"],
                hours_self=c_data["hours_self"],
                knowledge_group=c_data["knowledge_group"],
                semester_default=c_data["semester_default"],
                description=c_data["description"],
            )
            db.add(course)
            db.flush()

            co_by_code = {}
            for i, (co_code, co_text) in enumerate(c_data["cos"], 1):
                co = CO(course_id=course.id, code=co_code, text_vn=co_text, order=i)
                db.add(co)
                co_by_code[co_code] = co
            db.flush()

            clo_by_code = {}
            for i, (clo_code, clo_text, co_codes, pi_levels) in enumerate(c_data["clos"], 1):
                clo = CLO(course_id=course.id, code=clo_code, text_vn=clo_text, order=i)
                db.add(clo)
                clo_by_code[clo_code] = clo
                db.flush()
                for co_code in co_codes:
                    db.add(CLO_CO(clo_id=clo.id, co_id=co_by_code[co_code].id))
                for pi_code, level in pi_levels:
                    pi = next((p for p in db.query(PI).filter_by(code=pi_code).all()), None)
                    if pi:
                        db.add(CLO_PI(clo_id=clo.id, pi_id=pi.id, level=IRMALevel(level)))

            for i, (name, weight, method, clo_codes_str) in enumerate(c_data["assessments"], 1):
                asmt = Assessment(course_id=course.id, component_name=name,
                                  weight_pct=weight, method=method, order=i)
                db.add(asmt)
                db.flush()
                for clo_code in clo_codes_str.split(","):
                    if clo_code.strip() in clo_by_code:
                        db.add(Assessment_CLO(assessment_id=asmt.id,
                                              clo_id=clo_by_code[clo_code.strip()].id))

            for week, topic, lt, th, clo_codes_str in c_data["weeks"]:
                wp = WeeklyPlan(course_id=course.id, week=week, topic=topic,
                                hours_lt=lt, hours_th=th)
                db.add(wp)
                db.flush()
                for clo_code in clo_codes_str.split(","):
                    if clo_code.strip() in clo_by_code:
                        db.add(WeeklyPlan_CLO(weekly_plan_id=wp.id,
                                              clo_id=clo_by_code[clo_code.strip()].id))

        db.commit()
        print(f"[OK] Seeded program {program.code} ({program.name_vn}) for {DEMO_USER_EMAIL}")
        print(f"  - {len(POS)} POs, {len(PLOS)} PLOs, {len(PIS)} PIs")
        print(f"  - {sum(len(v) for v in PLO_PO_MATRIX.values())} PLO_PO mappings")
        print(f"  - {len(VQF_ITEMS)} VQF items, {sum(len(v) for v in PLO_VQF_MATRIX.values())} PLO_VQF mappings")
        print(f"  - {len(DEMO_COURSES)} courses")
        print(f"\n  → Login với: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
