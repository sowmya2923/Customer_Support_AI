const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const kbRoutes = require('./src/routes/kbRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors({ origin: '*' })); // Allow all cross-origins for development convenience
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files as static assets under "/uploads" route path
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uploaderFallbackActive: !process.env.CLOUDINARY_CLOUD_NAME,
    aiFallbackActive: !process.env.GEMINI_API_KEY,
  });
});

// Fallback Route handler (Not Found)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});


