const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── JSON Database ────────────────────────────────────────────────────────────
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ evidence: [], assessments: [], kpi_data: [], school_info: {}, nextId: 1, nextAssessId: 1, nextKpiId: 1 }, null, 2), 'utf8');
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!db.assessments)  db.assessments  = [];
  if (!db.nextAssessId) db.nextAssessId = 1;
  if (!db.kpi_data)     db.kpi_data     = [];
  if (!db.school_info)  db.school_info  = {};
  if (!db.nextKpiId)    db.nextKpiId    = 1;
  if (!db.tdg_plans)       db.tdg_plans       = [];
  if (!db.nextTdgId)       db.nextTdgId       = 1;
  if (!db.nextTaskId)      db.nextTaskId      = 1;
  if (!db.surveys)         db.surveys         = [];
  if (!db.nextSurveyId)    db.nextSurveyId    = 1;
  if (!db.nextResponseId)  db.nextResponseId  = 1;
  return db;
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ─── Standards / Criteria ─────────────────────────────────────────────────────
const STANDARDS = [
  { id: 1,  name: 'Tầm nhìn, sứ mạng, văn hoá và quản trị',         criteria: ['Tầm nhìn & sứ mạng','Hệ thống quản trị','Giá trị văn hóa','Truyền đạt tầm nhìn','Trách nhiệm xã hội','Cải tiến quản trị'] },
  { id: 2,  name: 'Lãnh đạo và chiến lược',                           criteria: ['Cơ cấu tổ chức','Rà soát cơ cấu','Kế hoạch chiến lược','Triển khai chiến lược','Cải tiến lãnh đạo'] },
  { id: 3,  name: 'Nguồn nhân lực',                                   criteria: ['Quy hoạch & tuyển dụng','Đánh giá hiệu quả','Phát triển chuyên môn','Chế độ đãi ngộ','Cải tiến nhân lực'] },
  { id: 4,  name: 'Nguồn lực tài chính và vật chất',                  criteria: ['Quản lý tài chính','Cơ sở vật chất','Thư viện & học liệu','CNTT & hạ tầng số','Cải tiến CSVC'] },
  { id: 5,  name: 'Mạng lưới và quan hệ đối ngoại',                   criteria: ['Hợp tác trong/ngoài nước','Cải tiến hợp tác'] },
  { id: 6,  name: 'Chính sách về đào tạo',                            criteria: ['Tuyển sinh','Chương trình ĐT','Giảng dạy & học tập','Kiểm tra đánh giá','Hỗ trợ người học','Quản lý thông tin người học','Cải tiến đào tạo'] },
  { id: 7,  name: 'Chính sách về nghiên cứu khoa học',                criteria: ['Chiến lược NCKH','Môi trường NCKH','SHTT & đạo đức','Phát triển NL nghiên cứu','Cải tiến NCKH'] },
  { id: 8,  name: 'Chính sách kết nối và phục vụ cộng đồng',          criteria: ['Chính sách kết nối','Triển khai kết nối','Cải tiến kết nối'] },
  { id: 9,  name: 'Hệ thống bảo đảm chất lượng',                      criteria: ['Cơ cấu & chính sách IQA','Quy trình BĐCL','Giám sát & đánh giá','Cải tiến BĐCL'] },
  { id: 10, name: 'Hệ thống thông tin BĐCL bên trong',                criteria: ['Thu thập & quản lý dữ liệu','Báo cáo & công bố'] },
  { id: 11, name: 'Nâng cao chất lượng',                              criteria: ['Chu trình PDCA','Đổi mới sáng tạo'] },
  { id: 12, name: 'Kết quả về đào tạo',                               criteria: ['Tỉ lệ tốt nghiệp','Chất lượng tốt nghiệp','Việc làm sau TN','Mức độ hài lòng người học'] },
  { id: 13, name: 'Kết quả về nghiên cứu khoa học',                   criteria: ['Đề tài NCKH','Bài báo khoa học','Sáng chế & chuyển giao','NCKH người học'] },
  { id: 14, name: 'Kết quả kết nối và phục vụ cộng đồng',             criteria: ['Hợp tác với DN','Chuyển giao & tư vấn','Phục vụ cộng đồng','Tác động kết nối'] },
  { id: 15, name: 'Kết quả về tài chính và thị trường',               criteria: ['Hiệu quả tài chính','Uy tín & thương hiệu'] },
];

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${ts}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── API: Standards ───────────────────────────────────────────────────────────
app.get('/api/standards', (req, res) => res.json(STANDARDS));

