const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
// On Vercel (serverless) write to /tmp; locally write next to server.js
const IS_VERCEL = !!process.env.VERCEL;
const DB_FILE    = IS_VERCEL ? '/tmp/db.json'    : path.join(__dirname, 'db.json');
const UPLOADS_DIR = IS_VERCEL ? '/tmp/uploads'  : path.join(__dirname, 'uploads');

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
  if (!db.reports)         db.reports         = [];
  if (!db.nextReportId)    db.nextReportId    = 1;
  if (!db.workspaces)      db.workspaces      = [];
  if (!db.nextWorkspaceId) db.nextWorkspaceId = 1;
  // M8 — Khung CĐR (Inc4)
  if (!db.peos)         db.peos         = [];
  if (!db.nextPeoId)    db.nextPeoId    = 1;
  if (!db.plos)         db.plos         = [];
  if (!db.nextPloId)    db.nextPloId    = 1;
  if (!db.courses)      db.courses      = [];
  if (!db.nextCourseId) db.nextCourseId = 1;
  if (!db.clos)         db.clos         = [];
  if (!db.nextCloId)    db.nextCloId    = 1;
  if (!db.course_plo_map) db.course_plo_map = []; // {workspace_id, course_id, plo_id, level}
  if (!db.clo_plo_map)    db.clo_plo_map    = []; // {workspace_id, clo_id, plo_id, weight}
  // M9 — Rubric Builder (Inc5)
  if (!db.rubrics)      db.rubrics      = [];
  if (!db.nextRubricId) db.nextRubricId = 1;
  // M10 — Assessment Plans / Items / Students / Scores (Inc6)
  if (!db.assessment_plans)    db.assessment_plans    = [];
  if (!db.nextPlanId)          db.nextPlanId          = 1;
  if (!db.assessment_items)    db.assessment_items    = [];
  if (!db.nextItemId)          db.nextItemId          = 1;
  if (!db.plan_students)       db.plan_students       = [];
  if (!db.nextPlanStudentId)   db.nextPlanStudentId   = 1;
  if (!db.scores)              db.scores              = [];
  if (!db.nextScoreId)         db.nextScoreId         = 1;
  // Seed default workspace if empty (so existing data has a "home")
  if (db.workspaces.length === 0) {
    db.workspaces.push({
      id: db.nextWorkspaceId++,
      name: 'CSGD 2026',
      type: 'CSGD',
      law:  'TT26/2026 BGDĐT',
      description: 'Kiểm định Cơ sở Giáo dục — 15 tiêu chuẩn / 60 tiêu chí',
      active: true,
      created_at: new Date().toLocaleString('vi-VN'),
    });
    saveDB(db);
  }
  // ─── Inc2 migration: stamp workspace_id on legacy records ──────────────────
  const defaultWsId = db.workspaces[0].id;
  let dirty = false;
  const stamp = (arr) => {
    for (const r of arr) {
      if (r && r.workspace_id === undefined) { r.workspace_id = defaultWsId; dirty = true; }
    }
  };
  stamp(db.evidence);
  stamp(db.assessments);
  stamp(db.kpi_data);
  stamp(db.tdg_plans);
  stamp(db.surveys);
  stamp(db.reports);
  stamp(db.peos);
  stamp(db.plos);
  stamp(db.courses);
  stamp(db.clos);
  stamp(db.course_plo_map);
  stamp(db.clo_plo_map);
  stamp(db.rubrics);
  stamp(db.assessment_plans);
  stamp(db.assessment_items);
  stamp(db.plan_students);
  stamp(db.scores);
  // school_info: was a flat object {} — convert to map keyed by workspace_id
  // Detect legacy form (no numeric keys) by checking for any known field at top-level.
  if (db.school_info && typeof db.school_info === 'object' && !Array.isArray(db.school_info)) {
    const keys = Object.keys(db.school_info);
    const looksLikeMap = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
    if (!looksLikeMap) {
      const legacy = db.school_info;
      db.school_info = {};
      if (Object.keys(legacy).length > 0) db.school_info[defaultWsId] = legacy;
      dirty = true;
    }
  } else {
    db.school_info = {};
    dirty = true;
  }
  if (dirty) saveDB(db);
  return db;
}

// ─── Cookie helper ────────────────────────────────────────────────────────────
function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, pair) => {
    const [k, ...v] = pair.trim().split('=');
    if (k) acc[k] = decodeURIComponent(v.join('=') || '');
    return acc;
  }, {});
}

// Returns the active workspace id for this request.
// Priority: ?ws_id query → x-workspace-id header → ws_id cookie → first workspace
function getWorkspaceId(req, db) {
  const fromQuery  = req.query && req.query.ws_id;
  const fromHeader = req.headers['x-workspace-id'];
  const fromCookie = parseCookies(req).ws_id;
  const raw = fromQuery || fromHeader || fromCookie;
  const id = parseInt(raw);
  if (id && db.workspaces.find(w => w.id === id)) return id;
  return db.workspaces[0] ? db.workspaces[0].id : null;
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
const { STANDARDS_DETAIL, EVIDENCE_TYPES } = require('./standards-detail.js');

app.get('/api/standards', (req, res) => res.json(STANDARDS));
app.get('/api/evidence-types', (req, res) => res.json(EVIDENCE_TYPES));

// Chi tiết 1 tiêu chí (yêu cầu + minh chứng gợi ý + self-check)
// Trả null nếu chưa có chi tiết (các TC chưa được seed ở Pha A)
app.get('/api/criteria/:code', (req, res) => {
  const code = req.params.code; // VD "1.1"
  res.json(STANDARDS_DETAIL[code] || null);
});

app.get('/api/criteria', (req, res) => {
  // Trả full map (dùng khi cần preload bulk, VD trong Module 2 sidebar)
  res.json(STANDARDS_DETAIL);
});

// ─── API: Workspaces ──────────────────────────────────────────────────────────
// A workspace = 1 đợt kiểm định (CSGD theo TT26 hoặc CTĐT theo TT04)
app.get('/api/workspaces', (req, res) => {
  const db = loadDB();
  const currentId = getWorkspaceId(req, db);
  res.json({
    items: db.workspaces.map(w => ({ ...w, current: w.id === currentId })),
    current_id: currentId,
  });
});

app.get('/api/workspaces/current', (req, res) => {
  const db = loadDB();
  const id = getWorkspaceId(req, db);
  const ws = db.workspaces.find(w => w.id === id);
  if (!ws) return res.status(404).json({ error: 'Chưa có workspace' });
  res.json(ws);
});

app.post('/api/workspaces', (req, res) => {
  const { name, type, law, description } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Thiếu tên hoặc loại workspace' });
  if (!['CSGD', 'CTDT'].includes(type)) return res.status(400).json({ error: 'Loại không hợp lệ (CSGD hoặc CTDT)' });
  const db = loadDB();
  const ws = {
    id: db.nextWorkspaceId++,
    name, type,
    law: law || (type === 'CSGD' ? 'TT26/2026 BGDĐT' : 'TT04/2025 BGDĐT'),
    description: description || '',
    active: true,
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.workspaces.push(ws);
  saveDB(db);
  res.json({ id: ws.id, message: 'Đã tạo workspace' });
});

app.put('/api/workspaces/:id', (req, res) => {
  const db = loadDB();
  const ws = db.workspaces.find(w => w.id === parseInt(req.params.id));
  if (!ws) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, description, active, law } = req.body;
  if (name        !== undefined) ws.name        = name;
  if (description !== undefined) ws.description = description;
  if (active      !== undefined) ws.active      = active;
  if (law         !== undefined) ws.law         = law;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/workspaces/:id', (req, res) => {
  const db = loadDB();
  if (db.workspaces.length <= 1) return res.status(400).json({ error: 'Phải còn ít nhất 1 workspace' });
  const idx = db.workspaces.findIndex(w => w.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.workspaces.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa workspace (dữ liệu trong workspace này không bị xóa — sẽ trở thành mồ côi)' });
});

// ─── API: Stats ───────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const evidence = db.evidence.filter(e => e.workspace_id === wsId);
  const total = evidence.length;
  const byStandard = {};
  for (let i = 1; i <= 15; i++) byStandard[i] = 0;
  for (const e of evidence) byStandard[e.tieu_chuan] = (byStandard[e.tieu_chuan] || 0) + 1;
  res.json({ total, byStandard });
});

