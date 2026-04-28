const pool = require('../db');

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT w.product_id, p.name, p.slug, p.price, p.sale_price,
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
              c.name AS category_name
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE w.user_id = ? AND p.deleted_at IS NULL
       ORDER BY w.added_at DESC`,
      [req.user.id]
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/wishlist { product_id }
const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'Thiếu product_id' });
    }

    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // INSERT IGNORE: không lỗi nếu đã có
    await pool.query(
      'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
      [req.user.id, product_id]
    );

    res.json({ message: 'Đã thêm vào yêu thích' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
      [req.user.id, req.params.productId]
    );
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
