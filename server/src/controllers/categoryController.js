const pool = require('../db');

// chuyển danh sách phẳng thành dạng cây (parent - children)
const buildTree = (rows) => {
  const map = {};
  const roots = [];
  rows.forEach((r) => { map[r.id] = { ...r, children: [] }; });
  rows.forEach((r) => {
    if (r.parent_id && map[r.parent_id]) {
      map[r.parent_id].children.push(map[r.id]);
    } else {
      roots.push(map[r.id]);
    }
  });
  return roots;
};

const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '-');

// lấy danh sách danh mục
// ?flat=1 trả về mảng phẳng, mặc định trả về dạng cây
const getCategories = async (req, res) => {
  try {
    const { flat, status, parent_id } = req.query;

    let query = `
      SELECT c.*,
             p.name AS parent_name,
             COUNT(DISTINCT pr.id) AS product_count
      FROM categories c
      LEFT JOIN categories p ON p.id = c.parent_id
      LEFT JOIN products pr ON pr.category_id = c.id AND pr.is_published = 1
    `;
    const params = [];
    const wheres = [];

    if (status) { wheres.push('c.status = ?'); params.push(status); }
    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        wheres.push('c.parent_id IS NULL');
      } else {
        wheres.push('c.parent_id = ?'); params.push(Number(parent_id));
      }
    }
    if (wheres.length) query += ' WHERE ' + wheres.join(' AND ');
    query += ' GROUP BY c.id ORDER BY id DESC';

    const [rows] = await pool.query(query, params);

    if (flat === '1') return res.json(rows);
    return res.json(buildTree(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// thêm danh mục mới
const createCategory = async (req, res) => {
  try {
    const { name, slug, parent_id = null, position = 0, status = 'active', description } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ message: 'Thiếu tên danh mục' });

    const finalSlug = slug || toSlug(name);

    const [result] = await pool.query(
      'INSERT INTO categories (parent_id, name, slug, position, status, description) VALUES (?, ?, ?, ?, ?, ?)',
      [parent_id || null, name, finalSlug, position, status, description || null]
    );

    res.status(201).json({
      id: result.insertId, parent_id: parent_id || null,
      name, slug: finalSlug, position, status,
      description: description || null, product_count: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, slug, parent_id, position, status, description } = req.body;
    
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ message: 'Tên danh mục không được để trống' });
    }

    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (parent_id !== undefined) { fields.push('parent_id = ?'); params.push(parent_id || null); }
    if (position !== undefined) { fields.push('position = ?'); params.push(position); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Không có gì để cập nhật' });
    }

    // không cho set parent là chính nó
    if (parent_id !== undefined && Number(parent_id) === Number(req.params.id)) {
      return res.status(400).json({ message: 'Danh mục không thể là cha của chính nó' });
    }

    params.push(req.params.id);
    const [result] = await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    // không xóa nếu còn sản phẩm
    const [[{ productCount }]] = await pool.query(
      'SELECT COUNT(*) AS productCount FROM products WHERE category_id = ?',
      [req.params.id]
    );
    if (productCount > 0) {
      return res.status(400).json({ message: `Danh mục đang có ${productCount} sản phẩm, không thể xóa` });
    }

    // không xóa nếu còn danh mục con
    const [[{ childCount }]] = await pool.query(
      'SELECT COUNT(*) AS childCount FROM categories WHERE parent_id = ?',
      [req.params.id]
    );
    if (childCount > 0) {
      return res.status(400).json({ message: `Danh mục có ${childCount} danh mục con, không thể xóa` });
    }

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