// ─── API: Stats ───────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const db = loadDB();
  const total = db.evidence.length;
  const byStandard = {};
  for (let i = 1; i <= 15; i++) byStandard[i] = 0;
  for (const e of db.evidence) byStandard[e.tieu_chuan] = (byStandard[e.tieu_chuan] || 0) + 1;
  res.json({ total, byStandard });
});

// ─── API: List Evidence ───────────────────────────────────────────────────────
app.get('/api/evidence', (req, res) => {
  const db = loadDB();
  let list = db.evidence;
  const { tieu_chuan, tieu_chi, search } = req.query;

  if (tieu_chuan) list = list.filter(e => e.tieu_chuan === parseInt(tieu_chuan));
  if (tieu_chi)   list = list.filter(e => e.tieu_chi === tieu_chi);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e =>
      (e.mo_ta     || '').toLowerCase().includes(q) ||
      (e.file_name || '').toLowerCase().includes(q) ||
      (e.code      || '').toLowerCase().includes(q) ||
      (e.nguon     || '').toLowerCase().includes(q)
    );
  }

  list = [...list].sort((a, b) => {
    if (a.tieu_chuan !== b.tieu_chuan) return a.tieu_chuan - b.tieu_chuan;
    if (a.tieu_chi_so !== b.tieu_chi_so) return a.tieu_chi_so - b.tieu_chi_so;
    return a.thu_tu - b.thu_tu;
  });

  res.json(list);
});

// ─── API: Upload Evidence ─────────────────────────────────────────────────────
app.post('/api/evidence', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' });

  const { tieu_chuan, tieu_chi, mo_ta, nguon, ghi_chu } = req.body;
  if (!tieu_chuan || !tieu_chi) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'Thiếu thông tin tiêu chí' });
  }

  const tc = parseInt(tieu_chuan);
  const parts = tieu_chi.split('.');          // e.g. "3.2" → ["3","2"]
  const tieu_chi_so = parseInt(parts[1]);     // position within standard

  const db = loadDB();

  // Count existing evidence for this criterion → next sequence number
  const existing = db.evidence.filter(e => e.tieu_chi === tieu_chi);
  const thu_tu = existing.length + 1;

  // Generate code: Hn.ab.cd.ef
  const code = `H${tc}.${String(tc).padStart(2,'0')}.${String(tieu_chi_so).padStart(2,'0')}.${String(thu_tu).padStart(2,'0')}`;

  const record = {
    id:          db.nextId++,
    code,
    tieu_chuan:  tc,
    tieu_chi,
    tieu_chi_so,
    thu_tu,
    mo_ta:       mo_ta || '',
    nguon:       nguon || '',
    ghi_chu:     ghi_chu || '',
    file_name:   req.file.originalname,
    file_stored: req.file.filename,
    file_size:   req.file.size,
    mime_type:   req.file.mimetype,
    created_at:  new Date().toLocaleString('vi-VN'),
  };

  db.evidence.push(record);
  saveDB(db);

  res.json({ id: record.id, code, message: 'Thêm minh chứng thành công' });
});

// ─── API: Delete Evidence ─────────────────────────────────────────────────────
app.delete('/api/evidence/:id', (req, res) => {
  const db = loadDB();
  const idx = db.evidence.findIndex(e => e.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });

  const [removed] = db.evidence.splice(idx, 1);
  const filePath = path.join(UPLOADS_DIR, removed.file_stored);
  fs.unlink(filePath, () => {});
  saveDB(db);

  res.json({ message: 'Đã xóa' });
});

// ─── API: Download File ───────────────────────────────────────────────────────
app.get('/api/evidence/:id/download', (req, res) => {
  const db = loadDB();
  const record = db.evidence.find(e => e.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ error: 'Không tìm thấy' });
  const filePath = path.join(UPLOADS_DIR, record.file_stored);
  res.download(filePath, record.file_name);
});

