const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getUsers, getUserById } = require('../controllers/userController');

router.get('/', auth, adminOnly, getUsers);
router.get('/:id', auth, adminOnly, getUserById);

module.exports = router;