// ─── API: List Evidence ───────────────────────────────────────────────────────
app.get('/api/evidence', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.evidence.filter(e => e.workspace_id === wsId);
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
  const wsId = getWorkspaceId(req, db);

  // Count existing evidence for this criterion → next sequence number (per workspace)
  const existing = db.evidence.filter(e => e.workspace_id === wsId && e.tieu_chi === tieu_chi);
  const thu_tu = existing.length + 1;

  // Generate code: Hn.ab.cd.ef
  const code = `H${tc}.${String(tc).padStart(2,'0')}.${String(tieu_chi_so).padStart(2,'0')}.${String(thu_tu).padStart(2,'0')}`;

  const record = {
    id:          db.nextId++,
    workspace_id: wsId,
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
  const wsId = getWorkspaceId(req, db);
  const idx = db.evidence.findIndex(e => e.id === parseInt(req.params.id) && e.workspace_id === wsId);
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
  const wsId = getWorkspaceId(req, db);
  const record = db.evidence.find(e => e.id === parseInt(req.params.id) && e.workspace_id === wsId);
  if (!record) return res.status(404).json({ error: 'Không tìm thấy' });
  const filePath = path.join(UPLOADS_DIR, record.file_stored);
  res.download(filePath, record.file_name);
});

// ─── API: Assessment Stats (Biểu 04) ─────────────────────────────────────────
app.get('/api/assess-stats', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const list = db.assessments.filter(a => a.workspace_id === wsId);
  const total = list.length;
  const dat = list.filter(a => a.ket_qua === 'DAT').length;
  const khongDat = list.filter(a => a.ket_qua === 'KHONG_DAT').length;
  const draft = list.filter(a => a.trang_thai === 'draft').length;
  const approved = list.filter(a => a.trang_thai === 'approved').length;
  const statusMap = {};
  for (const a of list) statusMap[a.tieu_chi] = { ket_qua: a.ket_qua, trang_thai: a.trang_thai };
  res.json({ total, dat, khongDat, draft, approved, statusMap });
});

// ─── API: List Assessments ────────────────────────────────────────────────────
app.get('/api/assessments', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.assessments.filter(a => a.workspace_id === wsId));
});

// ─── API: Get Assessment for one criterion ────────────────────────────────────
app.get('/api/assessments/by-criteria/:tieu_chi', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const code = decodeURIComponent(req.params.tieu_chi);
  const record = db.assessments.find(a => a.workspace_id === wsId && a.tieu_chi === code);
  const evidence = db.evidence.filter(e => e.workspace_id === wsId && e.tieu_chi === code);
  res.json({ assessment: record || null, evidence });
});

// ─── API: Save Assessment (create or update) ──────────────────────────────────
app.post('/api/assessments', (req, res) => {
  const { tieu_chuan, tieu_chi, hien_trang, diem_manh, ton_tai, ke_hoach, ket_qua, trang_thai, nguoi_thuc_hien, mc_bo_sung } = req.body;
  if (!tieu_chuan || !tieu_chi) return res.status(400).json({ error: 'Thiếu thông tin tiêu chí' });

  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const existing = db.assessments.find(a => a.workspace_id === wsId && a.tieu_chi === tieu_chi);

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
    workspace_id:     wsId,
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
  const wsId = getWorkspaceId(req, db);
  const idx = db.assessments.findIndex(a => a.id === parseInt(req.params.id) && a.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.assessments.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── API: School Info (per workspace) ─────────────────────────────────────────
app.get('/api/school-info', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.school_info[wsId] || {});
});

app.put('/api/school-info', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  db.school_info[wsId] = { ...(db.school_info[wsId] || {}), ...req.body };
  saveDB(db);
  res.json({ message: 'Đã lưu thông tin trường' });
});

// ─── API: KPI Data (Biểu 16) ─────────────────────────────────────────────────
app.get('/api/kpi', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const list = db.kpi_data.filter(r => r.workspace_id === wsId).map(r => ({
    id: r.id, nam_hoc: r.nam_hoc, created_at: r.created_at, updated_at: r.updated_at,
    so_gv_co_huu: r.so_gv_co_huu, pct_gv_ts: r.pct_gv_ts,
    pct_tot_nghiep: r.pct_tot_nghiep, pct_viec_lam_12t: r.pct_viec_lam_12t,
    so_bao_isi_scopus: r.so_bao_isi_scopus, so_nguoi_hoc_dh: r.so_nguoi_hoc_dh,
  }));
  res.json(list.sort((a, b) => (b.nam_hoc || '').localeCompare(a.nam_hoc || '')));
});

app.get('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const record = db.kpi_data.find(r => r.id === parseInt(req.params.id) && r.workspace_id === wsId);
  if (!record) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(record);
});

app.post('/api/kpi', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { nam_hoc } = req.body;
  if (!nam_hoc) return res.status(400).json({ error: 'Thiếu năm học' });
  if (db.kpi_data.find(r => r.workspace_id === wsId && r.nam_hoc === nam_hoc))
    return res.status(400).json({ error: `Đã có dữ liệu năm học ${nam_hoc} trong workspace này` });

  const record = { id: db.nextKpiId++, workspace_id: wsId, nam_hoc, ...req.body,
    created_at: new Date().toLocaleString('vi-VN'),
    updated_at: new Date().toLocaleString('vi-VN') };
  db.kpi_data.push(record);
  saveDB(db);
  res.json({ id: record.id, message: 'Đã tạo dữ liệu năm học' });
});

app.put('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.kpi_data.findIndex(r => r.id === parseInt(req.params.id) && r.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Prevent overwriting workspace_id and id from request body
  const { workspace_id: _ws, id: _id, ...rest } = req.body;
  db.kpi_data[idx] = { ...db.kpi_data[idx], ...rest,
    updated_at: new Date().toLocaleString('vi-VN') };
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/kpi/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.kpi_data.findIndex(r => r.id === parseInt(req.params.id) && r.workspace_id === wsId);
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
  const wsId = getWorkspaceId(req, db);
  res.json(db.tdg_plans.filter(p => p.workspace_id === wsId).map(p => ({
    id: p.id, name: p.name, ngay_bat_dau: p.ngay_bat_dau,
    total: p.tasks.length,
    done: p.tasks.filter(t => t.status === 'done').length,
    late: p.tasks.filter(t => t.status === 'late').length,
    in_progress: p.tasks.filter(t => t.status === 'in_progress').length,
  })));
});

// Helper: find a plan within current workspace
function findPlan(db, req) {
  const wsId = getWorkspaceId(req, db);
  return db.tdg_plans.find(p => p.id === parseInt(req.params.id) && p.workspace_id === wsId);
}

app.get('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const plan = findPlan(db, req);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(plan);
});

app.post('/api/tdg', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { name, ngay_bat_dau, use_defaults } = req.body;
  if (!name) return res.status(400).json({ error: 'Thiếu tên kế hoạch' });
  const tasks = use_defaults !== false ? defaultTasks(db.nextTaskId) : [];
  db.nextTaskId += tasks.length;
  const plan = { id: db.nextTdgId++, workspace_id: wsId, name, ngay_bat_dau: ngay_bat_dau || '', tasks,
    created_at: new Date().toLocaleString('vi-VN') };
  db.tdg_plans.push(plan);
  saveDB(db);
  res.json({ id: plan.id, message: 'Đã tạo kế hoạch TĐG' });
});

