const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { getSettings, updateSettings } = require('../controllers/settingController');

// Public
router.get('/', getSettings);

// Admin
router.put('/', auth, adminOnly, updateSettings);

module.exports = router;