// ─── API: Assessment Stats (Biểu 04) ─────────────────────────────────────────
app.get('/api/assess-stats', (req, res) => {
  const db = loadDB();
  const total = db.assessments.length;
  const dat = db.assessments.filter(a => a.ket_qua === 'DAT').length;
  const khongDat = db.assessments.filter(a => a.ket_qua === 'KHONG_DAT').length;
  const draft = db.assessments.filter(a => a.trang_thai === 'draft').length;
  const approved = db.assessments.filter(a => a.trang_thai === 'approved').length;
  // Map tieu_chi → status for tree coloring
  const statusMap = {};
  for (const a of db.assessments) statusMap[a.tieu_chi] = { ket_qua: a.ket_qua, trang_thai: a.trang_thai };
  res.json({ total, dat, khongDat, draft, approved, statusMap });
});

// ─── API: List Assessments ────────────────────────────────────────────────────
app.get('/api/assessments', (req, res) => {
  const db = loadDB();
  res.json(db.assessments);
});

// ─── API: Get Assessment for one criterion ────────────────────────────────────
app.get('/api/assessments/by-criteria/:tieu_chi', (req, res) => {
  const db = loadDB();
  const code = decodeURIComponent(req.params.tieu_chi);
  const record = db.assessments.find(a => a.tieu_chi === code);
  // Also fetch linked evidence from Module 1
  const evidence = db.evidence.filter(e => e.tieu_chi === code);
  res.json({ assessment: record || null, evidence });
});

// ─── API: Save Assessment (create or update) ──────────────────────────────────
app.post('/api/assessments', (req, res) => {
  const { tieu_chuan, tieu_chi, hien_trang, diem_manh, ton_tai, ke_hoach, ket_qua, trang_thai, nguoi_thuc_hien, mc_bo_sung } = req.body;
  if (!tieu_chuan || !tieu_chi) return res.status(400).json({ error: 'Thiếu thông tin tiêu chí' });

  const db = loadDB();
  const existing = db.assessments.find(a => a.tieu_chi === tieu_chi);

  if (existing) {
    existing.tieu_chuan      = parseInt(tieu_chuan);
    existing.hien_trang      = hien_trang || '';
    existing.diem_manh       = diem_manh || '';
    existing.ton_tai         = ton_tai || '';
    existing.ke_hoach        = ke_hoach || '';
    existing.ket_qua         = ket_qua || 'CHUA';
    existing.trang_thai      = trang_thai || 'draft';
    existing.nguoi_thuc_hien = nguoi_thuc_hien || '';
    existing.mc_bo_sung      = mc_bo_sung || '';
    existing.updated_at      = new Date().toLocaleString('vi-VN');
    saveDB(db);
    return res.json({ id: existing.id, message: 'Đã cập nhật đánh giá', updated: true });
  }

  const record = {
    id:               db.nextAssessId++,
    tieu_chuan:       parseInt(tieu_chuan),
    tieu_chi,
    hien_trang:       hien_trang || '',
    diem_manh:        diem_manh || '',
    ton_tai:          ton_tai || '',
    ke_hoach:         ke_hoach || '',
    ket_qua:          ket_qua || 'CHUA',
    trang_thai:       trang_thai || 'draft',
    nguoi_thuc_hien:  nguoi_thuc_hien || '',
    mc_bo_sung:       mc_bo_sung || '',
    created_at:       new Date().toLocaleString('vi-VN'),
    updated_at:       new Date().toLocaleString('vi-VN'),
  };
  db.assessments.push(record);
  saveDB(db);
  res.json({ id: record.id, message: 'Đã tạo đánh giá', updated: false });
});

