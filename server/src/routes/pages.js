const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getPages, getPageBySlug, getPageById,
  createPage, updatePage, deletePage,
} = require('../controllers/pageController');

// public
router.get('/', getPages);
router.get('/:slug', getPageBySlug);

// admin
router.get('/admin/:id', auth, adminOnly, getPageById);
router.post('/', auth, adminOnly, createPage);
router.put('/:id', auth, adminOnly, updatePage);
router.delete('/:id', auth, adminOnly, deletePage);

module.exports = router;
