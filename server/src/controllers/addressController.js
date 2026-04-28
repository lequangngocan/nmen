const pool = require('../db');

// GET /api/addresses — lấy danh sách địa chỉ của user đang login
const getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.label, a.recipient, a.phone, a.address,
              a.province_id, a.commune_id, a.is_default,
              p.name AS province_name, c.name AS commune_name
       FROM user_addresses a
       LEFT JOIN provinces p ON p.id = a.province_id
       LEFT JOIN communes  c ON c.id = a.commune_id
       WHERE a.user_id = ?
       ORDER BY a.is_default DESC, a.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/addresses — thêm địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const { label, recipient, phone, address, province_id, commune_id, is_default } = req.body;

    if (!recipient || recipient.trim() === '') {
      return res.status(400).json({ message: 'Tên người nhận không được để trống' });
    }
    if (!address || address.trim() === '') {
      return res.status(400).json({ message: 'Địa chỉ chi tiết không được để trống' });
    }
    if (!province_id) {
      return res.status(400).json({ message: 'Vui lòng chọn tỉnh/thành phố' });
    }
    if (!commune_id) {
      return res.status(400).json({ message: 'Vui lòng chọn xã/phường' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // nếu đặt làm mặc định → bỏ default của địa chỉ cũ
      if (is_default) {
        await conn.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      const [result] = await conn.query(
        `INSERT INTO user_addresses
         (user_id, label, recipient, phone, address, province_id, commune_id, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          label || 'Nhà',
          recipient.trim(),
          phone || null,
          address.trim(),
          province_id,
          commune_id,
          is_default ? 1 : 0,
        ]
      );

      await conn.commit();
      res.status(201).json({ id: result.insertId, message: 'Thêm địa chỉ thành công' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// PUT /api/addresses/:id — cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const { label, recipient, phone, address, province_id, commune_id, is_default } = req.body;

    if (!recipient || recipient.trim() === '') {
      return res.status(400).json({ message: 'Tên người nhận không được để trống' });
    }
    if (!address || address.trim() === '') {
      return res.status(400).json({ message: 'Địa chỉ chi tiết không được để trống' });
    }
    if (!province_id) {
      return res.status(400).json({ message: 'Vui lòng chọn tỉnh/thành phố' });
    }
    if (!commune_id) {
      return res.status(400).json({ message: 'Vui lòng chọn xã/phường' });
    }

    // kiểm tra quyền sở hữu
    const [existing] = await pool.query(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (is_default) {
        await conn.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      }

      await conn.query(
        `UPDATE user_addresses
         SET label=?, recipient=?, phone=?, address=?, province_id=?, commune_id=?, is_default=?
         WHERE id=? AND user_id=?`,
        [
          label || 'Nhà',
          recipient.trim(),
          phone || null,
          address.trim(),
          province_id,
          commune_id,
          is_default ? 1 : 0,
          req.params.id,
          req.user.id,
        ]
      );

      await conn.commit();
      res.json({ message: 'Cập nhật địa chỉ thành công' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/addresses/:id — xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }
    res.json({ message: 'Đã xóa địa chỉ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// PATCH /api/addresses/:id/default — đặt làm địa chỉ mặc định
const setDefault = async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM user_addresses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await pool.query('UPDATE user_addresses SET is_default = 1 WHERE id = ?', [req.params.id]);

    res.json({ message: 'Đã đặt làm địa chỉ mặc định' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefault };
