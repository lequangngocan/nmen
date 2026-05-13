const jwt = require('jsonwebtoken');

// kiểm tra token JWT
const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin không lưu trong DB, bỏ qua bước kiểm tra DB
    if (decoded.role === 'admin') {
      req.user = decoded;
      return next();
    }

    // Kiểm tra user trong DB xem còn active không
    const pool = require('../db');
    const [rows] = await pool.query('SELECT status FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0 || rows[0].status === 'inactive') {
      return res.status(401).json({ message: 'Tài khoản đã bị vô hiệu hóa hoặc không tồn tại' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = { auth };
