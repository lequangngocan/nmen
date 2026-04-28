const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// tài khoản admin cứng, không lưu DB cho đơn giản
const ADMIN_EMAIL = 'admin@nmen.vn';
const ADMIN_PASSWORD = 'admin123';

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
      user: { id: result.insertId, full_name, email, role: 'customer', tier: 'Hạng Đồng', points: 0 },
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
        tier: user.tier,
        points: user.points,
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
      user: { id: 0, full_name: 'NMen Admin', email: ADMIN_EMAIL, role: 'admin', tier: 'Hạng Đen', points: 0 },
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
        id: 0, full_name: 'NMen Admin', email: ADMIN_EMAIL, role: 'admin', tier: 'Hạng Đen', points: 0,
      });
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, tier, points, avatar_url, joined_at FROM users WHERE id = ?',
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

module.exports = { register, login, adminLogin, me };
