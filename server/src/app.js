const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
const promoRoutes = require('./routes/promo');
const newsRoutes     = require('./routes/news');
const uploadRoutes   = require('./routes/upload');
const settingRoutes  = require('./routes/settings');
const pageRoutes     = require('./routes/pages');
const locationRoutes = require('./routes/locations');
const addressRoutes  = require('./routes/addresses');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// phục vụ ảnh đã upload
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/addresses', addressRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'NMen API đang chạy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
