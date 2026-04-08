const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const FOLDER = __dirname;

// Multer config: save uploaded files directly to FOLDER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FOLDER),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/files — list all files/folders
app.get('/api/files', (req, res) => {
  try {
    const entries = fs.readdirSync(FOLDER, { withFileTypes: true });
    const files = entries
      .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
      .map(e => {
        const fullPath = path.join(FOLDER, e.name);
        const stat = fs.statSync(fullPath);
        return {
          name: e.name,
          type: e.isDirectory() ? 'folder' : 'file',
          size: e.isFile() ? stat.size : null,
          modified: stat.mtime.toISOString(),
        };
      });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/create — create a new text file
app.post('/api/files/create', (req, res) => {
  const { name, content } = req.body;
  if (!name) return res.status(400).json({ error: 'File name is required' });

  const safeName = path.basename(name);
  const filePath = path.join(FOLDER, safeName);

  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: 'File already exists' });
  }

  try {
    fs.writeFileSync(filePath, content || '');
    res.json({ success: true, name: safeName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/upload — upload file(s)
app.post('/api/files/upload', upload.array('files'), (req, res) => {
  const uploaded = req.files.map(f => f.originalname);
  res.json({ success: true, uploaded });
});

// DELETE /api/files/:name — delete a file
app.delete('/api/files/:name', (req, res) => {
  const safeName = path.basename(req.params.name);
  const filePath = path.join(FOLDER, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Managing folder: ${FOLDER}`);
});