app.put('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const plan = findPlan(db, req);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, ngay_bat_dau } = req.body;
  if (name) plan.name = name;
  if (ngay_bat_dau !== undefined) plan.ngay_bat_dau = ngay_bat_dau;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/tdg/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.tdg_plans.findIndex(p => p.id === parseInt(req.params.id) && p.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.tdg_plans.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── API: Tasks (inherit workspace from parent plan) ─────────────────────────
app.post('/api/tdg/:id/tasks', (req, res) => {
  const db = loadDB();
  const plan = findPlan(db, req);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch' });
  const task = { id: db.nextTaskId++, status: 'todo', priority: 'normal', notes: '', ...req.body };
  plan.tasks.push(task);
  saveDB(db);
  res.json({ id: task.id });
});

app.put('/api/tdg/:id/tasks/:taskId', (req, res) => {
  const db = loadDB();
  const plan = findPlan(db, req);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy kế hoạch' });
  const task = plan.tasks.find(t => t.id === parseInt(req.params.taskId));
  if (!task) return res.status(404).json({ error: 'Không tìm thấy task' });
  Object.assign(task, req.body);
  saveDB(db);
  res.json({ message: 'Đã cập nhật task' });
});

app.delete('/api/tdg/:id/tasks/:taskId', (req, res) => {
  const db = loadDB();
  const plan = findPlan(db, req);
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
  const wsId = getWorkspaceId(req, db);
  res.json(db.surveys.filter(s => s.workspace_id === wsId).map(s => ({
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
  const wsId = getWorkspaceId(req, db);
  const s = db.surveys.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ ...s, template: SURVEY_TEMPLATES[s.type] || {} });
});

app.post('/api/surveys', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { type, title, description } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'Thiếu loại hoặc tiêu đề' });
  if (!SURVEY_TEMPLATES[type]) return res.status(400).json({ error: 'Loại khảo sát không hợp lệ' });
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  const survey = {
    id: db.nextSurveyId++, workspace_id: wsId, type, title, description: description || '',
    token, active: true, created_at: new Date().toLocaleString('vi-VN'), responses: [],
  };
  db.surveys.push(survey);
  saveDB(db);
  res.json({ id: survey.id, token: survey.token, message: 'Đã tạo khảo sát' });
});

app.put('/api/surveys/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const s = db.surveys.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
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
  const wsId = getWorkspaceId(req, db);
  const idx = db.surveys.findIndex(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.surveys.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

app.get('/api/surveys/:id/stats', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const s = db.surveys.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
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

// ─── API: Report data (Biểu 05) ──────────────────────────────────────────────
app.get('/api/report/data', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const wsAssessments = db.assessments.filter(a => a.workspace_id === wsId);
  const wsEvidence    = db.evidence.filter(e => e.workspace_id === wsId);
  const wsKpi         = db.kpi_data.filter(r => r.workspace_id === wsId);

  const assessMap = {};
  for (const a of wsAssessments) assessMap[a.tieu_chi] = a;

  const standards = STANDARDS.map(std => {
    const criteriaData = std.criteria.map((name, idx) => {
      const key = `${std.id}.${idx + 1}`;
      return {
        key, name, idx: idx + 1,
        assess: assessMap[key] || null,
        evidence: wsEvidence.filter(e => e.tieu_chi === key),
      };
    });
    const assessed  = criteriaData.filter(c => c.assess).length;
    const dat       = criteriaData.filter(c => c.assess?.ket_qua === 'DAT').length;
    const khong_dat = criteriaData.filter(c => c.assess?.ket_qua === 'KHONG_DAT').length;
    return { ...std, criteriaData, assessed, dat, khong_dat };
  });

  const totalAssessed  = wsAssessments.length;
  const totalDat       = wsAssessments.filter(a => a.ket_qua === 'DAT').length;
  const totalKhongDat  = wsAssessments.filter(a => a.ket_qua === 'KHONG_DAT').length;
  const latestKpi      = wsKpi.sort((a, b) => (b.nam_hoc||'').localeCompare(a.nam_hoc||''))[0] || null;

  res.json({
    school_info:    db.school_info[wsId] || {},
    standards,
    evidence:       wsEvidence,
    kpi_data:       wsKpi,
    latest_kpi:     latestKpi,
    stats: { total_criteria: 60, assessed: totalAssessed, dat: totalDat, khong_dat: totalKhongDat, total_evidence: wsEvidence.length },
  });
});

// ─── API: Reports CRUD ────────────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.reports.filter(r => r.workspace_id === wsId).map(r => ({
    id: r.id, title: r.title, period: r.period, author: r.author,
    created_at: r.created_at, updated_at: r.updated_at,
  })));
});

app.get('/api/reports/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const r = db.reports.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!r) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(r);
});

app.post('/api/reports', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { title, period, author } = req.body;
  if (!title) return res.status(400).json({ error: 'Thiếu tiêu đề' });
  const now = new Date().toLocaleString('vi-VN');
  const report = {
    id: db.nextReportId++, workspace_id: wsId, title, period: period || '', author: author || '',
    co_so_phap_ly: '', mo_ta_qua_trinh: '', mo_ta_csdt: '',
    tom_tat_ket_qua: '', ke_hoach_cai_tien: '',
    created_at: now, updated_at: now,
  };
  db.reports.push(report);
  saveDB(db);
  res.json({ id: report.id, message: 'Đã tạo báo cáo' });
});

app.put('/api/reports/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const r = db.reports.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!r) return res.status(404).json({ error: 'Không tìm thấy' });
  // Prevent overwriting id, created_at, workspace_id
  const { id: _id, created_at: _ca, workspace_id: _ws, ...rest } = req.body;
  Object.assign(r, rest, { updated_at: new Date().toLocaleString('vi-VN') });
  saveDB(db);
  res.json({ message: 'Đã lưu' });
});

app.delete('/api/reports/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.reports.findIndex(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.reports.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── M8 — PEO (Mục tiêu giáo dục) ─────────────────────────────────────────────
// Cấp cao nhất của khung CĐR: mô tả người học sẽ làm được gì sau 3-5 năm tốt nghiệp.
app.get('/api/peos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.peos.filter(p => p.workspace_id === wsId).sort((a, b) => (a.code || '').localeCompare(b.code || '')));
});

app.post('/api/peos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { code, content } = req.body;
  if (!code || !content) return res.status(400).json({ error: 'Thiếu mã hoặc nội dung PEO' });
  if (db.peos.find(p => p.workspace_id === wsId && p.code === code))
    return res.status(400).json({ error: `Đã có PEO "${code}" trong workspace này` });
  const peo = {
    id: db.nextPeoId++, workspace_id: wsId,
    code: code.trim(), content: content.trim(),
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.peos.push(peo);
  saveDB(db);
  res.json({ id: peo.id, message: 'Đã tạo PEO' });
});

app.put('/api/peos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const peo = db.peos.find(p => p.id === parseInt(req.params.id) && p.workspace_id === wsId);
  if (!peo) return res.status(404).json({ error: 'Không tìm thấy' });
  const { code, content } = req.body;
  if (code !== undefined && code.trim() !== peo.code) {
    if (db.peos.find(p => p.workspace_id === wsId && p.code === code.trim() && p.id !== peo.id))
      return res.status(400).json({ error: `Đã có PEO "${code.trim()}"` });
    peo.code = code.trim();
  }
  if (content !== undefined) peo.content = content.trim();
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/peos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.peos.findIndex(p => p.id === parseInt(req.params.id) && p.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.peos.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── M8 — PLO (Chuẩn đầu ra CTĐT) ─────────────────────────────────────────────
// 6-10 PLO mô tả năng lực sinh viên đạt được khi tốt nghiệp.
const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
const PLO_TYPES    = ['knowledge', 'skill', 'attitude'];

app.get('/api/plos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.plos.filter(p => p.workspace_id === wsId).sort((a, b) => (a.code || '').localeCompare(b.code || '')));
});

app.post('/api/plos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { code, content, bloom_level, type } = req.body;
  if (!code || !content) return res.status(400).json({ error: 'Thiếu mã hoặc nội dung PLO' });
  if (db.plos.find(p => p.workspace_id === wsId && p.code === code))
    return res.status(400).json({ error: `Đã có PLO "${code}" trong workspace này` });
  const plo = {
    id: db.nextPloId++, workspace_id: wsId,
    code: code.trim(), content: content.trim(),
    bloom_level: BLOOM_LEVELS.includes(bloom_level) ? bloom_level : 'apply',
    type: PLO_TYPES.includes(type) ? type : 'knowledge',
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.plos.push(plo);
  saveDB(db);
  res.json({ id: plo.id, message: 'Đã tạo PLO' });
});

app.put('/api/plos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const plo = db.plos.find(p => p.id === parseInt(req.params.id) && p.workspace_id === wsId);
  if (!plo) return res.status(404).json({ error: 'Không tìm thấy' });
  const { code, content, bloom_level, type } = req.body;
  if (code !== undefined && code.trim() !== plo.code) {
    if (db.plos.find(p => p.workspace_id === wsId && p.code === code.trim() && p.id !== plo.id))
      return res.status(400).json({ error: `Đã có PLO "${code.trim()}"` });
    plo.code = code.trim();
  }
  if (content     !== undefined) plo.content     = content.trim();
  if (bloom_level !== undefined && BLOOM_LEVELS.includes(bloom_level)) plo.bloom_level = bloom_level;
  if (type        !== undefined && PLO_TYPES.includes(type))           plo.type        = type;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/plos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const ploId = parseInt(req.params.id);
  const idx = db.plos.findIndex(p => p.id === ploId && p.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.plos.splice(idx, 1);
  // Cascade mappings
  db.course_plo_map = db.course_plo_map.filter(m => !(m.workspace_id === wsId && m.plo_id === ploId));
  db.clo_plo_map    = db.clo_plo_map.filter(m => !(m.workspace_id === wsId && m.plo_id === ploId));
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── M8 — Courses (Học phần) ──────────────────────────────────────────────────
const COURSE_TYPES = ['core', 'elective', 'general']; // bắt buộc / tự chọn / đại cương

app.get('/api/courses', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const list = db.courses.filter(c => c.workspace_id === wsId);
  // Attach CLO count for each course (so list page can show it)
  const cloCount = {};
  for (const cl of db.clos) {
    if (cl.workspace_id !== wsId) continue;
    cloCount[cl.course_id] = (cloCount[cl.course_id] || 0) + 1;
  }
  res.json(list
    .map(c => ({ ...c, clo_count: cloCount[c.id] || 0 }))
    .sort((a, b) => (a.semester || 0) - (b.semester || 0) || (a.code || '').localeCompare(b.code || '')));
});

app.post('/api/courses', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { code, name, credits, semester, type } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Thiếu mã hoặc tên học phần' });
  if (db.courses.find(c => c.workspace_id === wsId && c.code === code))
    return res.status(400).json({ error: `Đã có học phần "${code}" trong workspace này` });
  const course = {
    id: db.nextCourseId++, workspace_id: wsId,
    code: code.trim(), name: name.trim(),
    credits: Number(credits) || 0,
    semester: Number(semester) || 0,
    type: COURSE_TYPES.includes(type) ? type : 'core',
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.courses.push(course);
  saveDB(db);
  res.json({ id: course.id, message: 'Đã tạo học phần' });
});

app.put('/api/courses/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const c = db.courses.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!c) return res.status(404).json({ error: 'Không tìm thấy' });
  const { code, name, credits, semester, type } = req.body;
  if (code !== undefined && code.trim() !== c.code) {
    if (db.courses.find(x => x.workspace_id === wsId && x.code === code.trim() && x.id !== c.id))
      return res.status(400).json({ error: `Đã có học phần "${code.trim()}"` });
    c.code = code.trim();
  }
  if (name     !== undefined) c.name     = name.trim();
  if (credits  !== undefined) c.credits  = Number(credits) || 0;
  if (semester !== undefined) c.semester = Number(semester) || 0;
  if (type     !== undefined && COURSE_TYPES.includes(type)) c.type = type;
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/courses/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.courses.findIndex(c => c.id === parseInt(req.params.id) && c.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Cascade: CLOs, mappings, plans, items, students, scores
  const courseId = db.courses[idx].id;
  const cloBefore = db.clos.length;
  const removedCloIds = db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === courseId).map(cl => cl.id);
  db.clos = db.clos.filter(cl => !(cl.workspace_id === wsId && cl.course_id === courseId));
  db.course_plo_map = db.course_plo_map.filter(m => !(m.workspace_id === wsId && m.course_id === courseId));
  db.clo_plo_map    = db.clo_plo_map.filter(m => !(m.workspace_id === wsId && removedCloIds.includes(m.clo_id)));
  // M10 cascade
  const planIds = new Set(db.assessment_plans.filter(p => p.workspace_id === wsId && p.course_id === courseId).map(p => p.id));
  const itemIdsSet = new Set(db.assessment_items.filter(it => it.workspace_id === wsId && planIds.has(it.plan_id)).map(it => it.id));
  db.scores              = db.scores.filter(s => !(s.workspace_id === wsId && itemIdsSet.has(s.item_id)));
  db.plan_students       = db.plan_students.filter(s => !(s.workspace_id === wsId && planIds.has(s.plan_id)));
  db.assessment_items    = db.assessment_items.filter(it => !(it.workspace_id === wsId && planIds.has(it.plan_id)));
  db.assessment_plans    = db.assessment_plans.filter(p => !(p.workspace_id === wsId && planIds.has(p.id)));
  db.courses.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa', clos_removed: cloBefore - db.clos.length, plans_removed: planIds.size });
});

// ─── M8 — CLO (Chuẩn đầu ra học phần) ─────────────────────────────────────────
// CLO inflation warning: nếu 1 học phần có > 6 CLO sẽ trả về cảnh báo (không block)
const CLO_INFLATION_LIMIT = 6;

app.get('/api/clos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.clos.filter(cl => cl.workspace_id === wsId);
  if (req.query.course_id) {
    const cid = parseInt(req.query.course_id);
    list = list.filter(cl => cl.course_id === cid);
  }
  res.json(list.sort((a, b) => (a.code || '').localeCompare(b.code || '')));
});

