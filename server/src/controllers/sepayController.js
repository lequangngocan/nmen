const pool = require('../db');

const handleWebhook = async (req, res) => {
  try {
    // 1. Xác thực Token (Bearer hoặc Apikey tùy cấu hình Sepay)
    const token = process.env.SEPAY_WEBHOOK_SECRET;
    const authHeader = req.headers.authorization;
    if (token && authHeader !== `Bearer ${token}` && authHeader !== `Apikey ${token}`) {
      return res.status(401).json({ message: 'Unauthorized Webhook' });
    }

    // 2. Lấy dữ liệu payload từ Sepay
    // Cấu trúc payload Sepay trả về thường có: referenceNumber, amountIn, transactionContent, v.v.
    const { referenceNumber, amountIn, transactionContent } = req.body;

    if (!referenceNumber || amountIn === undefined) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // 3. Xử lý Idempotency: Kiểm tra xem giao dịch đã tồn tại chưa
    const [existingTx] = await pool.query(
      'SELECT id FROM payment_transactions WHERE reference_number = ?',
      [referenceNumber]
    );

    if (existingTx.length > 0) {
      // Giao dịch đã được xử lý từ trước -> trả về 200 OK để Sepay không gửi lại nữa
      return res.status(200).json({ message: 'Transaction already processed' });
    }

    // 4. Tìm kiếm order_number trong transactionContent
    // Giả sử nội dung thanh toán có chứa "NM-12345"
    const orderNumberMatch = transactionContent ? transactionContent.match(/(NM-\d+)/i) : null;
    let orderId = null;
    let isSuccess = false;

    if (orderNumberMatch) {
      const orderNumber = orderNumberMatch[1].toUpperCase();

      // Tìm đơn hàng trong DB
      const [orders] = await pool.query(
        'SELECT id, total_amount, payment_status FROM orders WHERE order_number = ? LIMIT 1',
        [orderNumber]
      );

      if (orders.length > 0) {
        const order = orders[0];
        orderId = order.id;

        // Nếu số tiền nhận được >= số tiền đơn hàng VÀ đơn hàng chưa được thanh toán
        if (Number(amountIn) >= Number(order.total_amount) && order.payment_status === 'pending') {
          // 5. Cập nhật trạng thái đơn hàng
          await pool.query(
            `UPDATE orders 
             SET payment_status = 'paid', status = 'confirmed', payment_ref = ?
             WHERE id = ?`,
            [referenceNumber, orderId]
          );
          isSuccess = true;
        }
      }
    }

    // 6. Ghi log giao dịch vào payment_transactions
    await pool.query(
      `INSERT INTO payment_transactions 
        (order_id, gateway, reference_number, amount, transaction_content, raw_payload, status)
       VALUES (?, 'Sepay', ?, ?, ?, ?, ?)`,
      [
        orderId, 
        referenceNumber, 
        amountIn, 
        transactionContent || '', 
        JSON.stringify(req.body), 
        isSuccess ? 'success' : 'failed'
      ]
    );

    // Trả về 200 OK để xác nhận với Sepay đã nhận được Webhook
    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Sepay Webhook Error:', error);
    // Trả về 500 để Sepay có thể retry lại sau
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  handleWebhook
};
