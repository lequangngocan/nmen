const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { 
  validatePromo,
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo
} = require('../controllers/promoController');

// Khách hàng validate mã khi checkout
router.post('/validate', validatePromo);

// Admin quản lý mã giảm giá
router.get('/', auth, adminOnly, getAllPromos);
router.get('/:id', auth, adminOnly, getPromoById);
router.post('/', auth, adminOnly, createPromo);
router.put('/:id', auth, adminOnly, updatePromo);
router.delete('/:id', auth, adminOnly, deletePromo);

module.exports = router;
