const pool = require('../db');
const path = require('path');
const fs = require('fs');

const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '-');

// lấy tin tức đã xuất bản (dành cho trang người dùng)
const getNews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM news WHERE status = 'published'"
    );

    const [rows] = await pool.query(
      `SELECT id, title, slug, author, image, status, short_description, created_at
       FROM news WHERE status = 'published'
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({ data: rows, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy tất cả tin tức cho admin, có filter và tìm kiếm
const getAllNews = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const wheres = [];
    const params = [];

    if (status) { wheres.push('status = ?'); params.push(status); }
    if (search) { wheres.push('title LIKE ?'); params.push(`%${search}%`); }

    const where = wheres.length ? 'WHERE ' + wheres.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM news ${where}`, params);
    const [rows] = await pool.query(
      `SELECT id, title, slug, author, image, status, short_description, created_at
       FROM news ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ data: rows, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy chi tiết bài viết theo slug
const getNewsBySlug = async (req, res) => {
  try {
    const [[row]] = await pool.query(
      "SELECT * FROM news WHERE slug = ? AND status = 'published'",
      [req.params.slug]
    );
    if (!row) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy chi tiết bài viết theo id (admin dùng, kể cả bài draft)
const getNewsById = async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// tạo bài viết mới
const createNews = async (req, res) => {
  try {
    const { title, slug, author, image, status = 'draft', short_description, description } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ message: 'Thiếu tiêu đề bài viết' });

    const finalSlug = slug || toSlug(title);

    const [result] = await pool.query(
      `INSERT INTO news (title, slug, author, image, status, short_description, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, finalSlug, author || null, image || null, status, short_description || null, description || null]
    );

    res.status(201).json({ id: result.insertId, slug: finalSlug, message: 'Tạo bài viết thành công' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật bài viết
const updateNews = async (req, res) => {
  try {
    const { title, slug, author, image, status, short_description, description } = req.body;
    const fields = [];
    const params = [];

    if (title !== undefined) {
      if (title.trim() === '') return res.status(400).json({ message: 'Tiêu đề không được để trống' });
      fields.push('title = ?'); params.push(title);
    }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (author !== undefined) { fields.push('author = ?'); params.push(author); }
    if (image !== undefined) { fields.push('image = ?'); params.push(image || null); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (short_description !== undefined) { fields.push('short_description = ?'); params.push(short_description); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }

    if (!fields.length) return res.status(400).json({ message: 'Không có gì để cập nhật' });

    params.push(req.params.id);
    const [result] = await pool.query(`UPDATE news SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa bài viết, nếu có ảnh local thì xóa luôn file
const deleteNews = async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT image FROM news WHERE id = ?', [req.params.id]);
    if (row?.image?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../public', row.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const [result] = await pool.query('DELETE FROM news WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.json({ message: 'Đã xóa bài viết' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getNews, getAllNews, getNewsBySlug, getNewsById, createNews, updateNews, deleteNews };
