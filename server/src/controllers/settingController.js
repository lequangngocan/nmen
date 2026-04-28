const pool = require('../db');

// lấy tất cả cấu hình website dưới dạng object
const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    // chuyển từ mảng [{key, value}] thành object {key: value}
    const settings = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật cấu hình, nhận vào object key-value
const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }

    const queries = Object.keys(settings).map((key) => {
      return pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, settings[key], settings[key]]
      );
    });

    await Promise.all(queries);

    res.json({ message: 'Cập nhật cấu hình thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getSettings, updateSettings };
