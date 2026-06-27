const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

// Initialize routes after dotenv so env vars are available
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiter to get correct IP behind load balancers/proxies
app.set('trust proxy', 1);

// Secure headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org", "https://wa.me", "https://*.whatsapp.com", "https://*.wp.com"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "https://nominatim.openstreetmap.org", "https://*.tile.openstreetmap.org"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS configuration - allow localhost and production domains if any
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-admin-password']
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

// Root route for health check / status
app.get('/', (req, res) => {
  res.json({ message: "Parichaya Tours & Travels Backend API is running!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

