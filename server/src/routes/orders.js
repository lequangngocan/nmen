const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authOptional = require('../middleware/authOptional');
const adminOnly = require('../middleware/adminOnly');
const {
  createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, lookupOrder, cancelOrderByLookup,
} = require('../controllers/orderController');

// /my và /lookup phải đặt trước /:id để không bị nhầm route
router.get('/my', auth, getMyOrders);
router.get('/lookup', lookupOrder);             // công khai — tra cứu cho khách vãng lai
router.post('/cancel', cancelOrderByLookup);    // công khai — khách hủy đơn pending
router.get('/', auth, adminOnly, getAllOrders);
router.post('/', authOptional, createOrder);   // guest vẫn đặt được
router.get('/:id', auth, getOrderById);
router.patch('/:id/status', auth, adminOnly, updateOrderStatus);

module.exports = router;
