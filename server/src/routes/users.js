const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getUsers, getUserById, updateUser } = require('../controllers/userController');

router.get('/', auth, adminOnly, getUsers);
router.get('/:id', auth, adminOnly, getUserById);
router.put('/:id', auth, adminOnly, updateUser);

module.exports = router;
