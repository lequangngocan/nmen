const pool = require('../db');
const crypto = require('crypto');

// tạo mã đơn hàng ngẫu nhiên
const genOrderNumber = () => 'NM-' + Math.floor(10000 + Math.random() * 90000);

// tên trạng thái đơn hàng
const STATUS_LABELS = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping:   'Đang giao hàng',
  delivered:  'Đã giao',
  cancelled:  'Đã hủy',
  returned:   'Trả hàng',
};

// các chuyển trạng thái được phép
const ALLOWED_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping:   ['delivered', 'returned'],
  delivered:  ['returned'],
  cancelled:  [],
  returned:   [],
};

// trạng thái được phép sửa sản phẩm
const ITEM_EDITABLE_STATUSES = ['pending', 'confirmed'];

// trạng thái đã kết thúc, không cho sửa
const TERMINAL_STATUSES = ['cancelled', 'returned'];

// đặt hàng
const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      customer_name, email, phone,
      address, province_id, commune_id,
      payment_method = 'COD',
      promo_code,
      note,
      items,
    } = req.body;

    if (
      !customer_name || customer_name.trim() === '' ||
      !email || email.trim() === '' ||
      !phone || phone.trim() === '' ||
      !address || address.trim() === '' ||
      !province_id
    ) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // lấy tên tỉnh/thành và xã/phường từ DB
    const [provRows] = await conn.query('SELECT name FROM provinces WHERE id = ?', [province_id]);
    const shippingProvince = provRows.length > 0 ? provRows[0].name : '';

    let shippingCommune = '';
    if (commune_id) {
      const [commRows] = await conn.query('SELECT name FROM communes WHERE id = ?', [commune_id]);
      if (commRows.length > 0) shippingCommune = commRows[0].name;
    }

    // lấy giá từ DB để tránh client gửi giá sai
    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      // lấy thông tin sản phẩm + ảnh đại diện
      const [rows] = await conn.query(
        `SELECT p.id, p.name, p.price, p.sale_price,
                (SELECT pi.image_url FROM product_images pi
                 WHERE pi.product_id = p.id AND pi.is_primary = 1
                 LIMIT 1) AS primary_image
         FROM products p WHERE p.id = ?`,
        [item.product_id]
      );
      if (rows.length === 0) {
        return res.status(400).json({ message: `Sản phẩm ID ${item.product_id} không tồn tại` });
      }
      const product = rows[0];

      // tìm variant_id theo color_hex + size
      let variant_id = item.variant_id || null;
      if (!variant_id && item.color && item.size) {
        const [vRows] = await conn.query(
          'SELECT id FROM product_variants WHERE product_id = ? AND color_hex = ? AND size = ?',
          [item.product_id, item.color, item.size]
        );
        if (vRows.length > 0) variant_id = vRows[0].id;
      }

      const qty = parseInt(item.quantity) || 1;
      const originalPrice = Number(product.price);
      const unitPrice = product.sale_price ? Number(product.sale_price) : originalPrice;

      subtotal += unitPrice * qty;
      enrichedItems.push({
        ...item,
        quantity: qty,
        unit_price: unitPrice,
        original_price: originalPrice,
        product_name: product.name,
        image_url: product.primary_image || null,
        variant_id,
      });
    }

    // kiểm tra mã giảm giá (chưa tăng used_count, sẽ tăng sau khi transaction commit)
    let discountAmount = 0;
    let appliedPromoId = null;
    if (promo_code) {
      const [promos] = await conn.query(
        'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1',
        [promo_code]
      );
      if (promos.length > 0) {
        const promo = promos[0];
        const now = new Date();
        const notExpired = !promo.expires_at || new Date(promo.expires_at) > now;
        const hasUses = !promo.max_uses || promo.used_count < promo.max_uses;
        const minOk = subtotal >= Number(promo.min_order);

        if (notExpired && hasUses && minOk) {
          discountAmount = promo.discount_type === 'percent'
            ? Math.round(subtotal * promo.discount_value / 100)
            : Number(promo.discount_value);
          // Lưu lại id để tăng used_count BÊN TRONG transaction (BUG-03 fix)
          appliedPromoId = promo.id;
        }
      }
    }

    // phí ship: phương án A — luôn miễn phí
    const shippingFee = 0;
    const totalAmount = subtotal - discountAmount + shippingFee;
    let order_number;
    let attempts = 0;
    do {
      order_number = genOrderNumber();
      const [dup] = await conn.query('SELECT id FROM orders WHERE order_number = ?', [order_number]);
      if (dup.length === 0) break;
      attempts++;
    } while (attempts < 5);
    const user_id = req.user?.id || null;

    await conn.beginTransaction();

    // kiểm tra tồn kho trước khi tạo đơn
    for (const item of enrichedItems) {
      if (!item.variant_id) {
        const [vRows] = await conn.query(
          'SELECT id, stock FROM product_variants WHERE product_id = ? AND size = ? AND color_hex = ?',
          [item.product_id, item.size || '', item.color || '']
        );
        if (vRows.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Không tìm thấy biến thể cho sản phẩm "${item.product_name}"` });
        }
        item.variant_id = vRows[0].id;
        item._stock = vRows[0].stock;
      } else {
        const [vRows] = await conn.query(
          'SELECT stock FROM product_variants WHERE id = ?',
          [item.variant_id]
        );
        item._stock = vRows.length > 0 ? vRows[0].stock : 0;
      }

      if (item._stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({
          message: `Sản phẩm "${item.product_name}" (${item.size || ''}) không đủ hàng`,
        });
      }
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (order_number, user_id, customer_name, email, phone,
         shipping_address, shipping_commune, shipping_province,
         shipping_province_id, shipping_commune_id,
         payment_method, promo_code, discount_amount,
         subtotal, shipping_fee, total_amount, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number, user_id, customer_name, email, phone,
        address.trim(), shippingCommune, shippingProvince,
        province_id || null, commune_id || null,
        payment_method, promo_code || null, discountAmount,
        subtotal, shippingFee, totalAmount, note || null,
      ]
    );
    const orderId = orderResult.insertId;

    for (const item of enrichedItems) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, product_id, variant_id, product_name,
            color_name, color_hex, size, image_url,
            original_price, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.product_id, item.variant_id, item.product_name,
          item.color_name || null, item.color || null,
          item.size || null, item.image_url,
          item.original_price, item.unit_price, item.quantity,
        ]
      );

      // cập nhật tồn kho
      await conn.query(
        'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.variant_id]
      );
    }

    // tăng used_count của promo BÊN TRONG transaction — nếu rollback thì không bị tăng (BUG-03 fix)
    if (appliedPromoId) {
      await conn.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [appliedPromoId]);
    }

    // cộng điểm nếu người dùng đã đăng nhập (đã xoá)

    await conn.commit();
    let sepayCheckoutData = null;
    if (payment_method === 'Sepay') {
      // TẠO GIAO DỊCH PENDING TRƯỚC THEO YÊU CẦU ĐỒ ÁN
      await conn.query(
        `INSERT INTO payment_transactions 
          (order_id, gateway, reference_number, amount, transaction_content, raw_payload, status) 
         VALUES (?, 'Sepay', ?, ?, ?, ?, 'pending')`,
        [orderId, `PENDING_${order_number}`, totalAmount, `Đang chờ thanh toán đơn ${order_number}`, JSON.stringify({})]
      );

      const merchant = process.env.SEPAY_MERCHANT_ID || 'MERCHANT_123456';
      const integrationKey = process.env.SEPAY_SECRET_KEY || 'INTEGRATION_KEY_SECRET';
      const payment_method = 'BANK_TRANSFER';
      const currency = 'VND';
      const operation = 'PURCHASE';
      const order_description = `Thanh toan don hang ${order_number}`;
      const success_url = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/order/success?order=${order_number}&total=${totalAmount}&phone=${encodeURIComponent(phone)}`;
      const error_url = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/order/failed?order=${order_number}&phone=${encodeURIComponent(phone)}`;
      const cancel_url = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/order/failed?order=${order_number}&phone=${encodeURIComponent(phone)}`;
      
      // Chữ ký Sepay yêu cầu format cụ thể: field1=value1,field2=value2... theo đúng thứ tự
      const signedString = [
        `merchant=${merchant}`,
        `operation=${operation}`,
        `payment_method=${payment_method}`,
        `order_amount=${totalAmount}`,
        `currency=${currency}`,
        `order_invoice_number=${order_number}`,
        `order_description=${order_description}`,
        `success_url=${success_url}`,
        `error_url=${error_url}`,
        `cancel_url=${cancel_url}`
      ].join(',');

      // Hàm băm dùng sha256, encode base64
      const signature = crypto.createHmac('sha256', integrationKey).update(signedString).digest('base64');

      sepayCheckoutData = {
        action: process.env.SEPAY_ENVIRONMENT === 'sandbox' ? 'https://pay-sandbox.sepay.vn/v1/checkout/init' : 'https://pay.sepay.vn/v1/checkout/init',
        params: {
          merchant,
          operation,
          payment_method,
          order_amount: totalAmount,
          currency,
          order_invoice_number: order_number,
          order_description,
          success_url,
          error_url,
          cancel_url,
          signature
        }
      };
    }

    res.status(201).json({
      order_number,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      status: 'pending',
      status_label: STATUS_LABELS['pending'],
      sepay_checkout: sepayCheckoutData
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};

// lấy lịch sử đơn hàng của user đang đăng nhập
const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, order_number, status, payment_method, payment_status,
              promo_code, subtotal, discount_amount, shipping_fee, total_amount,
              note, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT id, product_id, variant_id, product_name, color_name, color_hex,
                size, image_url, original_price, unit_price, quantity, line_total
         FROM order_items WHERE order_id = ?`,
        [order.id]
      );
      order.items = items;
      order.status_label = STATUS_LABELS[order.status] || order.status;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xem chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const order = rows[0];

    // chỉ cho xem đơn của mình, admin thì xem hết
    if (req.user.role !== 'admin' && (order.user_id === null || order.user_id !== req.user.id)) {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }

    const [items] = await pool.query(
      `SELECT id, product_id, variant_id, product_name, color_name, color_hex,
              size, image_url, original_price, unit_price, quantity, line_total
       FROM order_items WHERE order_id = ?`,
      [order.id]
    );
    order.items = items;
    order.status_label = STATUS_LABELS[order.status] || order.status;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy tất cả đơn hàng cho admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [orders] = await pool.query(query, params);

    // thêm status_label cho mỗi đơn
    orders.forEach((o) => { o.status_label = STATUS_LABELS[o.status] || o.status; });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật trạng thái đơn hàng (có validate luồng + hoàn kho khi hủy/trả)
const updateOrderStatus = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { status, cancelled_reason } = req.body;

    // BUG-02 fix: kiểm tra đúng cú pháp — ALLOWED_TRANSITIONS[status] === undefined
    if (ALLOWED_TRANSITIONS[status] === undefined) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // lấy đơn hiện tại
    const [rows] = await conn.query('SELECT id, status FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const currentStatus = rows[0].status;

    // validate luồng
    if (!ALLOWED_TRANSITIONS[currentStatus] || !ALLOWED_TRANSITIONS[currentStatus].includes(status)) {
      return res.status(409).json({
        message: `Không thể chuyển từ "${STATUS_LABELS[currentStatus]}" sang "${STATUS_LABELS[status]}"`,
      });
    }

    await conn.beginTransaction();

    const updates = ['status = ?'];
    const params = [status];

    if (status === 'cancelled' && cancelled_reason) {
      updates.push('cancelled_reason = ?');
      params.push(cancelled_reason);
    }
    if (status === 'returned' && cancelled_reason) {
      updates.push('cancelled_reason = ?');
      params.push(cancelled_reason);
    }

    params.push(req.params.id);
    await conn.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    // hoàn kho khi hủy hoặc trả hàng
    if (status === 'cancelled' || status === 'returned') {
      const [items] = await conn.query(
        'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
        [req.params.id]
      );
      for (const item of items) {
        if (item.variant_id) {
          await conn.query(
            'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        }
      }
    }

    await conn.commit();
    res.json({ message: 'Cập nhật trạng thái thành công', status_label: STATUS_LABELS[status] });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};

// chỉnh sửa thông tin giao hàng và payment_status
const updateOrderInfo = async (req, res) => {
  try {
    const { customer_name, phone, email, shipping_address, note, payment_status } = req.body;
    const orderId = req.params.id;

    const [rows] = await pool.query('SELECT status FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (TERMINAL_STATUSES.includes(rows[0].status)) {
      return res.status(409).json({ message: 'Không thể chỉnh sửa đơn hàng đã kết thúc' });
    }

    const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
    if (payment_status && !VALID_PAYMENT_STATUSES.includes(payment_status)) {
      return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
    }
    if (customer_name !== undefined && customer_name.trim() === '') {
      return res.status(400).json({ message: 'Tên khách hàng không được để trống' });
    }
    if (phone !== undefined && phone.trim() === '') {
      return res.status(400).json({ message: 'Số điện thoại không được để trống' });
    }

    const fields = [];
    const params = [];
    if (customer_name !== undefined) { fields.push('customer_name = ?'); params.push(customer_name.trim()); }
    if (phone !== undefined)         { fields.push('phone = ?');          params.push(phone.trim()); }
    if (email !== undefined)         { fields.push('email = ?');          params.push(email.trim()); }
    if (shipping_address !== undefined) { fields.push('shipping_address = ?'); params.push(shipping_address.trim()); }
    if (note !== undefined)          { fields.push('note = ?');           params.push(note); }
    if (payment_status !== undefined){ fields.push('payment_status = ?'); params.push(payment_status); }

    if (fields.length === 0) return res.status(400).json({ message: 'Không có thông tin nào để cập nhật' });

    params.push(orderId);
    await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// chỉnh sửa sản phẩm trong đơn — chỉ COD + pending/confirmed
const updateOrderItems = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const orderId = req.params.id;
    const { updates = [], additions = [], deletions = [] } = req.body;

    const [orderRows] = await conn.query(
      'SELECT status, payment_method FROM orders WHERE id = ?', [orderId]
    );
    if (orderRows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const { status, payment_method } = orderRows[0];
    if (payment_method !== 'COD' && (additions.length > 0 || deletions.length > 0)) {
      return res.status(400).json({ message: 'Không thể thêm hoặc xóa sản phẩm với đơn đã thanh toán' });
    }
    if (!ITEM_EDITABLE_STATUSES.includes(status)) {
      return res.status(409).json({ message: `Không thể sửa sản phẩm khi đơn ở trạng thái "${STATUS_LABELS[status]}"` });
    }

    // kiểm tra số items còn lại >= 1
    const [currentItems] = await conn.query(
      'SELECT id FROM order_items WHERE order_id = ?', [orderId]
    );
    const remainingCount = currentItems.length - deletions.length + additions.length;
    if (remainingCount < 1) {
      return res.status(400).json({ message: 'Đơn hàng cần có ít nhất 1 sản phẩm' });
    }

    await conn.beginTransaction();

    // --- DELETIONS ---
    for (const itemId of deletions) {
      const [itemRows] = await conn.query(
        'SELECT variant_id, quantity FROM order_items WHERE id = ? AND order_id = ?', [itemId, orderId]
      );
      if (itemRows.length === 0) continue;
      const { variant_id, quantity } = itemRows[0];
      if (variant_id) {
        await conn.query('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [quantity, variant_id]);
      }
      await conn.query('DELETE FROM order_items WHERE id = ?', [itemId]);
    }

    // --- UPDATES ---
    for (const upd of updates) {
      const { item_id, quantity, variant_id: newVariantId } = upd;
      const [itemRows] = await conn.query(
        'SELECT variant_id, quantity, product_id FROM order_items WHERE id = ? AND order_id = ?',
        [item_id, orderId]
      );
      if (itemRows.length === 0) continue;
      const { variant_id: oldVariantId, quantity: oldQty, product_id } = itemRows[0];

      const targetVariantId = newVariantId || oldVariantId;

      // validate variant cùng product nếu đổi
      if (newVariantId && newVariantId !== oldVariantId) {
        const [vRows] = await conn.query(
          'SELECT id FROM product_variants WHERE id = ? AND product_id = ?', [newVariantId, product_id]
        );
        if (vRows.length === 0) {
          await conn.rollback();
          return res.status(400).json({ message: `Variant không thuộc sản phẩm này (item_id=${item_id})` });
        }
        // hoàn kho variant cũ
        await conn.query('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [oldQty, oldVariantId]);
        // trừ kho variant mới
        const [stockRows] = await conn.query(
          'SELECT stock FROM product_variants WHERE id = ?', [newVariantId]
        );
        if (stockRows[0].stock < quantity) {
          await conn.rollback();
          return res.status(409).json({ message: 'Variant mới không đủ tồn kho' });
        }
        await conn.query('UPDATE product_variants SET stock = stock - ? WHERE id = ?', [quantity, newVariantId]);
        // lấy info variant mới
        const [vInfo] = await conn.query(
          'SELECT color_name, color_hex, size FROM product_variants WHERE id = ?', [newVariantId]
        );
        await conn.query(
          'UPDATE order_items SET variant_id = ?, color_name = ?, color_hex = ?, size = ?, quantity = ? WHERE id = ?',
          [newVariantId, vInfo[0].color_name, vInfo[0].color_hex, vInfo[0].size, quantity, item_id]
        );
      } else {
        // chỉ đổi qty
        const delta = quantity - oldQty;
        if (delta > 0) {
          const [stockRows] = await conn.query(
            'SELECT stock FROM product_variants WHERE id = ?', [targetVariantId]
          );
          if (stockRows[0].stock < delta) {
            await conn.rollback();
            return res.status(409).json({ message: 'Không đủ tồn kho để tăng số lượng' });
          }
          await conn.query('UPDATE product_variants SET stock = stock - ? WHERE id = ?', [delta, targetVariantId]);
        } else if (delta < 0) {
          await conn.query('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [Math.abs(delta), targetVariantId]);
        }
        await conn.query('UPDATE order_items SET quantity = ? WHERE id = ?', [quantity, item_id]);
      }
    }

    // --- ADDITIONS ---
    for (const add of additions) {
      const { product_id, variant_id, quantity } = add;
      const [pRows] = await conn.query(
        `SELECT p.name, p.price, p.sale_price,
                (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS primary_image
         FROM products p WHERE p.id = ? AND p.deleted_at IS NULL`,
        [product_id]
      );
      if (pRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Sản phẩm ID ${product_id} không tồn tại` });
      }
      const product = pRows[0];
      const unitPrice = product.sale_price ? Number(product.sale_price) : Number(product.price);

      const [vRows] = await conn.query(
        'SELECT color_name, color_hex, size, stock FROM product_variants WHERE id = ? AND product_id = ?',
        [variant_id, product_id]
      );
      if (vRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: `Variant ID ${variant_id} không thuộc sản phẩm ID ${product_id}` });
      }
      if (vRows[0].stock < quantity) {
        await conn.rollback();
        return res.status(409).json({ message: `Sản phẩm "${product.name}" (${vRows[0].size}) không đủ hàng` });
      }
      await conn.query('UPDATE product_variants SET stock = stock - ? WHERE id = ?', [quantity, variant_id]);
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, color_name, color_hex, size, image_url, original_price, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, product_id, variant_id, product.name, vRows[0].color_name, vRows[0].color_hex, vRows[0].size, product.primary_image || null, Number(product.price), unitPrice, quantity]
      );
    }

    // tính lại tổng đơn
    const [orderInfo] = await conn.query(
      'SELECT discount_amount, shipping_fee FROM orders WHERE id = ?', [orderId]
    );
    const [sumResult] = await conn.query(
      'SELECT SUM(unit_price * quantity) AS subtotal FROM order_items WHERE order_id = ?', [orderId]
    );
    const subtotal = Number(sumResult[0].subtotal) || 0;
    const totalAmount = Math.max(0, subtotal - Number(orderInfo[0].discount_amount) + Number(orderInfo[0].shipping_fee));
    await conn.query(
      'UPDATE orders SET subtotal = ?, total_amount = ? WHERE id = ?',
      [subtotal, totalAmount, orderId]
    );

    // lấy items mới
    const [newItems] = await conn.query(
      'SELECT * FROM order_items WHERE order_id = ?', [orderId]
    );

    await conn.commit();
    res.json({ message: 'Cập nhật sản phẩm thành công', items: newItems, subtotal, totalAmount });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};


