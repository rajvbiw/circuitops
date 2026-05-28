const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartWishlistRoutes = require('./routes/cartWishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://localhost:5173',
  'https://127.0.0.1:5173',
  'http://a7c33e33069cf440e9aa365ee27ffea6-2115925528.ap-south-1.elb.amazonaws.com:5173',
  'http://a9bd0d506a0934f01b6002058a3a704a-1733260371.ap-south-1.elb.amazonaws.com:5173',
  'http://a9bd0d506a0934f01b6002058a3a704a-1733260371.ap-south-1.elb.amazonaws.com',
  'https://a9bd0d506a0934f01b6002058a3a704a-1733260371.ap-south-1.elb.amazonaws.com'
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express Session configuration
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'circuitops_super_secret_session_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CircuitOps API is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// API Routes prefixing
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1', cartWishlistRoutes); // Handles /cart and /wishlist endpoints
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (Must be declared last)
app.use(errorHandler);

// Start server after verifying DB connection
async function startServer() {
  // Test database connection
  await db.testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 CircuitOps Server is listening on port ${PORT}`);
    console.log(`📡 Local Health Check URL: http://localhost:${PORT}/health`);
  });
}

startServer();
