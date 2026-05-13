const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// tài khoản admin cứng, không lưu DB cho đơn giản
// đọc từ biến môi trường để không lộ thông tin trong source code
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nmen.vn';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const makeToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || full_name.trim() === '' || !email || email.trim() === '' || !password || password.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, hashed, phone || null]
    );

    const token = makeToken({ id: result.insertId, email, role: 'customer' });

    res.status(201).json({
      token,
      user: { id: result.insertId, full_name, email, role: 'customer' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// đăng nhập phía CLIENT — chỉ dành cho khách hàng, chặn admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Chặn tài khoản admin đăng nhập phía client
    if (email === ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Tài khoản quản trị không được đăng nhập tại đây' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = rows[0];

    // Chặn nếu tài khoản bị vô hiệu hóa
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
    }

    // Phòng hờ: nếu trong DB có user role=admin thì cũng chặn luôn
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Tài khoản quản trị không được đăng nhập tại đây' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = makeToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// đăng nhập phía ADMIN — chỉ dành cho quản trị viên
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Chỉ cho phép tài khoản admin cứng
    if (email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Tài khoản không có quyền quản trị' });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const token = makeToken({ id: 0, email: ADMIN_EMAIL, role: 'admin' });
    res.json({
      token,
      user: { id: 0, full_name: 'NMen Admin', email: ADMIN_EMAIL, role: 'admin' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy thông tin user đang đăng nhập
const me = async (req, res) => {
  try {
    // admin không có trong DB
    if (req.user.role === 'admin') {
      return res.json({
        id: 0, full_name: 'NMen Admin', email: ADMIN_EMAIL, role: 'admin',
      });
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, avatar_url, joined_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật thông tin cá nhân (user tự cập nhật)
const updateMe = async (req, res) => {
  try {
    // admin không có trong DB → không cho sửa
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Tài khoản quản trị không thể chỉnh sửa qua API này' });
    }

    const { full_name, phone } = req.body;

    if (full_name !== undefined && full_name.trim() === '') {
      return res.status(400).json({ message: 'Họ tên không được để trống' });
    }

    const fields = [];
    const params = [];

    if (full_name !== undefined) { fields.push('full_name = ?'); params.push(full_name.trim()); }
    if (phone !== undefined)     { fields.push('phone = ?');     params.push(phone || null); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });
    }

    params.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    // trả về dữ liệu mới nhất
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, avatar_url, joined_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Cập nhật thành công', user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// đổi mật khẩu
const updatePassword = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể đổi MK admin tại đây' });
    }

    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 6 ký tự trở lên' });
    }

    // lấy user từ db
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User không tồn tại' });

    // kiểm tra pass cũ
    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });

    // hash và update pass mới
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { register, login, adminLogin, me, updateMe, updatePassword };
