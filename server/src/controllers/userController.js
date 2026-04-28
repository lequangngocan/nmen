const pool = require('../db');

// GET /api/users — danh sách users (admin)
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.tier, u.points, u.avatar_url, u.joined_at,
              COUNT(DISTINCT o.id)  AS order_count,
              COALESCE(SUM(o.total_amount), 0) AS total_spent,
              COUNT(DISTINCT a.id)  AS address_count,
              -- địa chỉ mặc định
              da.recipient          AS default_recipient,
              dp.name               AS default_province,
              dc.name               AS default_commune
       FROM users u
       LEFT JOIN orders o       ON o.user_id = u.id
       LEFT JOIN user_addresses a  ON a.user_id = u.id
       LEFT JOIN user_addresses da ON da.user_id = u.id AND da.is_default = 1
       LEFT JOIN provinces dp   ON dp.id = da.province_id
       LEFT JOIN communes  dc   ON dc.id = da.commune_id
       GROUP BY u.id
       ORDER BY u.joined_at DESC`
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/users/:id — chi tiết 1 user (admin)
const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, role, tier, points, avatar_url, joined_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const [orders] = await pool.query(
      'SELECT id, order_number, status, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    // lấy danh sách địa chỉ kèm tên tỉnh/xã
    const [addresses] = await pool.query(
      `SELECT a.id, a.label, a.recipient, a.phone, a.address,
              a.is_default, a.created_at,
              p.name AS province_name, c.name AS commune_name
       FROM user_addresses a
       LEFT JOIN provinces p ON p.id = a.province_id
       LEFT JOIN communes  c ON c.id = a.commune_id
       WHERE a.user_id = ?
       ORDER BY a.is_default DESC, a.created_at DESC`,
      [req.params.id]
    );

    res.json({ ...rows[0], orders, addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getUsers, getUserById };