// ─── API: Delete Assessment ───────────────────────────────────────────────────
app.delete('/api/assessments/:id', (req, res) => {
  const db = loadDB();
  const idx = db.assessments.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.assessments.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── API: School Info ─────────────────────────────────────────────────────────
app.get('/api/school-info', (req, res) => {
  const db = loadDB();
  res.json(db.school_info);
});

app.put('/api/school-info', (req, res) => {
  const db = loadDB();
  db.school_info = { ...db.school_info, ...req.body };
  saveDB(db);
  res.json({ message: 'Đã lưu thông tin trường' });
});

// ─── API: KPI Data (Biểu 16) ─────────────────────────────────────────────────
app.get('/api/kpi', (req, res) => {
  const db = loadDB();
  // Return lightweight summary list (exclude heavy fields for list view)
  const list = db.kpi_data.map(r => ({
    id: r.id, nam_hoc: r.nam_hoc, created_at: r.created_at, updated_at: r.updated_at,
    // Key summary fields for table
    so_gv_co_huu: r.so_gv_co_huu, pct_gv_ts: r.pct_gv_ts,
    pct_tot_nghiep: r.pct_tot_nghiep, pct_viec_lam_12t: r.pct_viec_lam_12t,
    so_bao_isi_scopus: r.so_bao_isi_scopus, so_nguoi_hoc_dh: r.so_nguoi_hoc_dh,
  }));
  res.json(list.sort((a, b) => (b.nam_hoc || '').localeCompare(a.nam_hoc || '')));
});

app.get('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const record = db.kpi_data.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(record);
});

app.post('/api/kpi', (req, res) => {
  const db = loadDB();
  const { nam_hoc } = req.body;
  if (!nam_hoc) return res.status(400).json({ error: 'Thiếu năm học' });
  if (db.kpi_data.find(r => r.nam_hoc === nam_hoc))
    return res.status(400).json({ error: `Đã có dữ liệu năm học ${nam_hoc}` });

  const record = { id: db.nextKpiId++, nam_hoc, ...req.body,
    created_at: new Date().toLocaleString('vi-VN'),
    updated_at: new Date().toLocaleString('vi-VN') };
  db.kpi_data.push(record);
  saveDB(db);
  res.json({ id: record.id, message: 'Đã tạo dữ liệu năm học' });
});

app.put('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const idx = db.kpi_data.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.kpi_data[idx] = { ...db.kpi_data[idx], ...req.body,
    updated_at: new Date().toLocaleString('vi-VN') };
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const idx = db.kpi_data.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.kpi_data.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── Default TĐG tasks (24 tuần) ─────────────────────────────────────────────
function defaultTasks(startId) {
  let id = startId;
  const t = (phase, ws, we, title, priority = 'normal') =>
    ({ id: id++, phase, week_start: ws, week_end: we, title, assignee: '', status: 'todo', priority, notes: '' });
  return [
    t(1,  1,  1,  'Ra quyết định thành lập Hội đồng TĐG (Biểu 01)', 'high'),
    t(1,  1,  2,  'Phân công nhiệm vụ cho các nhóm TĐG'),
    t(1,  2,  2,  'Xây dựng Kế hoạch TĐG chi tiết (Biểu 02)', 'high'),
    t(1,  3,  4,  'Tập huấn Hội đồng TĐG về quy trình & biểu mẫu'),
    t(2,  5,  6,  'Thu thập minh chứng — Tiêu chuẩn 1, 2, 3'),
    t(2,  7,  8,  'Thu thập minh chứng — Tiêu chuẩn 4, 5, 6'),
    t(2,  9,  10, 'Thu thập minh chứng — Tiêu chuẩn 7, 8, 9'),
    t(2,  11, 12, 'Thu thập minh chứng — Tiêu chuẩn 10–15'),
    t(2,  10, 12, 'Mã hóa và phân loại minh chứng (Hn.ab.cd.ef)'),
    t(2,  12, 12, 'Nhập dữ liệu KPI vào Biểu 16', 'high'),
    t(3,  13, 14, 'Đánh giá Tiêu chuẩn 1–4 (Biểu 04)', 'high'),
    t(3,  15, 16, 'Đánh giá Tiêu chuẩn 5–9 (Biểu 04)', 'high'),
    t(3,  17, 18, 'Đánh giá Tiêu chuẩn 10–15 (Biểu 04)', 'high'),
    t(3,  18, 18, 'Họp Hội đồng TĐG — xem xét kết quả đánh giá'),
    t(4,  19, 20, 'Viết Báo cáo TĐG — Phần mở đầu & TC 1–7 (Biểu 05)', 'high'),
    t(4,  21, 22, 'Viết Báo cáo TĐG — TC 8–15 & kết luận', 'high'),
    t(4,  22, 22, 'Rà soát, chỉnh sửa Báo cáo TĐG lần 1'),
    t(5,  23, 23, 'Thẩm định nội bộ, chỉnh sửa lần cuối', 'high'),
    t(5,  23, 24, 'Hoàn thiện và đóng gói hồ sơ minh chứng'),
    t(5,  24, 24, 'Nộp hồ sơ TĐG cho cơ quan kiểm định', 'high'),
  ];
}

// ─── API: TĐG Plans ───────────────────────────────────────────────────────────
app.get('/api/tdg', (req, res) => {
  const db = loadDB();
  res.json(db.tdg_plans.map(p => ({
    id: p.id, name: p.name, ngay_bat_dau: p.ngay_bat_dau,
    total: p.tasks.length,
    done: p.tasks.filter(t => t.status === 'done').length,
    late: p.tasks.filter(t => t.status === 'late').length,
    in_progress: p.tasks.filter(t => t.status === 'in_progress').length,
  })));
});

app.get('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const plan = db.tdg_plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(plan);
});

