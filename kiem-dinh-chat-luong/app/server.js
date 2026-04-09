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
    fs.writeFileSync(DB_FILE, JSON.stringify({ evidence: [], nextId: 1 }, null, 2), 'utf8');
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Quản lý minh chứng KĐCLGD`);
  console.log(`   http://localhost:${PORT}\n`);
});
