require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const contactRoutes = require('./routes/contact');
const moderationRoutes = require('./routes/moderation');
const visitorRoutes = require('./routes/visitors');
const friendsRoutes = require('./routes/friends');
const canvasRoutes = require('./routes/canvas');
const adminRoutes = require('./routes/admin');

// Import database
const db = require('./database/db');

// Import socket handlers
const socketHandlers = require('./socket/handlers');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Allow polling transport (required for Replit free tier)
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
db.init().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/friends', friendsRoutes.router);
app.use('/api/canvas', canvasRoutes);
app.use('/api/admin', adminRoutes);

// Pass io instance to friends routes for socket events
friendsRoutes.setIO(io);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SHS Game Hall Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      moderation: '/api/moderation',
      visitors: '/api/visitors',
      friends: '/api/friends',
      canvas: '/api/canvas',
      admin: '/api/admin?password=YOUR_PASSWORD'
    },
    websocket: 'Socket.io is available for real-time connections'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socketHandlers.handleConnection(socket, io);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socketHandlers.handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for Fly.io

server.listen(PORT, HOST, () => {
  console.log(`🚀 Backend server running on ${HOST}:${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || "*"}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