app.post('/api/clos', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { course_id, code, content, bloom_level, type, rubric_id } = req.body;
  if (!course_id || !code || !content) return res.status(400).json({ error: 'Thiếu course_id, mã hoặc nội dung CLO' });
  const cid = parseInt(course_id);
  const course = db.courses.find(c => c.id === cid && c.workspace_id === wsId);
  if (!course) return res.status(400).json({ error: 'Học phần không tồn tại trong workspace này' });
  if (db.clos.find(cl => cl.workspace_id === wsId && cl.course_id === cid && cl.code === code))
    return res.status(400).json({ error: `Đã có CLO "${code}" trong học phần này` });
  let rid = null;
  if (rubric_id !== undefined && rubric_id !== null && rubric_id !== '') {
    rid = parseInt(rubric_id);
    if (!db.rubrics.find(r => r.id === rid && r.workspace_id === wsId))
      return res.status(400).json({ error: 'Rubric không tồn tại trong workspace này' });
  }
  const clo = {
    id: db.nextCloId++, workspace_id: wsId, course_id: cid,
    code: code.trim(), content: content.trim(),
    bloom_level: BLOOM_LEVELS.includes(bloom_level) ? bloom_level : 'apply',
    type: PLO_TYPES.includes(type) ? type : 'knowledge',
    ...(rid ? { rubric_id: rid } : {}),
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.clos.push(clo);
  saveDB(db);
  // Inflation check
  const total = db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === cid).length;
  const warning = total > CLO_INFLATION_LIMIT
    ? `⚠ Học phần này hiện có ${total} CLO (> ${CLO_INFLATION_LIMIT}). Khuyến nghị 4–6 CLO/HP để tránh CLO inflation.`
    : null;
  res.json({ id: clo.id, message: 'Đã tạo CLO', warning });
});

app.put('/api/clos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const cl = db.clos.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!cl) return res.status(404).json({ error: 'Không tìm thấy' });
  const { code, content, bloom_level, type, rubric_id } = req.body;
  if (code !== undefined && code.trim() !== cl.code) {
    if (db.clos.find(x => x.workspace_id === wsId && x.course_id === cl.course_id && x.code === code.trim() && x.id !== cl.id))
      return res.status(400).json({ error: `Đã có CLO "${code.trim()}" trong học phần này` });
    cl.code = code.trim();
  }
  if (content     !== undefined) cl.content     = content.trim();
  if (bloom_level !== undefined && BLOOM_LEVELS.includes(bloom_level)) cl.bloom_level = bloom_level;
  if (type        !== undefined && PLO_TYPES.includes(type))           cl.type        = type;
  if (rubric_id !== undefined) {
    if (rubric_id === null || rubric_id === '') {
      delete cl.rubric_id;
    } else {
      const rid = parseInt(rubric_id);
      if (!db.rubrics.find(r => r.id === rid && r.workspace_id === wsId))
        return res.status(400).json({ error: 'Rubric không tồn tại trong workspace này' });
      cl.rubric_id = rid;
    }
  }
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/clos/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const idx = db.clos.findIndex(cl => cl.id === parseInt(req.params.id) && cl.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  db.clos.splice(idx, 1);
  // Cascade clo_plo_map for this CLO
  db.clo_plo_map = db.clo_plo_map.filter(m => !(m.workspace_id === wsId && m.clo_id === parseInt(req.params.id)));
  saveDB(db);
  res.json({ message: 'Đã xóa' });
});

// ─── M8 — Course × PLO mapping (level I/R/M) ─────────────────────────────────
// Each course contributes to certain PLOs at I (Introduce) / R (Reinforce) / M (Master) level.
// Upsert pattern: POST with {course_id, plo_id, level}; level=null deletes the cell.
const MAP_LEVELS = ['I', 'R', 'M'];

app.get('/api/course-plo-map', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  res.json(db.course_plo_map.filter(m => m.workspace_id === wsId));
});

app.post('/api/course-plo-map', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { course_id, plo_id, level } = req.body;
  const cid = parseInt(course_id), pid = parseInt(plo_id);
  if (!cid || !pid) return res.status(400).json({ error: 'Thiếu course_id hoặc plo_id' });
  const course = db.courses.find(c => c.id === cid && c.workspace_id === wsId);
  const plo    = db.plos.find(p => p.id === pid && p.workspace_id === wsId);
  if (!course || !plo) return res.status(400).json({ error: 'Course hoặc PLO không tồn tại trong workspace' });

  const idx = db.course_plo_map.findIndex(m => m.workspace_id === wsId && m.course_id === cid && m.plo_id === pid);
  if (level === null || level === '' || level === undefined) {
    if (idx !== -1) db.course_plo_map.splice(idx, 1);
    saveDB(db);
    return res.json({ deleted: idx !== -1 });
  }
  if (!MAP_LEVELS.includes(level)) return res.status(400).json({ error: 'level phải là I, R hoặc M' });
  if (idx !== -1) {
    db.course_plo_map[idx].level = level;
  } else {
    db.course_plo_map.push({ workspace_id: wsId, course_id: cid, plo_id: pid, level });
  }
  saveDB(db);
  res.json({ ok: true, level });
});

