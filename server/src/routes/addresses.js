const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAddresses, createAddress, updateAddress, deleteAddress, setDefault,
} = require('../controllers/addressController');

// tất cả route đều yêu cầu đăng nhập
router.get('/',            auth, getAddresses);
router.post('/',           auth, createAddress);
router.put('/:id',         auth, updateAddress);
router.delete('/:id',      auth, deleteAddress);
router.patch('/:id/default', auth, setDefault);

module.exports = router;