app.post('/api/tdg', (req, res) => {
  const db = loadDB();
  const { name, ngay_bat_dau, use_defaults } = req.body;
  if (!name) return res.status(400).json({ error: 'Thiếu tên kế hoạch' });
  const tasks = use_defaults !== false ? defaultTasks(db.nextTaskId) : [];
  db.nextTaskId += tasks.length;
  const plan = { id: db.nextTdgId++, name, ngay_bat_dau: ngay_bat_dau || '', tasks,
    created_at: new Date().toLocaleString('vi-VN') };
  db.tdg_plans.push(plan);
  saveDB(db);
  res.json({ id: plan.id, message: 'Đã tạo kế hoạch TĐG' });
});

app.put('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const plan = db.tdg_plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, ngay_bat_dau } = req.body;
  if (name) plan.name = name;
  if (ngay_bat_dau !== undefined) plan.ngay_bat_dau = ngay_bat_dau;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const idx = db.tdg_plans.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.tdg_plans.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── API: Tasks ───────────────────────────────────────────────────────────────
app.post('/api/tdg/:id/tasks', (req, res) => {
  const db = loadDB();
  const plan = db.tdg_plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch' });
  const task = { id: db.nextTaskId++, status: 'todo', priority: 'normal', notes: '', ...req.body };
  plan.tasks.push(task);
  saveDB(db);
  res.json({ id: task.id });
});

app.put('/api/tdg/:id/tasks/:taskId', (req, res) => {
  const db = loadDB();
  const plan = db.tdg_plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch' });
  const task = plan.tasks.find(t => t.id === parseInt(req.params.taskId));
  if (!task) return res.status(404).json({ error: 'Không tìm thấy task' });
  Object.assign(task, req.body);
  saveDB(db);
  res.json({ message: 'Đã cập nhật task' });
});

app.delete('/api/tdg/:id/tasks/:taskId', (req, res) => {
  const db = loadDB();
  const plan = db.tdg_plans.find(p => p.id === parseInt(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch' });
  plan.tasks = plan.tasks.filter(t => t.id !== parseInt(req.params.taskId));
  saveDB(db);
  res.json({ message: 'Đã xóa task' });
});

// ─── Survey Templates (Biểu 08–11) ───────────────────────────────────────────
const SURVEY_TEMPLATES = {
  bieu08: {
    label: 'Biểu 08', target: 'Cán bộ / Giảng viên',
    scale: ['Rất không đồng ý','Không đồng ý','Trung lập','Đồng ý','Rất đồng ý'],
    questions: [
      'Tầm nhìn, sứ mạng nhà trường được truyền đạt rõ ràng đến CB/GV',
      'Hệ thống quản trị nhà trường hoạt động hiệu quả, minh bạch',
      'Quy trình tuyển dụng, đánh giá GV thực hiện đúng quy định',
      'CB/GV được tạo điều kiện phát triển chuyên môn, nghiệp vụ',
      'Chính sách lương, thưởng, phúc lợi phù hợp với đóng góp',
      'Cơ sở vật chất phục vụ giảng dạy đầy đủ, hiện đại',
      'Chương trình đào tạo được rà soát, cập nhật thường xuyên',
      'Hoạt động NCKH được nhà trường khuyến khích và hỗ trợ',
      'Hệ thống đảm bảo chất lượng bên trong vận hành hiệu quả',
      'Nhìn chung, tôi hài lòng với môi trường làm việc tại trường',
    ],
  },
  bieu09: {
    label: 'Biểu 09', target: 'Người học (Sinh viên / Học viên)',
    scale: ['Rất không đồng ý','Không đồng ý','Trung lập','Đồng ý','Rất đồng ý'],
    questions: [
      'Mục tiêu và chuẩn đầu ra của CTĐT được thông báo rõ ràng',
      'Nội dung chương trình học đáp ứng yêu cầu và cập nhật xu hướng',
      'Phương pháp giảng dạy phát huy tính chủ động của người học',
      'Giảng viên có kiến thức chuyên sâu và nhiệt tình hướng dẫn',
      'Cơ sở vật chất (phòng học, lab, thư viện) đáp ứng nhu cầu học tập',
      'Hệ thống CNTT (cổng thông tin, LMS) hỗ trợ tốt việc học',
      'Nhà trường có chính sách hỗ trợ người học (học bổng, tư vấn)',
      'Hoạt động thực tập, thực tế bổ sung được kỹ năng nghề nghiệp',
      'Thủ tục hành chính và dịch vụ hỗ trợ sinh viên thuận tiện',
      'Nhìn chung, tôi hài lòng với chất lượng đào tạo của nhà trường',
    ],
  },
  bieu10: {
    label: 'Biểu 10', target: 'Nhà tuyển dụng / Doanh nghiệp',
    scale: ['Rất kém','Kém','Trung bình','Tốt','Xuất sắc'],
    questions: [
      'Kiến thức chuyên môn của SV tốt nghiệp đáp ứng yêu cầu công việc',
      'Kỹ năng thực hành và khả năng ứng dụng vào thực tiễn',
      'Kỹ năng làm việc nhóm và phối hợp với đồng nghiệp',
      'Kỹ năng giao tiếp, trình bày và thuyết trình',
      'Khả năng tự học và tiếp thu kiến thức, kỹ năng mới',
      'Thái độ làm việc: chuyên nghiệp, có trách nhiệm, chăm chỉ',
      'Kỹ năng ngoại ngữ (tiếng Anh) trong môi trường công việc',
      'Kỹ năng ứng dụng CNTT phục vụ công việc',
      'Khả năng tư duy phân tích và giải quyết vấn đề',
      'Nhìn chung, đơn vị hài lòng với SV tốt nghiệp từ trường',
    ],
  },
  bieu11: {
    label: 'Biểu 11', target: 'Cựu sinh viên (Alumni)',
    scale: ['Rất không đồng ý','Không đồng ý','Trung lập','Đồng ý','Rất đồng ý'],
    questions: [
      'Kiến thức được đào tạo áp dụng hiệu quả trong công việc hiện tại',
      'Kỹ năng thực hành học được tại trường đáp ứng yêu cầu công việc',
      'Chương trình đào tạo phù hợp với thực tiễn nghề nghiệp',
      'Kỹ năng mềm (giao tiếp, làm việc nhóm, tư duy) được phát triển tốt',
      'Môi trường học tập hình thành thái độ làm việc chuyên nghiệp',
      'Tôi tìm được việc làm trong vòng 12 tháng sau khi tốt nghiệp',
      'Công việc hiện tại phù hợp với ngành học tại trường',
      'Mức thu nhập hiện tại đáp ứng được nhu cầu cuộc sống',
      'Tôi sẵn sàng giới thiệu trường cho người thân và bạn bè',
      'Nhìn chung, tôi hài lòng với chất lượng đào tạo của nhà trường',
    ],
  },
};

// ─── API: Surveys (admin) ─────────────────────────────────────────────────────
app.get('/api/surveys', (req, res) => {
  const db = loadDB();
  res.json(db.surveys.map(s => ({
    id: s.id, type: s.type, title: s.title, description: s.description,
    token: s.token, active: s.active, created_at: s.created_at,
    response_count: s.responses.length,
  })));
});

// IMPORTANT: by-token route must come BEFORE /:id
app.get('/api/surveys/by-token/:token', (req, res) => {
  const db = loadDB();
  const s = db.surveys.find(x => x.token === req.params.token);
  if (!s) return res.status(404).json({ error: 'Khảo sát không tồn tại' });
  if (!s.active) return res.status(403).json({ error: 'Khảo sát đã đóng' });
  const tpl = SURVEY_TEMPLATES[s.type] || {};
  res.json({
    id: s.id, type: s.type, title: s.title, description: s.description,
    token: s.token, created_at: s.created_at,
    response_count: s.responses.length,
    template: tpl,
  });
});

app.post('/api/surveys/by-token/:token/respond', (req, res) => {
  const db = loadDB();
  const s = db.surveys.find(x => x.token === req.params.token);
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  if (!s.active) return res.status(403).json({ error: 'Khảo sát đã đóng' });
  const response = {
    id: db.nextResponseId++,
    submitted_at: new Date().toLocaleString('vi-VN'),
    answers: req.body.answers || {},
  };
  s.responses.push(response);
  saveDB(db);
  res.json({ message: 'Đã gửi khảo sát thành công' });
});

app.get('/api/surveys/:id', (req, res) => {
  const db = loadDB();
  const s = db.surveys.find(x => x.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ ...s, template: SURVEY_TEMPLATES[s.type] || {} });
});

app.post('/api/surveys', (req, res) => {
  const db = loadDB();
  const { type, title, description } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'Thiếu loại hoặc tiêu đề' });
  if (!SURVEY_TEMPLATES[type]) return res.status(400).json({ error: 'Loại khảo sát không hợp lệ' });
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const survey = {
    id: db.nextSurveyId++, type, title, description: description || '',
    token, active: true, created_at: new Date().toLocaleString('vi-VN'), responses: [],
  };
  db.surveys.push(survey);
  saveDB(db);
  res.json({ id: survey.id, token: survey.token, message: 'Đã tạo khảo sát' });
});

