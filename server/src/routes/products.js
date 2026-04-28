const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getProducts, getProductById, getProductBySlug,
  createProduct, updateProduct, deleteProduct,
  addVariant, deleteVariant,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);  // SEO-friendly — phải đặt TRƯỚC /:id
router.get('/:id', getProductById);
router.post('/', auth, adminOnly, createProduct);
router.put('/:id', auth, adminOnly, updateProduct);
router.delete('/:id', auth, adminOnly, deleteProduct);
router.post('/:id/variants', auth, adminOnly, addVariant);
router.delete('/:id/variants/:vid', auth, adminOnly, deleteVariant);

module.exports = router;
