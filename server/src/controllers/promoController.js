const pool = require('../db');

// POST /api/promo/validate { code, subtotal }
const validatePromo = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return res.status(400).json({ valid: false, message: 'Thiếu code hoặc subtotal' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1',
      [code]
    );

    if (rows.length === 0) {
      return res.json({ valid: false, message: 'Mã giảm giá không hợp lệ' });
    }

    const promo = rows[0];
    const now = new Date();

    if (promo.expires_at && new Date(promo.expires_at) <= now) {
      return res.json({ valid: false, message: 'Mã đã hết hạn' });
    }

    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.json({ valid: false, message: 'Mã đã được sử dụng hết' });
    }

    if (Number(subtotal) < Number(promo.min_order)) {
      return res.json({
        valid: false,
        message: `Đơn hàng tối thiểu ${Number(promo.min_order).toLocaleString('vi-VN')}đ để dùng mã này`,
      });
    }

    const discountAmount = promo.discount_type === 'percent'
      ? Math.round(Number(subtotal) * promo.discount_value / 100)
      : Number(promo.discount_value);

    res.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: discountAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Lỗi server' });
  }
};

// Admin: Lấy danh sách mã giảm giá
const getAllPromos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promo_codes ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin: Lấy chi tiết 1 mã
const getPromoById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promo_codes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin: Tạo mã mới
const createPromo = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order, max_uses, expires_at, is_active } = req.body;
    
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ message: 'Vui lòng điền đủ thông tin bắt buộc' });
    }

    const [existing] = await pool.query('SELECT id FROM promo_codes WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(400).json({ message: 'Mã này đã tồn tại' });

    await pool.query(
      `INSERT INTO promo_codes 
        (code, discount_type, discount_value, min_order, max_uses, expires_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, discount_type, discount_value, min_order || 0, max_uses || null, expires_at || null, is_active ?? 1]
    );

    res.status(201).json({ message: 'Tạo mã giảm giá thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin: Cập nhật mã
const updatePromo = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order, max_uses, expires_at, is_active } = req.body;
    const { id } = req.params;

    if (code) {
      const [existing] = await pool.query('SELECT id FROM promo_codes WHERE code = ? AND id != ?', [code, id]);
      if (existing.length > 0) return res.status(400).json({ message: 'Mã này đã tồn tại' });
    }

    const fields = [];
    const params = [];

    if (code !== undefined) { fields.push('code = ?'); params.push(code); }
    if (discount_type !== undefined) { fields.push('discount_type = ?'); params.push(discount_type); }
    if (discount_value !== undefined) { fields.push('discount_value = ?'); params.push(discount_value); }
    if (min_order !== undefined) { fields.push('min_order = ?'); params.push(min_order); }
    if (max_uses !== undefined) { fields.push('max_uses = ?'); params.push(max_uses); }
    if (expires_at !== undefined) { fields.push('expires_at = ?'); params.push(expires_at); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length === 0) return res.status(400).json({ message: 'Không có dữ liệu cập nhật' });

    params.push(id);
    const [result] = await pool.query(`UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`, params);
    
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Admin: Xóa mã
const deletePromo = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { 
  validatePromo, 
  getAllPromos, 
  getPromoById, 
  createPromo, 
  updatePromo, 
  deletePromo 
};
