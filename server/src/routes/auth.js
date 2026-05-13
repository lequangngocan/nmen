const express = require('express');
const router = express.Router();
const { register, login, adminLogin, me, updateMe, updatePassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register',    register);
router.post('/login',       login);       // client only — chặn admin
router.post('/admin-login', adminLogin);  // admin only — chặn non-admin
router.get('/me', auth, me);
router.put('/me', auth, updateMe);
router.put('/password', auth, updatePassword);

module.exports = router;
