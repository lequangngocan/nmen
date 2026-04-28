const jwt = require('jsonwebtoken');

// Giống auth.js nhưng không reject nếu không có token
// Nếu có token hợp lệ thì gắn req.user, ngược lại cho qua luôn
const authOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // token lỗi thì bỏ qua, không chặn request
    }
  }

  next();
};

module.exports = authOptional;
