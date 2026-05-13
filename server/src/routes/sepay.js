const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepayController');

// Webhook endpoint (không cần middleware auth vì Sepay gọi từ ngoài vào)
// Xác thực sẽ được thực hiện bằng SEPAY_WEBHOOK_TOKEN ở trong controller
router.post('/webhook', sepayController.handleWebhook);

module.exports = router;