// ─── M8 — CLO × PLO mapping (weight) ──────────────────────────────────────────
// Each CLO contributes to PLOs with a relative weight (default 1.0).
// Used in Inc7 to aggregate CLO scores → PLO scores.
app.get('/api/clo-plo-map', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.clo_plo_map.filter(m => m.workspace_id === wsId);
  if (req.query.course_id) {
    const cid = parseInt(req.query.course_id);
    const cloIds = new Set(db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === cid).map(cl => cl.id));
    list = list.filter(m => cloIds.has(m.clo_id));
  }
  res.json(list);
});

app.post('/api/clo-plo-map', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { clo_id, plo_id, weight } = req.body;
  const cid = parseInt(clo_id), pid = parseInt(plo_id);
  if (!cid || !pid) return res.status(400).json({ error: 'Thiếu clo_id hoặc plo_id' });
  const clo = db.clos.find(c => c.id === cid && c.workspace_id === wsId);
  const plo = db.plos.find(p => p.id === pid && p.workspace_id === wsId);
  if (!clo || !plo) return res.status(400).json({ error: 'CLO hoặc PLO không tồn tại trong workspace' });

  const idx = db.clo_plo_map.findIndex(m => m.workspace_id === wsId && m.clo_id === cid && m.plo_id === pid);
  // weight === null/empty/undefined → delete
  if (weight === null || weight === '' || weight === undefined) {
    if (idx !== -1) db.clo_plo_map.splice(idx, 1);
    saveDB(db);
    return res.json({ deleted: idx !== -1 });
  }
  const w = Number(weight);
  if (!Number.isFinite(w) || w < 0) return res.status(400).json({ error: 'weight phải là số ≥ 0' });
  if (idx !== -1) {
    db.clo_plo_map[idx].weight = w;
  } else {
    db.clo_plo_map.push({ workspace_id: wsId, clo_id: cid, plo_id: pid, weight: w });
  }
  saveDB(db);
  res.json({ ok: true, weight: w });
});

// ─── M9 — Rubric Builder (Inc5) ───────────────────────────────────────────────
// Rubric chuẩn theo doc05: 1 rubric mô tả thang đo cho 1 hoặc nhiều CLO.
// 4 thuộc tính của mỗi level: name, is_pass (Đạt CĐR?), weight (%), description.
const RUBRIC_PRESETS = {
  A_D:    { name: 'A-D (Yếu/TB/Khá/Giỏi)',          levels: ['Yếu','Trung bình','Khá','Giỏi'] },
  NOVICE: { name: 'Novice → Mastery',                levels: ['Cần phát triển','Đang phát triển','Hài lòng','Vượt trội'] },
  NUMERIC:{ name: 'Mức 1–4',                         levels: ['Mức 1','Mức 2','Mức 3','Mức 4'] },
};

function defaultRubricLevels(presetKey = 'A_D') {
  const preset = RUBRIC_PRESETS[presetKey] || RUBRIC_PRESETS.A_D;
  const n = preset.levels.length;
  const w = Math.round(10000 / n) / 100; // ~25.00 for n=4
  // Mặc định: 2 mức cuối là "Đạt CĐR"
  return preset.levels.map((nm, i) => ({
    name: nm,
    is_pass: i >= Math.floor(n / 2),
    weight: w,
    description: '',
  }));
}

app.get('/api/rubric-presets', (req, res) => res.json(RUBRIC_PRESETS));

app.get('/api/rubrics', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  // Count CLOs using each rubric (per workspace)
  const cloCount = {};
  for (const cl of db.clos) {
    if (cl.workspace_id !== wsId || !cl.rubric_id) continue;
    cloCount[cl.rubric_id] = (cloCount[cl.rubric_id] || 0) + 1;
  }
  const list = db.rubrics.filter(r => r.workspace_id === wsId).map(r => {
    const sumW = (r.levels || []).reduce((s, l) => s + (Number(l.weight) || 0), 0);
    return {
      id: r.id, name: r.name, description: r.description,
      scale_type: r.scale_type, level_count: (r.levels || []).length,
      weight_sum: Math.round(sumW * 100) / 100,
      pass_count: (r.levels || []).filter(l => l.is_pass).length,
      clo_count:  cloCount[r.id] || 0,
      created_at: r.created_at, updated_at: r.updated_at,
    };
  }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  res.json(list);
});

app.get('/api/rubrics/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const r = db.rubrics.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!r) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(r);
});

function sanitizeLevels(levels) {
  if (!Array.isArray(levels)) return [];
  return levels.map(l => ({
    name:        String(l.name || '').trim() || '—',
    is_pass:     !!l.is_pass,
    weight:      Math.max(0, Number(l.weight) || 0),
    description: String(l.description || '').trim(),
  }));
}

app.post('/api/rubrics', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { name, description, scale_type, levels, preset } = req.body;
  if (!name) return res.status(400).json({ error: 'Thiếu tên rubric' });
  let lvls;
  if (Array.isArray(levels) && levels.length > 0) {
    lvls = sanitizeLevels(levels);
  } else {
    lvls = defaultRubricLevels(preset || scale_type || 'A_D');
  }
  const now = new Date().toLocaleString('vi-VN');
  const r = {
    id: db.nextRubricId++, workspace_id: wsId,
    name: name.trim(), description: (description || '').trim(),
    scale_type: scale_type || preset || 'A_D',
    levels: lvls,
    created_at: now, updated_at: now,
  };
  db.rubrics.push(r);
  saveDB(db);
  res.json({ id: r.id, message: 'Đã tạo rubric' });
});

app.put('/api/rubrics/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const r = db.rubrics.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!r) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, description, scale_type, levels } = req.body;
  if (name        !== undefined) r.name        = name.trim();
  if (description !== undefined) r.description = description.trim();
  if (scale_type  !== undefined) r.scale_type  = scale_type;
  if (levels      !== undefined) r.levels      = sanitizeLevels(levels);
  r.updated_at = new Date().toLocaleString('vi-VN');
  saveDB(db);
  res.json({ message: 'Đã cập nhật rubric' });
});

app.delete('/api/rubrics/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const ridParam = parseInt(req.params.id);
  const idx = db.rubrics.findIndex(r => r.id === ridParam && r.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Detach from any CLOs that reference this rubric
  let detached = 0;
  for (const cl of db.clos) {
    if (cl.workspace_id === wsId && cl.rubric_id === ridParam) {
      delete cl.rubric_id;
      detached++;
    }
  }
  db.rubrics.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa rubric', clos_detached: detached });
});

// ─── M10 — Assessment Plans (Inc6a) ───────────────────────────────────────────
// 1 plan = 1 đợt đo CLO của 1 HP × 1 kỳ học. Sau này gắn với items, students, scores.
const PLAN_STATUSES = ['draft', 'active', 'closed'];

app.get('/api/assessment-plans', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.assessment_plans.filter(p => p.workspace_id === wsId);
  if (req.query.course_id) {
    const cid = parseInt(req.query.course_id);
    list = list.filter(p => p.course_id === cid);
  }
  // Attach summary counts (items, students)
  const itemsByPlan = {};
  for (const it of db.assessment_items) {
    if (it.workspace_id !== wsId) continue;
    itemsByPlan[it.plan_id] = (itemsByPlan[it.plan_id] || 0) + 1;
  }
  const studentsByPlan = {};
  for (const s of db.plan_students) {
    if (s.workspace_id !== wsId) continue;
    studentsByPlan[s.plan_id] = (studentsByPlan[s.plan_id] || 0) + 1;
  }
  // Attach course code/name (denormalized for list view)
  const courseById = Object.fromEntries(db.courses.filter(c => c.workspace_id === wsId).map(c => [c.id, c]));
  res.json(list
    .map(p => {
      const c = courseById[p.course_id];
      return {
        ...p,
        course_code: c?.code, course_name: c?.name,
        item_count:    itemsByPlan[p.id]    || 0,
        student_count: studentsByPlan[p.id] || 0,
      };
    })
    .sort((a, b) => (b.school_year || '').localeCompare(a.school_year || '') || (a.semester || 0) - (b.semester || 0)));
});

app.get('/api/assessment-plans/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const p = db.assessment_plans.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy' });
  const c = db.courses.find(x => x.id === p.course_id && x.workspace_id === wsId);
  res.json({ ...p, course_code: c?.code, course_name: c?.name });
});

