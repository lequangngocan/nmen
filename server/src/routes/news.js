const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getNews, getAllNews, getNewsBySlug, getNewsById,
  createNews, updateNews, deleteNews,
} = require('../controllers/newsController');

// Public
router.get('/', getNews);
router.get('/slug/:slug', getNewsBySlug);

// Admin
router.get('/admin/all', auth, adminOnly, getAllNews);
router.get('/admin/:id', auth, adminOnly, getNewsById);
router.post('/', auth, adminOnly, createNews);
router.put('/:id', auth, adminOnly, updateNews);
router.delete('/:id', auth, adminOnly, deleteNews);

module.exports = router;
