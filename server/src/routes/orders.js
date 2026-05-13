const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authOptional = require('../middleware/authOptional');
const adminOnly = require('../middleware/adminOnly');
const {
  createOrder, getMyOrders, getOrderById, getAllOrders,
  updateOrderStatus, updateOrderInfo, updateOrderItems,
  lookupOrder, cancelOrderByLookup, verifySepayFrontend
} = require('../controllers/orderController');

// /my và /lookup phải đặt trước /:id để không bị nhầm route
router.get('/my', auth, getMyOrders);
router.get('/lookup', lookupOrder);
router.post('/cancel', cancelOrderByLookup);
router.post('/verify-sepay', verifySepayFrontend);
router.get('/', auth, adminOnly, getAllOrders);
router.post('/', authOptional, createOrder);
router.get('/:id', auth, getOrderById);
router.patch('/:id/status',         auth, adminOnly, updateOrderStatus);
router.put('/:id/info',             auth, adminOnly, updateOrderInfo);
router.put('/:id/items', auth, adminOnly, updateOrderItems);

module.exports = router;