// tra cứu đơn hàng công khai — dùng cho khách vãng lai
const lookupOrder = async (req, res) => {
  try {
    const { order_number, phone } = req.query;
    if (!order_number || !phone) {
      return res.status(400).json({ message: 'Vui lòng nhập mã đơn hàng và số điện thoại' });
    }

    const [rows] = await pool.query(
      `SELECT id, order_number, customer_name, email, phone,
              shipping_address, shipping_commune, shipping_province,
              payment_method, payment_status, promo_code,
              subtotal, discount_amount, shipping_fee, total_amount,
              status, note, created_at
       FROM orders
       WHERE order_number = ? AND phone = ?
       LIMIT 1`,
      [order_number.trim(), phone.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.' });
    }

    const order = rows[0];
    const [items] = await pool.query(
      `SELECT oi.product_id, oi.product_name, oi.color_name, oi.color_hex, oi.size,
              COALESCE(oi.image_url,
                (SELECT pi.image_url FROM product_images pi
                 WHERE pi.product_id = oi.product_id AND pi.is_primary = 1
                 LIMIT 1),
                (SELECT pi.image_url FROM product_images pi
                 WHERE pi.product_id = oi.product_id
                 LIMIT 1)
              ) AS image_url,
              oi.unit_price, oi.quantity, oi.line_total
       FROM order_items oi WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
    order.status_label = STATUS_LABELS[order.status] || order.status;

    // Ẩn id nội bộ trước khi trả về
    delete order.id;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};


// hủy đơn hàng công khai — chỉ cho khách hủy khi đơn đang ở trạng thái pending
const cancelOrderByLookup = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { order_number, phone, reason } = req.body;
    if (!order_number || !phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã đơn hàng và số điện thoại' });
    }

    // Tìm và lock đơn hàng
    const [rows] = await conn.query(
      'SELECT id, status, user_id FROM orders WHERE order_number = ? AND phone = ? LIMIT 1',
      [order_number.trim(), phone.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const order = rows[0];

    if (order.status !== 'pending') {
      return res.status(409).json({
        message: `Không thể hủy đơn hàng đang ở trạng thái "${STATUS_LABELS[order.status] || order.status}". Chỉ có thể hủy khi đơn đang chờ xác nhận.`,
      });
    }

    await conn.beginTransaction();

    // Cập nhật trạng thái
    await conn.query(
      'UPDATE orders SET status = ?, cancelled_reason = ? WHERE id = ?',
      ['cancelled', reason?.trim() || 'Khách hàng tự hủy', order.id]
    );

    // Hoàn trả tồn kho
    const [items] = await conn.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
      [order.id]
    );
    for (const item of items) {
      if (item.variant_id) {
        await conn.query(
          'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
    }

    await conn.commit();

    res.json({ message: 'Đơn hàng đã được hủy thành công', status: 'cancelled', status_label: STATUS_LABELS['cancelled'] });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};
// -- FRONTEND MOCK VERIFY SEPAY (CHỈ DÙNG CHO ĐỒ ÁN LOCAL) --
const verifySepayFrontend = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { order_number, status } = req.body;
    if (!order_number || !status) {
      return res.status(400).json({ message: 'Thiếu thông tin' });
    }

    const [orders] = await conn.query(
      'SELECT id, status, payment_status FROM orders WHERE order_number = ?',
      [order_number]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const orderId = orders[0].id;
    const currentStatus = orders[0].status;

    // Nếu đã thanh toán rồi thì bỏ qua
    if (orders[0].payment_status === 'paid') {
      return res.json({ success: true, message: 'Đã thanh toán trước đó' });
    }

    await conn.beginTransaction();

    if (status === 'success') {
      // Thanh toán thành công: xác nhận đơn
      await conn.query(
        "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
        [orderId]
      );
      await conn.query(
        "UPDATE payment_transactions SET status = 'success' WHERE order_id = ? AND status = 'pending'",
        [orderId]
      );
    } else {
      // Thanh toán thất bại / bị hủy: hủy đơn hàng và hoàn kho
      if (currentStatus !== 'cancelled') {
        await conn.query(
          "UPDATE orders SET status = 'cancelled', payment_status = 'failed', cancelled_reason = 'Thanh toán thất bại hoặc bị hủy' WHERE id = ?",
          [orderId]
        );
        await conn.query(
          "UPDATE payment_transactions SET status = 'failed' WHERE order_id = ? AND status = 'pending'",
          [orderId]
        );

        // Hoàn trả tồn kho
        const [items] = await conn.query(
          'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );
        for (const item of items) {
          if (item.variant_id) {
            await conn.query(
              'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
              [item.quantity, item.variant_id]
            );
          }
        }
      }
    }

    await conn.commit();
    res.json({ success: true, message: 'Đã cập nhật trạng thái thanh toán từ Frontend' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  } finally {
    conn.release();
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, updateOrderInfo, updateOrderItems, lookupOrder, cancelOrderByLookup, verifySepayFrontend };
