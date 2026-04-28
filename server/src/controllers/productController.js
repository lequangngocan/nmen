const pool = require('../db');

const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim().replace(/\s+/g, '-');

// Kiểm tra SKU đã tồn tại trong products hoặc product_variants chưa
const checkSkuExists = async (sku, excludeProductId = null, excludeVariantId = null) => {
  if (!sku) return false;
  
  // Check products
  let pQuery = 'SELECT id FROM products WHERE sku = ?';
  let pParams = [sku];
  if (excludeProductId) {
    pQuery += ' AND id != ?';
    pParams.push(excludeProductId);
  }
  const [pRows] = await pool.query(pQuery, pParams);
  if (pRows.length > 0) return true;

  // Check variants
  let vQuery = 'SELECT id FROM product_variants WHERE sku = ?';
  let vParams = [sku];
  if (excludeVariantId) {
    vQuery += ' AND id != ?';
    vParams.push(excludeVariantId);
  }
  const [vRows] = await pool.query(vQuery, vParams);
  if (vRows.length > 0) return true;

  return false;
};

// lấy danh sách sản phẩm, có thể lọc theo danh mục và tìm kiếm
const getProducts = async (req, res) => {
  try {
    const { category, search, size, color, maxPrice, sort } = req.query;

    let query = `
      SELECT DISTINCT p.id, p.name, p.slug, p.sku, p.price, p.sale_price, p.created_at,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 0 ORDER BY display_order ASC LIMIT 1) as hover_image,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.is_published = 1 AND p.deleted_at IS NULL
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }
    if (size) {
      const sizes = size.split(',');
      query += ` AND pv.size IN (${sizes.map(() => '?').join(',')})`;
      params.push(...sizes);
    }
    if (color) {
      const colors = color.split(',');
      query += ` AND pv.color_hex IN (${colors.map(() => '?').join(',')})`;
      params.push(...colors);
    }
    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }

    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy chi tiết 1 sản phẩm kèm theo các biến thể (theo ID)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order ASC LIMIT 1) AS hover_image
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    const [variants] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY color_name, size',
      [id]
    );

    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [id]
    );

    res.json({ ...products[0], variants, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy chi tiết 1 sản phẩm kèm theo các biến thể (theo slug — SEO friendly)
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 0 ORDER BY display_order ASC LIMIT 1) AS hover_image
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_published = 1 AND p.deleted_at IS NULL`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    const productId = products[0].id;

    const [variants] = await pool.query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY color_name, size',
      [productId]
    );

    const [images] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [productId]
    );

    res.json({ ...products[0], variants, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { name, slug, sku, price, sale_price, category_id, description, is_published = 1, images } = req.body;

    if (!name || name.trim() === '' || price === undefined || price === null || !category_id) {
      return res.status(400).json({ message: 'Thiếu tên, giá hoặc danh mục' });
    }
    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ' });
    }
    if (sale_price !== undefined && sale_price !== null && sale_price !== '') {
      if (isNaN(sale_price) || Number(sale_price) < 0) {
        return res.status(400).json({ message: 'Giá khuyến mãi không hợp lệ' });
      }
      if (Number(sale_price) >= Number(price)) {
        return res.status(400).json({ message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' });
      }
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Vui lòng thêm ít nhất 1 hình ảnh' });
    }
    if (sku) {
      const skuExists = await checkSkuExists(sku);
      if (skuExists) {
        return res.status(400).json({ message: 'SKU đã tồn tại trong hệ thống' });
      }
    }

    const finalSlug = slug || toSlug(name);

    const [result] = await pool.query(
      `INSERT INTO products (name, slug, sku, price, sale_price, category_id, description, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, finalSlug, sku || null, price, sale_price || null, category_id, description || null, is_published]
    );

    const productId = result.insertId;

    if (images && Array.isArray(images) && images.length > 0) {
      const imgValues = images.map((img, idx) => [
        productId,
        typeof img === 'string' ? img : img.url,
        idx === 0 ? 1 : 0, // Ảnh đầu tiên là primary
        idx
      ]);
      await pool.query(
        'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ?',
        [imgValues]
      );
    }

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
  try {
    const { name, slug, sku, price, sale_price, category_id, description, is_published, images } = req.body;
    const { id } = req.params;

    const fields = [];
    const params = [];

    if (name !== undefined) {
      if (name.trim() === '') return res.status(400).json({ message: 'Tên sản phẩm không được để trống' });
      fields.push('name = ?'); params.push(name);
    }
    if (slug !== undefined) { fields.push('slug = ?'); params.push(slug); }
    if (sku !== undefined) { 
      if (sku) {
        const skuExists = await checkSkuExists(sku, id, null);
        if (skuExists) {
          return res.status(400).json({ message: 'SKU đã tồn tại trong hệ thống' });
        }
      }
      fields.push('sku = ?'); params.push(sku); 
    }
    if (price !== undefined) {
      if (isNaN(price) || Number(price) < 0) return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ' });
      fields.push('price = ?'); params.push(price);
    }
    if (sale_price !== undefined) {
      if (sale_price !== null && sale_price !== '') {
        if (isNaN(sale_price) || Number(sale_price) < 0) return res.status(400).json({ message: 'Giá khuyến mãi không hợp lệ' });
        
        // So sánh với giá gốc nếu có cập nhật giá gốc
        if (price !== undefined && Number(sale_price) >= Number(price)) {
           return res.status(400).json({ message: 'Giá khuyến mãi phải nhỏ hơn giá gốc' });
        }
        fields.push('sale_price = ?'); params.push(sale_price);
      } else {
        fields.push('sale_price = ?'); params.push(null);
      }
    }
    if (category_id !== undefined) { fields.push('category_id = ?'); params.push(category_id); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (is_published !== undefined) { fields.push('is_published = ?'); params.push(is_published); }

    if (fields.length > 0) {
      params.push(id);
      const [result] = await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
      }
    }

    if (images !== undefined) {
      // Xóa ảnh cũ
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      if (Array.isArray(images) && images.length > 0) {
        const imgValues = images.map((img, idx) => [
          id,
          typeof img === 'string' ? img : img.url,
          idx === 0 ? 1 : 0,
          idx
        ]);
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ?',
          [imgValues]
        );
      }
    }

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// thêm biến thể (size/màu) cho sản phẩm
const addVariant = async (req, res) => {
  try {
    const { sku, color_name, color_hex, size, stock = 0 } = req.body;

    if (!size || size.trim() === '') {
      return res.status(400).json({ message: 'Thiếu size' });
    }
    if (!sku || sku.trim() === '') {
      return res.status(400).json({ message: 'Thiếu SKU cho variant' });
    }
    if (isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ' });
    }

    const skuExists = await checkSkuExists(sku);
    if (skuExists) {
      return res.status(400).json({ message: 'SKU đã tồn tại trong hệ thống' });
    }

    const [result] = await pool.query(
      'INSERT INTO product_variants (product_id, sku, color_name, color_hex, size, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, sku, color_name || null, color_hex || null, size, stock]
    );

    res.status(201).json({ id: result.insertId, product_id: Number(req.params.id), sku, color_name, color_hex, size, stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa biến thể
const deleteVariant = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM product_variants WHERE id = ? AND product_id = ?',
      [req.params.vid, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Variant không tồn tại' });
    }
    res.json({ message: 'Đã xóa variant' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getProducts, getProductById, getProductBySlug, createProduct, updateProduct, deleteProduct, addVariant, deleteVariant };