app.post('/api/assessment-plans', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { course_id, name, semester, school_year, threshold_pct, pass_score_pct } = req.body;
  if (!course_id || !school_year) return res.status(400).json({ error: 'Thiếu course_id hoặc năm học' });
  const cid = parseInt(course_id);
  const course = db.courses.find(c => c.id === cid && c.workspace_id === wsId);
  if (!course) return res.status(400).json({ error: 'Học phần không tồn tại trong workspace này' });
  // Dedup (course × semester × school_year)
  const sem = parseInt(semester) || 1;
  if (db.assessment_plans.find(p => p.workspace_id === wsId && p.course_id === cid && p.semester === sem && p.school_year === school_year))
    return res.status(400).json({ error: `Đã có kế hoạch cho ${course.code} HK${sem} năm ${school_year}` });
  const now = new Date().toLocaleString('vi-VN');
  const plan = {
    id: db.nextPlanId++, workspace_id: wsId,
    course_id: cid,
    name: (name || `${course.code} — HK${sem} ${school_year}`).trim(),
    semester: sem,
    school_year: school_year.trim(),
    threshold_pct:  Math.max(0, Math.min(100, Number(threshold_pct)  || 75)),
    pass_score_pct: Math.max(0, Math.min(100, Number(pass_score_pct) || 50)),
    status: 'draft',
    created_at: now, updated_at: now,
  };
  db.assessment_plans.push(plan);
  saveDB(db);
  res.json({ id: plan.id, message: 'Đã tạo kế hoạch đo CLO' });
});

app.put('/api/assessment-plans/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const p = db.assessment_plans.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!p) return res.status(404).json({ error: 'Không tìm thấy' });
  const { name, semester, school_year, threshold_pct, pass_score_pct, status } = req.body;
  if (name           !== undefined) p.name           = name.trim();
  if (semester       !== undefined) p.semester       = parseInt(semester) || 1;
  if (school_year    !== undefined) p.school_year    = school_year.trim();
  if (threshold_pct  !== undefined) p.threshold_pct  = Math.max(0, Math.min(100, Number(threshold_pct)  || 0));
  if (pass_score_pct !== undefined) p.pass_score_pct = Math.max(0, Math.min(100, Number(pass_score_pct) || 0));
  if (status         !== undefined && PLAN_STATUSES.includes(status)) p.status = status;
  p.updated_at = new Date().toLocaleString('vi-VN');
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/assessment-plans/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const pid = parseInt(req.params.id);
  const idx = db.assessment_plans.findIndex(p => p.id === pid && p.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Cascade: items, students, scores
  const items = db.assessment_items.filter(it => it.workspace_id === wsId && it.plan_id === pid);
  const itemIds = new Set(items.map(it => it.id));
  const stuRemoved = db.plan_students.filter(s => s.workspace_id === wsId && s.plan_id === pid).length;
  const itemsRemoved = items.length;
  const scoresRemoved = db.scores.filter(s => s.workspace_id === wsId && itemIds.has(s.item_id)).length;
  db.assessment_items = db.assessment_items.filter(it => !(it.workspace_id === wsId && it.plan_id === pid));
  db.plan_students    = db.plan_students.filter(s => !(s.workspace_id === wsId && s.plan_id === pid));
  db.scores           = db.scores.filter(s => !(s.workspace_id === wsId && itemIds.has(s.item_id)));
  db.assessment_plans.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa', items_removed: itemsRemoved, students_removed: stuRemoved, scores_removed: scoresRemoved });
});

// ─── M10 — Assessment Items (Inc6b) ───────────────────────────────────────────
// Mỗi plan có nhiều bài đánh giá. Mỗi bài có thể đóng góp vào nhiều CLO với trọng số %.
// VD: Mid-term {max_score: 10, clo_targets: [{clo_id:1, weight:30}, {clo_id:2, weight:70}]}
//     → 30% điểm Mid-term tính cho CLO1, 70% tính cho CLO2.
const ITEM_TYPES = ['test', 'rubric', 'project', 'observation'];

function sanitizeCloTargets(arr, allowedCloIds) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const t of arr) {
    const cid = parseInt(t.clo_id);
    if (!cid || !allowedCloIds.has(cid)) continue;
    const w = Math.max(0, Number(t.weight) || 0);
    if (w === 0) continue;
    out.push({ clo_id: cid, weight: w });
  }
  // dedup by clo_id (keep last)
  const seen = new Map();
  for (const t of out) seen.set(t.clo_id, t);
  return [...seen.values()];
}

app.get('/api/assessment-items', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.assessment_items.filter(it => it.workspace_id === wsId);
  if (req.query.plan_id) {
    const pid = parseInt(req.query.plan_id);
    list = list.filter(it => it.plan_id === pid);
  }
  res.json(list.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '')));
});

app.get('/api/assessment-items/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const it = db.assessment_items.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!it) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json(it);
});

app.post('/api/assessment-items', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { plan_id, name, type, max_score, description, clo_targets } = req.body;
  if (!plan_id || !name) return res.status(400).json({ error: 'Thiếu plan_id hoặc tên bài đánh giá' });
  const pid = parseInt(plan_id);
  const plan = db.assessment_plans.find(p => p.id === pid && p.workspace_id === wsId);
  if (!plan) return res.status(400).json({ error: 'Plan không tồn tại trong workspace này' });
  // Allowed CLOs = CLOs of the course this plan belongs to
  const allowedCloIds = new Set(db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === plan.course_id).map(cl => cl.id));
  const targets = sanitizeCloTargets(clo_targets, allowedCloIds);
  const now = new Date().toLocaleString('vi-VN');
  const item = {
    id: db.nextItemId++, workspace_id: wsId, plan_id: pid,
    name: name.trim(),
    type: ITEM_TYPES.includes(type) ? type : 'test',
    max_score: Math.max(0.01, Number(max_score) || 10),
    description: (description || '').trim(),
    clo_targets: targets,
    created_at: now, updated_at: now,
  };
  db.assessment_items.push(item);
  saveDB(db);
  // Warning if total weight > 100%
  const sum = targets.reduce((s, t) => s + t.weight, 0);
  const warning = sum > 100 ? `Tổng weight CLO targets = ${sum}% (>100%). Kiểm tra lại?` : null;
  res.json({ id: item.id, message: 'Đã tạo bài đánh giá', warning });
});

app.put('/api/assessment-items/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const it = db.assessment_items.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!it) return res.status(404).json({ error: 'Không tìm thấy' });
  const plan = db.assessment_plans.find(p => p.id === it.plan_id && p.workspace_id === wsId);
  const allowedCloIds = new Set(db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === plan.course_id).map(cl => cl.id));
  const { name, type, max_score, description, clo_targets } = req.body;
  if (name        !== undefined) it.name        = name.trim();
  if (type        !== undefined && ITEM_TYPES.includes(type)) it.type = type;
  if (max_score   !== undefined) it.max_score   = Math.max(0.01, Number(max_score) || 10);
  if (description !== undefined) it.description = description.trim();
  if (clo_targets !== undefined) it.clo_targets = sanitizeCloTargets(clo_targets, allowedCloIds);
  it.updated_at = new Date().toLocaleString('vi-VN');
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/assessment-items/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const itemId = parseInt(req.params.id);
  const idx = db.assessment_items.findIndex(it => it.id === itemId && it.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Cascade scores of this item
  const before = db.scores.length;
  db.scores = db.scores.filter(s => !(s.workspace_id === wsId && s.item_id === itemId));
  db.assessment_items.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa', scores_removed: before - db.scores.length });
});

// ─── M10 — Plan Students (Inc6c) ──────────────────────────────────────────────
// Danh sách SV trong 1 plan. Code (MSSV) unique trong plan.
app.get('/api/plan-students', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.plan_students.filter(s => s.workspace_id === wsId);
  if (req.query.plan_id) {
    const pid = parseInt(req.query.plan_id);
    list = list.filter(s => s.plan_id === pid);
  }
  res.json(list.sort((a, b) => (a.code || '').localeCompare(b.code || '')));
});

app.post('/api/plan-students', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { plan_id, code, full_name } = req.body;
  if (!plan_id || !code || !full_name) return res.status(400).json({ error: 'Thiếu plan_id, mã SV hoặc họ tên' });
  const pid = parseInt(plan_id);
  if (!db.assessment_plans.find(p => p.id === pid && p.workspace_id === wsId))
    return res.status(400).json({ error: 'Plan không tồn tại trong workspace' });
  if (db.plan_students.find(s => s.workspace_id === wsId && s.plan_id === pid && s.code === code.trim()))
    return res.status(400).json({ error: `Đã có SV mã "${code}" trong plan` });
  const s = {
    id: db.nextPlanStudentId++, workspace_id: wsId, plan_id: pid,
    code: code.trim(), full_name: full_name.trim(),
    created_at: new Date().toLocaleString('vi-VN'),
  };
  db.plan_students.push(s);
  saveDB(db);
  res.json({ id: s.id, message: 'Đã thêm SV' });
});

