const pool = require('../db');

// lấy tất cả tỉnh/thành
const getProvinces = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, code, name, level FROM provinces ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy xã/phường theo mã tỉnh
const getCommunes = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const [rows] = await pool.query(
      'SELECT id, code, name, level FROM communes WHERE province_id = ? ORDER BY name ASC',
      [provinceId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getProvinces, getCommunes };
