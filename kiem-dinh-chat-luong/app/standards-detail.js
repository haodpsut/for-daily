// ─── Chi tiết 15 tiêu chuẩn / 60 tiêu chí TT26/2026/TT-BGDĐT (Phụ lục 2) ─────
// Mỗi tiêu chí có:
//   short_name         — tên ngắn cho UI tree
//   full_name          — toàn văn tiêu chí (đầu mỗi ô tiêu chí trong PL2)
//   requirements[]     — các yêu cầu tiêu chí (cột 2 trong PL2)
//   suggested_evidence[] — danh sách minh chứng gợi ý (cột 3 trong PL2)
//     { name, type, category }
//     type: loại tài liệu (official_statement | decision | report | survey | website | ...)
//   self_check_questions[] — gợi ý câu hỏi tự đánh giá khi soạn Biểu 04
//
// Pha A: pilot Tiêu chuẩn 1 (6 tiêu chí). Các TC còn lại sẽ bổ sung ở Pha B.

const STANDARDS_DETAIL = {
  "1.1": {
    short_name: "Công bố tầm nhìn, sứ mạng",
    full_name: "Lãnh đạo CSĐT công bố tầm nhìn, sứ mạng của CSĐT, bảo đảm đáp ứng nhu cầu của các bên liên quan.",
    requirements: [
      "Lãnh đạo CSĐT công bố và truyền đạt rõ ràng tầm nhìn, sứ mạng của CSĐT.",
      "Tầm nhìn và sứ mạng của CSĐT được xây dựng dựa trên phân tích nhu cầu của các bên liên quan, định hướng phát triển của địa phương/ngành/quốc gia.",
    ],
    suggested_evidence: [
      { name: "Văn bản tuyên bố chính thức về tầm nhìn, sứ mạng của CSĐT", type: "official_statement", category: "Văn bản chính sách" },
      { name: "Trang thông tin điện tử của CSĐT (ảnh chụp/URL có công bố tầm nhìn, sứ mạng)", type: "website", category: "Truyền thông" },
      { name: "Các sổ tay giảng viên, người học (có công bố tầm nhìn/sứ mạng)", type: "handbook", category: "Truyền thông" },
      { name: "Văn bản hướng dẫn xây dựng, rà soát, cải tiến tuyên bố tầm nhìn, sứ mạng", type: "guideline", category: "Văn bản chính sách" },
      { name: "Biên bản, báo cáo kết quả khảo sát các bên liên quan / tổng hợp ý kiến tham gia xây dựng, rà soát tầm nhìn, sứ mạng", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Chiến lược phát triển ngành, chiến lược KT-XH-môi trường của địa phương và quốc gia còn hiệu lực (căn cứ tham chiếu)", type: "external_doc", category: "Căn cứ pháp lý" },
    ],
    self_check_questions: [
      "CSĐT đã có văn bản tuyên bố chính thức về tầm nhìn, sứ mạng chưa? Ai ký, ngày nào?",
      "Tầm nhìn/sứ mạng có được công khai trên website và các kênh truyền thông nội bộ (sổ tay, bảng thông báo) không?",
      "Khi xây dựng tầm nhìn/sứ mạng có tham vấn bên liên quan (GV, SV, nhà tuyển dụng, cựu SV, chính quyền) không? Có biên bản/báo cáo khảo sát không?",
      "Tầm nhìn/sứ mạng có căn cứ vào chiến lược phát triển địa phương/ngành/quốc gia không?",
      "Có cơ chế định kỳ rà soát, cải tiến tầm nhìn/sứ mạng không?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT đã ban hành Quyết định số ... ngày ... về việc công bố tầm nhìn và sứ mạng. Tầm nhìn hướng đến ... Sứ mạng tập trung vào ... Quá trình xây dựng có tham vấn ... bên liên quan (SV, GV, DN, cựu SV) qua Biên bản khảo sát số ...",
      diem_manh: "VD: Tầm nhìn/sứ mạng được công bố rộng rãi qua website, sổ tay, bảng thông báo; có căn cứ chiến lược phát triển ...; định kỳ rà soát 5 năm/lần ...",
      ton_tai: "VD: Tần suất rà soát chưa đều; khảo sát bên liên quan chưa đủ đại diện; ...",
      ke_hoach: "VD: Tổ chức khảo sát cựu SV và nhà tuyển dụng vào Q...; họp HĐT rà soát tầm nhìn/sứ mạng vào năm ...",
    },
  },

  "1.2": {
    short_name: "Hệ thống quản trị",
    full_name: "CSĐT có hệ thống quản trị bao gồm hội đồng đại học/hội đồng trường (nếu có), ban giám đốc/ban giám hiệu, tổ chức Đảng, đoàn thể (nếu có), hội đồng khoa học và đào tạo, các hội đồng tư vấn, và các thành phần quản trị khác nhằm định hướng tổng thể và đảm bảo trách nhiệm giải trình, tính minh bạch, sự bền vững và giảm thiểu rủi ro.",
    requirements: [
      "CSĐT có hệ thống quản trị bao gồm các đơn vị/bộ phận được thành lập/hoạt động trong CSĐT theo quy định của Luật Giáo dục đại học.",
      "Hoạt động của hệ thống quản trị của CSĐT thể hiện sự định hướng rõ ràng trong việc xây dựng và tổ chức thực hiện các chiến lược, chính sách phát triển của CSĐT.",
      "Hệ thống quản trị có chính sách/giải pháp cụ thể và dài hạn đảm bảo trách nhiệm giải trình, tính minh bạch, sự bền vững và giảm thiểu rủi ro trong quá trình hoạt động.",
      "Vai trò và trách nhiệm của các đơn vị/bộ phận trong hệ thống quản trị được xác định rõ ràng, không chồng chéo về chức năng, nhiệm vụ và phạm vi hoạt động.",
    ],
    suggested_evidence: [
      { name: "Quyết định thành lập và biên bản/báo cáo định kỳ về hoạt động của hội đồng đại học/hội đồng trường (nếu có)", type: "decision", category: "Cơ cấu tổ chức" },
      { name: "Quyết định thành lập/công nhận các tổ chức Đảng, đoàn thể, hội đồng KH&ĐT, các hội đồng tư vấn", type: "decision", category: "Cơ cấu tổ chức" },
      { name: "Quyết định bổ nhiệm và báo cáo định kỳ về công tác của thành viên ban giám hiệu/ban giám đốc", type: "decision", category: "Nhân sự quản trị" },
      { name: "Quyết định ban hành chiến lược phát triển CSĐT", type: "decision", category: "Chiến lược" },
      { name: "Quyết định ban hành kế hoạch chiến lược, kế hoạch trung và ngắn hạn của Hiệu trưởng triển khai chiến lược", type: "decision", category: "Chiến lược" },
      { name: "Quy chế tổ chức và hoạt động của CSĐT, của HĐĐH/HĐT, các hội đồng tư vấn, tổ chức Đảng/đoàn thể", type: "regulation", category: "Văn bản chính sách" },
      { name: "Quy chế phối hợp công tác xác định vai trò, trách nhiệm các bộ phận trong hệ thống quản trị", type: "regulation", category: "Văn bản chính sách" },
      { name: "Văn bản do HĐĐH/HĐT, hiệu trưởng ban hành thể hiện tính minh bạch, trách nhiệm giải trình", type: "official_doc", category: "Văn bản chính sách" },
    ],
    self_check_questions: [
      "CSĐT có đủ các thành phần quản trị theo Luật GDĐH: HĐĐH/HĐT, Hiệu trưởng, Đảng ủy, hội đồng KH&ĐT, các hội đồng tư vấn... chưa?",
      "Có quy chế tổ chức và hoạt động được ban hành chính thức không? Còn hiệu lực không?",
      "Có quy chế phối hợp giữa các bộ phận, tránh chồng chéo chức năng không?",
      "Có báo cáo định kỳ về hoạt động của HĐĐH/HĐT, Hiệu trưởng, các hội đồng tư vấn không?",
      "Chính sách minh bạch, giải trình và giảm thiểu rủi ro thể hiện ở những văn bản nào?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT có hệ thống quản trị gồm: HĐT (theo QĐ số ...), Ban Giám hiệu (...), Đảng ủy, Công đoàn, HĐ KH&ĐT, các HĐ tư vấn. Quy chế tổ chức hoạt động ban hành theo QĐ số ..., sửa đổi lần gần nhất ...",
      diem_manh: "VD: Cơ cấu đầy đủ theo Luật; có quy chế phối hợp rõ ràng; HĐT họp định kỳ 4 lần/năm có biên bản; các báo cáo giải trình công khai trên website...",
      ton_tai: "VD: Một số HĐ tư vấn hoạt động chưa đều; cơ chế giảm thiểu rủi ro mới dừng ở văn bản khung, chưa có quy trình chi tiết...",
      ke_hoach: "VD: Rà soát quy chế tổ chức hoạt động trong Q... năm ...; xây dựng sổ tay quản trị rủi ro...",
    },
  },

  "1.3": {
    short_name: "Giá trị văn hóa, liêm chính",
    full_name: "Lãnh đạo CSĐT thúc đẩy các giá trị văn hóa nhằm đề cao tính liêm chính học thuật và hành vi chuẩn mực, bảo đảm phù hợp với tầm nhìn, sứ mạng và hướng tới việc đạt được các mục tiêu của CSĐT.",
    requirements: [
      "CSĐT công bố và thúc đẩy các giá trị văn hóa (bao gồm giá trị cốt lõi và các giá trị khác) thông qua các văn bản, chính sách và quy trình hoạt động.",
      "Các giá trị văn hóa của CSĐT đề cao tính liêm chính học thuật và hành vi chuẩn mực.",
      "Các giá trị văn hóa phù hợp với tầm nhìn, sứ mạng và hướng tới việc đạt được các mục tiêu của CSĐT.",
    ],
    suggested_evidence: [
      { name: "Văn bản tuyên bố chính thức và các hình thức phổ biến các giá trị văn hóa của CSĐT", type: "official_statement", category: "Văn bản chính sách" },
      { name: "Văn bản tuyên bố tầm nhìn, sứ mạng của CSĐT (để đối chiếu phù hợp)", type: "official_statement", category: "Văn bản chính sách" },
      { name: "Văn bản hướng dẫn tích hợp hệ giá trị văn hóa vào hoạt động dạy và học, NCKH, kết nối và phục vụ cộng đồng", type: "guideline", category: "Văn bản chính sách" },
      { name: "Văn bản giao nhiệm vụ cho đơn vị/bộ phận triển khai rà soát, cập nhật/cải tiến các giá trị văn hóa", type: "decision", category: "Văn bản chính sách" },
      { name: "Quy tắc ứng xử, quy định về liêm chính học thuật, chống đạo văn, đạo đức nghiên cứu", type: "regulation", category: "Liêm chính học thuật" },
      { name: "Các hoạt động truyền thông giá trị văn hóa (báo cáo, ảnh, video của sự kiện)", type: "report", category: "Truyền thông" },
    ],
    self_check_questions: [
      "Giá trị cốt lõi của CSĐT đã được công bố chính thức chưa? Có trong văn bản nào?",
      "Có quy định chính thức về liêm chính học thuật, chống đạo văn, quy tắc ứng xử chưa?",
      "Hệ giá trị được tích hợp vào giảng dạy, NCKH, phục vụ cộng đồng thế nào?",
      "Giá trị văn hóa có nhất quán với tầm nhìn/sứ mạng (TC 1.1) và mục tiêu chiến lược không?",
      "Có cơ chế định kỳ rà soát/cải tiến giá trị văn hóa không?",
    ],
    placeholders: {
      hien_trang: "VD: Giá trị cốt lõi của CSĐT (Liêm chính - Sáng tạo - Hội nhập) công bố theo QĐ số ... Tích hợp trong Quy chế đào tạo, Quy định về đạo đức NCKH (QĐ số ...), Sổ tay SV/GV ...",
      diem_manh: "VD: Có quy định chống đạo văn và kiểm tra qua Turnitin; quy tắc ứng xử được phổ biến đến 100% nhân sự; truyền thông qua các sự kiện định kỳ...",
      ton_tai: "VD: Thực hiện chính sách liêm chính mới tập trung ở bậc ThS/TS, chưa rộng ở ĐH; chưa có hệ thống theo dõi vi phạm tổng thể...",
      ke_hoach: "VD: Triển khai hệ thống kiểm tra đạo văn cho tất cả luận văn ĐH từ năm học ...; đào tạo liêm chính cho 100% GV mới...",
    },
  },

  "1.4": {
    short_name: "Truyền đạt và triển khai tầm nhìn",
    full_name: "Tầm nhìn, sứ mạng và các giá trị văn hóa của CSĐT được truyền đạt rõ ràng và triển khai thực hiện đến nhân sự tất cả các cấp của CSĐT.",
    requirements: [
      "Tầm nhìn, sứ mạng và văn hóa của CSĐT được triển khai thực hiện thông qua các hoạt động của CSĐT.",
      "CSĐT có xây dựng và ban hành các kế hoạch chiến lược, kế hoạch hành động trung hạn, ngắn hạn thể hiện sự nhất quán với tầm nhìn, sứ mạng.",
      "Các mục tiêu, nhiệm vụ trong kế hoạch của từng đơn vị/phòng ban và mô tả công việc của từng cá nhân được xây dựng dựa trên và gắn kết chặt chẽ với các mục tiêu chung của CSĐT.",
      "Có cơ chế để đánh giá hiệu quả các hoạt động triển khai thực hiện tầm nhìn, sứ mạng và văn hóa đến nhân sự tất cả các cấp.",
    ],
    suggested_evidence: [
      { name: "Tài liệu triển khai kế hoạch hành động, truyền thông, phổ biến tầm nhìn, sứ mạng, văn hóa đến tất cả các cấp", type: "report", category: "Truyền thông" },
      { name: "Chương trình bồi dưỡng chuyên môn nghiệp vụ có tích hợp nội dung tầm nhìn, sứ mạng, văn hóa", type: "training", category: "Đào tạo nội bộ" },
      { name: "Tài liệu họp bàn, tổng hợp ý kiến các bên liên quan tham gia xây dựng kế hoạch hành động", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Bảng/biển thông báo trong khuôn viên có tuyên bố tầm nhìn, sứ mạng, văn hóa (ảnh chụp)", type: "visual", category: "Truyền thông" },
      { name: "Trang thông tin điện tử, tài liệu giới thiệu CSĐT", type: "website", category: "Truyền thông" },
      { name: "Chiến lược phát triển, kế hoạch trung/dài hạn, kế hoạch hoạt động hằng năm", type: "strategic_plan", category: "Chiến lược" },
      { name: "Kế hoạch công tác và mô tả công việc của đơn vị/cá nhân (có liên kết với mục tiêu chung)", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo/khảo sát đánh giá hiệu quả truyền đạt tầm nhìn đến các cấp", type: "survey", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Có kế hoạch chiến lược ngắn/trung hạn bằng văn bản, thể hiện sự nhất quán với tầm nhìn/sứ mạng không?",
      "Kế hoạch công tác từng đơn vị và mô tả công việc từng vị trí có liên kết rõ với mục tiêu chung của trường không?",
      "Tầm nhìn/sứ mạng được truyền thông qua những kênh nào: website, bảng hiệu, sổ tay, các buổi họp, chương trình bồi dưỡng?",
      "Có khảo sát/đánh giá mức độ hiểu và thấm nhuần tầm nhìn/sứ mạng của GV, CB, SV không?",
      "Có minh chứng ảnh/video các buổi truyền thông, quán triệt tầm nhìn không?",
    ],
    placeholders: {
      hien_trang: "VD: Tầm nhìn, sứ mạng của CSĐT được truyền đạt qua: (i) website, sổ tay; (ii) các buổi tập huấn đầu năm cho GV mới; (iii) các bảng hiệu tại 5 điểm trong khuôn viên; (iv) tích hợp vào kế hoạch công tác của 100% đơn vị. Khảo sát năm ... cho thấy ...% CB/GV/SV biết và hiểu...",
      diem_manh: "VD: Có hệ thống truyền thông đa kênh; KPI của đơn vị gắn với mục tiêu chiến lược; khảo sát định kỳ ...",
      ton_tai: "VD: Mức độ hiểu của SV năm 1 còn thấp (...%); kế hoạch cá nhân một số đơn vị còn chung chung...",
      ke_hoach: "VD: Tổ chức Orientation Day bắt buộc cho SV năm 1 từ ...; rà soát KPI đơn vị vào ...",
    },
  },

  "1.5": {
    short_name: "Trách nhiệm xã hội",
    full_name: "Các quyết định của tổ chức quản trị được cụ thể hóa thành kế hoạch hành động và chính sách, trong đó thể hiện trách nhiệm xã hội của CSĐT nhằm bảo vệ lợi ích của các bên liên quan, cộng đồng và môi trường.",
    requirements: [
      "Các quyết định của các tổ chức trong hệ thống quản trị được chuyển hóa thành các chính sách, kế hoạch hành động cụ thể để triển khai thực hiện.",
      "Các chính sách và kế hoạch hành động thể hiện trách nhiệm xã hội của CSĐT nhằm bảo vệ lợi ích của các bên liên quan, cộng đồng và môi trường.",
      "CSĐT có cơ chế theo dõi, giám sát và báo cáo định kỳ về tiến độ và kết quả thực hiện các kế hoạch, chính sách.",
    ],
    suggested_evidence: [
      { name: "Nghị quyết/quyết định của các tổ chức trong hệ thống quản trị (HĐĐH/HĐT, Đảng ủy, ban giám hiệu...)", type: "decision", category: "Văn bản quản trị" },
      { name: "Kế hoạch hành động, chính sách và hướng dẫn thể hiện trách nhiệm xã hội của CSĐT", type: "plan", category: "Trách nhiệm xã hội" },
      { name: "Biên bản cuộc họp ban giám hiệu, HĐĐH/HĐT, hội đồng tư vấn, tổ chức Đảng, đoàn thể liên quan", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Báo cáo hằng năm về thực hiện trách nhiệm xã hội (bên liên quan, cộng đồng, môi trường)", type: "report", category: "Báo cáo định kỳ" },
      { name: "Chính sách bảo vệ môi trường, tiết kiệm năng lượng, phát triển bền vững của CSĐT", type: "policy", category: "Môi trường" },
      { name: "Hoạt động phục vụ cộng đồng, đóng góp xã hội (báo cáo, hình ảnh, tài liệu)", type: "report", category: "Cộng đồng" },
      { name: "Cơ chế tiếp nhận, xử lý khiếu nại/phản hồi từ các bên liên quan", type: "procedure", category: "Các bên liên quan" },
    ],
    self_check_questions: [
      "Các quyết định quan trọng của HĐT/Đảng ủy có được cụ thể hóa bằng kế hoạch hành động cụ thể không?",
      "CSĐT có chính sách bảo vệ môi trường, phát triển bền vững không?",
      "Có hoạt động phục vụ cộng đồng (tình nguyện, chuyển giao công nghệ, đào tạo miễn phí...) không?",
      "Có cơ chế tiếp nhận phản hồi, khiếu nại từ SV/GV/cộng đồng không?",
      "Có báo cáo định kỳ về tiến độ thực hiện các kế hoạch, công khai không?",
    ],
    placeholders: {
      hien_trang: "VD: QĐ số ... của HĐT về chiến lược được cụ thể hóa bằng ... kế hoạch hành động. Chính sách bảo vệ môi trường theo QĐ số ... triển khai từ ... Hoạt động phục vụ cộng đồng năm gồm: ... (ảnh/báo cáo). Báo cáo giám sát định kỳ hằng quý ...",
      diem_manh: "VD: Có bộ chỉ tiêu KPI về trách nhiệm xã hội; báo cáo được công khai; các chương trình cộng đồng có quy mô lớn (ví dụ ...)...",
      ton_tai: "VD: Chính sách môi trường chưa đo lường định lượng (ví dụ tiết kiệm điện, giảm thải); cơ chế phản hồi còn phân tán...",
      ke_hoach: "VD: Áp dụng bộ chỉ số SDG cho trường trong năm ...; triển khai hotline phản hồi tập trung...",
    },
  },

  "1.6": {
    short_name: "Cải tiến hệ thống quản trị",
    full_name: "Hệ thống quản trị của CSĐT được cải tiến để nâng cao hiệu quả hoạt động và quản lý rủi ro tốt hơn.",
    requirements: [
      "CSĐT có cơ chế định kỳ đánh giá hiệu quả hoạt động của các thành phần trong hệ thống quản trị.",
      "Nhân sự tham gia các đơn vị, bộ phận của hệ thống quản trị được đào tạo, bồi dưỡng, đánh giá, điều chỉnh và/hoặc luân chuyển để nâng cao năng lực, tăng hiệu quả hoạt động và quản lý rủi ro tốt hơn.",
      "Hệ thống văn bản của hệ thống quản trị để tổ chức, quản lý CSĐT được định kỳ rà soát, điều chỉnh để phù hợp với các thay đổi trong cơ cấu tổ chức và quản trị của CSĐT, với các quy định của pháp luật.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch rà soát, điều chỉnh cơ cấu tổ chức, chức năng, nhiệm vụ của các tổ chức, đơn vị, bộ phận", type: "plan", category: "Cải tiến" },
      { name: "Báo cáo tổng kết, đánh giá hằng năm; báo cáo giữa nhiệm kỳ; báo cáo cuối nhiệm kỳ của các tổ chức, đơn vị", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo đánh giá về cơ cấu tổ chức, chức năng nhiệm vụ của các đơn vị, bộ phận của hệ thống quản trị", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Biên bản kiểm tra, báo cáo đánh giá của các tổ chức cấp trên", type: "audit", category: "Giám sát ngoài" },
      { name: "Nhận xét, đánh giá về năng lực lãnh đạo, quản lý của nhân sự tham gia các tổ chức quản trị", type: "evaluation", category: "Nhân sự quản trị" },
      { name: "Báo cáo rà soát về các văn bản của hệ thống quản trị", type: "report", category: "Văn bản quản trị" },
      { name: "Quyết định thành lập/giải thể/điều chỉnh chức năng nhiệm vụ của đơn vị, bộ phận", type: "decision", category: "Cơ cấu tổ chức" },
      { name: "Quyết định bổ nhiệm/bãi nhiệm, điều chuyển nhân sự của hệ thống quản trị", type: "decision", category: "Nhân sự quản trị" },
      { name: "Các phiên bản khác nhau của văn bản hệ thống quản trị (before/after cải tiến)", type: "document_history", category: "Cải tiến" },
      { name: "Chương trình tập huấn, bồi dưỡng nhân sự của hệ thống quản trị", type: "training", category: "Đào tạo nội bộ" },
      { name: "Báo cáo về cải thiện hiệu quả hoạt động và giảm thiểu rủi ro trước và sau cải tiến (so sánh số liệu)", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Có cơ chế/quy trình định kỳ đánh giá hiệu quả hoạt động HĐT, ban giám hiệu, các phòng ban không? Tần suất?",
      "Nhân sự quản trị có được bồi dưỡng, đào tạo nâng cao năng lực không? Có bằng chứng chương trình tập huấn?",
      "Văn bản quản trị có được rà soát định kỳ (ví dụ 3 năm/lần) không? Có phiên bản before/after cải tiến để so sánh?",
      "Có số liệu cụ thể chứng minh hiệu quả tăng, rủi ro giảm sau cải tiến không? (Ví dụ: số cuộc họp giảm, thời gian ra quyết định rút ngắn...)",
      "Có kiểm tra/đánh giá từ cấp trên (Bộ, Sở) không? Kết quả?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT có quy trình định kỳ đánh giá HĐT 2 năm/lần, ban giám hiệu 1 năm/lần (theo QĐ số ...). Trong kỳ ..., đã cải tiến: (i) ban hành Quy chế tổ chức hoạt động phiên bản mới (QĐ số ...); (ii) tập huấn nâng cao năng lực cho ... CB quản trị; (iii) cải thiện chỉ số ... từ X→Y...",
      diem_manh: "VD: Có chương trình tập huấn lãnh đạo định kỳ; có quy trình rà soát văn bản 3 năm/lần; số liệu cụ thể cho thấy giảm ...% rủi ro...",
      ton_tai: "VD: Chưa có hệ thống đánh giá 360° cho nhân sự quản trị; một số văn bản cũ chưa được cập nhật sau khi Luật sửa đổi...",
      ke_hoach: "VD: Triển khai đánh giá 360° cho nhân sự cấp trưởng/phó từ năm ...; rà soát toàn bộ văn bản quản trị để phù hợp Luật GDĐH sửa đổi ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 2: Lãnh đạo và chiến lược ═══════════════

  "2.1": {
    short_name: "Cơ cấu tổ chức quản lý",
    full_name: "CSĐT có cơ cấu tổ chức quản lý với các vai trò và trách nhiệm được xác định rõ ràng, bảo đảm thông tin được trao đổi thông suốt và đa chiều.",
    requirements: [
      "CSĐT có cơ cấu tổ chức được xác định rõ ràng.",
      "Vai trò, trách nhiệm của các chủ thể được phân định rõ ràng, thể hiện trong quy chế tổ chức và hoạt động của CSĐT, được xây dựng theo quy định của pháp luật.",
      "Hệ thống thông tin nội bộ minh bạch và hiệu quả, bảo đảm thông tin được trao đổi thông suốt và đa chiều.",
    ],
    suggested_evidence: [
      { name: "Văn bản ban hành cơ cấu tổ chức của CSĐT", type: "decision", category: "Cơ cấu tổ chức" },
      { name: "Sơ đồ/cơ cấu tổ chức của CSĐT", type: "visual", category: "Cơ cấu tổ chức" },
      { name: "Quy chế tổ chức và hoạt động của CSĐT, của đơn vị trực thuộc (nếu có)", type: "regulation", category: "Văn bản chính sách" },
      { name: "Văn bản quy định vị trí, chức năng, nhiệm vụ, quyền hạn của các đơn vị; quy chế làm việc/phối hợp công tác của Đảng ủy, ban giám hiệu, các phòng ban, khoa, viện, trung tâm", type: "regulation", category: "Văn bản chính sách" },
      { name: "Đề án việc làm, các quyết định liên quan đến nhân sự tham gia cơ cấu quản lý", type: "decision", category: "Nhân sự quản trị" },
      { name: "Nghị quyết của Đảng ủy, HĐĐH/HĐT (nếu có); biên bản họp giao ban định kỳ giữa ban giám hiệu và các đơn vị", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Các kênh thông tin nội bộ chính thức: Website, họp giao ban, email nội bộ, hệ thống quản lý văn bản điện tử", type: "website", category: "Truyền thông" },
      { name: "Kết quả khảo sát GV, nhân viên, người học về hiệu quả truyền thông nội bộ", type: "survey", category: "Khảo sát - góp ý" },
    ],
    self_check_questions: [
      "Cơ cấu tổ chức đã được ban hành chính thức qua văn bản nào? Sơ đồ tổ chức có được công khai không?",
      "Quy chế tổ chức & hoạt động quy định chức năng, nhiệm vụ mỗi đơn vị có rõ ràng, không chồng chéo không?",
      "Các kênh thông tin nội bộ (website, email, hệ thống QLVB) có vận hành hiệu quả không? Có khảo sát mức độ hài lòng của CB/GV không?",
      "Thông tin trao đổi 2 chiều (từ trên xuống + phản hồi từ dưới lên) được thực hiện qua cơ chế nào?",
    ],
    placeholders: {
      hien_trang: "VD: Cơ cấu tổ chức CSĐT ban hành theo QĐ số ..., gồm: HĐT, Ban Giám hiệu, 5 phòng, 3 khoa, 2 trung tâm. Quy chế TC&HĐ ban hành theo QĐ số ..., quy định rõ chức năng, nhiệm vụ. Các kênh truyền thông nội bộ: website nội bộ, email chung, hệ thống QLVB điện tử, họp giao ban hằng tuần.",
      diem_manh: "VD: Cơ cấu tổ chức rõ ràng, được công khai trên website; hệ thống QLVB đã số hóa 100%; họp giao ban định kỳ có biên bản.",
      ton_tai: "VD: Một số đơn vị có chức năng chồng chéo (vd khoa A và trung tâm B); phản hồi 2 chiều từ GV chưa thực hiện định kỳ.",
      ke_hoach: "VD: Rà soát chức năng các đơn vị Q... năm ...; tổ chức khảo sát hiệu quả truyền thông nội bộ hằng năm.",
    },
  },

  "2.2": {
    short_name: "Rà soát cơ cấu tổ chức",
    full_name: "Cơ cấu tổ chức quản lý được rà soát định kỳ nhằm nâng cao hiệu quả hoạt động và kết quả vận hành của CSĐT.",
    requirements: [
      "CSĐT thiết lập và thực hiện quy định, quy trình và kế hoạch rà soát định kỳ cơ cấu tổ chức quản lý theo chu kỳ xác định hoặc khi có thay đổi về chiến lược.",
      "CSĐT có đánh giá hiệu quả hoạt động của đội ngũ lãnh đạo, quản lý nhằm nâng cao hiệu quả hoạt động và kết quả vận hành.",
      "CSĐT có các chương trình đào tạo/phát triển năng lực lãnh đạo và quy hoạch nhân sự kế thừa.",
    ],
    suggested_evidence: [
      { name: "Quy định/quy trình, kế hoạch rà soát cơ cấu tổ chức; quy hoạch/chủ trương xây dựng, bồi dưỡng đội ngũ lãnh đạo, quản lý", type: "regulation", category: "Cải tiến" },
      { name: "Báo cáo rà soát cơ cấu tổ chức quản lý trong giai đoạn đánh giá", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Văn bản góp ý từ khoa, phòng, đơn vị, hội nghị viên chức hoặc hội đồng khoa học và đào tạo", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Quyết định thành lập/sáp nhập/chia tách đơn vị chức năng, phân công lại nhiệm vụ (nếu có)", type: "decision", category: "Cơ cấu tổ chức" },
      { name: "Kết luận thanh tra/kiểm tra chỉ ra bất cập về tổ chức và các điều chỉnh sau đó (nếu có)", type: "audit", category: "Giám sát ngoài" },
      { name: "Khảo sát đánh giá hiệu quả trước và sau khi điều chỉnh cơ cấu tổ chức (nếu có)", type: "survey", category: "Đánh giá hiệu quả" },
      { name: "Chương trình, kế hoạch đào tạo/bồi dưỡng năng lực lãnh đạo; quy hoạch nhân sự kế thừa", type: "training", category: "Đào tạo nội bộ" },
    ],
    self_check_questions: [
      "Có quy trình rà soát cơ cấu tổ chức định kỳ (vd 3-5 năm/lần)? Đã thực hiện bao nhiêu lần trong chu kỳ đánh giá?",
      "Có chương trình bồi dưỡng năng lực lãnh đạo cho cấp trưởng/phó không? Số lượt tham gia?",
      "Có quy hoạch nhân sự kế thừa (succession planning) cho vị trí then chốt không?",
      "Kết quả đánh giá hiệu quả trước/sau cải tiến có số liệu định lượng không?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT ban hành QĐ số ... về rà soát cơ cấu tổ chức chu kỳ 3 năm. Đã thực hiện ... lần trong giai đoạn ..., kết quả: sáp nhập ... đơn vị, điều chỉnh chức năng ..., bồi dưỡng ... lượt cán bộ lãnh đạo.",
      diem_manh: "VD: Có quy trình rà soát chuẩn hóa; số liệu cải tiến rõ ràng (X → Y); quy hoạch kế thừa cho 100% vị trí chủ chốt.",
      ton_tai: "VD: Chương trình bồi dưỡng lãnh đạo chủ yếu tập trung cấp trưởng, chưa rộng ở cấp phó; tần suất rà soát chưa đều.",
      ke_hoach: "VD: Mở rộng đối tượng bồi dưỡng sang cấp phó từ ...; xây dựng chương trình leadership pipeline ...",
    },
  },

  "2.3": {
    short_name: "Kế hoạch chiến lược",
    full_name: "Các kế hoạch chiến lược ngắn, trung và dài hạn được triển khai nhằm đáp ứng các nhu cầu về đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng; quá trình xây dựng kế hoạch có tính đến năng lực nội tại cũng như các cơ hội và thách thức từ bên ngoài.",
    requirements: [
      "CSĐT có quy trình xây dựng kế hoạch chiến lược, bao gồm việc phân tích bối cảnh (năng lực nội tại, cơ hội, thách thức) và tham vấn, tiếp thu ý kiến từ các bên liên quan.",
      "Các kế hoạch chiến lược (ngắn, trung, dài hạn) liên kết chặt chẽ với nhau và bao phủ toàn diện các lĩnh vực cốt lõi: đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
      "CSĐT có hệ thống/cơ chế để triển khai, theo dõi, đánh giá định kỳ và cải tiến liên tục việc thực hiện các kế hoạch chiến lược.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch chiến lược tổng thể đã được cấp có thẩm quyền phê duyệt", type: "strategic_plan", category: "Chiến lược" },
      { name: "Kế hoạch trung hạn cho đào tạo, NCKH, kết nối và phục vụ cộng đồng", type: "strategic_plan", category: "Chiến lược" },
      { name: "Kế hoạch năm học, kế hoạch công tác hằng năm của từng đơn vị", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Tài liệu phân tích SWOT hoặc PESTLE", type: "report", category: "Phân tích bối cảnh" },
      { name: "Biên bản họp, khảo sát lấy ý kiến các bên liên quan về xây dựng kế hoạch chiến lược", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Quyết định phê duyệt kế hoạch và Kế hoạch hành động đi kèm", type: "decision", category: "Chiến lược" },
      { name: "Báo cáo theo dõi/đánh giá thực hiện kế hoạch qua từng năm", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Kế hoạch chiến lược có đủ 3 cấp: ngắn/trung/dài hạn không? Có nhất quán với nhau không?",
      "Quá trình xây dựng có phân tích SWOT/PESTLE không? Có tham vấn các bên liên quan (SV/GV/DN/đối tác) không?",
      "Kế hoạch có bao phủ đủ 4 mảng cốt lõi: đào tạo, NCKH, phục vụ cộng đồng, quản trị không?",
      "Có cơ chế theo dõi tiến độ thực hiện định kỳ (hằng quý/năm)? Có điều chỉnh khi cần?",
    ],
    placeholders: {
      hien_trang: "VD: Kế hoạch chiến lược giai đoạn ...-... ban hành theo QĐ số ... Quá trình xây dựng có phân tích SWOT (tài liệu ...); tham vấn qua ... cuộc họp và khảo sát ... người. Bao phủ 4 mảng: đào tạo (KPIs ...), NCKH (...), phục vụ cộng đồng (...), quản trị (...).",
      diem_manh: "VD: Kế hoạch toàn diện, có SWOT bài bản; bảo đảm tham vấn đa đối tượng; báo cáo tiến độ hằng quý công khai.",
      ton_tai: "VD: Chỉ báo một số KPI còn định tính, chưa đo lường chặt; điều chỉnh giữa kỳ chưa có quy trình chuẩn.",
      ke_hoach: "VD: Chuyển ... KPI định tính → định lượng từ ...; ban hành quy trình điều chỉnh giữa kỳ ...",
    },
  },

  "2.4": {
    short_name: "KPIs chiến lược",
    full_name: "Các chỉ số chính nhằm đánh giá hiệu quả thực hiện (KPIs) và các chỉ tiêu được thiết lập nhằm đo lường mức độ thực hiện các mục tiêu chiến lược của CSĐT.",
    requirements: [
      "CSĐT xác lập các chỉ tiêu/KPIs cụ thể (định lượng, định tính rõ ràng) cho từng mục tiêu chiến lược về đào tạo, nghiên cứu khoa học, phục vụ cộng đồng, chuyển đổi số, phát triển nhân sự.",
      "CSĐT có phân công đơn vị/nhân sự phụ trách theo dõi, đánh giá và cập nhật KPIs định kỳ.",
    ],
    suggested_evidence: [
      { name: "Danh sách KPIs theo từng mảng: đào tạo, NCKH (ISI/Scopus, SHTT, NVKHCN...), phục vụ cộng đồng, chuyển đổi số, phát triển nhân sự", type: "policy", category: "KPIs" },
      { name: "Tài liệu hướng dẫn triển khai KPIs cho các đơn vị (biểu mẫu, quy trình xây dựng, cách đo lường)", type: "guideline", category: "KPIs" },
      { name: "Biểu mẫu theo dõi KPIs, báo cáo tổng hợp theo năm (số liệu, biểu đồ thể hiện mức độ đạt/chưa đạt)", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản họp về đánh giá mức độ thực hiện các mục tiêu chiến lược", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Hệ thống theo dõi tiến độ thực hiện KPIs (Excel, phần mềm KPIs, dashboard)", type: "visual", category: "Công cụ theo dõi" },
      { name: "Văn bản điều chỉnh các chỉ số, chỉ tiêu chiến lược (nếu có)", type: "decision", category: "Cải tiến" },
    ],
    self_check_questions: [
      "CSĐT có bộ KPIs đầy đủ cho 5 mảng: đào tạo, NCKH, cộng đồng, chuyển đổi số, nhân sự không?",
      "KPIs có cụ thể, đo lường được (SMART) không? VD: tỉ lệ tốt nghiệp ≥ 85%, ISI/Scopus ≥ 0.3 bài/GV/năm?",
      "Có đơn vị/nhân sự cụ thể phụ trách theo dõi KPIs không? Bao lâu báo cáo 1 lần?",
      "Có dashboard/phần mềm theo dõi KPIs real-time hay chỉ Excel thủ công?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT có bộ KPIs gồm ... chỉ số trên 5 mảng, ban hành theo QĐ số ... Phòng ĐBCL phụ trách theo dõi, báo cáo hằng quý. Kết quả năm ...: đạt ...% KPIs, ví dụ: ISI/Scopus đạt ... so chỉ tiêu ...",
      diem_manh: "VD: Có dashboard KPIs tự động; báo cáo hằng quý đầy đủ; điều chỉnh chỉ tiêu linh hoạt khi cần.",
      ton_tai: "VD: Một số KPIs mới ở dạng Excel thủ công, chưa có dashboard tích hợp; KPIs về chuyển đổi số còn sơ lược.",
      ke_hoach: "VD: Triển khai phần mềm KPIs tích hợp từ Q... năm ...; bổ sung chi tiết KPIs chuyển đổi số...",
    },
  },

  "2.5": {
    short_name: "Phổ biến & triển khai chiến lược",
    full_name: "Kế hoạch chiến lược được phổ biến và triển khai tới tất cả các cấp quản lý và nhân sự trong CSĐT, gắn với mục tiêu công việc của từng cá nhân.",
    requirements: [
      "CSĐT phổ biến kế hoạch chiến lược đến các cấp quản lý và nhân sự trong CSĐT.",
      "Các đơn vị xây dựng kế hoạch năm học, kế hoạch hành động dựa trên kế hoạch chiến lược, đảm bảo tính nhất quán.",
      "Mỗi cá nhân có nhiệm vụ cụ thể gắn với kế hoạch của đơn vị nhằm thúc đẩy sự liên kết và tính trách nhiệm chung.",
      "CSĐT có cơ chế giám sát và đánh giá định kỳ việc triển khai và kết quả thực hiện các kế hoạch hành động ở cấp đơn vị và cấp quản lý, gắn kết với việc đánh giá hiệu quả làm việc của đội ngũ lãnh đạo, quản lý.",
    ],
    suggested_evidence: [
      { name: "Tài liệu phổ biến Kế hoạch chiến lược: văn bản, biên bản hội nghị, bản tóm tắt", type: "official_doc", category: "Truyền thông" },
      { name: "Website nội bộ có đăng tải kế hoạch chiến lược", type: "website", category: "Truyền thông" },
      { name: "Kế hoạch công tác năm học (đào tạo, NCKH, phục vụ cộng đồng, CSVC), kế hoạch triển khai chiến lược của các đơn vị", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Phiếu giao nhiệm vụ/bản phân công công việc của từng cá nhân đầu năm học cho viên chức, người lao động", type: "plan", category: "Phân công nhiệm vụ" },
      { name: "Báo cáo kết quả thực hiện kế hoạch cá nhân cuối năm", type: "report", category: "Báo cáo định kỳ" },
      { name: "Minh chứng nhận thức của CB/GV về kế hoạch chiến lược (khảo sát, phỏng vấn)", type: "survey", category: "Đánh giá hiệu quả" },
      { name: "Biên bản họp sơ kết/kiểm tra, đánh giá thực hiện kế hoạch chiến lược", type: "meeting_minutes", category: "Hồ sơ họp" },
    ],
    self_check_questions: [
      "Kế hoạch chiến lược phổ biến đến 100% CB/GV qua những kênh nào?",
      "Mỗi cá nhân có bản phân công công việc đầu năm gắn với mục tiêu đơn vị không?",
      "Có khảo sát mức độ hiểu/nhận thức của CB/GV về chiến lược không?",
      "Đánh giá thực hiện nhiệm vụ cá nhân cuối năm có liên kết với KPIs đơn vị không?",
    ],
    placeholders: {
      hien_trang: "VD: Chiến lược được phổ biến qua: (i) Hội nghị CBVC đầu năm học; (ii) Website nội bộ; (iii) Tập huấn GV mới. 100% CB/GV có bản phân công nhiệm vụ đầu năm. Khảo sát năm ...: ...% CB/GV hiểu rõ chiến lược.",
      diem_manh: "VD: Hệ thống truyền thông đa kênh; 100% cá nhân có KPI gắn với mục tiêu đơn vị; đánh giá cuối năm dựa trên KPI.",
      ton_tai: "VD: Mức độ hiểu chiến lược ở nhân viên phục vụ còn thấp (...%); liên kết KPI cá nhân ↔ đơn vị chưa chặt ở một số phòng.",
      ke_hoach: "VD: Tổ chức workshop chuyên đề chiến lược cho nhân viên phục vụ ...; rà soát bộ KPI cá nhân theo chuẩn SMART ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 3: Nguồn nhân lực ═══════════════

  "3.1": {
    short_name: "Quy hoạch nhân lực",
    full_name: "Quy hoạch nguồn nhân lực cho đội ngũ giảng viên, nghiên cứu viên, chuyên viên, nhân viên, kỹ thuật viên được thực hiện nhằm đáp ứng các nhu cầu về đào tạo, NCKH, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT có quy hoạch, bao gồm cả ngắn hạn và dài hạn về nguồn nhân lực (tuyển dụng, điều động, luân chuyển, bổ nhiệm, miễn nhiệm, nghỉ hưu...) căn cứ nhu cầu về đào tạo, NCKH, kết nối và phục vụ cộng đồng.",
      "CSĐT phát triển nguồn nhân lực theo quy hoạch, tuân thủ các quy định hiện hành và đáp ứng sứ mạng, tầm nhìn, kế hoạch chiến lược của CSĐT.",
      "CSĐT có đánh giá tính hiệu quả việc thực hiện quy hoạch nguồn nhân lực sau mỗi giai đoạn nhằm cải tiến chất lượng và đáp ứng các nhu cầu phát triển.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy hoạch/kế hoạch (ngắn hạn và dài hạn) phát triển nguồn nhân lực của CSĐT", type: "strategic_plan", category: "Quy hoạch nhân lực" },
      { name: "Văn bản hướng dẫn triển khai quy hoạch/kế hoạch phát triển nguồn nhân lực", type: "guideline", category: "Văn bản chính sách" },
      { name: "Báo cáo phân tích, đánh giá nhu cầu nguồn nhân lực và hiệu quả thực hiện quy hoạch", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Chiến lược phát triển đội ngũ/đề án vị trí việc làm", type: "strategic_plan", category: "Đề án VTVL" },
      { name: "Dữ liệu nguồn nhân lực: cơ cấu tuổi, giới tính, trình độ; hoạt động đào tạo/NCKH/phục vụ cộng đồng của đội ngũ", type: "report", category: "Dữ liệu nhân sự" },
      { name: "Các nghị quyết, quyết định về công tác nhân sự của Đảng ủy, HĐT/HĐĐH (nếu có)", type: "decision", category: "Nhân sự quản trị" },
    ],
    self_check_questions: [
      "CSĐT có quy hoạch nhân lực ngắn hạn (1 năm) + dài hạn (5 năm) văn bản hóa không?",
      "Quy hoạch có căn cứ vào chiến lược và bao phủ cả giảng viên, NCV, chuyên viên, nhân viên, kỹ thuật viên không?",
      "Có đánh giá hiệu quả quy hoạch sau mỗi giai đoạn không?",
      "Cơ cấu tuổi/giới tính/trình độ GV có cân đối và phù hợp quy hoạch không?",
    ],
    placeholders: {
      hien_trang: "VD: Quy hoạch nhân lực giai đoạn ... theo QĐ số ..., xác định tăng ... GV TS, ... ThS. Đề án VTVL ban hành QĐ số ... Đã triển khai: tuyển ... GV, bổ nhiệm ... trưởng phó đơn vị. Tỷ lệ GV TS hiện tại ...%.",
      diem_manh: "VD: Quy hoạch chi tiết cho 5 đối tượng nhân sự; đáp ứng ... % chỉ tiêu trong giai đoạn; cơ cấu trình độ GV cải thiện rõ.",
      ton_tai: "VD: Tuyển dụng NCV chưa đạt chỉ tiêu; cân đối giới tính trong một số khoa chưa đều.",
      ke_hoach: "VD: Tăng cường truyền thông tuyển dụng NCV quốc tế từ ...; chính sách thu hút nữ GV trong ngành kỹ thuật ...",
    },
  },

  "3.2": {
    short_name: "Thăng tiến & bổ nhiệm",
    full_name: "Hệ thống thăng tiến và bổ nhiệm các chức danh của đội ngũ giảng viên được thiết lập và vận hành hiệu quả.",
    requirements: [
      "CSĐT có chính sách về thăng tiến; có văn bản quy định rõ ràng về quy trình, tiêu chí tuyển dụng và lựa chọn, tiêu chí thăng tiến và bổ nhiệm các chức danh của đội ngũ giảng viên.",
      "Các văn bản quy định được phổ biến rộng rãi bằng nhiều hình thức khác nhau.",
      "Các quy trình thăng tiến và bổ nhiệm được triển khai minh bạch, được đánh giá về hiệu quả thực hiện.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định về quy trình, tiêu chí tuyển dụng và lựa chọn; tiêu chí thăng tiến và bổ nhiệm", type: "regulation", category: "Văn bản chính sách" },
      { name: "Trang thông tin điện tử có phổ biến các quy trình, quy định, tiêu chí tuyển dụng, đề bạt, thăng tiến, bổ nhiệm", type: "website", category: "Truyền thông" },
      { name: "Quyết định tuyển dụng, hợp đồng lao động; hồ sơ giảng viên; văn bằng/chứng chỉ/chứng nhận", type: "decision", category: "Nhân sự quản trị" },
      { name: "Hệ thống văn bản quy định về công tác đánh giá giảng viên", type: "regulation", category: "Đánh giá hiệu quả" },
      { name: "Báo cáo đánh giá đội ngũ giảng viên, đánh giá mức độ hiệu quả của quy trình thăng tiến và bổ nhiệm hằng năm", type: "report", category: "Báo cáo định kỳ" },
      { name: "Nghị quyết, quyết định, biên bản họp về công tác nhân sự của Đảng ủy, HĐT/HĐĐH", type: "meeting_minutes", category: "Hồ sơ họp" },
    ],
    self_check_questions: [
      "Tiêu chí thăng tiến/bổ nhiệm có được ban hành bằng văn bản và công khai không?",
      "Quy trình tuyển dụng có bao gồm công khai → xét duyệt → phỏng vấn → phê duyệt không? Thời gian trung bình?",
      "Tỷ lệ GV được đề bạt đúng hạn theo quy hoạch là bao nhiêu?",
      "Có đánh giá hiệu quả quy trình hằng năm, có điều chỉnh không?",
    ],
    placeholders: {
      hien_trang: "VD: Quy định thăng tiến/bổ nhiệm GV theo QĐ số ..., quy trình gồm 5 bước công khai. Đã tuyển dụng ... GV, thăng chức ... người trong giai đoạn. Website công khai tiêu chí. Báo cáo hằng năm chỉ ra ...% quy trình đạt thời gian kế hoạch.",
      diem_manh: "VD: Quy trình minh bạch; công khai website; báo cáo đánh giá hằng năm chỉ ra xu hướng cải thiện.",
      ton_tai: "VD: Thời gian xử lý hồ sơ thăng tiến một số lĩnh vực dài hơn dự kiến; chưa có hệ thống số hóa hồ sơ.",
      ke_hoach: "VD: Triển khai e-HR cho quy trình thăng tiến từ ...; chuẩn hóa thời gian xử lý tối đa ... tuần.",
    },
  },

  "3.3": {
    short_name: "Khung năng lực",
    full_name: "Năng lực của đội ngũ giảng viên, nghiên cứu viên, chuyên viên, nhân viên, kỹ thuật viên bao gồm cả kỹ năng lãnh đạo được xác định, chuẩn hóa và triển khai.",
    requirements: [
      "CSĐT có bản mô tả/khung năng lực, bao gồm cả kỹ năng lãnh đạo, của đội ngũ GV, NCV, chuyên viên, nhân viên, kỹ thuật viên.",
      "CSĐT định kỳ rà soát, cập nhật quy định về các tiêu chuẩn/khung năng lực.",
      "Năng lực bao gồm cả kỹ năng lãnh đạo được đánh giá và sử dụng trong tuyển dụng và thăng tiến.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định/xác định các tiêu chuẩn/khung năng lực của đội ngũ GV, NCV, chuyên viên, nhân viên, kỹ thuật viên", type: "regulation", category: "Khung năng lực" },
      { name: "Bản mô tả vị trí việc làm (có yêu cầu năng lực) của các nhóm nhân sự", type: "policy", category: "Đề án VTVL" },
      { name: "Kế hoạch chiến lược CSĐT có kế hoạch nguồn nhân lực; đề án vị trí việc làm", type: "strategic_plan", category: "Chiến lược" },
      { name: "Báo cáo ý kiến phản hồi của các bên liên quan về tiêu chuẩn năng lực", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Báo cáo kết quả đánh giá năng lực đội ngũ theo quy định", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Báo cáo rà soát, cập nhật các tiêu chuẩn năng lực", type: "report", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có khung năng lực cho từng nhóm nhân sự (GV/NCV/chuyên viên/kỹ thuật viên) không?",
      "Khung năng lực có bao gồm kỹ năng lãnh đạo cho vị trí quản lý không?",
      "Có dùng khung năng lực khi tuyển dụng và đánh giá thăng tiến không?",
      "Tần suất rà soát khung năng lực?",
    ],
    placeholders: {
      hien_trang: "VD: Khung năng lực ban hành theo QĐ số ..., gồm 5 nhóm đối tượng, mỗi nhóm có 4-6 năng lực cốt lõi + kỹ năng lãnh đạo. Đã áp dụng trong tuyển dụng ... năm, rà soát lần gần nhất ...",
      diem_manh: "VD: Khung năng lực chi tiết; áp dụng nhất quán trong tuyển dụng + đánh giá; rà soát định kỳ 3 năm/lần.",
      ton_tai: "VD: Khung năng lực chưa phân cấp độ (novice/advanced); đánh giá năng lực còn dựa nhiều vào ý kiến chủ quan.",
      ke_hoach: "VD: Bổ sung thang đo cấp độ năng lực 4 mức từ ...; triển khai đánh giá 360° cho ... nhóm đối tượng.",
    },
  },

  "3.4": {
    short_name: "Đào tạo bồi dưỡng",
    full_name: "Nhu cầu đào tạo, bồi dưỡng, phát triển đội ngũ giảng viên, nghiên cứu viên, chuyên viên, nhân viên, kỹ thuật viên được xác định và có các hoạt động được triển khai để đáp ứng nhu cầu này.",
    requirements: [
      "CSĐT có quy trình xác định nhu cầu đào tạo, bồi dưỡng của đội ngũ ở các cấp, phù hợp yêu cầu công việc và định hướng phát triển.",
      "Kế hoạch đào tạo, bồi dưỡng được xây dựng dựa trên yêu cầu hoạt động đào tạo, NCKH, phục vụ cộng đồng, nhu cầu phát triển chuyên môn của đội ngũ và phù hợp kế hoạch chiến lược.",
      "Các kế hoạch đào tạo, bồi dưỡng được triển khai thực hiện đầy đủ.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch ngắn/trung/dài hạn về đào tạo, bồi dưỡng và phát triển chuyên môn cho đội ngũ", type: "training", category: "Đào tạo nội bộ" },
      { name: "Hồ sơ xác định nhu cầu đào tạo, bồi dưỡng hằng năm", type: "report", category: "Đào tạo nội bộ" },
      { name: "Hồ sơ triển khai hoạt động đào tạo, bồi dưỡng, NCKH, phục vụ cộng đồng và phát triển chuyên môn", type: "report", category: "Đào tạo nội bộ" },
      { name: "Báo cáo/phản hồi của đội ngũ về mức độ hiệu quả các hoạt động đào tạo, bồi dưỡng", type: "survey", category: "Đánh giá hiệu quả" },
      { name: "Dữ liệu trình độ chuyên môn, kết quả NCKH, phục vụ cộng đồng trước/sau khi triển khai đào tạo", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Kinh phí dành cho đào tạo, bồi dưỡng, phát triển đội ngũ hằng năm và theo giai đoạn", type: "report", category: "Tài chính đào tạo" },
    ],
    self_check_questions: [
      "Có quy trình xác định nhu cầu đào tạo cá nhân hằng năm không (vd: form đánh giá đầu năm)?",
      "Kế hoạch đào tạo có phân bổ theo mục tiêu chiến lược (đào tạo / NCKH / cộng đồng) không?",
      "Tỷ lệ GV được đào tạo, bồi dưỡng hằng năm? Ngân sách % tổng thu nhập?",
      "Có đo hiệu quả sau đào tạo (so sánh trước/sau)?",
    ],
    placeholders: {
      hien_trang: "VD: Quy trình xác định nhu cầu đào tạo theo QĐ số ... Kế hoạch đào tạo năm ...: ... lớp nội bộ, ... khóa bên ngoài, kinh phí ... đồng. Tỷ lệ CB/GV tham gia đào tạo ...%. Hiệu quả sau đào tạo: số bài báo ISI tăng ..., điểm đánh giá GV cải thiện ...",
      diem_manh: "VD: Kinh phí đào tạo chiếm ...% tổng thu; đo hiệu quả sau đào tạo có số liệu rõ; tỷ lệ tham gia cao.",
      ton_tai: "VD: Đào tạo kỹ năng mềm cho đội ngũ hỗ trợ còn ít; chưa có KPI đo lường ROI đào tạo.",
      ke_hoach: "VD: Mở rộng chương trình kỹ năng mềm cho ... đối tượng; thí điểm đo ROI đào tạo qua ... chỉ số...",
    },
  },

  "3.5": {
    short_name: "Đánh giá & khen thưởng",
    full_name: "Hệ thống quản lý thực hiện hiệu quả nhiệm vụ, bao gồm chế độ khen thưởng, ghi nhận và kế hoạch đào tạo, bồi dưỡng, phát triển đội ngũ được triển khai để thúc đẩy và hỗ trợ các hoạt động đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT có hệ thống, quy trình, tiêu chí, chỉ số và hướng dẫn rõ ràng để đánh giá hiệu quả công việc của nhân sự tất cả các cấp, gắn kết với KPIs và mục tiêu chiến lược.",
      "Việc đánh giá kết quả công việc được thực hiện công khai, minh bạch, công bằng và truyền thông đến toàn thể đội ngũ.",
      "CSĐT có dữ liệu và báo cáo kết quả đánh giá hiệu quả công việc được sử dụng làm căn cứ cho việc ra quyết định.",
      "Kết quả đánh giá hiệu quả được sử dụng có hệ thống trong thi đua khen thưởng và công nhận.",
    ],
    suggested_evidence: [
      { name: "Quy trình, tiêu chí đánh giá hiệu quả công việc của nhân sự tất cả các cấp", type: "regulation", category: "Đánh giá hiệu quả" },
      { name: "Hồ sơ/báo cáo về sự tham gia của nhân sự trong quá trình xây dựng tiêu chí, quy trình đánh giá", type: "meeting_minutes", category: "Tham vấn nội bộ" },
      { name: "Dữ liệu/báo cáo kết quả đánh giá hiệu quả công việc của nhân sự tất cả các cấp", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hệ thống đánh giá và hệ thống khen thưởng; chế độ, chính sách thi đua, khen thưởng", type: "policy", category: "Khen thưởng" },
      { name: "Dữ liệu, báo cáo kết quả thi đua, khen thưởng", type: "report", category: "Khen thưởng" },
      { name: "Kế hoạch và kinh phí đầu tư đào tạo, bồi dưỡng dựa trên kết quả đánh giá", type: "training", category: "Đào tạo nội bộ" },
      { name: "Dữ liệu thống kê các nghiên cứu và công bố; hoạt động đào tạo, kết nối, phục vụ cộng đồng của nhân sự", type: "report", category: "Dữ liệu nhân sự" },
    ],
    self_check_questions: [
      "Có quy trình đánh giá viên chức hằng năm chuẩn hóa không? Tiêu chí có SMART không?",
      "Kết quả đánh giá có được dùng làm căn cứ thăng tiến / tăng lương / khen thưởng không?",
      "Tỷ lệ CB/GV đạt HTXSNV, HTTNV trong năm gần nhất? Có phân bố hợp lý không?",
      "Có khảo sát mức độ hài lòng của CB/GV về tính công bằng của đánh giá không?",
    ],
    placeholders: {
      hien_trang: "VD: Quy trình đánh giá VC hằng năm theo QĐ số ..., tiêu chí gắn với KPI cá nhân. Năm ...: ...% HTXSNV, ...% HTTNV. Khen thưởng dựa trên kết quả đánh giá: ... HC, ... cá nhân. Kế hoạch đào tạo năm sau ưu tiên ... đối tượng KHCN.",
      diem_manh: "VD: Quy trình đánh giá chuẩn hóa, SMART; kết quả dùng làm căn cứ đa mục đích; tính công bằng khảo sát cao.",
      ton_tai: "VD: Tỷ lệ HTXSNV một số đơn vị trên 60%, khó phân biệt; chưa có cơ chế review ngang hàng.",
      ke_hoach: "VD: Chuẩn hóa phân bố HTXSNV theo curve từ ...; thí điểm peer review ở ... khoa...",
    },
  },

  // ═══════════════ Tiêu chuẩn 4: Nguồn lực tài chính và vật chất ═══════════════

  "4.1": {
    short_name: "Quản lý tài chính",
    full_name: "Hệ thống quản lý tài chính hoạt động hiệu quả trong việc lập kế hoạch, triển khai, kiểm toán và cải tiến việc sử dụng các nguồn lực tài chính, nhằm hỗ trợ CSĐT trong việc thực hiện tầm nhìn, sứ mạng và các mục tiêu chiến lược, đồng thời tuân thủ quy định của pháp luật.",
    requirements: [
      "CSĐT có quy định, quy trình, công cụ hỗ trợ quản lý tài chính/sử dụng ngân sách phù hợp quy định pháp luật.",
      "Kế hoạch tài chính được xây dựng/điều chỉnh với sự tham gia chủ động của các bên liên quan, ban hành chính thức, phù hợp tầm nhìn, sứ mạng, mục tiêu chiến lược.",
      "Các kế hoạch tài chính/ngân sách được triển khai, kiểm tra, giám sát, đánh giá định kỳ và kiểm toán theo quy định nhằm đảm bảo minh bạch và trách nhiệm giải trình.",
    ],
    suggested_evidence: [
      { name: "Văn bản chính thức về tầm nhìn, sứ mạng và mục tiêu chiến lược của CSĐT", type: "official_statement", category: "Chiến lược" },
      { name: "Quy chế, quy định tài chính/quy chế chi tiêu nội bộ", type: "regulation", category: "Văn bản tài chính" },
      { name: "Quy định, quy trình, phần mềm hỗ trợ quản lý tài chính/sử dụng ngân sách", type: "procedure", category: "Công cụ quản lý" },
      { name: "Kế hoạch tài chính dài hạn/trung hạn và kế hoạch tài chính hằng năm", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo quyết toán tài chính các năm; báo cáo rà soát, đánh giá hiệu quả thực hiện", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo/kết quả kiểm toán", type: "audit", category: "Kiểm toán" },
      { name: "Văn bản sửa đổi, bổ sung để cải tiến quy định, quy trình quản lý tài chính", type: "regulation", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Quy chế chi tiêu nội bộ ban hành năm nào? Có cập nhật khi có thay đổi chính sách không?",
      "Kế hoạch tài chính có được HĐT phê duyệt không? Có công khai đến CB/GV không?",
      "Có kiểm toán độc lập định kỳ không? Kết quả kiểm toán gần nhất?",
      "Có phần mềm quản lý tài chính hay dùng Excel? Mức tự động hóa?",
    ],
    placeholders: {
      hien_trang: "VD: Quy chế chi tiêu nội bộ ban hành QĐ số ..., sửa đổi năm ... Kế hoạch tài chính hằng năm được HĐT phê duyệt. Kiểm toán độc lập năm ... cho kết quả ... Phần mềm quản lý tài chính ... đã triển khai toàn CSĐT.",
      diem_manh: "VD: Quy chế chi tiêu đầy đủ, cập nhật kịp thời; kiểm toán hằng năm đạt; phần mềm quản lý số hóa.",
      ton_tai: "VD: Một số dự án ngân sách chậm tiến độ giải ngân; chưa có dashboard tài chính real-time cho lãnh đạo.",
      ke_hoach: "VD: Triển khai dashboard tài chính từ Q... năm ...; quy trình giải ngân rút gọn cho dự án nhỏ ...",
    },
  },

  "4.2": {
    short_name: "Cơ sở vật chất & hạ tầng",
    full_name: "Việc lập kế hoạch, bảo trì, nâng cấp và mở rộng cơ sở vật chất, hạ tầng được thực hiện hiệu quả nhằm đáp ứng nhu cầu hiện tại và tương lai của CSĐT về đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT có quy hoạch tổng thể và kế hoạch (dài/trung hạn, hằng năm) về bảo trì, nâng cấp/mở rộng CSVC, hạ tầng, ban hành chính thức, phù hợp kế hoạch chiến lược.",
      "Kế hoạch bảo trì, nâng cấp và mở rộng CSVC được thực hiện hiệu quả; có tổng kết, đánh giá đáp ứng nhu cầu hiện tại và dự báo tương lai; đáp ứng các chuẩn chất lượng CSVC theo quy định.",
      "Các bên liên quan (đơn vị đào tạo, NCKH, phục vụ cộng đồng, người học) đánh giá CSVC đáp ứng nhu cầu.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch hằng năm, kế hoạch chiến lược về đào tạo, NCKH, kết nối và phục vụ cộng đồng", type: "strategic_plan", category: "Chiến lược" },
      { name: "Quy hoạch tổng thể, sơ đồ, chỉ dẫn mặt bằng các khu vực chức năng", type: "visual", category: "CSVC" },
      { name: "Kế hoạch hằng năm, trung/dài hạn của CSĐT về phát triển CSVC, hạ tầng", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo đầu tư xây dựng - sửa chữa qua các năm; báo cáo tổng kết kết quả thực hiện kế hoạch bảo trì, nâng cấp và mở rộng CSVC", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hồ sơ lấy ý kiến phản hồi của các bên liên quan về việc đáp ứng nhu cầu (phiếu hỏi, bản tổng hợp)", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Quy hoạch/kế hoạch phát triển CSVC, hạ tầng điều chỉnh (nếu có)", type: "plan", category: "Cải tiến" },
      { name: "Số liệu minh chứng CSVC, hạ tầng được cải tiến/phát triển trong chu kỳ đánh giá", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Có quy hoạch tổng thể CSVC văn bản hóa không? Còn hiệu lực?",
      "Ngân sách bảo trì/nâng cấp CSVC chiếm bao nhiêu % tổng chi hằng năm?",
      "Có khảo sát mức hài lòng của SV/GV về CSVC (phòng học, lab, thư viện) không? Điểm?",
      "CSVC đáp ứng các chuẩn Bộ GD&ĐT như diện tích/SV, số chỗ ngồi thư viện/SV không?",
    ],
    placeholders: {
      hien_trang: "VD: Quy hoạch CSVC giai đoạn ... theo QĐ số ... Ngân sách bảo trì hằng năm ...% tổng chi. Khảo sát SV năm ...: ...% hài lòng với phòng học, ...% với thư viện. Diện tích sàn/SV ... m², đáp ứng chuẩn Bộ.",
      diem_manh: "VD: Quy hoạch chi tiết; ngân sách bảo trì ổn định; điểm hài lòng SV cao; đáp ứng vượt chuẩn Bộ.",
      ton_tai: "VD: Một số lab thực hành cũ cần nâng cấp; khu KTX chưa đủ chỗ cho SV năm 1.",
      ke_hoach: "VD: Nâng cấp ... lab trọng điểm từ năm ...; xây thêm ... chỗ KTX giai đoạn ...",
    },
  },

  "4.3": {
    short_name: "Hạ tầng CNTT",
    full_name: "CSĐT có hệ thống vận hành hiệu quả trong việc lập kế hoạch, bảo trì, đánh giá và nâng cấp cơ sở hạ tầng công nghệ thông tin và kết nối mạng, đáp ứng nhu cầu hiện tại của CSĐT và dự báo về đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT có quy định, quy trình về lập kế hoạch, bảo trì, đánh giá và nâng cấp cơ sở hạ tầng CNTT (phần cứng, phần mềm, an toàn, an ninh mạng).",
      "Kế hoạch dài/trung/hằng năm về bảo trì, nâng cấp CSHT CNTT được xây dựng, ban hành, phù hợp chiến lược và thực hiện hiệu quả.",
      "Các bên liên quan đánh giá CSHT CNTT đáp ứng nhu cầu.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch hằng năm, kế hoạch chiến lược về đào tạo, NCKH, kết nối và phục vụ cộng đồng", type: "strategic_plan", category: "Chiến lược" },
      { name: "Danh mục thiết bị CNTT và bản mô tả hạ tầng CNTT, hạ tầng mạng", type: "report", category: "CSHT CNTT" },
      { name: "Kế hoạch dài/trung hạn, hằng năm về phát triển CSHT CNTT", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Hợp đồng dịch vụ/bảo trì, nhật ký sửa chữa, nâng cấp; báo cáo tổng kết thực hiện kế hoạch", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hồ sơ lấy ý kiến phản hồi của các bên liên quan về CSHT CNTT", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Kế hoạch điều chỉnh; văn bản cải tiến quy trình phát triển CSHT CNTT", type: "plan", category: "Cải tiến" },
      { name: "Số liệu minh chứng CSHT CNTT được cải tiến/phát triển", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Băng thông Internet/SV là bao nhiêu Mbps? Đáp ứng chuẩn?",
      "LMS, HRIS, FMIS, cổng SV, cổng GV đã triển khai đủ chưa?",
      "Có chính sách an toàn/an ninh mạng (firewall, backup, DRP) không?",
      "Khảo sát mức hài lòng của GV/SV về dịch vụ CNTT?",
    ],
    placeholders: {
      hien_trang: "VD: Băng thông Internet ... Mbps, tương đương ... Mbps/SV. Các hệ thống đã triển khai: LMS (năm ...), HRIS (...), FMIS (...). Chính sách ATTT ban hành QĐ số ..., có backup hằng ngày + DRP. Khảo sát năm ...: ...% hài lòng CNTT.",
      diem_manh: "VD: Băng thông dư dả; hệ thống số hóa đầy đủ; ATTT chuẩn hóa; khảo sát dương tính.",
      ton_tai: "VD: Một số module LMS tính năng phân tích CLO còn hạn chế; phần cứng máy trạm tại lab cũ.",
      ke_hoach: "VD: Nâng cấp LMS module CLO Q... năm ...; thay thế ... máy trạm lab ưu tiên...",
    },
  },

  "4.4": {
    short_name: "Nguồn lực học thuật",
    full_name: "CSĐT có hệ thống vận hành hiệu quả trong việc lập kế hoạch, bảo trì, đánh giá và cải tiến các nguồn lực học thuật như thư viện, học liệu giảng dạy, cơ sở dữ liệu trực tuyến nhằm đáp ứng nhu cầu hiện tại của CSĐT và dự báo về đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT có quy định, quy trình về bảo trì, phát triển, đánh giá, cải tiến các nguồn lực học thuật.",
      "Kế hoạch dài/trung/hằng năm về bảo trì, phát triển nguồn lực học thuật (tài chính và nhân lực) được xây dựng, ban hành, phù hợp chiến lược và thực hiện hiệu quả.",
      "Các bên liên quan đánh giá nguồn lực học thuật đáp ứng nhu cầu.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch hằng năm, kế hoạch chiến lược về đào tạo, NCKH, phục vụ cộng đồng", type: "strategic_plan", category: "Chiến lược" },
      { name: "Danh mục các loại nguồn lực học thuật đã và đang sử dụng", type: "report", category: "Nguồn lực học thuật" },
      { name: "Kế hoạch dài/trung/hằng năm của CSĐT về phát triển nguồn lực học thuật", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo tổng kết thực hiện kế hoạch bảo trì và cải tiến nguồn lực học thuật", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hồ sơ lấy ý kiến phản hồi của các bên liên quan", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Kế hoạch điều chỉnh; văn bản cải tiến quy trình phát triển nguồn lực học thuật", type: "plan", category: "Cải tiến" },
      { name: "Số liệu minh chứng nguồn lực học thuật được cập nhật, truy cập, cải tiến", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Số đầu sách giấy + ebook của thư viện? Cập nhật hằng năm bao nhiêu?",
      "Có đăng ký CSDL quốc tế (IEEE, Springer, Elsevier) không? Số lượng?",
      "Tỷ lệ SV/GV truy cập tài nguyên học thuật hằng năm?",
      "Có học liệu mở nội bộ (OER) do GV CSĐT tạo không?",
    ],
    placeholders: {
      hien_trang: "VD: Thư viện CSĐT có ... đầu sách, ... ebook, đăng ký CSDL ... (IEEE, Springer, ScienceDirect). Cập nhật hằng năm ... đầu sách. Tỷ lệ truy cập: ...% SV, ...% GV. OER nội bộ: ... bài.",
      diem_manh: "VD: Bộ CSDL quốc tế đa dạng; tỷ lệ truy cập cao; đã có OER nội bộ.",
      ton_tai: "VD: Số đầu sách chuyên ngành hẹp còn thiếu; OER nội bộ chưa tập trung (phân tán cá nhân).",
      ke_hoach: "VD: Đầu tư ... đầu sách chuyên ngành ... từ ...; chuẩn hóa platform OER tập trung...",
    },
  },

  "4.5": {
    short_name: "Môi trường, y tế, an toàn",
    full_name: "Hệ thống lập kế hoạch, triển khai, đánh giá và cải tiến các điều kiện môi trường, y tế, an toàn và khả năng tiếp cận cho người có nhu cầu đặc biệt được vận hành hiệu quả; bảo đảm tuân thủ quy định pháp luật.",
    requirements: [
      "CSĐT có quy định, quy trình về điều kiện, đánh giá và cải tiến các yếu tố môi trường, y tế, an toàn và khả năng tiếp cận cho người có nhu cầu đặc biệt, phù hợp quy định pháp luật.",
      "Kế hoạch đảm bảo các điều kiện được xây dựng, ban hành, tuân thủ pháp luật và triển khai hiệu quả.",
      "Đại diện các bên liên quan (gồm người có nhu cầu đặc biệt, bên ngoài CSĐT) được tham gia ý kiến, đánh giá các điều kiện.",
      "Ý kiến phản hồi được dùng làm cơ sở cải tiến.",
    ],
    suggested_evidence: [
      { name: "Quy định, quy trình về đảm bảo điều kiện, đánh giá và cải tiến các yếu tố môi trường, y tế, an toàn, tiếp cận", type: "regulation", category: "Văn bản chính sách" },
      { name: "Kế hoạch đảm bảo các điều kiện môi trường, y tế, an toàn, tiếp cận cho người có nhu cầu đặc biệt", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Kết quả kiểm định môi trường, báo cáo PCCC, báo cáo y tế học đường, hợp đồng liên quan", type: "audit", category: "Kiểm tra chất lượng" },
      { name: "Báo cáo tổng kết/đánh giá hằng năm về thực hiện kế hoạch", type: "report", category: "Báo cáo định kỳ" },
      { name: "Danh mục thiết bị hỗ trợ người có nhu cầu đặc biệt; khóa học, tập huấn liên quan", type: "report", category: "Người khuyết tật" },
      { name: "Hồ sơ lấy ý kiến phản hồi của các bên liên quan về môi trường, y tế, an toàn, thuận tiện", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Kế hoạch điều chỉnh, văn bản cải tiến quy định/quy trình", type: "plan", category: "Cải tiến" },
      { name: "Số liệu thực tế về điều kiện môi trường, y tế, an toàn, tiếp cận đã cải thiện", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Có kế hoạch PCCC hằng năm + diễn tập không?",
      "Phòng y tế học đường có đủ nhân sự, thiết bị theo quy định không?",
      "Có lối đi/thiết bị hỗ trợ cho người khuyết tật (ramp, elevator, nhà vệ sinh) không?",
      "Có khảo sát mức hài lòng về an toàn, sức khỏe không?",
    ],
    placeholders: {
      hien_trang: "VD: Kế hoạch PCCC năm ... theo QĐ số ..., diễn tập ... lần/năm. Phòng y tế học đường đạt chuẩn Bộ Y tế. Có ... lối đi / ramp cho người khuyết tật, ... nhà vệ sinh tiếp cận. Kiểm định môi trường năm ... đạt tiêu chuẩn. Khảo sát SV: ...% hài lòng.",
      diem_manh: "VD: PCCC chuẩn hóa; phòng y tế đầy đủ; khả năng tiếp cận bao phủ các tòa chính; khảo sát dương tính.",
      ton_tai: "VD: Một số khu cũ chưa có thang máy; chưa có nhân viên hỗ trợ chuyên trách cho người khuyết tật.",
      ke_hoach: "VD: Lắp thang máy khu ... Q... năm ...; tuyển nhân viên hỗ trợ khuyết tật ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 5: Các mạng lưới và quan hệ đối ngoại ═══════════════

  "5.1": {
    short_name: "Chính sách đối ngoại",
    full_name: "CSĐT có các chính sách, kế hoạch chiến lược và quy trình để tăng cường quan hệ đối ngoại, phát triển mạng lưới và quan hệ đối tác với doanh nghiệp, hiệp hội nghề nghiệp, cựu người học, các tổ chức chính phủ và phi chính phủ trong và ngoài nước.",
    requirements: [
      "CSĐT có chính sách, nguồn lực và kế hoạch chiến lược về hoạt động quan hệ và mạng lưới đối ngoại phù hợp tầm nhìn, sứ mạng và mục tiêu chiến lược.",
      "Kế hoạch chiến lược/các kế hoạch về đối ngoại bao quát mục tiêu, đối tác và lĩnh vực hợp tác chủ yếu, KPIs, thời gian và nguồn lực, lộ trình triển khai với DN, hiệp hội nghề nghiệp, cựu người học, tổ chức chính phủ/phi chính phủ trong và ngoài nước.",
      "CSĐT thiết lập các quy trình cần thiết cho hoạt động đối ngoại, bao gồm cơ chế giám sát, đánh giá, rà soát và cải tiến định kỳ.",
    ],
    suggested_evidence: [
      { name: "Văn bản ban hành chính sách về hoạt động quan hệ đối ngoại, phát triển mạng lưới và quan hệ đối tác", type: "policy", category: "Đối ngoại" },
      { name: "Kế hoạch chiến lược về hoạt động quan hệ đối ngoại, phát triển mạng lưới và quan hệ đối tác", type: "strategic_plan", category: "Chiến lược" },
      { name: "Các quy trình về hoạt động quan hệ đối ngoại, phát triển mạng lưới và quan hệ đối tác", type: "procedure", category: "Đối ngoại" },
      { name: "Cổng thông tin điện tử công khai chính sách, kế hoạch, quy trình về đối ngoại", type: "website", category: "Truyền thông" },
      { name: "Tài liệu liên quan đến xây dựng, hoàn thiện chính sách, kế hoạch, quy trình về đối ngoại", type: "meeting_minutes", category: "Hồ sơ họp" },
    ],
    self_check_questions: [
      "Có chính sách đối ngoại được ban hành bằng văn bản chính thức không?",
      "Kế hoạch đối ngoại có KPIs cụ thể (vd: số MOU ký mới, số hội thảo quốc tế, số GV trao đổi) không?",
      "Có phân loại đối tác theo nhóm (DN, hiệp hội, cựu SV, tổ chức CP/NGO, quốc tế) không?",
      "Có quy trình ký MOU/MOA chuẩn hóa không? Thời gian xử lý?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách đối ngoại ban hành QĐ số ... Kế hoạch 5 năm xác định ... MOU/năm với DN, ... chương trình với hiệp hội, ... hội thảo quốc tế/năm. Đã ký ... MOU hiện hành, phủ ... quốc gia.",
      diem_manh: "VD: Mạng lưới đối tác đa dạng; KPIs rõ; quy trình MOU chuẩn hóa ... ngày.",
      ton_tai: "VD: MOU với tổ chức quốc tế châu lục ... còn ít; kết nối cựu SV chưa có hệ thống tập trung.",
      ke_hoach: "VD: Mở rộng MOU với ... từ năm ...; triển khai platform alumni ...",
    },
  },

  "5.2": {
    short_name: "Triển khai đối ngoại",
    full_name: "Các kế hoạch đối ngoại của CSĐT được triển khai và phù hợp với việc đạt được tầm nhìn, sứ mạng và các mục tiêu chiến lược của CSĐT.",
    requirements: [
      "Các kế hoạch chiến lược/dài/trung/ngắn hạn về đối ngoại được triển khai và giám sát.",
      "CSĐT đánh giá tính phù hợp của chính sách và kết quả thực hiện với tầm nhìn, sứ mạng, mục tiêu chiến lược; cải tiến dựa trên kết quả đánh giá, rà soát.",
    ],
    suggested_evidence: [
      { name: "Văn bản tuyên bố tầm nhìn, sứ mạng; chiến lược của CSĐT", type: "official_statement", category: "Chiến lược" },
      { name: "Kế hoạch chiến lược, dài/trung/ngắn hạn về đối ngoại", type: "strategic_plan", category: "Chiến lược" },
      { name: "Báo cáo rà soát, đánh giá định kỳ việc triển khai kế hoạch đối ngoại", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo/biên bản/tài liệu rà soát, đánh giá việc đạt được tầm nhìn, sứ mạng, mục tiêu", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Các biên bản thỏa thuận hợp tác (MOU, MOA)", type: "official_doc", category: "Đối tác" },
      { name: "Báo cáo/biên bản rà soát các MOU, MOA", type: "report", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Số MOU đã triển khai thực tế (có hoạt động) / tổng số đã ký là bao nhiêu?",
      "Có báo cáo định kỳ đánh giá tỷ lệ đạt KPIs đối ngoại không?",
      "Các kết quả đối ngoại (GV trao đổi, SV trao đổi, đồng nghiên cứu) có số liệu cụ thể không?",
      "Có sử dụng kết quả để cải tiến chiến lược đối ngoại không?",
    ],
    placeholders: {
      hien_trang: "VD: Trong giai đoạn ...: triển khai ...% MOU đã ký, cụ thể: ... GV trao đổi, ... SV trao đổi, ... công bố đồng tác giả. Báo cáo rà soát hằng năm chỉ ra: ... KPIs đạt, ... chưa đạt, đã điều chỉnh ...",
      diem_manh: "VD: Tỷ lệ triển khai MOU cao (... %); số GV/SV trao đổi tăng ...% so kỳ trước; có cơ chế rà soát chuẩn.",
      ton_tai: "VD: Một số MOU với DN chưa đi vào thực chất (chỉ dừng ký kết); thiếu hoạt động đồng nghiên cứu.",
      ke_hoach: "VD: Xây dựng quy trình activate MOU từ ...; ưu tiên đồng nghiên cứu với ... đối tác chiến lược...",
    },
  },

  // ═══════════════ Tiêu chuẩn 6: Các chính sách về đào tạo ═══════════════

  "6.1": {
    short_name: "Tuyển sinh",
    full_name: "Các kế hoạch, chính sách và tiêu chí tuyển chọn người học vào từng chương trình đào tạo được xây dựng, triển khai, giám sát và cải tiến nhằm bảo đảm tính phù hợp và hiệu quả.",
    requirements: [
      "Đề án tuyển sinh được ban hành, phù hợp mục tiêu của CTĐT, đúng quy định hiện hành và được cập nhật hằng năm.",
      "CSĐT có chính sách và hoạt động tuyển sinh phù hợp để thu hút người học.",
      "Tiêu chí và quy trình tuyển chọn được công bố công khai và thực hiện đúng quy định.",
      "CSĐT giám sát, định kỳ đánh giá và cải tiến chính sách, kế hoạch tuyển sinh dựa trên dữ liệu từ các bên liên quan và phân tích kết quả tuyển sinh.",
    ],
    suggested_evidence: [
      { name: "Đề án tuyển sinh và kế hoạch tuyển sinh hằng năm", type: "plan", category: "Tuyển sinh" },
      { name: "Quy trình, tiêu chí tuyển chọn người học được công bố công khai trên website, tài liệu hướng dẫn", type: "website", category: "Truyền thông" },
      { name: "Cơ sở dữ liệu, thống kê kết quả tuyển sinh hằng năm, phân tích đầu vào", type: "report", category: "Dữ liệu tuyển sinh" },
      { name: "Báo cáo giám sát và đánh giá kết quả tuyển sinh", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản họp, báo cáo phân tích dữ liệu tuyển sinh, phản hồi của người học, phụ huynh, doanh nghiệp", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch cải tiến chính sách tuyển sinh dựa trên kết quả giám sát", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Đề án tuyển sinh được công khai trên website từ bao lâu trước đợt tuyển sinh?",
      "Tỷ lệ tuyển đạt chỉ tiêu trong 3 năm gần nhất?",
      "Điểm đầu vào trung bình có xu hướng thế nào? Có phân tích theo ngành/khu vực?",
      "Có khảo sát lý do chọn trường của SV mới không?",
    ],
    placeholders: {
      hien_trang: "VD: Đề án tuyển sinh hằng năm công khai trên website trước ... tháng. Năm ...: chỉ tiêu ..., trúng tuyển ..., nhập học ..., đạt ...% chỉ tiêu. Điểm chuẩn TB ...",
      diem_manh: "VD: Tỷ lệ tuyển đạt > 95%; điểm đầu vào tăng; có khảo sát lý do chọn trường công khai hằng năm.",
      ton_tai: "VD: Một số ngành tuyển chưa đạt chỉ tiêu (< 80%); chưa có phân tích nguồn SV theo khu vực địa lý chi tiết.",
      ke_hoach: "VD: Tăng truyền thông ngành ... từ Q...; triển khai hệ thống BI phân tích nguồn SV...",
    },
  },

  "6.2": {
    short_name: "Thiết kế & rà soát CTĐT",
    full_name: "CSĐT có quy trình thiết kế và phát triển chương trình đào tạo, trong đó chuẩn đầu ra của tất cả các chương trình đào tạo được xây dựng, triển khai, rà soát và cập nhật một cách có hệ thống, để phù hợp với nhu cầu của các bên liên quan.",
    requirements: [
      "CSĐT có quy trình thiết kế, phát triển, rà soát, đánh giá và cập nhật CTĐT đáp ứng các quy định, đảm bảo sự tham gia của các bên liên quan, theo nguyên tắc giáo dục theo đầu ra (OBE).",
      "Tất cả CTĐT được thiết kế, rà soát, đánh giá và cập nhật đáp ứng quy định về chuẩn CTĐT và khung trình độ quốc gia Việt Nam.",
      "Giảng viên tham gia trong quá trình xây dựng, rà soát, đánh giá và cập nhật CTĐT và có năng lực phù hợp.",
      "CSĐT có cơ chế đảm bảo tất cả CTĐT được thiết kế, rà soát, đánh giá và cập nhật theo quy trình đã thiết lập và có chất lượng.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy trình thiết kế, phát triển và rà soát CTĐT", type: "procedure", category: "CTĐT" },
      { name: "Tài liệu chuẩn đầu ra của các CTĐT", type: "official_doc", category: "Chuẩn đầu ra" },
      { name: "Báo cáo phân tích nhu cầu thị trường và các bên liên quan làm cơ sở xây dựng chuẩn đầu ra", type: "report", category: "Nhu cầu thị trường" },
      { name: "Biên bản họp hội đồng CTĐT, hội đồng khoa học, các cuộc họp lấy ý kiến DN, người học về chuẩn đầu ra", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Báo cáo rà soát, cập nhật CTĐT theo chu kỳ", type: "report", category: "Rà soát CTĐT" },
      { name: "Phiếu khảo sát, phản hồi của người học, cựu người học, nhà tuyển dụng về chuẩn đầu ra và CTĐT", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Hồ sơ, biên bản họp và báo cáo liên quan đến rà soát, cập nhật CTĐT", type: "meeting_minutes", category: "Hồ sơ họp" },
    ],
    self_check_questions: [
      "Tất cả CTĐT đã có chuẩn đầu ra (PLO) công bố chính thức chưa?",
      "Chu kỳ rà soát CTĐT là bao lâu (hằng năm/2 năm/5 năm)?",
      "Có lấy ý kiến DN + cựu SV khi rà soát CTĐT không? Tỷ lệ phản hồi?",
      "CTĐT có tương thích khung trình độ quốc gia VN không? Có minh chứng?",
    ],
    placeholders: {
      hien_trang: "VD: Quy trình thiết kế/rà soát CTĐT ban hành QĐ số ... 100% CTĐT có PLO công bố. Chu kỳ rà soát 2 năm/lần. Đã rà soát ... CTĐT trong giai đoạn, có tham vấn ... DN và ... cựu SV.",
      diem_manh: "VD: 100% CTĐT theo OBE; có bản mapping PLO ↔ Khung trình độ quốc gia; tham vấn DN bài bản.",
      ton_tai: "VD: Một số CTĐT chưa cập nhật chuẩn nghề nghiệp mới nhất; tỷ lệ phản hồi DN còn thấp (< 30%).",
      ke_hoach: "VD: Cập nhật CTĐT ... theo chuẩn mới từ ...; xây dựng network DN cố định để tăng tỷ lệ phản hồi ...",
    },
  },

  "6.3": {
    short_name: "Hoạt động dạy & học",
    full_name: "CSĐT có hệ thống để lựa chọn các hoạt động dạy và học phù hợp với triết lý giáo dục và đạt được các chuẩn đầu ra.",
    requirements: [
      "Triết lý giáo dục được phát biểu phù hợp, giúp giảng viên và người học triển khai các hoạt động dạy và học phù hợp để đạt chuẩn đầu ra.",
      "CSĐT có chính sách, quy định, hướng dẫn và quy trình phù hợp thực hiện triết lý giáo dục, đảm bảo giảng viên hiểu thấu đáo và chuyển tải vào hoạt động dạy và học.",
      "CSĐT có chính sách, hệ thống và quy trình để đảm bảo giảng viên lựa chọn và triển khai hoạt động dạy và học phù hợp để người học đạt được chuẩn đầu ra.",
      "CSĐT đảm bảo giảng viên có năng lực thiết kế và triển khai hoạt động dạy và học hiệu quả.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy trình lựa chọn và tổ chức hoạt động dạy và học", type: "procedure", category: "Dạy và học" },
      { name: "Kế hoạch giảng dạy chi tiết theo từng học phần, chương trình", type: "plan", category: "Dạy và học" },
      { name: "Báo cáo giám sát, đánh giá chất lượng dạy học", type: "report", category: "Giám sát chất lượng" },
      { name: "Phiếu khảo sát ý kiến người học, giảng viên về phương pháp dạy học", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Hồ sơ tập huấn, bồi dưỡng giảng viên về phương pháp giảng dạy", type: "training", category: "Đào tạo nội bộ" },
      { name: "Biên bản họp hội đồng KH&ĐT, hội đồng xây dựng và thẩm định CTĐT, họp khoa/bộ môn về lựa chọn phương pháp", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Hồ sơ quy trình, kế hoạch giảng dạy, báo cáo giám sát và phản hồi", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Triết lý giáo dục của CSĐT được phát biểu chính thức ở văn bản nào?",
      "Có chương trình tập huấn về phương pháp dạy học cho GV mới và định kỳ không?",
      "Tỷ lệ học phần áp dụng Active Learning (PBL, case study, flipped classroom)?",
      "Có khảo sát SV về phương pháp giảng dạy không? Điểm trung bình?",
    ],
    placeholders: {
      hien_trang: "VD: Triết lý giáo dục ban hành QĐ số ..., theo hướng ... (Outcome-based, Learner-centered, Active Learning). Hằng năm tập huấn ... lượt GV về phương pháp. ...% học phần áp dụng Active Learning. Khảo sát SV năm ...: điểm ...",
      diem_manh: "VD: Triết lý rõ ràng; tập huấn GV chuẩn hóa; Active Learning phủ > 60% học phần; điểm khảo sát SV cao.",
      ton_tai: "VD: Một số GV kỳ cựu còn duy trì lecture thuần; ứng dụng LMS chưa đồng đều.",
      ke_hoach: "VD: Chương trình mentor cho GV kỳ cựu về phương pháp mới từ ...; chuẩn hóa tối thiểu LMS usage ...",
    },
  },

  "6.4": {
    short_name: "Giám sát & cải tiến dạy học",
    full_name: "Các hoạt động dạy và học được giám sát và đánh giá nhằm bảo đảm chất lượng và cải tiến chất lượng.",
    requirements: [
      "Quy trình và công cụ giám sát, đánh giá và cải tiến các hoạt động dạy và học được ban hành và thực hiện nhất quán.",
      "Phản hồi từ người học, giảng viên và các bên liên quan về chất lượng hoạt động dạy và học được thu thập định kỳ, phân tích và sử dụng để cải tiến.",
      "Kế hoạch cải tiến dựa trên kết quả đánh giá được xây dựng, triển khai, giám sát và truyền thông kết quả cải tiến đến các bên liên quan.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy trình giám sát và đánh giá hoạt động dạy và học", type: "procedure", category: "Giám sát chất lượng" },
      { name: "Phiếu khảo sát, bảng thu thập ý kiến người học, giảng viên, nhà tuyển dụng", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Báo cáo phân tích kết quả khảo sát, đánh giá chất lượng dạy học", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản họp hội đồng khoa học, hội đồng quản lý CTĐT về kết quả giám sát và cải tiến", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch cải tiến và báo cáo thực hiện cải tiến chất lượng dạy học", type: "plan", category: "Cải tiến" },
      { name: "Hồ sơ theo dõi kết quả các đợt cải tiến", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Quy trình khảo sát SV cuối học phần có chuẩn hóa không? Tỷ lệ SV tham gia?",
      "Có dự giờ GV không? Ai dự và tần suất?",
      "Kết quả khảo sát có được dùng để cải tiến/khuyến cáo GV cụ thể không?",
      "Có minh chứng cải tiến sau phản hồi (vd: GV X thay đổi phương pháp → điểm tăng)?",
    ],
    placeholders: {
      hien_trang: "VD: Khảo sát SV sau mỗi học phần (>90% SV tham gia). Dự giờ GV 1 lần/học kỳ bởi trưởng bộ môn. Phân tích hằng kỳ cho các khoa. Năm ...: ... học phần có kế hoạch cải tiến, triển khai ...% hoàn thành.",
      diem_manh: "VD: Tỷ lệ phản hồi SV cao; dự giờ đầy đủ; minh chứng cải tiến có số liệu rõ.",
      ton_tai: "VD: Phản hồi từ DN và cựu SV còn rời rạc, chưa định kỳ; cơ chế đối thoại GV-SV sau khảo sát còn hình thức.",
      ke_hoach: "VD: Triển khai khảo sát cựu SV 6 tháng + 24 tháng định kỳ từ ...; workshop đối thoại GV-SV hằng học kỳ ...",
    },
  },

  "6.5": {
    short_name: "Học tập suốt đời, tư duy sáng tạo",
    full_name: "Các hoạt động dạy và học thúc đẩy tự học tập, học tập suốt đời, tư duy sáng tạo, tinh thần khởi nghiệp, được thiết kế phù hợp và gắn kết với việc đạt được các chuẩn đầu ra.",
    requirements: [
      "CSĐT xác định rõ năng lực học tập suốt đời người học cần đạt, các hoạt động dạy và học thúc đẩy học tập suốt đời, tư duy sáng tạo và tinh thần khởi nghiệp.",
      "CSĐT có cơ chế đảm bảo các hoạt động dạy và học phù hợp tăng cường năng lực học tập suốt đời, tư duy sáng tạo, khởi nghiệp.",
      "Hoạt động dạy và học được triển khai phù hợp mục tiêu, chuẩn đầu ra của CTĐT và học phần. CTĐT sử dụng các hoạt động đa dạng, bao gồm LMS để triển khai hiệu quả.",
    ],
    suggested_evidence: [
      { name: "Báo cáo thu thập phản hồi của người học, giảng viên về hiệu quả các hoạt động này", type: "survey", category: "Đánh giá hiệu quả" },
      { name: "Hồ sơ các CTĐT tích hợp kỹ năng mềm, tư duy sáng tạo, khởi nghiệp", type: "report", category: "CTĐT" },
      { name: "Hoạt động ngoại khóa, câu lạc bộ học thuật, cuộc thi sáng tạo", type: "report", category: "Ngoại khóa" },
      { name: "Biên bản họp hội đồng quản lý CTĐT, hội đồng khoa học về phát triển năng lực người học", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Báo cáo cải tiến dựa trên kết quả đánh giá các hoạt động dạy và học", type: "report", category: "Cải tiến" },
      { name: "Hồ sơ chính sách, kế hoạch hoạt động, báo cáo thực hiện, phiếu khảo sát và báo cáo tổng hợp", type: "policy", category: "Văn bản chính sách" },
    ],
    self_check_questions: [
      "Có học phần chuyên về Khởi nghiệp / Đổi mới sáng tạo trong CTĐT chính thức không?",
      "Số CLB học thuật + số SV tham gia? Số giải thưởng sáng tạo của SV trong giai đoạn?",
      "Tỷ lệ học phần sử dụng LMS (Moodle/Canvas/Google Classroom)?",
      "Có hệ thống ghi nhận kỹ năng mềm trong bảng điểm không?",
    ],
    placeholders: {
      hien_trang: "VD: CTĐT có các học phần Khởi nghiệp (bắt buộc/tự chọn), Tư duy phản biện. Số CLB học thuật: ..., SV tham gia ... Số giải thưởng sáng tạo giai đoạn ...: ...% học phần dùng LMS.",
      diem_manh: "VD: Có module Khởi nghiệp chính thức; CLB đa dạng; giải thưởng sáng tạo tăng; LMS phủ toàn diện.",
      ton_tai: "VD: Chưa có chứng nhận kỹ năng mềm số hóa; ngoại khóa phân tán, chưa tập trung.",
      ke_hoach: "VD: Ra mắt badge kỹ năng mềm số hóa từ ...; tổ chức Innovation Week hằng năm ...",
    },
  },

  "6.6": {
    short_name: "Đánh giá kết quả học tập",
    full_name: "CSĐT có hệ thống để lựa chọn các hình thức đánh giá người học phù hợp và gắn kết với việc đạt được các chuẩn đầu ra.",
    requirements: [
      "CSĐT có chính sách, quy định, quy trình rõ ràng về tiêu chí đánh giá, chấm điểm, rà soát kết quả đánh giá; lựa chọn phương pháp và tiêu chí đánh giá kết quả học tập phù hợp với CTĐT và chuẩn đầu ra; phản hồi kết quả đánh giá, phúc khảo; đo lường mức độ đạt CĐR học phần và CTĐT; rà soát, cải tiến.",
      "Các chính sách, quy định về đánh giá KQHT, kế hoạch đánh giá học phần được truyền thông đến các bên liên quan và triển khai nhất quán. Người học được phản hồi kết quả kịp thời.",
      "Các CTĐT sử dụng đa dạng phương pháp đánh giá; xây dựng rubrics phù hợp với chuẩn đầu ra; bảo đảm độ giá trị, độ tin cậy và tính công bằng.",
      "Tất cả CTĐT triển khai đo lường mức độ đạt CĐR học phần và CTĐT theo quy trình; đảm bảo kết quả tin cậy và sử dụng để cải tiến.",
      "Hoạt động đánh giá được rà soát, cải tiến để tăng cường tương thích với chuẩn đầu ra.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy trình, hướng dẫn lựa chọn và tổ chức các hình thức đánh giá người học", type: "procedure", category: "Đánh giá KQHT" },
      { name: "Kế hoạch và lịch đánh giá chi tiết theo từng học phần, CTĐT", type: "plan", category: "Đánh giá KQHT" },
      { name: "Mẫu phiếu khảo sát, bảng thu thập ý kiến phản hồi của người học, GV, nhà tuyển dụng về phương pháp đánh giá", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Báo cáo phân tích kết quả đánh giá và phản hồi", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản họp hội đồng CTĐT, hội đồng chuyên môn về rà soát và cải tiến phương pháp đánh giá", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch và báo cáo thực hiện cải tiến phương pháp đánh giá", type: "plan", category: "Cải tiến" },
      { name: "Hồ sơ quy trình, hướng dẫn chấm điểm, kế hoạch đánh giá, báo cáo phân tích", type: "procedure", category: "Đánh giá KQHT" },
    ],
    self_check_questions: [
      "CTĐT có sử dụng đa dạng phương pháp đánh giá (MCQ, tự luận, project, presentation, rubric) không?",
      "Tỷ lệ học phần đã xây dựng rubric đánh giá theo CĐR?",
      "Có quy trình đo lường mức độ đạt CLO/PLO cấp CTĐT không? Bao nhiêu CTĐT đã triển khai?",
      "Có quy trình phúc khảo / phản hồi điểm cho SV không? Thời gian xử lý?",
    ],
    placeholders: {
      hien_trang: "VD: Quy định đánh giá KQHT theo QĐ số ..., đa dạng phương pháp. ...% học phần có rubric. Đã triển khai đo lường CLO trên ... CTĐT, kết quả ...% CLO đạt. Thời gian xử lý phúc khảo tối đa ... ngày.",
      diem_manh: "VD: Phương pháp đánh giá đa dạng; rubric phổ biến; đo CLO/PLO chuẩn hóa; phúc khảo minh bạch.",
      ton_tai: "VD: Một số CLO chỉ đo qua bài thi, chưa có rubric skill/attitude; công cụ phân tích P/D/R/V/F đề thi còn sơ khai.",
      ke_hoach: "VD: Xây dựng rubric chuẩn cho toàn bộ CLO skill/attitude từ ...; triển khai phần mềm phân tích đề thi ...",
    },
  },

  "6.7": {
    short_name: "Dịch vụ hỗ trợ người học",
    full_name: "Các dịch vụ và hoạt động hỗ trợ người học phù hợp được triển khai, giám sát và đáp ứng nhu cầu của các bên liên quan.",
    requirements: [
      "CSĐT có hệ thống, chính sách, quy trình triển khai các dịch vụ hỗ trợ đáp ứng nhu cầu đa dạng của người học.",
      "CSĐT có cơ chế đảm bảo chất lượng dịch vụ hỗ trợ, bao gồm chính sách, quy trình/hướng dẫn, đảm bảo nguồn lực tài chính, CSVC và con người.",
      "CSĐT cung cấp đa dạng dịch vụ hỗ trợ: tư vấn học tập, nghề nghiệp/việc làm, kỹ năng mềm, hỗ trợ tâm lý, kỹ thuật, tài chính, hoạt động ngoại khóa, khuyết tật.",
      "Môi trường học tập và sinh hoạt an toàn, thân thiện, hỗ trợ phát triển toàn diện.",
      "CSĐT có quy định, tiêu chí định kỳ đánh giá, đối sánh và cải tiến chất lượng dịch vụ hỗ trợ.",
    ],
    suggested_evidence: [
      { name: "Văn bản chính sách và quy trình triển khai dịch vụ hỗ trợ người học", type: "policy", category: "Hỗ trợ người học" },
      { name: "Kế hoạch hoạt động của trung tâm hỗ trợ, phòng công tác người học, các khoa", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo hoạt động tư vấn học tập, hỗ trợ việc làm cho người học", type: "report", category: "Hỗ trợ người học" },
      { name: "Thống kê sử dụng thư viện, LMS, phòng máy, phòng thực hành/thí nghiệm, ký túc xá, CLB", type: "report", category: "Sử dụng dịch vụ" },
      { name: "Báo cáo thu thập và phân tích phản hồi người học về dịch vụ hỗ trợ", type: "survey", category: "Đánh giá hiệu quả" },
      { name: "Hồ sơ phân công nhiệm vụ, biên bản họp phối hợp giữa các đơn vị", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch nâng cấp dịch vụ hỗ trợ người học", type: "plan", category: "Cải tiến" },
      { name: "Báo cáo đánh giá, đối sánh và cải tiến chất lượng dịch vụ hỗ trợ", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Tài liệu liên quan hoạt động tư vấn học tập, nghề nghiệp, tâm lý, ngoại khóa, hỗ trợ khuyết tật", type: "report", category: "Hỗ trợ người học" },
      { name: "Báo cáo về môi trường học tập, an toàn và các điều kiện hỗ trợ người học", type: "report", category: "Môi trường học tập" },
    ],
    self_check_questions: [
      "Có trung tâm tư vấn/hỗ trợ SV không? Số lượt tư vấn hằng năm?",
      "Có phòng tư vấn tâm lý không? Chuyên gia biên chế hay cộng tác viên?",
      "Tỷ lệ SV sử dụng dịch vụ hướng nghiệp/việc làm?",
      "Có quy trình hỗ trợ SV khuyết tật không?",
      "Khảo sát mức hài lòng của SV về dịch vụ hỗ trợ có bao nhiêu điểm?",
    ],
    placeholders: {
      hien_trang: "VD: CSĐT có Trung tâm Hỗ trợ SV với ... nhân sự, cung cấp tư vấn học tập, hướng nghiệp, tâm lý. Năm ...: ... lượt tư vấn, ...% SV sử dụng dịch vụ hướng nghiệp. Khảo sát hài lòng ... điểm/5.",
      diem_manh: "VD: Trung tâm hỗ trợ đa dịch vụ; tỷ lệ sử dụng cao; khảo sát dương tính.",
      ton_tai: "VD: Tư vấn tâm lý chỉ có cộng tác viên ngoài, chưa có chuyên gia biên chế; hỗ trợ khuyết tật còn đơn lẻ.",
      ke_hoach: "VD: Tuyển chuyên gia tâm lý biên chế từ ...; xây dựng quy trình hỗ trợ SV khuyết tật từng bước ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 7: Các chính sách về NCKH ═══════════════

  "7.1": {
    short_name: "Quản lý NCKH",
    full_name: "CSĐT có hệ thống hiệu quả để định hướng và giám sát hoạt động nghiên cứu khoa học ở tất cả các cấp của CSĐT.",
    requirements: [
      "CSĐT có hệ thống để xây dựng, triển khai, giám sát và cải tiến chính sách, quy định, quy trình thực hiện công tác quản lý NCKH.",
      "Quy định về hoạt động NCKH đối với CB, GV, NCV, người học phù hợp quy định Nhà nước, sứ mạng, tầm nhìn, mục tiêu chiến lược của CSĐT.",
      "Các chính sách, quy định, quy trình và hoạt động NCKH được triển khai, giám sát.",
      "Định kỳ rà soát, đánh giá, cải tiến các chính sách, quy định, quy trình về quản lý hoạt động NCKH dựa trên kết quả và ý kiến các bên liên quan.",
    ],
    suggested_evidence: [
      { name: "Nghị quyết của Đảng ủy, HĐĐH/HĐT (nếu có) về hoạt động NCKH", type: "decision", category: "NCKH" },
      { name: "Sơ đồ tổ chức bộ máy của CSĐT", type: "visual", category: "Cơ cấu tổ chức" },
      { name: "Văn bản ban hành chính sách NCKH của CSĐT", type: "policy", category: "NCKH" },
      { name: "Văn bản phân công nhiệm vụ cho các đơn vị/bộ phận xây dựng chính sách NCKH", type: "decision", category: "NCKH" },
      { name: "Kế hoạch, dự toán phân bổ kinh phí hằng năm của CSĐT", type: "plan", category: "Tài chính NCKH" },
      { name: "Quy định, quy trình về rà soát, cải tiến hoạt động NCKH", type: "procedure", category: "Cải tiến" },
      { name: "Báo cáo tính hiệu quả công tác triển khai hoạt động NCKH; dự toán phân bổ kinh phí", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "CSĐT có phòng/trung tâm quản lý NCKH với chức năng rõ không?",
      "Có bộ văn bản quy định NCKH đầy đủ cho GV, NCV, SV không?",
      "Kinh phí NCKH phân bổ hằng năm là bao nhiêu % tổng chi?",
      "Có quy trình rà soát chính sách NCKH định kỳ không?",
    ],
    placeholders: {
      hien_trang: "VD: Phòng KHCN & HTQT quản lý NCKH, ban hành QĐ số ... Quy định NCKH cho CB/GV/SV theo QĐ số ... Kinh phí NCKH hằng năm ...% tổng chi. Rà soát chính sách 3 năm/lần, gần nhất năm ...",
      diem_manh: "VD: Phòng KHCN chuyên trách; văn bản đầy đủ; kinh phí NCKH vượt chuẩn tối thiểu; có rà soát chuẩn hóa.",
      ton_tai: "VD: Quy định NCKH cho SV còn chung, chưa khuyến khích cụ thể; phân bổ kinh phí chưa cạnh tranh.",
      ke_hoach: "VD: Chi tiết hóa chính sách NCKH SV từ ...; triển khai chế độ cạnh tranh đề tài ...",
    },
  },

  "7.2": {
    short_name: "KPIs NCKH",
    full_name: "Các chỉ số chính nhằm đánh giá hiệu quả thực hiện (như mức kinh phí, số lượng đề tài nghiên cứu khoa học, bài báo khoa học, bằng sáng chế, bản quyền, phát minh...) được sử dụng để đánh giá toàn diện hoạt động nghiên cứu khoa học từ đầu vào đến đầu ra, kết quả và tác động.",
    requirements: [
      "CSĐT xác định rõ các tiêu chí, KPIs gắn kết với chiến lược phát triển/kế hoạch chiến lược về NCKH để đánh giá số lượng, chất lượng và tác động NCKH.",
      "Sử dụng KPIs để đánh giá số lượng, chất lượng NCKH, hoạt động chuyển giao công nghệ, chuyển giao tri thức, thương mại hóa sản phẩm nghiên cứu.",
      "Định kỳ rà soát, đánh giá, cải tiến các tiêu chí và KPIs để đánh giá kết quả NCKH.",
    ],
    suggested_evidence: [
      { name: "Văn bản ban hành chính sách đánh giá hoạt động NCKH của CSĐT", type: "policy", category: "KPIs NCKH" },
      { name: "Biên bản đánh giá hoạt động NCKH theo KPIs", type: "meeting_minutes", category: "Đánh giá hiệu quả" },
      { name: "Biên bản đánh giá hoạt động chuyển giao công nghệ, chuyển giao tri thức, thương mại hóa sản phẩm nghiên cứu theo KPIs", type: "meeting_minutes", category: "Chuyển giao CN" },
      { name: "Quy định, quy trình về rà soát, cải tiến hoạt động NCKH", type: "procedure", category: "Cải tiến" },
      { name: "Báo cáo đánh giá toàn diện hoạt động NCKH từ đầu vào đến đầu ra, kết quả và tác động theo KPIs", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Bộ KPIs NCKH có bao gồm: số đề tài, bài báo ISI/Scopus, bằng SHTT, chuyển giao không?",
      "KPIs có phân theo cấp: cá nhân GV / bộ môn / khoa / toàn trường không?",
      "Có báo cáo NCKH hằng năm phân tích đầu vào - đầu ra - tác động không?",
      "Có điều chỉnh KPIs qua các năm không?",
    ],
    placeholders: {
      hien_trang: "VD: KPIs NCKH ban hành QĐ số ..., gồm: ... bài báo/GV/năm, ... đề tài/khoa/năm, ... bằng SHTT/trường/giai đoạn. Báo cáo NCKH hằng năm theo 3 nhóm chỉ số. Điều chỉnh KPIs năm ... để ưu tiên ISI/Scopus.",
      diem_manh: "VD: KPIs đa tầng; báo cáo đầy đủ input-output-impact; điều chỉnh kịp thời.",
      ton_tai: "VD: KPIs về chuyển giao còn thấp (< 2% đề tài chuyển giao); chưa có chỉ số citation tác động dài hạn.",
      ke_hoach: "VD: Ưu tiên đề tài có tiềm năng chuyển giao từ ...; bổ sung chỉ số h-index/citation ...",
    },
  },

  "7.3": {
    short_name: "Nghiên cứu xuất sắc & khởi nghiệp",
    full_name: "CSĐT có cơ chế khuyến khích và quản lý có hệ thống đối với hoạt động nghiên cứu xuất sắc, đặc biệt là hoạt động đổi mới sáng tạo và tinh thần khởi nghiệp.",
    requirements: [
      "CSĐT có hệ thống, các chính sách cho hoạt động nghiên cứu xuất sắc, đổi mới sáng tạo và khởi nghiệp.",
      "CSĐT có nguồn kinh phí phù hợp cho các hoạt động nghiên cứu xuất sắc, đổi mới sáng tạo và khởi nghiệp phù hợp mục tiêu, kế hoạch.",
      "CSĐT giám sát và định kỳ rà soát, đánh giá, cải tiến các chính sách, cơ chế khuyến khích dựa trên kết quả và ý kiến các bên liên quan.",
    ],
    suggested_evidence: [
      { name: "Văn bản ban hành chính sách đối với hoạt động nghiên cứu xuất sắc của CSĐT", type: "policy", category: "Nghiên cứu xuất sắc" },
      { name: "Các tiêu chí, KPIs để đánh giá số lượng, chất lượng nghiên cứu xuất sắc", type: "policy", category: "KPIs NCKH" },
      { name: "Văn bản ban hành quy định/hướng dẫn công tác triển khai, đối sánh, đánh giá hoạt động nghiên cứu xuất sắc", type: "regulation", category: "Văn bản chính sách" },
      { name: "Kế hoạch, dự toán phân bổ kinh phí hằng năm cho hoạt động nghiên cứu xuất sắc", type: "plan", category: "Tài chính NCKH" },
      { name: "Quy định, quy trình về rà soát, cải tiến quy định/hướng dẫn công tác đánh giá hoạt động nghiên cứu xuất sắc", type: "procedure", category: "Cải tiến" },
      { name: "Hồ sơ lấy ý kiến các bên liên quan về hoạt động nghiên cứu xuất sắc", type: "survey", category: "Khảo sát - góp ý" },
    ],
    self_check_questions: [
      "Có chính sách thưởng/ưu đãi cho GV có công bố ISI top không?",
      "Có vườn ươm khởi nghiệp (incubator) nội bộ không?",
      "Tỷ lệ đề tài thuộc danh mục xuất sắc (NAFOSTED, KC, cấp Bộ+)?",
      "Có đối sánh kết quả NCKH với trường cùng loại trong nước / khu vực không?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách khen thưởng NCKH xuất sắc ban hành QĐ số ..., mức thưởng ... cho bài Q1, ... cho bằng SHTT. Vườn ươm khởi nghiệp ra mắt năm ..., đã ươm ... ý tưởng. ... đề tài thuộc danh mục xuất sắc trong giai đoạn.",
      diem_manh: "VD: Chính sách thưởng rõ; có vườn ươm; tỷ lệ đề tài xuất sắc tăng; có đối sánh với trường trong khu vực.",
      ton_tai: "VD: Một số ngành chưa có đề tài xuất sắc; vườn ươm quy mô nhỏ.",
      ke_hoach: "VD: Hỗ trợ ngành ... tham gia đề tài xuất sắc từ ...; mở rộng vườn ươm lên ... diện tích ...",
    },
  },

  "7.4": {
    short_name: "Dữ liệu & tài sản trí tuệ",
    full_name: "CSĐT có hệ thống dữ liệu lớn phù hợp và hiệu quả để ghi nhận, lưu trữ và phân tích toàn bộ tài sản trí tuệ của CSĐT.",
    requirements: [
      "CSĐT có hệ thống phần mềm, phần cứng phù hợp để phân tích, lưu trữ tài sản trí tuệ được số hoá.",
      "CSĐT có chính sách, cơ chế an toàn và bảo mật thông tin; có quy định khai thác và bảo vệ quyền sở hữu trí tuệ.",
      "Các chính sách, cơ chế và quy định này được triển khai thực hiện và giám sát.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch số hoá tài sản trí tuệ của CSĐT", type: "plan", category: "Số hóa" },
      { name: "Chứng từ mua sắm, xây dựng hoặc biên bản nghiệm thu phần mềm, phần cứng dùng lưu trữ tài sản trí tuệ", type: "official_doc", category: "Hạ tầng" },
      { name: "Chính sách an toàn và bảo mật thông tin; quy định khai thác và bảo vệ quyền sở hữu trí tuệ", type: "policy", category: "ATTT - SHTT" },
      { name: "Cơ sở dữ liệu/hệ thống dữ liệu lớn của CSĐT", type: "visual", category: "Hệ thống dữ liệu" },
      { name: "Văn bản giao nhiệm vụ số hoá, khai thác và bảo vệ quyền sở hữu trí tuệ", type: "decision", category: "Nhân sự" },
      { name: "Báo cáo đánh giá mức độ phù hợp và hiệu quả của việc ghi nhận, lưu trữ và phân tích dữ liệu", type: "report", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "CSĐT có hệ thống CSDL nghiên cứu/tài sản trí tuệ tập trung không?",
      "Có chính sách ATTT cho dữ liệu nghiên cứu không?",
      "Có quy định SHTT rõ (ai sở hữu, chia sẻ thế nào)?",
      "Có công cụ phân tích bibliometric của CSĐT không?",
    ],
    placeholders: {
      hien_trang: "VD: CSDL NCKH trên platform ..., đã số hóa ... hồ sơ. Chính sách ATTT ban hành QĐ số ... Quy định SHTT theo QĐ số ..., phân định rõ bản quyền GV và CSĐT. Công cụ phân tích: ...",
      diem_manh: "VD: Platform tập trung; ATTT chuẩn hóa; SHTT rõ ràng.",
      ton_tai: "VD: Công cụ phân tích bibliometric còn dùng external (Scopus/WoS web), chưa có nội bộ; kế hoạch số hóa hồ sơ cũ chậm.",
      ke_hoach: "VD: Triển khai dashboard bibliometric nội bộ từ ...; hoàn thiện số hóa hồ sơ cũ ...",
    },
  },

  "7.5": {
    short_name: "Hợp tác NCKH",
    full_name: "CSĐT có hệ thống để thiết lập, duy trì và thúc đẩy, phát triển hợp tác nghiên cứu khoa học với các tổ chức chính phủ, các CSĐT khác, các doanh nghiệp trong nước và quốc tế ở nhiều lĩnh vực chuyên môn.",
    requirements: [
      "CSĐT có hệ thống, chính sách, quy định/hướng dẫn để lập kế hoạch, triển khai, giám sát và cải tiến công tác quản lý các hoạt động hợp tác NCKH với các đối tác bên ngoài.",
      "Các hoạt động hợp tác như đồng tổ chức hội nghị/hội thảo, các hoạt động NCKH với các đối tác đáp ứng được các mục tiêu của CSĐT.",
      "CSĐT rà soát, đánh giá tính hiệu quả và nguồn lực từ các hoạt động hợp tác NCKH và cải tiến chất lượng.",
    ],
    suggested_evidence: [
      { name: "Chính sách, kế hoạch, quy định/hướng dẫn công tác quản lý các hoạt động hợp tác NCKH", type: "policy", category: "Hợp tác NCKH" },
      { name: "Văn bản giao nhiệm vụ triển khai thực hiện, giám sát các hoạt động hợp tác NCKH với các đối tác bên ngoài", type: "decision", category: "Nhân sự" },
      { name: "Văn bản thỏa thuận hợp tác trong NCKH và chuyển giao công nghệ với các đối tác", type: "official_doc", category: "Đối tác" },
      { name: "Chương trình, kỷ yếu các hội nghị/hội thảo đồng tổ chức với các đối tác trong và ngoài nước", type: "report", category: "Hội nghị/thảo" },
      { name: "Các sản phẩm NCKH dựa trên các hoạt động hợp tác với đối tác bên ngoài, các tổ chức chính phủ, CSĐT khác, DN trong nước và quốc tế", type: "report", category: "Sản phẩm NCKH" },
      { name: "Biên bản rà soát, đánh giá tính hiệu quả và nguồn lực mang lại từ các hoạt động hợp tác NCKH", type: "meeting_minutes", category: "Đánh giá hiệu quả" },
    ],
    self_check_questions: [
      "Số MOU/MOA về NCKH hiện hành với tổ chức trong nước + quốc tế?",
      "Số bài báo có co-author với đối tác bên ngoài trong giai đoạn?",
      "Số hội nghị/hội thảo đồng tổ chức / tham gia?",
      "Có đánh giá ROI hợp tác NCKH không?",
    ],
    placeholders: {
      hien_trang: "VD: Số MOU NCKH hiện hành: ... (trong nước), ... (quốc tế). Giai đoạn có ... bài co-author quốc tế. Đồng tổ chức ... hội thảo quốc tế. Doanh thu NCKH hợp tác: ...",
      diem_manh: "VD: Mạng hợp tác đa dạng; tỷ lệ co-author quốc tế tăng; đồng tổ chức hội thảo thường xuyên.",
      ton_tai: "VD: Hợp tác với DN trong chuyển giao công nghệ còn ít; chưa có cơ chế ROI rõ.",
      ke_hoach: "VD: Tập trung ... đối tác DN trong công nghệ ... từ năm ...; xây dựng KPI ROI hợp tác ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 8: Kết nối và phục vụ cộng đồng ═══════════════

  "8.1": {
    short_name: "Chính sách kết nối cộng đồng",
    full_name: "Các chính sách, kế hoạch, hướng dẫn về kết nối và phục vụ cộng đồng được xây dựng, triển khai, rà soát, cải tiến nhằm đáp ứng nhu cầu và sự hài lòng của các bên liên quan.",
    requirements: [
      "CSĐT có hệ thống, chính sách, kế hoạch và hướng dẫn cụ thể cho các hoạt động kết nối và phục vụ cộng đồng, xác định mục tiêu, loại hình phù hợp tầm nhìn, sứ mạng, nhu cầu và sự hài lòng của các bên liên quan và nguồn lực đi kèm.",
      "CSĐT có chính sách, kế hoạch và hướng dẫn hoạt động kết nối cộng đồng được triển khai và giám sát.",
      "Các chính sách, kế hoạch và hướng dẫn được đánh giá, rà soát dựa trên kết quả thực hiện và khảo sát ý kiến các bên liên quan; cải tiến nhằm đáp ứng nhu cầu và sự hài lòng.",
    ],
    suggested_evidence: [
      { name: "Văn bản về chính sách kết nối và phục vụ cộng đồng", type: "policy", category: "Cộng đồng" },
      { name: "Kế hoạch về kết nối và phục vụ cộng đồng", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Tài liệu hướng dẫn về kết nối và phục vụ cộng đồng", type: "guideline", category: "Văn bản chính sách" },
      { name: "Tài liệu/hồ sơ/báo cáo về phổ biến, triển khai hoạt động kết nối và phục vụ cộng đồng", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hồ sơ/tài liệu/báo cáo về rà soát và cải tiến hoạt động kết nối cộng đồng", type: "report", category: "Cải tiến" },
      { name: "Hồ sơ/tài liệu/báo cáo về thu thập nhu cầu và sự hài lòng của các bên liên quan", type: "survey", category: "Khảo sát - góp ý" },
    ],
    self_check_questions: [
      "Có chính sách phục vụ cộng đồng ban hành bằng văn bản không?",
      "Các loại hình kết nối (chuyển giao, tình nguyện, đào tạo miễn phí) có đủ đa dạng không?",
      "Có khảo sát nhu cầu cộng đồng trước khi thiết kế hoạt động không?",
      "Tỷ lệ GV/SV tham gia hoạt động cộng đồng?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách phục vụ cộng đồng ban hành QĐ số ... Các loại hình: tình nguyện, chuyển giao khoa học, đào tạo ngắn hạn miễn phí cho địa phương. ...% SV tham gia hằng năm. Khảo sát cộng đồng ... năm/lần.",
      diem_manh: "VD: Chính sách đầy đủ; đa dạng loại hình; tỷ lệ tham gia cao.",
      ton_tai: "VD: Khảo sát nhu cầu cộng đồng chưa định kỳ; đánh giá hiệu quả chủ yếu định tính.",
      ke_hoach: "VD: Triển khai khảo sát cộng đồng hằng năm từ ...; xây dựng bộ chỉ số đo tác động ...",
    },
  },

  "8.2": {
    short_name: "Phù hợp định hướng quốc gia",
    full_name: "Các chính sách, kế hoạch, hướng dẫn về kết nối và phục vụ cộng đồng phù hợp với định hướng phát triển của quốc gia, được triển khai, rà soát và cải tiến.",
    requirements: [
      "Các chính sách, kế hoạch và hướng dẫn các loại hình về kết nối và phục vụ cộng đồng được xác định phù hợp định hướng phát triển của địa phương và quốc gia.",
      "Các chính sách được triển khai và giám sát.",
      "CSĐT định kỳ đánh giá, rà soát tính phù hợp và cải tiến dựa trên kết quả đánh giá.",
    ],
    suggested_evidence: [
      { name: "Tài liệu về quá trình xây dựng, thiết lập các chính sách, kế hoạch về kết nối cộng đồng", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Tài liệu/văn bản về định hướng phát triển của quốc gia trong giai đoạn đánh giá", type: "external_doc", category: "Căn cứ pháp lý" },
      { name: "Hồ sơ/tài liệu/báo cáo đánh giá, kết quả thực hiện hoạt động kết nối cộng đồng", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Kế hoạch/báo cáo về cải tiến chính sách, kế hoạch về kết nối cộng đồng", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Chính sách cộng đồng có tham chiếu Chiến lược phát triển quốc gia / Nghị quyết TW không?",
      "Có hoạt động phù hợp Mục tiêu phát triển bền vững SDGs không?",
      "Có đánh giá kết quả theo các mục tiêu quốc gia định kỳ không?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách cộng đồng tham chiếu Nghị quyết Đại hội XIII, Chiến lược phát triển KT-XH ... Các hoạt động gắn với ... SDGs (đặc biệt SDG ..., ...). Báo cáo đánh giá hằng năm theo mục tiêu SDGs.",
      diem_manh: "VD: Chính sách liên kết chặt với định hướng quốc gia; hoạt động gắn SDGs rõ; báo cáo đầy đủ.",
      ton_tai: "VD: Một số SDGs chưa có hoạt động cụ thể (ví dụ SDG 13, 14); báo cáo còn thiên định tính.",
      ke_hoach: "VD: Triển khai hoạt động SDG 13 (khí hậu) từ ...; xây dựng bộ chỉ số định lượng theo SDGs ...",
    },
  },

  "8.3": {
    short_name: "Đóng góp toàn cầu & môi trường",
    full_name: "Các chính sách, kế hoạch, hướng dẫn về kết nối và phục vụ cộng đồng thể hiện sự đóng góp cho một tương lai toàn cầu vì lợi ích chung và bền vững hơn, đồng thời góp phần bảo vệ môi trường.",
    requirements: [
      "CSĐT có chính sách, kế hoạch và hướng dẫn về kết nối và phục vụ cộng đồng nhằm đóng góp cho tương lai toàn cầu tốt đẹp và bền vững hơn, góp phần bảo vệ môi trường.",
      "Các chính sách, kế hoạch, hướng dẫn được triển khai thực hiện, giám sát, đánh giá và cải tiến dựa trên kết quả.",
    ],
    suggested_evidence: [
      { name: "Tài liệu về quá trình xây dựng chính sách, kế hoạch, hướng dẫn về đóng góp cho tương lai toàn cầu bền vững và bảo vệ môi trường", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Hồ sơ/tài liệu/báo cáo đánh giá, kết quả thực hiện hoạt động đóng góp cho tương lai toàn cầu bền vững và bảo vệ môi trường", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Kế hoạch/báo cáo cải tiến các chính sách, kế hoạch, hướng dẫn (nếu có)", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "CSĐT có chính sách về môi trường / phát triển bền vững công khai không?",
      "Có hoạt động giảm phát thải, tiết kiệm năng lượng, tái chế trong khuôn viên không?",
      "Có hoạt động chuyển giao công nghệ xanh cho cộng đồng không?",
      "Có báo cáo bền vững (sustainability report) hằng năm không?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách phát triển bền vững ban hành QĐ số ... CSĐT đã: (i) giảm ...% tiêu thụ điện nhờ LED + solar; (ii) triển khai chương trình ... bảo vệ môi trường; (iii) chuyển giao công nghệ xanh cho ... địa phương.",
      diem_manh: "VD: Chính sách rõ; hoạt động bền vững có số liệu; có báo cáo bền vững công khai.",
      ton_tai: "VD: Chưa có bộ chỉ số đo carbon footprint chính thức; hoạt động toàn cầu còn giới hạn.",
      ke_hoach: "VD: Triển khai carbon footprint accounting từ ...; mở rộng MOU với tổ chức quốc tế về phát triển bền vững ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 9: Hệ thống bảo đảm chất lượng ═══════════════

  "9.1": {
    short_name: "Đơn vị chuyên trách BĐCL",
    full_name: "CSĐT có đơn vị chuyên trách với vai trò và trách nhiệm trong điều phối, giám sát các hoạt động bảo đảm chất lượng bên trong và bên ngoài; các hoạt động này có hiệu quả và gắn kết với việc thực hiện các mục tiêu chiến lược của CSĐT.",
    requirements: [
      "Các quy định và quy trình BĐCL được thiết lập, xác định rõ các hoạt động BĐCL bên trong và bên ngoài, với công cụ, quy trình, nguồn lực và tài chính tương ứng để vận hành hiệu quả hệ thống, hỗ trợ thúc đẩy văn hóa chất lượng.",
      "CSĐT có đơn vị chuyên trách về BĐCL với chức năng, nhiệm vụ và trách nhiệm rõ ràng để triển khai, phối hợp, giám sát và cải tiến liên tục các hoạt động BĐCL bên trong và bên ngoài.",
      "CSĐT xác định năng lực BĐCL của đơn vị chuyên trách và đội ngũ tham gia hoạt động BĐCL, triển khai đào tạo, bồi dưỡng phù hợp.",
      "Chính sách BĐCL được chuyển tải vào trong các hoạt động của CSĐT và đến tất cả các cấp.",
      "Các hoạt động BĐCL được giám sát, đánh giá định kỳ; kết quả được sử dụng để cải tiến, gắn với mục tiêu chiến lược và xây dựng văn hóa chất lượng.",
    ],
    suggested_evidence: [
      { name: "Quyết định thành lập và quy định chức năng nhiệm vụ của trung tâm/đơn vị/bộ phận chuyên trách BĐCL", type: "decision", category: "BĐCL" },
      { name: "Sơ đồ tổ chức về hệ thống BĐCL bên trong CSĐT", type: "visual", category: "Cơ cấu tổ chức" },
      { name: "Văn bản quy định, hướng dẫn của CSĐT về hoạt động BĐCL bên trong (quy trình BĐCL, hệ thống thông tin BĐCL, lấy ý kiến bên liên quan, cải tiến liên tục) và bên ngoài (đánh giá ngoài, xếp hạng, công nhận văn bằng)", type: "regulation", category: "Văn bản chính sách" },
      { name: "Kế hoạch ĐBCL hằng năm và kế hoạch chiến lược BĐCL của CSĐT", type: "strategic_plan", category: "Chiến lược" },
      { name: "Báo cáo về hiệu suất của hệ thống BĐCL, báo cáo đánh giá nội bộ và kiểm định chất lượng bên ngoài", type: "report", category: "Báo cáo định kỳ" },
      { name: "Quy định về khung năng lực của đội ngũ cán bộ BĐCL; tài liệu tập huấn đào tạo, bồi dưỡng năng lực BĐCL", type: "training", category: "Đào tạo nội bộ" },
      { name: "Danh sách và nhiệm vụ của cán bộ trung tâm/đơn vị chuyên trách BĐCL, cán bộ được phân công làm BĐCL tại các đơn vị", type: "report", category: "Nhân sự BĐCL" },
      { name: "Chứng chỉ bồi dưỡng về BĐCL; minh chứng áp dụng kiến thức đã tập huấn vào công tác BĐCL", type: "training", category: "Đào tạo nội bộ" },
      { name: "Sổ tay, chính sách và quy trình BĐCL", type: "handbook", category: "BĐCL" },
      { name: "Tài liệu về hoạt động thúc đẩy văn hóa chất lượng", type: "report", category: "Văn hóa chất lượng" },
      { name: "Thông tin về ĐBCL trên trang thông tin điện tử của CSĐT", type: "website", category: "Truyền thông" },
      { name: "Minh chứng về sự tham gia của người học và bên liên quan bên ngoài vào các cơ chế phản hồi", type: "survey", category: "Khảo sát - góp ý" },
    ],
    self_check_questions: [
      "Có trung tâm/phòng chuyên trách BĐCL không? Có bao nhiêu nhân sự toàn thời gian?",
      "Có sổ tay BĐCL / policy handbook chính thức không?",
      "Tỷ lệ cán bộ BĐCL đã được bồi dưỡng chuyên môn (có chứng chỉ)?",
      "Chính sách BĐCL có được truyền đạt đến 100% đơn vị không?",
    ],
    placeholders: {
      hien_trang: "VD: Phòng Khảo thí & ĐBCL thành lập theo QĐ số ..., hiện có ... nhân sự toàn thời gian. Sổ tay BĐCL ban hành năm ... Chính sách BĐCL công khai trên website. ...% cán bộ BĐCL đã có chứng chỉ bồi dưỡng AUN-QA/IQA.",
      diem_manh: "VD: Đơn vị chuyên trách ổn định; sổ tay BĐCL chi tiết; tỷ lệ cán bộ có chứng chỉ cao; văn hóa chất lượng lan tỏa.",
      ton_tai: "VD: Một số đơn vị nhỏ chưa có cán bộ đầu mối BĐCL; bồi dưỡng cho cấp khoa/bộ môn chưa đồng đều.",
      ke_hoach: "VD: Phân công cán bộ đầu mối BĐCL ở 100% đơn vị từ ...; triển khai chương trình bồi dưỡng cấp khoa hằng năm ...",
    },
  },

  "9.2": {
    short_name: "Kế hoạch BĐCL",
    full_name: "CSĐT xây dựng kế hoạch bảo đảm chất lượng, trong đó thể hiện rõ cam kết và sự tham gia của các bên liên quan nhằm hướng đến mức độ bảo đảm chất lượng cao hơn.",
    requirements: [
      "CSĐT có kế hoạch BĐCL giúp triển khai chính sách và thực hiện các hoạt động thúc đẩy BĐCL bên trong và bên ngoài, bao gồm kế hoạch tập huấn nâng cao năng lực cho đơn vị chuyên trách BĐCL và đội ngũ cán bộ tham gia hoạt động BĐCL.",
      "Kế hoạch BĐCL được xây dựng và triển khai gắn kết với việc thực hiện các mục tiêu chiến lược của CSĐT.",
      "Kế hoạch BĐCL thể hiện rõ các chính sách ưu tiên, cam kết và sự tham gia của các bên liên quan, nhằm hướng đến mức đảm bảo chất lượng cao hơn.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch chiến lược ĐBCL, kế hoạch nhiệm vụ ĐBCL hằng năm (thể hiện sự tham gia của các bên liên quan)", type: "strategic_plan", category: "Chiến lược BĐCL" },
      { name: "Chính sách ĐBCL của CSĐT", type: "policy", category: "BĐCL" },
      { name: "Sổ tay BĐCL của CSĐT", type: "handbook", category: "BĐCL" },
      { name: "Thông tin về ĐBCL trên trang thông tin điện tử của CSĐT", type: "website", category: "Truyền thông" },
      { name: "Kế hoạch tổ chức, danh mục các khóa tập huấn về ĐBCL; minh chứng tham gia và triển khai sau tập huấn", type: "training", category: "Đào tạo nội bộ" },
      { name: "Quy định/Hướng dẫn về công tác khảo sát các bên liên quan của CSĐT", type: "guideline", category: "Khảo sát - góp ý" },
      { name: "Kế hoạch lấy ý kiến hoặc khảo sát các bên liên quan trong quá trình triển khai ĐBCL", type: "plan", category: "Khảo sát - góp ý" },
      { name: "Báo cáo đánh giá nội bộ và kiểm định chất lượng bên ngoài cho thấy cải thiện chất lượng và chia sẻ thực tiễn tốt", type: "audit", category: "Kiểm định" },
      { name: "Tài liệu chứng minh hoạt động theo dõi sau đánh giá và kế hoạch hành động phòng ngừa/khắc phục", type: "report", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có kế hoạch chiến lược BĐCL dài hạn không? Liên kết với chiến lược CSĐT thế nào?",
      "Kế hoạch BĐCL có đủ các cấu phần: đánh giá nội bộ + ngoại + tập huấn + cải tiến không?",
      "Có khảo sát/tham vấn các bên liên quan khi xây dựng kế hoạch BĐCL không?",
      "Có chu kỳ PDCA trong BĐCL không?",
    ],
    placeholders: {
      hien_trang: "VD: Kế hoạch chiến lược BĐCL giai đoạn ... theo QĐ số ..., gắn mục tiêu chiến lược ... Kế hoạch hằng năm gồm: đánh giá nội bộ, khảo sát các bên, tập huấn, cải tiến. Có tham vấn các bên qua ... cuộc họp.",
      diem_manh: "VD: Kế hoạch chiến lược BĐCL toàn diện; PDCA chuẩn hóa; tham vấn đa bên.",
      ton_tai: "VD: Hoạt động đối sánh với trường cùng loại còn ít; kế hoạch hành động khắc phục chậm.",
      ke_hoach: "VD: Mở rộng đối sánh với ... trường khu vực; số hóa tracking kế hoạch khắc phục ...",
    },
  },

  "9.3": {
    short_name: "Triển khai kế hoạch BĐCL",
    full_name: "Kế hoạch bảo đảm chất lượng được quán triệt và chuyển tải vào các kế hoạch hành động ngắn hạn và dài hạn để triển khai ở tất cả các cấp của CSĐT.",
    requirements: [
      "Kế hoạch BĐCL được chuyển tải thành các kế hoạch hành động cụ thể (ngắn hạn và dài hạn), triển khai trên phạm vi toàn CSĐT.",
      "Kế hoạch BĐCL được truyền thông và quán triệt đến tất cả các cấp, từ lãnh đạo cấp cao đến CB, GV, người học.",
      "Các hoạt động trong kế hoạch BĐCL được thực hiện nhất quán, có giám sát, báo cáo định kỳ và truyền thông đến các bên liên quan để cải tiến và đảm bảo đạt mục tiêu chiến lược.",
    ],
    suggested_evidence: [
      { name: "Bản chiến lược ĐBCL, kế hoạch hoạt động ĐBCL dài hạn, kế hoạch nhiệm vụ hằng năm", type: "strategic_plan", category: "Chiến lược BĐCL" },
      { name: "Biên bản các cuộc họp, hội thảo, buổi tập huấn phổ biến, quán triệt kế hoạch hoạt động BĐCL", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch/báo cáo hoạt động BĐCL; báo cáo hoạt động của trung tâm/đơn vị chuyên trách ĐBCL hằng năm", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Kế hoạch BĐCL có được chi tiết hóa thành kế hoạch hành động cho từng đơn vị không?",
      "Có tập huấn/phổ biến kế hoạch cho toàn CSĐT không?",
      "Có báo cáo giám sát định kỳ (hằng quý/năm) về tiến độ BĐCL không?",
      "Các đơn vị có báo cáo kết quả hoạt động BĐCL định kỳ không?",
    ],
    placeholders: {
      hien_trang: "VD: Kế hoạch BĐCL chi tiết hóa thành ... kế hoạch đơn vị. Đã tổ chức ... buổi tập huấn cho ...% CB/GV. Báo cáo giám sát hằng quý (4 lần/năm). Báo cáo hằng năm đầy đủ từ ... đơn vị.",
      diem_manh: "VD: Kế hoạch được chi tiết hóa đầy đủ; tập huấn phủ toàn trường; báo cáo định kỳ đầy đủ.",
      ton_tai: "VD: Một số đơn vị báo cáo sơ sài; thời gian thực hiện khắc phục sau đánh giá còn dài.",
      ke_hoach: "VD: Chuẩn hóa template báo cáo từ ...; rút ngắn chu kỳ khắc phục xuống ... tháng ...",
    },
  },

  "9.4": {
    short_name: "Chỉ số hiệu quả BĐCL",
    full_name: "CSĐT xác lập rõ ràng các chỉ số chính nhằm đánh giá hiệu quả thực hiện và chỉ tiêu để đo lường hiệu quả hoạt động bảo đảm chất lượng; kết quả đo lường được công bố kịp thời đến các bên liên quan để phục vụ phản hồi và cải tiến.",
    requirements: [
      "CSĐT xác lập rõ ràng các chỉ số hiệu quả chính và chỉ tiêu để đo lường hiệu quả hoạt động BĐCL bên trong và bên ngoài, gắn kết với mục tiêu chiến lược về BĐCL.",
      "Các chỉ số hiệu quả chính cần SMART, bao gồm các chỉ số về: vận hành hệ thống BĐCL; kết quả hoạt động BĐCL trong đào tạo, NCKH, kết nối và phục vụ cộng đồng; hoạt động đối sánh, nghiên cứu so sánh.",
      "Kết quả đo lường được báo cáo định kỳ và công bố kịp thời đến các bên liên quan để phản hồi và cải tiến.",
      "CSĐT thực hiện rà soát định kỳ, cải tiến các chỉ số và chỉ tiêu để đáp ứng mục tiêu BĐCL và chiến lược.",
    ],
    suggested_evidence: [
      { name: "Văn bản xác định các chỉ số hiệu quả chính (tỉ lệ SV quy đổi/GV, tỉ lệ hài lòng, tỉ lệ việc làm, công bố/GV...) và chỉ tiêu (40 SV/GV, 70% hài lòng, 50% việc làm, 0.3 bài/GV/năm...)", type: "policy", category: "KPIs BĐCL" },
      { name: "Báo cáo tổng kết, đánh giá kết quả hoạt động BĐCL (kết quả đo lường, hành động khắc phục, đối sánh, cải tiến)", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo hoạt động của trung tâm/đơn vị chuyên trách công tác BĐCL hằng năm", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản các cuộc họp rà soát chính sách, hệ thống, quy trình và thủ tục BĐCL", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Minh chứng các kết quả, báo cáo hoạt động BĐCL được công bố kịp thời đến các bên liên quan", type: "website", category: "Truyền thông" },
    ],
    self_check_questions: [
      "Bộ KPIs BĐCL có đầy đủ SMART không? Bao nhiêu chỉ số?",
      "Tỷ lệ chỉ số đạt chỉ tiêu trong giai đoạn?",
      "Có công bố kết quả KPIs BĐCL trên website định kỳ không?",
      "Có rà soát và điều chỉnh KPIs theo chu kỳ không?",
    ],
    placeholders: {
      hien_trang: "VD: Bộ KPIs BĐCL gồm ... chỉ số (vận hành, đào tạo, NCKH, cộng đồng, đối sánh). Năm ...: ...% chỉ số đạt chỉ tiêu. Công bố kết quả hằng năm trên website. Rà soát chỉ số 3 năm/lần.",
      diem_manh: "VD: Bộ KPIs toàn diện; tỷ lệ đạt cao; công bố minh bạch.",
      ton_tai: "VD: Một số chỉ số đối sánh chưa có nguồn tham chiếu rõ; khảo sát bên liên quan bên ngoài còn hạn chế.",
      ke_hoach: "VD: Tham gia AUN-QA benchmarking từ ...; mở rộng đối tượng khảo sát ngoài ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 10: Hệ thống thông tin BĐCL ═══════════════

  "10.1": {
    short_name: "Hệ thống quản lý thông tin",
    full_name: "CSĐT có hệ thống quản lý thông tin hiệu quả để thu thập, xử lý và báo cáo các chỉ số chính nhằm đánh giá hiệu quả thực hiện, các chỉ tiêu về chiến lược và bảo đảm chất lượng. Hệ thống này hỗ trợ hoạt động đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng theo sứ mạng của CSĐT.",
    requirements: [
      "CSĐT có quy định xác định rõ thông tin, dữ liệu cần thu thập, chu kỳ thu thập, xử lý và báo cáo, phân tích, lưu trữ trong hệ thống quản lý thông tin.",
      "Cơ sở dữ liệu quản lý cần bao gồm: dữ liệu, chỉ số, chỉ tiêu gắn kết chặt chẽ với chỉ tiêu chiến lược; dữ liệu về các chỉ số và chỉ tiêu BĐCL.",
      "Các đơn vị định kỳ nhập dữ liệu được phê duyệt vào hệ thống hoặc hệ thống hỗ trợ liên kết dữ liệu để theo dõi các chỉ số chiến lược và BĐCL.",
      "Các đơn vị sử dụng dữ liệu trong hoạt động của đơn vị (báo cáo, giám sát, theo dõi KPIs, đề xuất/ra quyết định dựa trên dữ liệu, đánh giá chất lượng CTĐT).",
      "CSĐT có minh chứng sử dụng thông tin, dữ liệu để ra quyết định trong các quyết định quan trọng về chiến lược, phân bổ nguồn lực.",
      "Định kỳ đánh giá tính hiệu quả của hệ thống quản lý thông tin và cải tiến tính liên thông với các hệ thống khác (LMS, nhân sự, tài chính).",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định thông tin, dữ liệu cần lưu trữ, phân công nhiệm vụ, quyền hạn, quyền truy cập, trách nhiệm", type: "regulation", category: "Hệ thống thông tin" },
      { name: "Minh chứng về trang thiết bị hạ tầng CNTT (đường truyền Internet, phần cứng, phần mềm, hợp đồng dịch vụ, mua sắm)", type: "official_doc", category: "Hạ tầng" },
      { name: "Hướng dẫn cấp/thu hồi quyền truy cập, cách thức truy cập và sử dụng dữ liệu", type: "guideline", category: "An toàn thông tin" },
      { name: "Số liệu về kinh phí đầu tư xây dựng, bảo trì, bảo dưỡng và nâng cấp hạ tầng CNTT trong giai đoạn đánh giá", type: "report", category: "Tài chính HTCNTT" },
      { name: "Minh chứng cơ chế đảm bảo dữ liệu được lưu trữ đầy đủ, an toàn, bảo mật và toàn vẹn (phần mềm, cơ chế tổ chức thực hiện và giám sát)", type: "policy", category: "An toàn thông tin" },
      { name: "Minh chứng thông tin, dữ liệu được lưu trữ, phân tích, báo cáo và sử dụng để ra quyết định (chiến lược, phân bổ nguồn lực)", type: "report", category: "Ra quyết định" },
      { name: "Chính sách và quy trình liên quan an ninh thông tin và quản lý rủi ro", type: "policy", category: "An toàn thông tin" },
      { name: "Tài liệu cho thấy CB/NV hiểu rõ trách nhiệm liên quan đến dữ liệu", type: "training", category: "Nhận thức dữ liệu" },
      { name: "Thiết lập quyền truy cập và các giao thức quản lý người dùng", type: "procedure", category: "An toàn thông tin" },
      { name: "Ảnh chụp màn hình, báo cáo, mẫu bảng điều khiển trực quan và kết quả phân tích", type: "visual", category: "Dashboard" },
      { name: "Báo cáo đánh giá rủi ro định kỳ liên quan hệ thống thông tin", type: "audit", category: "Quản lý rủi ro" },
      { name: "Minh chứng các công cụ phân tích dữ liệu, cách thức xác định và sử dụng", type: "report", category: "Công cụ phân tích" },
    ],
    self_check_questions: [
      "Có hệ thống thông tin BĐCL tập trung (MIS/EIS) không?",
      "Các phòng ban có nhập dữ liệu định kỳ vào hệ thống không? Chu kỳ?",
      "Có dashboard tổng hợp cho lãnh đạo không?",
      "Có minh chứng dùng dữ liệu ra quyết định (biên bản, báo cáo)?",
    ],
    placeholders: {
      hien_trang: "VD: Hệ thống thông tin BĐCL (MIS) triển khai từ năm ..., liên thông với LMS, HRIS, FMIS. Các phòng ban cập nhật dữ liệu hằng tháng. Dashboard lãnh đạo có ... chỉ số real-time. Nhiều quyết định chiến lược (phân bổ ngân sách, nhân sự) đã dựa trên MIS.",
      diem_manh: "VD: MIS tích hợp; dữ liệu real-time; lãnh đạo thực sự dùng MIS để ra quyết định.",
      ton_tai: "VD: Một số phòng cập nhật dữ liệu chậm; báo cáo phân tích nâng cao (predictive) còn hạn chế.",
      ke_hoach: "VD: Tự động hóa cập nhật dữ liệu từ hệ nguồn từ ...; triển khai BI/AI analytics ...",
    },
  },

  "10.2": {
    short_name: "Bảo mật & phân tích dữ liệu",
    full_name: "Hệ thống quản lý thông tin bảo đảm chất lượng có chức năng phân tích dữ liệu và cho phép các bên liên quan truy cập dễ dàng để hỗ trợ việc ra quyết định, đồng thời phải đảm bảo tính toàn vẹn và hữu ích của thông tin.",
    requirements: [
      "CSĐT có quy định và cơ chế nhằm bảo đảm tính an toàn, bảo mật, toàn vẹn và hữu ích của thông tin (cách thức tiếp cận, quyền truy cập, trách nhiệm). Có cơ chế đảm bảo tính bảo mật, toàn vẹn và hữu ích, quản trị rủi ro.",
      "Các bộ phận/cá nhân hiểu rõ loại thông tin, dữ liệu cần lưu trữ, cách thức lưu trữ và tiếp cận, quyền truy cập, trách nhiệm.",
      "Hệ thống có cơ chế phân quyền truy cập rõ ràng để đảm bảo an toàn, toàn vẹn và bảo mật thông tin.",
      "Hệ thống có tích hợp chức năng phân tích dữ liệu (biểu đồ xu hướng, bảng so sánh, bảng điều khiển trực quan) thuận tiện cho truy xuất và ra quyết định; phân tích và báo cáo đến các cá nhân, đơn vị liên quan.",
      "Người học được truy cập dữ liệu, thông tin cần thiết để cải thiện quá trình học tập (tiến độ, phân tích kết quả).",
      "CSĐT định kỳ báo cáo, đánh giá rủi ro về tính an toàn, bảo mật, toàn vẹn và hữu ích của thông tin.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định thông tin, dữ liệu cần lưu trữ, phân công nhiệm vụ, quyền hạn, quyền truy cập, trách nhiệm", type: "regulation", category: "Hệ thống thông tin" },
      { name: "Minh chứng về trang thiết bị hạ tầng CNTT (đường truyền, phần cứng, phần mềm, hợp đồng)", type: "official_doc", category: "Hạ tầng" },
      { name: "Hướng dẫn cấp/thu hồi quyền truy cập, cách thức truy cập và sử dụng dữ liệu", type: "guideline", category: "An toàn thông tin" },
      { name: "Số liệu về kinh phí đầu tư xây dựng, bảo trì, nâng cấp hạ tầng CNTT trong giai đoạn", type: "report", category: "Tài chính HTCNTT" },
      { name: "Minh chứng cơ chế đảm bảo dữ liệu được lưu trữ đầy đủ, an toàn, bảo mật và toàn vẹn", type: "policy", category: "An toàn thông tin" },
      { name: "Minh chứng thông tin, dữ liệu được lưu trữ, phân tích, báo cáo và sử dụng để ra quyết định quan trọng của CSĐT (chiến lược, phân bổ nguồn lực)", type: "report", category: "Ra quyết định" },
      { name: "Chính sách và quy trình về an ninh thông tin và quản lý rủi ro", type: "policy", category: "An toàn thông tin" },
      { name: "Tài liệu cho thấy CB/NV hiểu rõ trách nhiệm liên quan đến dữ liệu", type: "training", category: "Nhận thức dữ liệu" },
      { name: "Thiết lập quyền truy cập và các giao thức quản lý người dùng", type: "procedure", category: "An toàn thông tin" },
      { name: "Ảnh chụp màn hình, báo cáo, mẫu bảng điều khiển trực quan và kết quả phân tích", type: "visual", category: "Dashboard" },
      { name: "Báo cáo đánh giá rủi ro định kỳ liên quan hệ thống thông tin", type: "audit", category: "Quản lý rủi ro" },
      { name: "Minh chứng các công cụ phân tích dữ liệu, cách thức xác định và sử dụng", type: "report", category: "Công cụ phân tích" },
    ],
    self_check_questions: [
      "Có chính sách ATTT chuẩn ISO 27001 hoặc tương đương không?",
      "Có kiểm thử bảo mật / pen-test định kỳ không?",
      "SV có truy cập được tiến độ học tập, điểm CLO của bản thân qua portal không?",
      "Có dashboard phân tích cho từng đơn vị không?",
    ],
    placeholders: {
      hien_trang: "VD: Chính sách ATTT theo chuẩn ISO 27001, ban hành QĐ số ... Có pen-test hằng năm bởi ... Portal SV cho phép xem tiến độ, điểm CLO từ năm ... Mỗi khoa có dashboard riêng.",
      diem_manh: "VD: ATTT chuẩn quốc tế; pen-test định kỳ; portal SV trực quan; dashboard đa cấp.",
      ton_tai: "VD: Portal SV chưa hiển thị phân tích predictive; một số đơn vị ít dùng dashboard.",
      ke_hoach: "VD: Triển khai predictive analytics trên portal SV từ ...; workshop đào tạo dashboard cho các đơn vị ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 11: Nâng cao chất lượng ═══════════════

  "11.1": {
    short_name: "Cải tiến liên tục (PDCA)",
    full_name: "CSĐT có kế hoạch liên tục tăng cường hệ thống bảo đảm chất lượng, bao gồm các hoạt động đối sánh, nghiên cứu so sánh nhằm xác định các thực hành tốt trong đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng.",
    requirements: [
      "CSĐT xây dựng và triển khai kế hoạch chiến lược nhằm cam kết liên tục tăng cường hệ thống BĐCL, liên tục tìm kiếm sự cải tiến và các thực hành tốt. Kế hoạch bao gồm các hoạt động đối sánh và nghiên cứu so sánh để xác định thực hành tốt.",
      "CSĐT sử dụng kết quả hoạt động BĐCL bên ngoài và bên trong, kết quả kiểm định, đánh giá để tìm ra thực hành tốt trong từng lĩnh vực (đào tạo, NCKH, cộng đồng) để cải tiến hệ thống.",
      "Kế hoạch liên tục tăng cường hệ thống BĐCL được gắn kết chặt chẽ với kế hoạch BĐCL, chiến lược của CSĐT và cập nhật thường xuyên dựa trên phản hồi từ tất cả các bên liên quan.",
    ],
    suggested_evidence: [
      { name: "Văn bản (chính sách, quy định, hướng dẫn) về liên tục tăng cường hệ thống BĐCL (bao gồm đối sánh, nghiên cứu so sánh)", type: "policy", category: "Cải tiến liên tục" },
      { name: "Kế hoạch liên tục tăng cường hệ thống BĐCL (dự thảo và biên bản các cuộc họp xây dựng, thống nhất)", type: "plan", category: "Cải tiến liên tục" },
      { name: "Văn bản và minh chứng hoạt động thông tin, triển khai Kế hoạch liên tục tăng cường hệ thống BĐCL đến các bên liên quan", type: "report", category: "Triển khai" },
      { name: "Báo cáo (sơ kết, tổng kết) kết quả thực hiện kế hoạch liên tục tăng cường hệ thống BĐCL (phân tích, đánh giá kết quả, chỉ rõ thực hành tốt)", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Có kế hoạch cải tiến liên tục (PDCA) được ban hành bằng văn bản không?",
      "Có hoạt động đối sánh với trường cùng loại hoặc quốc tế không?",
      "Có catalog 'thực hành tốt' (best practices) nội bộ không?",
      "Tỷ lệ khuyến nghị cải tiến từ đánh giá ngoài đã triển khai?",
    ],
    placeholders: {
      hien_trang: "VD: Kế hoạch cải tiến liên tục giai đoạn ... theo QĐ số ... Đối sánh với ... trường trong nước, ... quốc tế. Catalog best practices nội bộ có ... mục. ...% khuyến nghị từ đánh giá ngoài đã triển khai.",
      diem_manh: "VD: Kế hoạch PDCA bài bản; đối sánh rộng; catalog best practices chuẩn hóa; tỷ lệ triển khai khuyến nghị cao.",
      ton_tai: "VD: Một số thực hành tốt chưa lan tỏa đến toàn CSĐT; đối sánh quốc tế còn giới hạn ở một số trường.",
      ke_hoach: "VD: Tổ chức Best Practice Sharing Day hằng năm từ ...; mở rộng đối sánh quốc tế ...",
    },
  },

  "11.2": {
    short_name: "Đối sánh & so sánh",
    full_name: "CSĐT thiết lập các chỉ số đối sánh và so sánh từ nhiều nguồn và sử dụng các chỉ số này trong hoạt động tự đánh giá và cải tiến các hoạt động bảo đảm chất lượng.",
    requirements: [
      "CSĐT thiết lập các chỉ số đối sánh và so sánh từ nhiều nguồn khác nhau đảm bảo tính toàn diện và đáng tin cậy: dữ liệu công khai từ các CSĐT khác; dữ liệu từ các tổ chức xếp hạng, kiểm định; khảo sát, nghiên cứu của bên thứ ba; dữ liệu nội bộ từ các CSĐT đối tác đối sánh chính thức.",
      "Các chỉ số đối sánh và so sánh được sử dụng trong hoạt động tự đánh giá và cải tiến các hoạt động BĐCL. Bao gồm: chỉ số về đào tạo; NCKH; phục vụ cộng đồng và kết nối; vận hành và quản lý.",
      "CSĐT có quy trình đối sánh rõ ràng: lựa chọn đơn vị đối sánh, xác định chức năng/quy trình, thu thập dữ liệu, phân tích để xác định cơ hội cải tiến.",
      "CSĐT tài liệu hóa và chia sẻ các kết quả, bài học kinh nghiệm từ hoạt động đối sánh để thúc đẩy phát triển và nuôi dưỡng văn hóa học hỏi, trách nhiệm chung.",
    ],
    suggested_evidence: [
      { name: "Văn bản (quy định, hướng dẫn, quy trình) đối sánh và so sánh về hệ thống BĐCL", type: "regulation", category: "Đối sánh" },
      { name: "Biên bản các cuộc họp thảo luận, phân tích, xác định các nguồn tham chiếu trong xác lập các chỉ số đối sánh (có các bên liên quan bên ngoài)", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Minh chứng các hoạt động thông tin, hướng dẫn, triển khai quy trình đối sánh đến bộ phận và nhân sự liên quan", type: "report", category: "Triển khai" },
      { name: "Minh chứng cho thấy bộ phận và nhân sự hiểu rõ quy trình đối sánh và so sánh", type: "training", category: "Đào tạo nội bộ" },
      { name: "Kế hoạch tự đánh giá và cải tiến các hoạt động BĐCL có sử dụng các chỉ số đối sánh và so sánh", type: "plan", category: "Tự đánh giá" },
      { name: "Báo cáo kết quả thực hiện đối sánh và so sánh về hệ thống BĐCL (danh sách các đối tác trong nước, quốc tế)", type: "report", category: "Báo cáo đối sánh" },
      { name: "Văn bản rà soát, điều chỉnh quy trình và các chỉ số đối sánh giúp nâng cao kết quả thực hiện các hoạt động BĐCL", type: "regulation", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có quy trình đối sánh được ban hành bằng văn bản không?",
      "Số đối tác đối sánh chính thức hiện có: trong nước? quốc tế?",
      "Các chỉ số đối sánh có phủ đủ 4 mảng (đào tạo, NCKH, cộng đồng, vận hành)?",
      "Có chia sẻ bài học từ đối sánh cho toàn CSĐT không?",
    ],
    placeholders: {
      hien_trang: "VD: Quy trình đối sánh theo QĐ số ... Đối tác đối sánh: ... trong nước, ... quốc tế. Chỉ số đối sánh phủ đủ 4 mảng. Báo cáo đối sánh hằng năm; chia sẻ bài học qua ... hội thảo.",
      diem_manh: "VD: Quy trình chuẩn; đối tác đa dạng; chỉ số toàn diện; chia sẻ bài học rộng.",
      ton_tai: "VD: Một số chỉ số đối sánh quốc tế chưa có nguồn tin cậy; lan tỏa bài học chưa đồng đều giữa các đơn vị.",
      ke_hoach: "VD: Ký MOU đối sánh với ... từ ...; chuẩn hóa định dạng chia sẻ bài học ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 12: Kết quả về đào tạo ═══════════════

  "12.1": {
    short_name: "Chỉ số kết quả đào tạo",
    full_name: "Các chỉ số về kết quả đầu ra như tỉ lệ tốt nghiệp, tỉ lệ thôi học, thời gian tốt nghiệp trung bình và mức độ đạt chuẩn đầu ra của tất cả các CTĐT được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập các chỉ số kết quả đầu ra: tỷ lệ tốt nghiệp, tỷ lệ thôi học, thời gian tốt nghiệp trung bình, kết quả đánh giá chuẩn đầu ra CLOs, PLOs cho từng CTĐT.",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu các chỉ số kết quả đầu ra theo định kỳ cho từng CTĐT.",
      "CSĐT triển khai quy trình đối sánh các chỉ số kết quả đầu ra giữa các CTĐT trong nội bộ và/hoặc với các cơ sở tương đồng trong nước, khu vực.",
      "CSĐT triển khai quy trình sử dụng kết quả phân tích, đối sánh để cải tiến chất lượng CTĐT, phương pháp dạy học, kiểm tra đánh giá và các dịch vụ hỗ trợ.",
    ],
    suggested_evidence: [
      { name: "Báo cáo kết quả học tập và tốt nghiệp của người học các năm gần đây (05 năm)", type: "report", category: "Kết quả đào tạo" },
      { name: "Tỷ lệ người tốt nghiệp đúng hạn, tỷ lệ thôi học, nguyên nhân thôi học", type: "report", category: "Kết quả đào tạo" },
      { name: "Thống kê thời gian tốt nghiệp bình quân của từng CTĐT", type: "report", category: "Kết quả đào tạo" },
      { name: "Báo cáo tổng hợp mức độ đạt chuẩn các CLOs dựa trên kết quả đánh giá kết thúc học phần/CĐR chương trình", type: "report", category: "Đo CLO/PLO" },
      { name: "Biên bản họp Hội đồng Khoa, Hội đồng KH&ĐT phân tích kết quả đầu ra", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Báo cáo so sánh nội bộ và đối sánh bên ngoài với các cơ sở giáo dục tương đồng", type: "report", category: "Đối sánh" },
      { name: "Kế hoạch cải tiến hoặc điều chỉnh CTĐT dựa trên kết quả", type: "plan", category: "Cải tiến" },
      { name: "Công cụ thu thập dữ liệu: phần mềm quản lý đào tạo, khảo sát người học/cựu, hệ thống đánh giá học tập", type: "visual", category: "Công cụ" },
      { name: "Báo cáo tổng kết đánh giá CTĐT hằng năm", type: "report", category: "Báo cáo định kỳ" },
    ],
    self_check_questions: [
      "Tỷ lệ tốt nghiệp đúng hạn toàn CSĐT / theo CTĐT trong 5 năm gần nhất?",
      "Tỷ lệ thôi học và nguyên nhân? Có phân tích xu hướng?",
      "Đã có báo cáo đo mức đạt CLO/PLO cho bao nhiêu CTĐT?",
      "Có đối sánh với trường cùng loại không? Kết quả?",
    ],
    placeholders: {
      hien_trang: "VD: Tỷ lệ tốt nghiệp đúng hạn toàn trường ...% (5 năm TB). Tỷ lệ thôi học ...%, nguyên nhân: học lực ...%, chuyển ngành ...%, khác ... Đã đo CLO trên ...% CTĐT, PLO trên ...% CTĐT. Đối sánh với ... trường cho thấy ...",
      diem_manh: "VD: Tỷ lệ tốt nghiệp cao, xu hướng tăng; đo CLO phủ rộng; đối sánh vị thế cao.",
      ton_tai: "VD: Một số CTĐT tỷ lệ thôi học > 10%; đo PLO ở một số CTĐT mới sơ khai.",
      ke_hoach: "VD: Chương trình hỗ trợ học tập cho ... CTĐT từ ...; chuẩn hóa đo PLO toàn trường ...",
    },
  },

  "12.2": {
    short_name: "Việc làm & khởi nghiệp SV",
    full_name: "Tình hình việc làm, khởi nghiệp và các nguyện vọng nghề nghiệp khác của người học tốt nghiệp được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập mục tiêu, chỉ tiêu và phạm vi theo dõi việc làm, khởi nghiệp, nguyện vọng nghề nghiệp của người học sau tốt nghiệp (tối thiểu sau 06 và/hoặc 12 tháng).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu từ khảo sát người học/cựu/nhà tuyển dụng về việc làm, khởi nghiệp, định hướng nghề nghiệp.",
      "CSĐT triển khai quy trình đối sánh tình hình việc làm, khởi nghiệp với các chuẩn trong nước/khu vực và với các cơ sở tương đồng.",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến hỗ trợ nghề nghiệp, CTĐT, dịch vụ tư vấn - kết nối DN và cơ chế khuyến khích khởi nghiệp.",
    ],
    suggested_evidence: [
      { name: "Báo cáo khảo sát việc làm của người tốt nghiệp (tỷ lệ có việc làm, thời gian có việc làm, lĩnh vực)", type: "survey", category: "Việc làm SV" },
      { name: "Khảo sát sinh viên khởi nghiệp hoặc tự tạo việc làm", type: "survey", category: "Khởi nghiệp" },
      { name: "Báo cáo từ Trung tâm hỗ trợ người học, phòng công tác người học, Khoa/Bộ môn", type: "report", category: "Báo cáo định kỳ" },
      { name: "Biên bản phân tích và đánh giá so sánh với các đơn vị cùng lĩnh vực (trong nước/quốc tế)", type: "meeting_minutes", category: "Đối sánh" },
      { name: "Kế hoạch/biên bản cải tiến từ phòng công tác người học/khoa dựa trên phản hồi từ khảo sát cựu SV, nhà tuyển dụng", type: "plan", category: "Cải tiến" },
      { name: "Các buổi tọa đàm DN, hội thảo nghề nghiệp", type: "report", category: "Hoạt động DN" },
      { name: "Kết quả tư vấn hướng nghiệp, hỗ trợ việc làm, ngày hội việc làm", type: "report", category: "Việc làm SV" },
      { name: "Báo cáo truyền thông, kết nối cựu người học, hoạt động mạng lưới nghề nghiệp", type: "report", category: "Cựu SV" },
    ],
    self_check_questions: [
      "Tỷ lệ SV có việc làm sau 6 tháng / 12 tháng / 24 tháng tốt nghiệp?",
      "Tỷ lệ SV khởi nghiệp? Số startup do SV sáng lập còn tồn tại?",
      "Mức thu nhập bình quân SV tốt nghiệp?",
      "Có đối sánh với trường khác / chuẩn quốc gia?",
    ],
    placeholders: {
      hien_trang: "VD: Khảo sát việc làm cựu SV: ...% sau 6 tháng, ...% sau 12 tháng. Khởi nghiệp: ... SV, ... startup tồn tại. Thu nhập bình quân ... triệu/tháng. Đối sánh với ... trường trong ngành ...",
      diem_manh: "VD: Tỷ lệ việc làm cao, thu nhập khá; có ecosystem khởi nghiệp; đối sánh tốt.",
      ton_tai: "VD: Tỷ lệ phản hồi khảo sát cựu SV còn thấp (...%); dữ liệu khởi nghiệp dài hạn chưa theo dõi có hệ thống.",
      ke_hoach: "VD: Triển khai platform alumni tracking từ ...; xây dựng KPI khởi nghiệp dài hạn ...",
    },
  },

  "12.3": {
    short_name: "Tác động dài hạn & SDGs",
    full_name: "Các chỉ số về kết quả đầu ra và về tác động dài hạn, như mức độ đóng góp cho sự phát triển quốc gia và các mục tiêu phát triển bền vững, được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập chỉ báo về kết quả và tác động dài hạn của người học sau tốt nghiệp: đóng góp phát triển quốc gia, thực hiện SDGs, đổi mới sáng tạo, tham gia chính sách công.",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu và minh chứng về đóng góp dài hạn (khảo sát cựu SV/nhà tuyển dụng, hợp tác với CP/DN, hoạt động SDGs).",
      "CSĐT triển khai quy trình đối sánh các chỉ số về tác động dài hạn với chuẩn trong nước/khu vực/quốc tế hoặc cơ sở tương đồng.",
      "CSĐT sử dụng kết quả để cải tiến chiến lược, chính sách, CTĐT và hoạt động phục vụ cộng đồng nhằm nâng cao đóng góp vào phát triển quốc gia và SDGs.",
    ],
    suggested_evidence: [
      { name: "Báo cáo đánh giá kết quả đào tạo gắn với đóng góp cho phát triển quốc gia, địa phương, ngành nghề", type: "report", category: "Đóng góp quốc gia" },
      { name: "Báo cáo hoạt động/chiến lược liên kết với các mục tiêu phát triển bền vững (SDGs) của Liên Hợp Quốc", type: "strategic_plan", category: "SDGs" },
      { name: "Biên bản làm việc, hợp tác với các cơ quan chính phủ, DN, tổ chức xã hội về đóng góp phát triển", type: "meeting_minutes", category: "Hợp tác CP/DN" },
      { name: "Kết quả khảo sát cựu SV, nhà tuyển dụng về mức độ ảnh hưởng nghề nghiệp và đóng góp cộng đồng", type: "survey", category: "Tác động cựu SV" },
      { name: "Số liệu về cựu SV tham gia khởi nghiệp, đổi mới sáng tạo, hoạch định chính sách hoặc phát triển bền vững", type: "report", category: "Dữ liệu cựu SV" },
      { name: "Báo cáo truyền thông, tin tức, ấn phẩm về tác động xã hội của người học/GV/trường", type: "report", category: "Truyền thông" },
      { name: "Hồ sơ minh chứng hợp tác liên ngành, liên trường trong phát triển các sáng kiến vì cộng đồng", type: "report", category: "Hợp tác liên ngành" },
    ],
    self_check_questions: [
      "Có chỉ số đo đóng góp của cựu SV cho quốc gia / SDGs không?",
      "Có khảo sát cựu SV dài hạn (5 năm+) để đo tác động không?",
      "Có báo cáo ảnh hưởng chính sách / sáng kiến của cựu SV không?",
      "Có hợp tác với cơ quan chính phủ để theo dõi tác động không?",
    ],
    placeholders: {
      hien_trang: "VD: Chỉ báo tác động dài hạn: ... cựu SV giữ vị trí lãnh đạo CP/DN, ... sáng kiến chính sách, ... hoạt động gắn SDGs. Khảo sát cựu SV 5 năm và 10 năm sau TN. Hợp tác với ... bộ/ngành theo dõi tác động.",
      diem_manh: "VD: Có hệ thống theo dõi dài hạn; minh chứng đóng góp cấp CP/DN rõ; gắn SDGs có số liệu.",
      ton_tai: "VD: Tỷ lệ phản hồi khảo sát 10 năm còn thấp; chưa có báo cáo impact assessment chuẩn mực.",
      ke_hoach: "VD: Xây dựng LinkedIn-based tracking cựu SV từ ...; chuẩn hóa impact assessment theo ... khung ...",
    },
  },

  "12.4": {
    short_name: "Hài lòng về người học tốt nghiệp",
    full_name: "Mức độ hài lòng của các bên liên quan đối với chất lượng người học tốt nghiệp được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập khảo sát mức độ hài lòng của các bên liên quan (người học, cựu SV, nhà tuyển dụng, GV, CB hỗ trợ) về chất lượng người học tốt nghiệp.",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích kết quả khảo sát theo định kỳ, phân tích theo nhóm đối tượng và lĩnh vực việc làm.",
      "CSĐT triển khai quy trình đối sánh mức độ hài lòng nội bộ giữa các CTĐT/đơn vị và/hoặc với chuẩn bên ngoài, chuẩn nghề nghiệp hoặc chuẩn khu vực.",
      "CSĐT sử dụng kết quả để cải tiến CTĐT, phương pháp dạy học, kiểm tra đánh giá và dịch vụ hỗ trợ, công bố kết quả.",
    ],
    suggested_evidence: [
      { name: "Báo cáo khảo sát mức độ hài lòng của: SV sắp tốt nghiệp về năng lực cá nhân sau đào tạo; cựu SV về sự phù hợp giữa năng lực đào tạo và công việc thực tế; nhà tuyển dụng về kỹ năng chuyên môn, mềm, thái độ nghề nghiệp", type: "survey", category: "Khảo sát hài lòng" },
      { name: "Biên bản họp phân tích kết quả khảo sát và đề xuất cải tiến", type: "meeting_minutes", category: "Hồ sơ họp" },
      { name: "Kế hoạch và báo cáo thực hiện các hành động cải tiến", type: "plan", category: "Cải tiến" },
      { name: "Bản đối sánh chuẩn đầu ra người học với tiêu chuẩn nghề nghiệp/chuẩn khu vực", type: "report", category: "Đối sánh chuẩn" },
      { name: "Báo cáo công khai kết quả khảo sát trên trang web của trường", type: "website", category: "Truyền thông" },
      { name: "Quy trình thu thập, xử lý và sử dụng phản hồi từ các bên liên quan", type: "procedure", category: "Khảo sát" },
      { name: "Biên bản hội thảo/đối thoại giữa nhà trường với DN, cựu SV, người học năm cuối", type: "meeting_minutes", category: "Đối thoại" },
    ],
    self_check_questions: [
      "Mức độ hài lòng của nhà tuyển dụng về SV tốt nghiệp trong giai đoạn?",
      "Mức độ hài lòng của cựu SV về chương trình đào tạo?",
      "Có đối sánh giữa các CTĐT về mức hài lòng không?",
      "Có công khai kết quả khảo sát không?",
    ],
    placeholders: {
      hien_trang: "VD: Khảo sát nhà tuyển dụng hằng năm (... DN), điểm TB ... /5. Cựu SV khảo sát sau 1, 5 năm; mức hài lòng ... /5. Đối sánh giữa ... CTĐT cho thấy ... Công khai trên website.",
      diem_manh: "VD: Khảo sát đa bên đầy đủ; điểm hài lòng cao; công khai minh bạch; có cải tiến cụ thể sau khảo sát.",
      ton_tai: "VD: Tỷ lệ phản hồi một số đối tượng thấp; chưa đo hài lòng theo ngành học chi tiết.",
      ke_hoach: "VD: Triển khai khảo sát chi tiết theo ngành từ ...; tăng tỷ lệ phản hồi qua kênh ... từ ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 13: Kết quả về NCKH ═══════════════

  "13.1": {
    short_name: "Ngân quỹ NCKH",
    full_name: "Nguồn kinh phí và phân bổ kinh phí cho hoạt động nghiên cứu khoa học của CSĐT được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập chính sách/tiêu chí và kế hoạch cấp/phân bổ ngân quỹ cho hoạt động NCKH (gắn chiến lược/kế hoạch phát triển KHCN, chỉ tiêu tài chính, nguồn lực, chu kỳ và phạm vi).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu phân bổ/cấp ngân quỹ hằng năm để theo dõi mức độ phù hợp và hiệu quả sử dụng kinh phí.",
      "CSĐT triển khai quy trình đối sánh mức ngân quỹ NCKH theo năm (nội bộ giữa các đơn vị và/hoặc với cơ sở tương đồng, chuẩn trong nước/khu vực).",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến điều chỉnh mức đầu tư/phân bổ ngân quỹ, ưu tiên lĩnh vực và hoàn thiện quy định tài chính cho NCKH.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch/Chiến lược phát triển khoa học công nghệ và tài chính của CSĐT (chỉ số về ngân quỹ cho NCKH)", type: "strategic_plan", category: "Chiến lược NCKH" },
      { name: "Văn bản quy định về ngân quỹ cho hoạt động NCKH của CSĐT", type: "regulation", category: "Tài chính NCKH" },
      { name: "Báo cáo tài chính hằng năm của CSĐT (báo cáo tài chính cho hoạt động NCKH)", type: "report", category: "Báo cáo định kỳ" },
      { name: "CSDL về hoạt động của các quỹ đầu tư cho NCKH của CSĐT (nếu có)", type: "report", category: "Tài chính NCKH" },
      { name: "Hệ thống giám sát về ngân quỹ cho hoạt động NCKH", type: "procedure", category: "Giám sát tài chính" },
      { name: "Bản đối sánh về ngân quỹ cho hoạt động NCKH trong 05 năm thuộc chu kỳ kiểm định", type: "report", category: "Đối sánh" },
      { name: "Văn bản quy định/phiếu khảo sát về việc thu thập thông tin phản hồi của các bên liên quan về mức độ phù hợp của ngân quỹ NCKH và kết quả khảo sát hằng năm", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Các biên bản họp rà soát, điều chỉnh; các quyết định điều chỉnh về ngân quỹ cho hoạt động NCKH", type: "meeting_minutes", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Ngân sách NCKH hằng năm chiếm bao nhiêu % tổng chi CSĐT?",
      "Có quy định phân bổ ngân sách NCKH rõ ràng không?",
      "Ngân sách NCKH bình quân/GV so với trường tương đương?",
      "Có khảo sát GV về mức độ đủ của ngân sách NCKH không?",
    ],
    placeholders: {
      hien_trang: "VD: Ngân sách NCKH hằng năm chiếm ...% tổng chi, tương đương ... đồng/GV. Quy định phân bổ theo QĐ số ... Đối sánh với ... trường cùng quy mô: vượt/đạt/dưới TB. Khảo sát GV cho thấy ...% hài lòng với ngân sách.",
      diem_manh: "VD: Ngân sách NCKH tăng đều qua các năm; phân bổ theo tiêu chí minh bạch; khảo sát GV dương tính.",
      ton_tai: "VD: Ngân sách NCKH/GV còn thấp hơn TB trường top; một số lĩnh vực (nhân văn) ngân sách hạn chế.",
      ke_hoach: "VD: Tăng ngân sách NCKH lên ... đồng/GV từ ...; bổ sung chính sách ưu tiên lĩnh vực ...",
    },
  },

  "13.2": {
    short_name: "Sản phẩm NCKH",
    full_name: "Loại hình và số lượng của các sản phẩm nghiên cứu khoa học và các tài sản trí tuệ khác do đội ngũ giảng viên, nghiên cứu viên và người học tạo ra được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập loại hình và số lượng sản phẩm NCKH và tài sản trí tuệ (quy định/khối lượng, chỉ tiêu theo GV/NCV/người học).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu sản phẩm NCKH và tài sản trí tuệ (theo dõi/giám sát, CSDL cập nhật định kỳ) để đánh giá mức đạt so với chỉ tiêu.",
      "CSĐT triển khai quy trình đối sánh loại hình và số lượng sản phẩm NCKH và tài sản trí tuệ hằng năm (nội bộ/ngoài trường; tham chiếu tổ chức kiểm định/xếp hạng hoặc đối tác).",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến (điều chỉnh chỉ tiêu, cơ chế khuyến khích/đầu tư, phát triển hạ tầng nghiên cứu).",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định/quản lý hoạt động NCKH của CSĐT (quy định loại hình, khối lượng) của GV, NCV và người học", type: "regulation", category: "Quản lý NCKH" },
      { name: "Kế hoạch phát triển KHCN của CSĐT (chỉ số về loại hình và khối lượng nghiên cứu)", type: "strategic_plan", category: "Chiến lược NCKH" },
      { name: "Quy định về theo dõi, giám sát hoạt động NCKH của GV, NCV và người học", type: "regulation", category: "Giám sát NCKH" },
      { name: "Quy định về xây dựng và cập nhật CSDL hoạt động nghiên cứu của GV, NCV và người học", type: "regulation", category: "Hệ thống dữ liệu" },
    ],
    self_check_questions: [
      "Số bài báo ISI/Scopus trung bình / GV / năm?",
      "Số đề tài NCKH các cấp trong giai đoạn?",
      "Số bằng SHTT / giải pháp hữu ích?",
      "Có đối sánh với trường cùng loại không?",
    ],
    placeholders: {
      hien_trang: "VD: Giai đoạn ...: ... bài ISI/Scopus (... bài Q1), ... đề tài các cấp, ... bằng SHTT. Bình quân ... bài/GV/năm. So với ... trường cùng loại: vượt/đạt/dưới.",
      diem_manh: "VD: Số bài ISI/Scopus tăng mạnh; có nhiều bài Q1; bằng SHTT có giải pháp hữu ích thực tế.",
      ton_tai: "VD: Tỷ lệ bài Q1 còn thấp; số bằng SHTT chưa đều giữa các ngành.",
      ke_hoach: "VD: Chính sách thưởng Q1 tăng từ ...; ưu tiên đầu tư nhóm nghiên cứu có tiềm năng SHTT ...",
    },
  },

  "13.3": {
    short_name: "Đổi mới sáng tạo & khởi nghiệp",
    full_name: "Kết quả nghiên cứu khoa học và đổi mới sáng tạo trong kinh doanh, bao gồm khởi nghiệp, ươm tạo khởi nghiệp, thương mại hóa, được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập phạm vi/kết quả NCKH và đổi mới sáng tạo trong kinh doanh, bao gồm khởi nghiệp, ươm tạo, thương mại hóa (chỉ tiêu, danh mục minh chứng, yêu cầu báo cáo và cập nhật CSDL).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích số liệu kết quả NCKH và đổi mới sáng tạo trong kinh doanh theo năm.",
      "CSĐT triển khai quy trình đối sánh kết quả khởi nghiệp/ươm tạo/thương mại hóa theo thời gian, giữa các đơn vị và/hoặc với cơ sở tương đương.",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến (đầu tư, cơ chế ươm tạo/thương mại hóa, chính sách hỗ trợ, kết nối DN).",
    ],
    suggested_evidence: [
      { name: "Bản đối sánh về loại hình và khối lượng nghiên cứu của GV, NCV và người học", type: "report", category: "Đối sánh" },
      { name: "Quyết định, kết luận, đầu tư thể hiện cải tiến chất lượng hoạt động KHCN dựa trên mức độ hài lòng của các bên", type: "decision", category: "Cải tiến" },
      { name: "Báo cáo tổng kết hoạt động NCKH hằng năm của CSĐT", type: "report", category: "Báo cáo định kỳ" },
      { name: "Danh sách các đề tài NCKH các cấp đã được nghiệm thu", type: "report", category: "Đề tài NCKH" },
      { name: "Danh sách các bằng sáng chế, nhãn hiệu bản quyền, ấn phẩm, trích dẫn, hợp đồng chuyển giao và thương mại hóa", type: "report", category: "Sở hữu trí tuệ" },
      { name: "Danh sách các bài báo được công bố kèm đường link", type: "report", category: "Công bố" },
      { name: "Bảng tổng hợp thu chi tài chính trong hoạt động NCKH hằng năm", type: "report", category: "Tài chính NCKH" },
      { name: "Văn bản của CSĐT thể hiện cải tiến/đầu tư để nâng cao chất lượng hoạt động KHCN", type: "decision", category: "Cải tiến" },
      { name: "Kết quả khảo sát mức độ hài lòng của các bên liên quan về hoạt động NCKH, tác động đến công nghiệp và xã hội", type: "survey", category: "Khảo sát - góp ý" },
    ],
    self_check_questions: [
      "Số hợp đồng chuyển giao công nghệ trong giai đoạn? Doanh thu?",
      "Số startup do GV/SV sáng lập được ươm tạo? Tỷ lệ tồn tại sau 3 năm?",
      "Có vườn ươm nội bộ không? Quy mô?",
      "Có hợp tác DN trong chuyển giao không?",
    ],
    placeholders: {
      hien_trang: "VD: Giai đoạn ...: ... hợp đồng chuyển giao, doanh thu ... đồng. Vườn ươm ươm ... startup, ... tồn tại sau 3 năm. Hợp tác ... DN về chuyển giao công nghệ.",
      diem_manh: "VD: Hoạt động chuyển giao có doanh thu; vườn ươm hoạt động hiệu quả; hợp tác DN phong phú.",
      ton_tai: "VD: Tỷ lệ thương mại hóa còn thấp so kỳ vọng; một số ngành chưa có hoạt động chuyển giao.",
      ke_hoach: "VD: Tăng cường kết nối DN cho ngành ... từ ...; triển khai chương trình pre-incubation ...",
    },
  },

  "13.4": {
    short_name: "Đóng góp NCKH cho quốc gia & SDGs",
    full_name: "Hoạt động nghiên cứu khoa học của CSĐT có đóng góp vào sự phát triển quốc gia và phù hợp với các mục tiêu phát triển bền vững.",
    requirements: [
      "CSĐT có hệ thống xác lập mục tiêu và chỉ báo về đóng góp phát triển quốc gia và phù hợp SDGs (gắn chiến lược KHCN; xác định lĩnh vực ưu tiên, chuẩn tham chiếu).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích minh chứng đóng góp (chuyển giao, chính sách công, sáng chế/giải pháp, tác động ngành/địa phương) và liên kết SDGs.",
      "CSĐT triển khai quy trình đối sánh mức đóng góp và sự phù hợp SDGs với chuẩn quốc gia/khu vực/quốc tế.",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến định hướng nghiên cứu ưu tiên, cơ chế khuyến khích và tích hợp SDGs vào chính sách, chương trình, chuyển giao.",
    ],
    suggested_evidence: [
      { name: "Chiến lược/Kế hoạch phát triển của địa phương/vùng/quốc gia", type: "external_doc", category: "Căn cứ pháp lý" },
      { name: "Danh sách sản phẩm NCKH của đề tài các cấp được chuyển giao công nghệ", type: "report", category: "Chuyển giao CN" },
      { name: "Danh sách bằng sáng chế, nhãn hiệu bản quyền, ấn phẩm, trích dẫn, hợp đồng chuyển giao có đóng góp phát triển quốc gia/vùng/địa phương", type: "report", category: "Sở hữu trí tuệ" },
      { name: "Báo cáo tổng kết hoạt động NCKH hằng năm của CSĐT/báo cáo tổng kết kế hoạch KHCN trung/dài hạn", type: "report", category: "Báo cáo định kỳ" },
      { name: "Bảng tổng hợp thu chi tài chính trong hoạt động NCKH hằng năm", type: "report", category: "Tài chính NCKH" },
    ],
    self_check_questions: [
      "CSĐT có danh mục lĩnh vực NCKH ưu tiên phù hợp định hướng quốc gia không?",
      "Số đề tài NCKH phục vụ địa phương / vùng / quốc gia?",
      "Số sản phẩm NCKH gắn với SDGs cụ thể?",
      "Có báo cáo impact assessment NCKH không?",
    ],
    placeholders: {
      hien_trang: "VD: Lĩnh vực ưu tiên NCKH (ban hành QĐ số ...): ..., gắn định hướng ... của quốc gia. Giai đoạn có ... đề tài phục vụ địa phương, ... sản phẩm gắn SDGs. Báo cáo impact assessment năm ... cho thấy ...",
      diem_manh: "VD: Định hướng rõ; có đóng góp cụ thể cho địa phương; gắn SDGs có số liệu.",
      ton_tai: "VD: Một số SDGs (vd SDG 13, 14) chưa có đề tài; đo impact còn định tính chủ yếu.",
      ke_hoach: "VD: Triển khai đề tài SDG 13/14 từ ...; chuẩn hóa impact assessment theo ... khung ...",
    },
  },

  // ═══════════════ Tiêu chuẩn 14: Kết quả kết nối và phục vụ cộng đồng ═══════════════

  "14.1": {
    short_name: "Hoạt động cộng đồng",
    full_name: "Loại hình và số lượng hoạt động kết nối, phục vụ cộng đồng và đóng góp cho xã hội được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập loại hình, phân loại và chỉ tiêu/số lượng hoạt động kết nối, phục vụ cộng đồng và đóng góp cho xã hội; phạm vi, đơn vị phụ trách và chỉ số theo dõi đầu vào - đầu ra.",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích dữ liệu về quy mô, tần suất, số lượng dự án, mức độ tham gia của người học/GV và đối tượng thụ hưởng.",
      "CSĐT triển khai quy trình đối sánh hiệu quả hoạt động giữa các giai đoạn, giữa các đơn vị và/hoặc với cơ sở tương đương, kể cả TB quốc gia/khu vực và SDGs.",
      "CSĐT sử dụng kết quả để cải tiến kế hoạch hằng năm, thiết kế hoạt động, phân bổ nguồn lực và nâng cao chất lượng/tác động xã hội.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch chiến lược/các văn bản chính sách, quy định quản lý của CSĐT (xác định loại hình và số lượng hoạt động)", type: "strategic_plan", category: "Chiến lược cộng đồng" },
      { name: "Sơ đồ tổ chức, văn bản mô tả chức năng, nhiệm vụ của các đơn vị phụ trách hoạt động kết nối, phục vụ cộng đồng", type: "visual", category: "Cơ cấu tổ chức" },
      { name: "Kế hoạch hằng năm về hoạt động kết nối, phục vụ cộng đồng và đóng góp cho xã hội", type: "plan", category: "Kế hoạch triển khai" },
      { name: "Báo cáo/thống kê hằng năm (số lượng hoạt động, mức độ tham gia của người học/GV, nhóm đối tượng thụ hưởng)", type: "report", category: "Báo cáo định kỳ" },
      { name: "Công cụ theo dõi, CSDL quản lý hoạt động, kết quả khảo sát, báo cáo phản hồi từ các bên liên quan", type: "visual", category: "Công cụ theo dõi" },
      { name: "Báo cáo đánh giá nội bộ về hiệu quả của các hoạt động phục vụ cộng đồng giữa các đơn vị hoặc với các CSĐT tương đương", type: "report", category: "Đánh giá hiệu quả" },
      { name: "Báo cáo đối sánh hiệu quả hoạt động của CSĐT với TB quốc gia/khu vực hoặc các SDGs", type: "report", category: "Đối sánh" },
      { name: "Biên bản họp rà soát, điều chỉnh; quyết định điều chỉnh về loại hình và số lượng hoạt động kết nối", type: "meeting_minutes", category: "Cải tiến" },
      { name: "Kế hoạch hành động hoặc cải tiến đã triển khai dựa trên kết quả phân tích từ đối sánh", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có chuẩn hóa loại hình hoạt động cộng đồng không? Bao nhiêu loại?",
      "Số lượng hoạt động cộng đồng trong giai đoạn?",
      "Tỷ lệ GV/SV tham gia?",
      "Có đối sánh với chuẩn quốc gia / SDGs không?",
    ],
    placeholders: {
      hien_trang: "VD: Loại hình hoạt động cộng đồng (chuẩn hóa theo QĐ số ...): gồm chuyển giao KHCN, tư vấn pháp lý/y tế, tình nguyện, đào tạo bồi dưỡng địa phương... Giai đoạn: ... hoạt động, ...% GV tham gia, ...% SV. Đối sánh với ... cho thấy ...",
      diem_manh: "VD: Phân loại chuẩn; quy mô lớn; tham gia đa bên; đối sánh tích cực.",
      ton_tai: "VD: Chất lượng đo lường chưa định lượng rõ; một số khoa tham gia còn ít.",
      ke_hoach: "VD: Triển khai hệ thống quản lý hoạt động cộng đồng từ ...; KPI cộng đồng cho từng khoa ...",
    },
  },

  "14.2": {
    short_name: "Tác động xã hội & SDGs",
    full_name: "Tác động xã hội và kết quả của các hoạt động kết nối, phục vụ cộng đồng, đóng góp cho xã hội và các mục tiêu phát triển bền vững được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập cách thức hoạt động gắn với tác động xã hội và SDGs, nêu kết quả mong đợi (giảm nghèo, sức khỏe cộng đồng, công bằng xã hội).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích chỉ số/minh chứng tác động ngắn hạn và dài hạn bằng khảo sát, phỏng vấn, nghiên cứu tình huống.",
      "CSĐT triển khai quy trình đối sánh tác động xã hội theo thời gian, giữa các đơn vị và/hoặc với tổ chức tương đương/mốc tham chiếu bên ngoài; liên hệ SDGs.",
      "CSĐT sử dụng kết quả để cải tiến quyết định chiến lược, kế hoạch bền vững và nâng cao hiệu quả các hoạt động kết nối.",
    ],
    suggested_evidence: [
      { name: "Sứ mạng/kế hoạch chiến lược của CSĐT về phục vụ cộng đồng có liên kết tác động xã hội và SDGs", type: "strategic_plan", category: "Chiến lược cộng đồng" },
      { name: "Quy định, hướng dẫn về quy trình, công cụ, phương pháp đánh giá tác động", type: "guideline", category: "Đánh giá tác động" },
      { name: "Tuyên bố kết quả đầu ra mong đợi của các chương trình phục vụ và gắn kết cộng đồng", type: "official_statement", category: "Tác động mong đợi" },
      { name: "Biên bản/báo cáo thể hiện tác động thực tế đối với cộng đồng (vd: giảm tỷ lệ thôi học các cấp, cải thiện vệ sinh môi trường, phát triển kỹ năng)", type: "report", category: "Tác động thực tế" },
      { name: "Giải thưởng, biên bản kết thúc chương trình/dự án được ký với các đối tượng thụ hưởng", type: "official_doc", category: "Kết quả dự án" },
      { name: "Khảo sát cộng đồng hoặc cơ chế phản hồi được tích hợp trong chu trình thực hiện dự án", type: "survey", category: "Phản hồi cộng đồng" },
      { name: "Công cụ theo dõi có xác định rõ các chỉ số đo lường tác động xã hội", type: "visual", category: "Công cụ đo" },
      { name: "Báo cáo kết quả đối sánh về tác động xã hội và kết quả của các hoạt động kết nối, phục vụ cộng đồng", type: "report", category: "Đối sánh" },
      { name: "Kế hoạch cải tiến về công tác kết nối dựa trên kết quả khảo sát và đối sánh", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có bộ chỉ số đo tác động xã hội không?",
      "Có báo cáo tác động định lượng (vd: giảm nghèo X%, giảm sức khỏe Y%) không?",
      "Có liên kết với SDGs cụ thể không?",
      "Có đối sánh với tổ chức khác không?",
    ],
    placeholders: {
      hien_trang: "VD: Bộ chỉ số tác động ban hành QĐ số ... Giai đoạn: ... dự án phục vụ cộng đồng, tác động đo được: giảm ...%, cải thiện ... Gắn SDGs ... Đối sánh với ...",
      diem_manh: "VD: Có bộ chỉ số định lượng; báo cáo tác động cụ thể; liên kết SDGs rõ.",
      ton_tai: "VD: Đo tác động dài hạn (5 năm+) chưa có hệ thống; đối sánh quốc tế còn hạn chế.",
      ke_hoach: "VD: Xây dựng longitudinal impact study từ ...; mở rộng đối sánh với mạng ... ...",
    },
  },

  "14.3": {
    short_name: "Tác động đến SV & GV",
    full_name: "Tác động đối với người học và đội ngũ giảng viên, nhân viên từ các hoạt động kết nối, phục vụ cộng đồng, đóng góp cho xã hội và các mục tiêu phát triển bền vững được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập cách thức hoạt động cộng đồng ảnh hưởng tích cực đến người học (kỹ năng mềm, trách nhiệm xã hội, năng lực lãnh đạo, công dân toàn cầu) và GV/nhân viên (phát triển chuyên môn, ứng dụng nghiên cứu, cải tiến phương pháp giảng dạy, gắn kết với nhà trường/cộng đồng).",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích tác động ngắn hạn và dài hạn bằng khảo sát, phỏng vấn, phản hồi đồng nghiệp, thảo luận nhóm, nghiên cứu tình huống.",
      "CSĐT triển khai quy trình đối sánh kết quả tác động theo thời gian, giữa các đơn vị và/hoặc với chuẩn đầu ra nội bộ/tham chiếu ngoài để đánh giá mức độ đạt được.",
      "CSĐT sử dụng kết quả để cải tiến chương trình gắn kết cộng đồng, bồi dưỡng năng lực và tích hợp kết quả vào CTĐT/hoạt động học tập - giảng dạy.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định, hướng dẫn về quy trình, công cụ, phương pháp đánh giá tác động đối với người học và đội ngũ GV, nhân viên từ các hoạt động phục vụ cộng đồng", type: "guideline", category: "Đánh giá tác động" },
      { name: "Tuyên bố về kết quả đầu ra mong đợi đối với người học và đội ngũ GV, nhân viên", type: "official_statement", category: "Tác động mong đợi" },
      { name: "Kế hoạch và báo cáo thực hiện đánh giá tác động", type: "report", category: "Báo cáo định kỳ" },
      { name: "Hệ thống giám sát về tác động đối với người học và đội ngũ GV, nhân viên", type: "procedure", category: "Giám sát" },
      { name: "Báo cáo kết quả khảo sát về tác động đối với người học và đội ngũ", type: "survey", category: "Khảo sát - góp ý" },
      { name: "Báo cáo kết quả đối sánh về tác động đối với người học và đội ngũ", type: "report", category: "Đối sánh" },
      { name: "Kế hoạch cải tiến về công tác kết nối dựa trên kết quả khảo sát và đối sánh", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có đo kỹ năng mềm / thái độ của SV thay đổi sau hoạt động cộng đồng không?",
      "Có khảo sát GV về tác động của hoạt động cộng đồng đến giảng dạy/NCKH không?",
      "Có tích hợp hoạt động cộng đồng vào CTĐT (service-learning) không?",
    ],
    placeholders: {
      hien_trang: "VD: Khảo sát SV sau hoạt động cộng đồng: ...% báo cáo tăng kỹ năng mềm. GV: ...% áp dụng vào giảng dạy. Service-learning tích hợp vào ... học phần.",
      diem_manh: "VD: Khảo sát đầy đủ; tác động có số liệu; service-learning chính thức.",
      ton_tai: "VD: Đo tác động dài hạn chưa có; service-learning giới hạn ngành.",
      ke_hoach: "VD: Tracking alumni về tác động từ cộng đồng; mở rộng service-learning sang ... ngành...",
    },
  },

  "14.4": {
    short_name: "Hài lòng về hoạt động cộng đồng",
    full_name: "Mức độ hài lòng của các bên liên quan đối với các hoạt động kết nối, phục vụ cộng đồng, đóng góp cho xã hội và cho các mục tiêu phát triển bền vững được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập quy trình, công cụ và bộ chỉ số khảo sát mức độ hài lòng của các bên liên quan (người học, cựu SV, nhà tuyển dụng, GV, CB hỗ trợ, đối tác) về các hoạt động cộng đồng và SDGs.",
      "CSĐT triển khai quy trình giám sát thu thập, phân tích phản hồi/mức độ hài lòng bằng khảo sát thường xuyên, tổng hợp theo nhóm đối tượng/loại hình chương trình.",
      "CSĐT triển khai quy trình đối sánh mức độ hài lòng theo thời gian, giữa các đơn vị/chương trình và/hoặc với chuẩn bên ngoài/cơ sở tương đương.",
      "CSĐT sử dụng kết quả để cải tiến kế hoạch và giải pháp nâng cao mức độ hài lòng, công bố kết quả và theo dõi thực hiện cải tiến.",
    ],
    suggested_evidence: [
      { name: "Văn bản quy định, hướng dẫn về quy trình, công cụ, phương pháp khảo sát, các chỉ số về mức độ hài lòng của các bên liên quan đối với các hoạt động phục vụ cộng đồng", type: "guideline", category: "Khảo sát - góp ý" },
      { name: "Kế hoạch triển khai và báo cáo kết quả khảo sát mức độ hài lòng của các bên liên quan", type: "survey", category: "Khảo sát hài lòng" },
      { name: "Hệ thống giám sát về mức độ hài lòng của các bên liên quan", type: "procedure", category: "Giám sát" },
      { name: "Báo cáo kết quả đối sánh về mức độ hài lòng", type: "report", category: "Đối sánh" },
      { name: "Kế hoạch cải tiến dựa trên kết quả khảo sát và phân tích đối sánh", type: "plan", category: "Cải tiến" },
    ],
    self_check_questions: [
      "Có khảo sát mức hài lòng của cộng đồng / đối tác định kỳ không?",
      "Điểm hài lòng bình quân theo loại hình hoạt động?",
      "Có công khai kết quả khảo sát không?",
      "Có đối sánh với tổ chức khác không?",
    ],
    placeholders: {
      hien_trang: "VD: Khảo sát hài lòng cộng đồng hằng năm, điểm TB ... /5. Theo loại hình: chuyển giao ..., tình nguyện ..., tư vấn ... Công khai trên website. Đối sánh với ...",
      diem_manh: "VD: Khảo sát đa đối tượng; điểm cao; công khai minh bạch.",
      ton_tai: "VD: Tỷ lệ phản hồi đối tác DN còn thấp; một số chương trình chưa có kênh phản hồi chuẩn.",
      ke_hoach: "VD: Tăng kênh khảo sát digital cho DN đối tác từ ...; chuẩn hóa cơ chế phản hồi 360°...",
    },
  },

  // ═══════════════ Tiêu chuẩn 15: Kết quả tài chính và thị trường ═══════════════

  "15.1": {
    short_name: "Hiệu quả tài chính",
    full_name: "Các chỉ số hiệu quả tài chính cho hoạt động đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng được xác lập, giám sát và đối sánh để cải tiến.",
    requirements: [
      "CSĐT có hệ thống xác lập bộ chỉ số hiệu quả tài chính cho hoạt động đào tạo, NCKH, kết nối và phục vụ cộng đồng (bảng cân đối tài chính, báo cáo thu-chi, doanh thu, chi phí đầu tư, phân tích tỷ lệ), kèm nguồn dữ liệu, chu kỳ, trách nhiệm và phạm vi áp dụng.",
      "CSĐT triển khai quy trình giám sát việc thu thập, phân tích các chỉ số hiệu quả tài chính; tổng hợp báo cáo tài chính hằng năm, khai thác báo cáo kiểm toán (nếu có) và đánh giá mức độ đạt chỉ tiêu.",
      "CSĐT triển khai quy trình đối sánh các chỉ số hiệu quả tài chính theo năm/đơn vị và/hoặc với chuẩn tham chiếu, cơ sở tương đồng.",
      "CSĐT sử dụng kết quả để cải tiến cơ chế tài chính và phân bổ nguồn lực, điều chỉnh chỉ tiêu; triển khai biện pháp cải thiện.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch, chiến lược phát triển của CSĐT (chỉ số tài chính của đào tạo, NCKH, kết nối và phục vụ cộng đồng)", type: "strategic_plan", category: "Chiến lược" },
      { name: "Văn bản quy định cụ thể về chỉ số đánh giá hiệu quả tài chính", type: "regulation", category: "KPIs tài chính" },
      { name: "Văn bản thể hiện hệ thống giám sát về kết quả thực hiện các chỉ số tài chính", type: "procedure", category: "Giám sát tài chính" },
      { name: "Quy chế tài chính", type: "regulation", category: "Văn bản tài chính" },
      { name: "Quy chế chi tiêu nội bộ", type: "regulation", category: "Văn bản tài chính" },
      { name: "Báo cáo tài chính hằng năm", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo kiểm toán độc lập, báo cáo của kiểm toán Nhà nước (nếu có)", type: "audit", category: "Kiểm toán" },
      { name: "Báo cáo kết quả rà soát các chỉ số đánh giá hiệu quả tài chính hằng năm", type: "report", category: "Rà soát" },
      { name: "Báo cáo thực hiện đối sánh, phân tích, điều chỉnh các chỉ số hiệu quả tài chính", type: "report", category: "Đối sánh" },
      { name: "Biên bản các cuộc họp rà soát, điều chỉnh các chỉ số hiệu quả tài chính", type: "meeting_minutes", category: "Cải tiến" },
      { name: "Thống kê kết quả tuyển sinh, tổng thu học phí; đề tài NCKH các loại hình và kinh phí; hoạt động kết nối và phục vụ cộng đồng", type: "report", category: "Thống kê" },
      { name: "Các quyết định, hợp đồng, hợp tác đầu tư", type: "official_doc", category: "Đầu tư" },
    ],
    self_check_questions: [
      "Có bộ KPIs tài chính cho 3 mảng (đào tạo, NCKH, cộng đồng) không?",
      "Doanh thu / chi phí / thặng dư hằng năm?",
      "Có kiểm toán độc lập hằng năm không? Kết quả?",
      "Có đối sánh với trường cùng quy mô không?",
    ],
    placeholders: {
      hien_trang: "VD: Bộ KPIs tài chính ban hành QĐ số ... Doanh thu năm ...: ... đồng (đào tạo ...%, NCKH ...%, cộng đồng ...%). Kiểm toán độc lập năm ... kết quả ... Đối sánh với ...",
      diem_manh: "VD: KPIs đầy đủ; tài chính ổn định; kiểm toán đạt; đối sánh dương tính.",
      ton_tai: "VD: Tỷ trọng doanh thu ngoài học phí (NCKH, dịch vụ) còn thấp; chi phí đơn vị một số dịch vụ cao.",
      ke_hoach: "VD: Tăng doanh thu NCKH & chuyển giao từ ...; tối ưu chi phí đơn vị qua ...",
    },
  },

  "15.2": {
    short_name: "Vị thế thị trường",
    full_name: "Các chỉ số kết quả và vị thế trên thị trường đối với hoạt động đào tạo, nghiên cứu khoa học, kết nối và phục vụ cộng đồng được xác lập, giám sát và đối sánh nhằm cải tiến chất lượng.",
    requirements: [
      "CSĐT xác lập hệ thống chỉ số phản ánh kết quả và vị thế trên thị trường đối với hoạt động đào tạo, NCKH, kết nối và phục vụ cộng đồng (xếp hạng/thứ hạng cạnh tranh quốc gia/quốc tế, quy mô/thị phần, giải thưởng, mức độ hài lòng của bên liên quan), kèm nguồn dữ liệu và chu kỳ.",
      "CSĐT triển khai cơ chế thu thập, giám sát và phân tích các chỉ số phản ánh kết quả và vị thế thông qua hệ thống dữ liệu nội bộ, khảo sát các bên liên quan và nguồn dữ liệu bên ngoài (xếp hạng, thống kê ngành, báo cáo thị trường).",
      "CSĐT thực hiện đối sánh các chỉ số kết quả và vị thế trên thị trường.",
      "CSĐT sử dụng kết quả phân tích, đối sánh để cải tiến định vị/chiến lược thị trường, danh mục chương trình/dịch vụ, hoạt động truyền thông - kết nối; điều chỉnh chỉ tiêu dựa trên phản hồi của các bên liên quan.",
    ],
    suggested_evidence: [
      { name: "Kế hoạch, chiến lược phát triển của CSĐT (chỉ số kết quả và vị thế trên thị trường của đào tạo, NCKH, kết nối và phục vụ cộng đồng)", type: "strategic_plan", category: "Chiến lược" },
      { name: "Văn bản quy định cụ thể về chỉ số kết quả và vị thế trên thị trường", type: "regulation", category: "KPIs thị trường" },
      { name: "Văn bản thể hiện hệ thống giám sát về các chỉ số kết quả và vị thế trên thị trường", type: "procedure", category: "Giám sát" },
      { name: "Báo cáo về thị trường của hoạt động đào tạo, kết nối và phục vụ cộng đồng hằng năm", type: "report", category: "Báo cáo thị trường" },
      { name: "Báo cáo tài chính hằng năm", type: "report", category: "Báo cáo định kỳ" },
      { name: "Báo cáo kiểm toán độc lập, báo cáo của kiểm toán Nhà nước (nếu có)", type: "audit", category: "Kiểm toán" },
      { name: "Báo cáo kết quả rà soát các chỉ số kết quả và vị thế trên thị trường hằng năm", type: "report", category: "Rà soát" },
      { name: "Báo cáo thực hiện đối sánh, phân tích, điều chỉnh các chỉ số kết quả và vị thế trên thị trường", type: "report", category: "Đối sánh" },
      { name: "Biên bản họp rà soát, điều chỉnh các chỉ số kết quả và vị thế trên thị trường", type: "meeting_minutes", category: "Cải tiến" },
      { name: "Thống kê kết quả tuyển sinh, tổng thu học phí; đề tài NCKH và kinh phí; hoạt động kết nối và phục vụ cộng đồng", type: "report", category: "Thống kê" },
      { name: "Kết quả xếp hạng theo các bảng xếp hạng có uy tín", type: "external_doc", category: "Xếp hạng" },
      { name: "Cơ sở dữ liệu về kết quả của hoạt động đào tạo, NCKH", type: "visual", category: "Hệ thống dữ liệu" },
    ],
    self_check_questions: [
      "CSĐT có xếp hạng trong bảng uy tín nào (QS, THE, Webometrics, VNUR)?",
      "Thị phần tuyển sinh trong ngành / khu vực?",
      "Số giải thưởng quốc gia / quốc tế trong giai đoạn?",
      "Có báo cáo thị trường hằng năm không?",
    ],
    placeholders: {
      hien_trang: "VD: Xếp hạng QS năm ...: #... (tăng/giữ nguyên/giảm). Webometrics: #... VNUR: #... Thị phần tuyển sinh ngành ...: ...%. Số giải thưởng: ... Quốc gia, ... Quốc tế. Báo cáo thị trường hằng năm.",
      diem_manh: "VD: Xếp hạng cải thiện đều; thị phần ổn định; có giải thưởng quốc tế.",
      ton_tai: "VD: Xếp hạng theo tiêu chí NCKH còn thấp; nhận diện thương hiệu khu vực chưa mạnh.",
      ke_hoach: "VD: Chiến lược tăng citation để cải thiện rank NCKH từ ...; đầu tư branding khu vực ... giai đoạn ...",
    },
  },

};

// Các loại minh chứng + icon/màu để UI render đẹp
const EVIDENCE_TYPES = {
  official_statement: { label: 'Văn bản tuyên bố chính thức', icon: '📜', color: '#4f8ef7' },
  decision:           { label: 'Quyết định',                  icon: '⚖',  color: '#7c5cbf' },
  regulation:         { label: 'Quy chế / Quy định',          icon: '📋', color: '#7c5cbf' },
  guideline:          { label: 'Văn bản hướng dẫn',           icon: '📘', color: '#4f8ef7' },
  policy:             { label: 'Chính sách',                  icon: '📑', color: '#4f8ef7' },
  plan:               { label: 'Kế hoạch',                    icon: '🗓', color: '#2ea87e' },
  strategic_plan:     { label: 'Chiến lược',                  icon: '🎯', color: '#2ea87e' },
  procedure:          { label: 'Quy trình',                   icon: '🔄', color: '#2ea87e' },
  report:             { label: 'Báo cáo',                     icon: '📊', color: '#e0a847' },
  meeting_minutes:    { label: 'Biên bản họp',                icon: '📝', color: '#e0a847' },
  survey:             { label: 'Khảo sát / Góp ý',            icon: '📋', color: '#e0a847' },
  audit:              { label: 'Kiểm tra / Thanh tra',        icon: '🔍', color: '#e05a5a' },
  evaluation:         { label: 'Đánh giá / Nhận xét',         icon: '⭐', color: '#e0a847' },
  training:           { label: 'Đào tạo / Tập huấn',          icon: '🎓', color: '#7c5cbf' },
  website:            { label: 'Trang web / URL',             icon: '🌐', color: '#4f8ef7' },
  handbook:           { label: 'Sổ tay',                      icon: '📔', color: '#4f8ef7' },
  visual:             { label: 'Ảnh / Video',                 icon: '🖼', color: '#64748b' },
  official_doc:       { label: 'Văn bản chính thức',          icon: '📄', color: '#4f8ef7' },
  external_doc:       { label: 'Văn bản tham chiếu ngoài',    icon: '📎', color: '#64748b' },
  document_history:   { label: 'Lịch sử phiên bản văn bản',   icon: '📚', color: '#64748b' },
};

module.exports = { STANDARDS_DETAIL, EVIDENCE_TYPES };