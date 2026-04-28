const pool = require('../db');

// tạo mã đơn hàng ngẫu nhiên
const genOrderNumber = () => 'NM-' + Math.floor(10000 + Math.random() * 90000);

// map status slug → label tiếng Việt (dùng cho response)
const STATUS_LABELS = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping:   'Đang giao hàng',
  delivered:  'Đã giao',
  cancelled:  'Đã hủy',
  returned:   'Trả hàng',
};

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

    // kiểm tra mã giảm giá
    let discountAmount = 0;
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
          await conn.query('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [promo.id]);
        }
      }
    }

    // phí ship: phương án A — luôn miễn phí
    const shippingFee = 0;
    const totalAmount = subtotal - discountAmount + shippingFee;
    const pointsEarned = Math.floor(totalAmount / 10000);
    const order_number = genOrderNumber();
    const user_id = req.user?.id || null;

    await conn.beginTransaction();

    // ─── Lớp 1 + 2: Kiểm tra & khóa tồn kho trước khi tạo đơn ───────────────
    // Thực hiện TRƯỚC khi INSERT order để không tạo đơn "rác" rồi rollback.
    for (const item of enrichedItems) {
      if (item.variant_id) {
        // LỚP 1: SELECT FOR UPDATE — lock row, các transaction khác phải đợi
        const [lockRows] = await conn.query(
          'SELECT id, stock FROM product_variants WHERE id = ? FOR UPDATE',
          [item.variant_id]
        );
        if (lockRows.length === 0 || lockRows[0].stock < item.quantity) {
          await conn.rollback();
          return res.status(409).json({
            message: `Sản phẩm "${item.product_name}" (${item.size || ''}) không đủ hàng. Còn lại: ${lockRows[0]?.stock ?? 0}`,
          });
        }
      } else {
        // fallback: lock theo product + size + color
        const [lockRows] = await conn.query(
          `SELECT id, stock FROM product_variants
           WHERE product_id = ? AND size = ? AND color_hex = ? FOR UPDATE`,
          [item.product_id, item.size || '', item.color || '']
        );
        if (lockRows.length === 0 || lockRows[0].stock < item.quantity) {
          await conn.rollback();
          return res.status(409).json({
            message: `Sản phẩm "${item.product_name}" (${item.size || ''}) không đủ hàng. Còn lại: ${lockRows[0]?.stock ?? 0}`,
          });
        }
        // gắn variant_id tìm được để dùng ở bước UPDATE bên dưới
        item.variant_id = lockRows[0].id;
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (order_number, user_id, customer_name, email, phone,
         shipping_address, shipping_commune, shipping_province,
         shipping_province_id, shipping_commune_id,
         payment_method, promo_code, discount_amount,
         subtotal, shipping_fee, total_amount, note, points_earned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number, user_id, customer_name, email, phone,
        address.trim(), shippingCommune, shippingProvince,
        province_id || null, commune_id || null,
        payment_method, promo_code || null, discountAmount,
        subtotal, shippingFee, totalAmount, note || null, pointsEarned,
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

      // LỚP 2: Atomic UPDATE với điều kiện AND stock >= ? (safety net)
      // Nếu lớp 1 bị bypass, affectedRows = 0 sẽ phát hiện và rollback
      const [updateResult] = await conn.query(
        'UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantity, item.variant_id, item.quantity]
      );
      if (updateResult.affectedRows === 0) {
        await conn.rollback();
        return res.status(409).json({
          message: `Sản phẩm "${item.product_name}" (${item.size || ''}) vừa hết hàng trong lúc xử lý. Vui lòng thử lại.`,
        });
      }
    }

    // cộng điểm nếu người dùng đã đăng nhập
    if (user_id) {
      await conn.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsEarned, user_id]);
      await conn.query(
        'INSERT INTO loyalty_transactions (user_id, order_id, type, points, note) VALUES (?, ?, ?, ?, ?)',
        [user_id, orderId, 'earn', pointsEarned, `Tích điểm đơn ${order_number}`]
      );
    }

    await conn.commit();

    res.status(201).json({
      order_number,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      points_earned: pointsEarned,
      status: 'pending',
      status_label: STATUS_LABELS['pending'],
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
              subtotal, discount_amount, shipping_fee, total_amount,
              points_earned, note, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT product_id, variant_id, product_name, color_name, color_hex,
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
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }

    const [items] = await pool.query(
      `SELECT product_id, variant_id, product_name, color_name, color_hex,
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

// cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelled_reason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const updates = ['status = ?'];
    const params = [status];

    if (status === 'cancelled' && cancelled_reason) {
      updates.push('cancelled_reason = ?');
      params.push(cancelled_reason);
    }

    params.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', status_label: STATUS_LABELS[status] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
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

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, lookupOrder, cancelOrderByLookup };
