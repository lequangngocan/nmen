const express = require('express');
const router = express.Router();
const { register, login, adminLogin, me } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register',    register);
router.post('/login',       login);       // client only — chặn admin
router.post('/admin-login', adminLogin);  // admin only — chặn non-admin
router.get('/me', auth, me);

module.exports = router;