// Bulk add: paste lines like "MSSV\tHọ và tên" or "MSSV,Họ và tên"
app.post('/api/plan-students/bulk', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { plan_id, raw } = req.body;
  if (!plan_id || !raw) return res.status(400).json({ error: 'Thiếu plan_id hoặc dữ liệu' });
  const pid = parseInt(plan_id);
  if (!db.assessment_plans.find(p => p.id === pid && p.workspace_id === wsId))
    return res.status(400).json({ error: 'Plan không tồn tại trong workspace' });
  const existing = new Set(db.plan_students.filter(s => s.workspace_id === wsId && s.plan_id === pid).map(s => s.code));
  const now = new Date().toLocaleString('vi-VN');
  let added = 0, skipped = 0, invalid = 0;
  for (const line of String(raw).split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    // Split by tab, comma, or 2+ spaces
    const parts = t.split(/\t|,|\s{2,}/).map(x => x.trim()).filter(Boolean);
    if (parts.length < 2) { invalid++; continue; }
    const code = parts[0];
    const name = parts.slice(1).join(' ');
    if (existing.has(code)) { skipped++; continue; }
    db.plan_students.push({
      id: db.nextPlanStudentId++, workspace_id: wsId, plan_id: pid,
      code, full_name: name, created_at: now,
    });
    existing.add(code);
    added++;
  }
  saveDB(db);
  res.json({ message: `Đã thêm ${added} SV`, added, skipped, invalid });
});

app.put('/api/plan-students/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const s = db.plan_students.find(x => x.id === parseInt(req.params.id) && x.workspace_id === wsId);
  if (!s) return res.status(404).json({ error: 'Không tìm thấy' });
  const { code, full_name } = req.body;
  if (code !== undefined && code.trim() !== s.code) {
    if (db.plan_students.find(x => x.workspace_id === wsId && x.plan_id === s.plan_id && x.code === code.trim() && x.id !== s.id))
      return res.status(400).json({ error: `Đã có SV mã "${code.trim()}"` });
    s.code = code.trim();
  }
  if (full_name !== undefined) s.full_name = full_name.trim();
  saveDB(db);
  res.json({ message: 'Đã cập nhật' });
});

app.delete('/api/plan-students/:id', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const sid = parseInt(req.params.id);
  const idx = db.plan_students.findIndex(s => s.id === sid && s.workspace_id === wsId);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy' });
  // Cascade: delete this SV's scores
  const before = db.scores.length;
  db.scores = db.scores.filter(s => !(s.workspace_id === wsId && s.plan_student_id === sid));
  db.plan_students.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Đã xóa', scores_removed: before - db.scores.length });
});

// ─── M10 — Scores (Inc6c) ─────────────────────────────────────────────────────
// Upsert pattern: POST với {item_id, plan_student_id, score}; score=null/'' → xóa cell.
app.get('/api/scores', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  let list = db.scores.filter(s => s.workspace_id === wsId);
  if (req.query.plan_id) {
    const pid = parseInt(req.query.plan_id);
    const itemIds = new Set(db.assessment_items.filter(it => it.workspace_id === wsId && it.plan_id === pid).map(it => it.id));
    list = list.filter(s => itemIds.has(s.item_id));
  }
  if (req.query.item_id) {
    const iid = parseInt(req.query.item_id);
    list = list.filter(s => s.item_id === iid);
  }
  res.json(list);
});

app.post('/api/scores', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const { item_id, plan_student_id, score } = req.body;
  const iid = parseInt(item_id), sid = parseInt(plan_student_id);
  if (!iid || !sid) return res.status(400).json({ error: 'Thiếu item_id hoặc plan_student_id' });
  const item = db.assessment_items.find(it => it.id === iid && it.workspace_id === wsId);
  const stu  = db.plan_students.find(s => s.id === sid && s.workspace_id === wsId);
  if (!item || !stu) return res.status(400).json({ error: 'Item hoặc SV không tồn tại trong workspace' });
  // Verify item and student belong to the same plan
  if (item.plan_id !== stu.plan_id) return res.status(400).json({ error: 'Item và SV không cùng plan' });

  const idx = db.scores.findIndex(s => s.workspace_id === wsId && s.item_id === iid && s.plan_student_id === sid);
  if (score === null || score === '' || score === undefined) {
    if (idx !== -1) db.scores.splice(idx, 1);
    saveDB(db);
    return res.json({ deleted: idx !== -1 });
  }
  const sc = Number(score);
  if (!Number.isFinite(sc) || sc < 0) return res.status(400).json({ error: 'score phải là số ≥ 0' });
  if (sc > item.max_score) return res.status(400).json({ error: `score vượt max_score (${item.max_score})` });
  const now = new Date().toLocaleString('vi-VN');
  if (idx !== -1) {
    db.scores[idx].score = sc;
    db.scores[idx].updated_at = now;
  } else {
    db.scores.push({ id: db.nextScoreId++, workspace_id: wsId, item_id: iid, plan_student_id: sid, score: sc, updated_at: now });
  }
  saveDB(db);
  res.json({ ok: true, score: sc });
});

// ─── M10 — Compute results (Inc6d) ────────────────────────────────────────────
// Pipeline (theo doc04 + doc03):
//   For each (student, CLO):
//     ratio_i = score_i / max_i  (chỉ tính item có điểm)
//     CLO_score% = Σ(w_i × ratio_i) / Σ(w_i) × 100   (chỉ items có data)
//     passed = CLO_score% ≥ pass_score_pct
//   For each CLO: pct_pass = passed / students_with_data × 100
//   4 mức AUN-QA: ≥75 fully_achieved | ≥50 achieved | ≥25 not_achieved | <25 fully_not
//   Binary "Đạt": pct_pass ≥ threshold_pct của plan.
function classifyAunQa(pct) {
  if (pct >= 75) return 'fully_achieved';
  if (pct >= 50) return 'achieved';
  if (pct >= 25) return 'not_achieved';
  return 'fully_not_achieved';
}

app.get('/api/assessment-plans/:id/results', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const pid = parseInt(req.params.id);
  const plan = db.assessment_plans.find(p => p.id === pid && p.workspace_id === wsId);
  if (!plan) return res.status(404).json({ error: 'Không tìm thấy' });

  const items    = db.assessment_items.filter(it => it.workspace_id === wsId && it.plan_id === pid);
  const students = db.plan_students.filter(s => s.workspace_id === wsId && s.plan_id === pid);
  const clos     = db.clos.filter(cl => cl.workspace_id === wsId && cl.course_id === plan.course_id);
  const itemIds  = new Set(items.map(it => it.id));
  const scoresAll = db.scores.filter(s => s.workspace_id === wsId && itemIds.has(s.item_id));

  // Index: scores[`itemId-stuId`] = score
  const scoreIdx = {};
  for (const s of scoresAll) scoreIdx[`${s.item_id}-${s.plan_student_id}`] = s.score;

  // CLO → list of {item_id, weight, max_score} (only items that have a target on this CLO)
  const cloItems = {};
  for (const cl of clos) cloItems[cl.id] = [];
  for (const it of items) {
    for (const t of (it.clo_targets || [])) {
      if (cloItems[t.clo_id]) cloItems[t.clo_id].push({ item_id: it.id, weight: Number(t.weight) || 0, max_score: it.max_score });
    }
  }

  const passPct = plan.pass_score_pct || 50;
  const thrPct  = plan.threshold_pct  || 75;

  // per_student_clo: {`stuId-cloId`: {score_pct, items_count, items_with_data, passed}}
  const psc = {};
  for (const s of students) {
    for (const cl of clos) {
      const targets = cloItems[cl.id] || [];
      if (targets.length === 0) {
        psc[`${s.id}-${cl.id}`] = { score_pct: null, items_count: 0, items_with_data: 0, passed: null };
        continue;
      }
      let wSum = 0, wxSum = 0, withData = 0;
      for (const t of targets) {
        const v = scoreIdx[`${t.item_id}-${s.id}`];
        if (v === undefined) continue;
        const ratio = (t.max_score > 0) ? (v / t.max_score) : 0;
        wSum  += t.weight;
        wxSum += t.weight * ratio;
        withData++;
      }
      if (withData === 0) {
        psc[`${s.id}-${cl.id}`] = { score_pct: null, items_count: targets.length, items_with_data: 0, passed: null };
      } else {
        const pct = (wSum > 0) ? (wxSum / wSum * 100) : 0;
        psc[`${s.id}-${cl.id}`] = {
          score_pct: Math.round(pct * 10) / 10,
          items_count: targets.length,
          items_with_data: withData,
          passed: pct >= passPct,
        };
      }
    }
  }

  // per_clo_summary
  const summary = clos.map(cl => {
    const targets = cloItems[cl.id] || [];
    let withData = 0, passed = 0;
    for (const s of students) {
      const r = psc[`${s.id}-${cl.id}`];
      if (r && r.score_pct !== null) {
        withData++;
        if (r.passed) passed++;
      }
    }
    const pctPass = withData > 0 ? Math.round(passed / withData * 1000) / 10 : null;
    return {
      clo_id: cl.id, code: cl.code, content: cl.content, type: cl.type,
      items_count: targets.length,
      students_total: students.length,
      students_with_data: withData,
      students_passed: passed,
      pct_pass: pctPass,
      level:  pctPass === null ? null : classifyAunQa(pctPass),
      binary: pctPass === null ? null : (pctPass >= thrPct ? 'DAT' : 'KHONG_DAT'),
    };
  });

  res.json({
    plan: { id: plan.id, name: plan.name, course_id: plan.course_id, status: plan.status,
            pass_score_pct: passPct, threshold_pct: thrPct },
    counts: { items: items.length, students: students.length, clos: clos.length, scores: scoresAll.length },
    items, students, clos,
    per_student_clo: psc,
    per_clo_summary: summary,
  });
});

