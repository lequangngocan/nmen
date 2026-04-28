const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingController');

// Public
router.get('/', getSettings);

// Admin
router.put('/', auth, adminOnly, updateSettings);

module.exports = router;
