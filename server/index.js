const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      server: {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to PropTrack API! 🏠',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      properties: '/api/properties',
      clients: '/api/clients',
      viewings: '/api/viewings',
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const propertyRoutes = require('./routes/properties');
const clientRoutes = require('./routes/clients');
const viewingRoutes = require('./routes/viewings');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/viewings', viewingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 - catch all remaining routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PropTrack Server running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log(`🏠 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
