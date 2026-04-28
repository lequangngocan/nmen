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

module.exports = { validatePromo };
