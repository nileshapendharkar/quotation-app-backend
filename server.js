const express = require('express');
const cors = require('cors');
require('dotenv').config();
const compression = require('compression');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const draftRoutes = require('./routes/draftRoutes');

const path = require('path');

const app = express();

app.use(cors());
// Enable gzip/deflate compression for responses > 1KB (default threshold)
// It also checks the Accept-Encoding header and prevents double-compression.
app.use(compression({
  threshold: 1024, // 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Avoid double compression if already compressed
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  immutable: true
}));
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '30d',
  immutable: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drafts', draftRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Product Quotation App API is running',
    policy: 'STRICT ZERO PRICING - Product Name & Quantity Only',
    version: '1.0.0',
    status: 'Healthy'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Quotation App Backend Server running on port ${PORT}`);
  console.log(`🔒 Policy: ZERO Price / Product Name & Qty Only`);
  console.log(`=================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} in use, switching to port 5001...`);
    app.listen(5001, () => {
      console.log(`=================================================`);
      console.log(`🚀 Quotation App Backend Server running on port 5001`);
      console.log(`🔒 Policy: ZERO Price / Product Name & Qty Only`);
      console.log(`=================================================`);
    });
  }
});

