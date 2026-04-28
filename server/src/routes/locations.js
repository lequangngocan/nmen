const express = require('express');
const router = express.Router();
const { getProvinces, getCommunes } = require('../controllers/locationController');

// public - không cần đăng nhập
router.get('/provinces', getProvinces);
router.get('/provinces/:provinceId/communes', getCommunes);

module.exports = router;