app.put('/api/surveys/:id', (req, res) => {
  const db = loadDB();
  const s = db.surveys.find(x => x.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  const { title, description, active } = req.body;
  if (title       !== undefined) s.title       = title;
  if (description !== undefined) s.description = description;
  if (active      !== undefined) s.active      = active;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/surveys/:id', (req, res) => {
  const db = loadDB();
  const idx = db.surveys.findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.surveys.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

app.get('/api/surveys/:id/stats', (req, res) => {
  const db = loadDB();
  const s = db.surveys.find(x => x.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  const n = s.responses.length;
  if (n === 0) return res.json({ count: 0, averages: [], overall: 0, distribution: [], comments: [] });

  const tpl = SURVEY_TEMPLATES[s.type] || {};
  const nQ = (tpl.questions || []).length;
  const sums = new Array(nQ).fill(0);
  const counts = new Array(nQ).fill(0);
  // distribution[q][v-1] = count of responses with value v
  const dist = Array.from({ length: nQ }, () => [0, 0, 0, 0, 0]);
  const comments = [];

  for (const r of s.responses) {
    const a = r.answers || {};
    for (let i = 0; i < nQ; i++) {
      const v = a[`q${i + 1}`];
      if (typeof v === 'number' && v >= 1 && v <= 5) {
        sums[i] += v;
        counts[i]++;
        dist[i][v - 1]++;
      }
    }
    if (a.comment && a.comment.trim()) comments.push(a.comment.trim());
  }

  const averages = sums.map((s, i) => counts[i] ? Math.round(s / counts[i] * 10) / 10 : 0);
  const overall  = averages.length ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length * 10) / 10 : 0;
  res.json({ count: n, averages, overall, distribution: dist, comments: comments.slice(-30) });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Quản lý minh chứng KĐCLGD`);
  console.log(`   http://localhost:${PORT}\n`);
});
