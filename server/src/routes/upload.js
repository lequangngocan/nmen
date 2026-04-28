const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminOnly } = require('../middleware/auth');

const uploadBaseDir = path.join(__dirname, '../../public/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // lấy tên thư mục từ query, mặc định là 'news'
    const folder = (req.query.folder || 'news').replace(/[^a-z0-9_-]/gi, '');
    const dir = path.join(uploadBaseDir, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // tối đa 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'));
  },
});

// upload ảnh, trả về đường dẫn
router.post('/image', auth, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Không có file' });
  const folder = (req.query.folder || 'news').replace(/[^a-z0-9_-]/gi, '');
  res.json({ url: `/uploads/${folder}/${req.file.filename}` });
});

module.exports = router;
