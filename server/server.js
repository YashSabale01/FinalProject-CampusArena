const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const commentRoutes = require('./routes/commentRoutes');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect Database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - skip for /api/health (ALB pings it every 30s)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', (req, res, next) => {
  if (req.path === '/health') return next();
  limiter(req, res, next);
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', stripeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);

// ✅ Health check route - must be BEFORE the catch-all *
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ Unknown API routes return JSON 404 (not HTML)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Frontend static files + catch-all (only for non-API routes)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await User.createDefaultAdmins();
  } catch (error) {
    console.error('Error creating default admins:', error);
  }
});

module.exports = { app, io };