// ─── M11 — PLO Rollup (Inc7) ──────────────────────────────────────────────────
// Pipeline cuối (doc03 + doc07):
//   (1) Mỗi CLO → tính avg pct_pass từ các plan đo nó (bỏ qua plan draft/empty)
//   (2) Mỗi PLO → Σ(w_clo × pct_pass_clo) / Σ(w_clo) → PLO %
//   (3) Phân loại PLO theo 4 mức AUN-QA
//   (4) Course × PLO heatmap = avg pct_pass của các CLO thuộc course đóng góp lên PLO đó
// Query: ?school_year=XXX (optional), ?include_draft=1 (default exclude)
app.get('/api/plo-rollup', (req, res) => {
  const db = loadDB();
  const wsId = getWorkspaceId(req, db);
  const filter = {
    school_year: req.query.school_year || null,
    include_draft: req.query.include_draft === '1',
  };

  const plos    = db.plos.filter(p => p.workspace_id === wsId);
  const clos    = db.clos.filter(cl => cl.workspace_id === wsId);
  const courses = db.courses.filter(c => c.workspace_id === wsId);
  const cloPloMap = db.clo_plo_map.filter(m => m.workspace_id === wsId);

  // Select plans to aggregate
  let plans = db.assessment_plans.filter(p => p.workspace_id === wsId);
  if (!filter.include_draft) plans = plans.filter(p => p.status !== 'draft');
  if (filter.school_year)    plans = plans.filter(p => p.school_year === filter.school_year);
  const planIds = new Set(plans.map(p => p.id));

  const items = db.assessment_items.filter(it => it.workspace_id === wsId && planIds.has(it.plan_id));
  const itemIds = new Set(items.map(it => it.id));
  const students = db.plan_students.filter(s => s.workspace_id === wsId && planIds.has(s.plan_id));
  const scoresAll = db.scores.filter(s => s.workspace_id === wsId && itemIds.has(s.item_id));
  const scoreIdx = {};
  for (const s of scoresAll) scoreIdx[`${s.item_id}-${s.plan_student_id}`] = s.score;

  // For each plan, compute per-CLO pct_pass (reuse M10 logic inline)
  // Result: cloPassByPlan[`planId-cloId`] = { pct_pass, students_with_data, students_passed }
  const cloPassByPlan = {};
  for (const plan of plans) {
    const passPct = plan.pass_score_pct || 50;
    const planItems = items.filter(it => it.plan_id === plan.id);
    const planStudents = students.filter(s => s.plan_id === plan.id);
    const courseClos = clos.filter(cl => cl.course_id === plan.course_id);
    // cloItems[cloId] = [{item_id, weight, max_score}]
    const cloItems = {};
    for (const cl of courseClos) cloItems[cl.id] = [];
    for (const it of planItems) {
      for (const t of (it.clo_targets || [])) {
        if (cloItems[t.clo_id]) cloItems[t.clo_id].push({ item_id: it.id, weight: Number(t.weight) || 0, max_score: it.max_score });
      }
    }
    for (const cl of courseClos) {
      const targets = cloItems[cl.id] || [];
      let withData = 0, passed = 0;
      for (const s of planStudents) {
        let wSum = 0, wxSum = 0, got = 0;
        for (const t of targets) {
          const v = scoreIdx[`${t.item_id}-${s.id}`];
          if (v === undefined) continue;
          const ratio = (t.max_score > 0) ? (v / t.max_score) : 0;
          wSum  += t.weight;
          wxSum += t.weight * ratio;
          got++;
        }
        if (got > 0 && wSum > 0) {
          withData++;
          if ((wxSum / wSum * 100) >= passPct) passed++;
        }
      }
      const pct = withData > 0 ? (passed / withData * 100) : null;
      cloPassByPlan[`${plan.id}-${cl.id}`] = { pct_pass: pct, students_with_data: withData, students_passed: passed };
    }
  }

  // Aggregate per-CLO across plans: avg pct_pass (weighted by # students_with_data)
  const cloAgg = {};
  for (const cl of clos) {
    let totalStu = 0, totalPass = 0, plansCount = 0;
    for (const p of plans) {
      if (p.course_id !== cl.course_id) continue;
      const r = cloPassByPlan[`${p.id}-${cl.id}`];
      if (!r || r.pct_pass === null) continue;
      totalStu  += r.students_with_data;
      totalPass += r.students_passed;
      plansCount++;
    }
    cloAgg[cl.id] = {
      pct_pass: totalStu > 0 ? Math.round(totalPass / totalStu * 1000) / 10 : null,
      total_students: totalStu,
      total_passed: totalPass,
      plans_count: plansCount,
    };
  }

  // Per-PLO rollup
  const ploResult = plos.map(plo => {
    const contributing = cloPloMap.filter(m => m.plo_id === plo.id);
    const cloDetails = contributing.map(m => {
      const cl = clos.find(c => c.id === m.clo_id);
      const course = cl ? courses.find(c => c.id === cl.course_id) : null;
      const agg = cloAgg[m.clo_id];
      return {
        clo_id: m.clo_id,
        clo_code: cl?.code,
        course_id: course?.id,
        course_code: course?.code,
        weight: m.weight,
        avg_pct_pass: agg?.pct_pass ?? null,
        plans_count: agg?.plans_count || 0,
      };
    });
    let wSum = 0, wxSum = 0, withDataCount = 0;
    for (const d of cloDetails) {
      if (d.avg_pct_pass === null) continue;
      wSum  += d.weight;
      wxSum += d.weight * d.avg_pct_pass;
      withDataCount++;
    }
    const pct = wSum > 0 ? Math.round(wxSum / wSum * 10) / 10 : null;
    return {
      plo_id: plo.id, code: plo.code, content: plo.content,
      bloom_level: plo.bloom_level, type: plo.type,
      contributing_clos: cloDetails,
      clo_with_data: withDataCount,
      clo_total: cloDetails.length,
      pct: pct,
      level: pct === null ? null : classifyAunQa(pct),
    };
  });

  // Course × PLO heatmap (actual achievement vs mapping level I/R/M)
  const coursePloMap = db.course_plo_map.filter(m => m.workspace_id === wsId);
  const heatmap = [];
  for (const course of courses) {
    for (const plo of plos) {
      const mapLevel = coursePloMap.find(m => m.course_id === course.id && m.plo_id === plo.id)?.level || null;
      // Aggregate pct from CLOs of this course contributing to this PLO
      const courseClos = clos.filter(cl => cl.course_id === course.id);
      const cloContribs = cloPloMap.filter(m => m.plo_id === plo.id && courseClos.some(cl => cl.id === m.clo_id));
      let wSum = 0, wxSum = 0, hasData = false;
      for (const m of cloContribs) {
        const agg = cloAgg[m.clo_id];
        if (!agg || agg.pct_pass === null) continue;
        wSum  += m.weight;
        wxSum += m.weight * agg.pct_pass;
        hasData = true;
      }
      const pct = hasData && wSum > 0 ? Math.round(wxSum / wSum * 10) / 10 : null;
      heatmap.push({
        course_id: course.id, course_code: course.code, course_name: course.name,
        plo_id: plo.id, plo_code: plo.code,
        map_level: mapLevel,    // I/R/M or null
        pct: pct,               // actual achievement % or null
      });
    }
  }

  res.json({
    filter,
    counts: {
      plos: plos.length, clos: clos.length, courses: courses.length,
      plans_considered: plans.length,
      mappings_clo_plo: cloPloMap.length,
    },
    plos: ploResult,
    heatmap,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
// Local: listen on port. Vercel serverless: export app for the platform to invoke.
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n✅  Quản lý minh chứng KĐCLGD`);
    console.log(`   http://localhost:${PORT}\n`);
  });
}
module.exports = app;
