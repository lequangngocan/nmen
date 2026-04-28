const pool = require('../db');

const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '-');

// lấy tất cả trang (cho admin)
const getPages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, slug, is_published, created_at, updated_at FROM pages ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy nội dung 1 trang theo slug (public)
const getPageBySlug = async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM pages WHERE slug = ? AND is_published = 1',
      [req.params.slug]
    );
    if (!row) return res.status(404).json({ message: 'Không tìm thấy trang' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy theo id (cho admin edit, kể cả trang chưa publish)
const getPageById = async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Không tìm thấy trang' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// tạo trang mới
const createPage = async (req, res) => {
  try {
    const { title, slug, content, is_published = 1 } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ message: 'Thiếu tiêu đề trang' });

    const finalSlug = slug || toSlug(title);

    const [result] = await pool.query(
      'INSERT INTO pages (title, slug, content, is_published) VALUES (?, ?, ?, ?)',
      [title, finalSlug, content || '', is_published]
    );

    res.status(201).json({ id: result.insertId, slug: finalSlug, message: 'Tạo trang thành công' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật trang
const updatePage = async (req, res) => {
  try {
    const { title, slug, content, is_published } = req.body;
    const fields = [];
    const params = [];

    if (title !== undefined) {
      if (title.trim() === '') return res.status(400).json({ message: 'Tiêu đề không được để trống' });
      fields.push('title = ?'); params.push(title);
    }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (content !== undefined) { fields.push('content = ?'); params.push(content); }
    if (is_published !== undefined) { fields.push('is_published = ?'); params.push(is_published); }

    if (!fields.length) return res.status(400).json({ message: 'Không có gì để cập nhật' });

    params.push(req.params.id);
    const [result] = await pool.query(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy trang' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa trang
const deletePage = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy trang' });
    res.json({ message: 'Đã xóa trang' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getPages, getPageBySlug, getPageById, createPage, updatePage, deletePage };
