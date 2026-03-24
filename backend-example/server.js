/**
 * ATM Guard Backend Example
 * Node.js + Express + Socket.IO + In-Memory Store (use Redis/DB in production)
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use Redis/Database in production)
const users = new Map();
const otpStore = new Map(); // tempToken -> { code, expiresAt, userId }
const auditLogs = [];

// Connected clients
const connectedClients = new Map(); // socketId -> { userId, username }

// Initialize with demo users (passwords are hashed)
async function initUsers() {
  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedOp = await bcrypt.hash('op123', 10);
  const hashedSec = await bcrypt.hash('sec123', 10);

  users.set('admin', {
    id: '1',
    username: 'admin',
    password: hashedAdmin,
    email: 'admin@atmguard.com',
    role: 'admin',
    name: 'System Administrator',
    phone: '+1234567890'
  });

  users.set('operator', {
    id: '2',
    username: 'operator',
    password: hashedOp,
    email: 'operator@atmguard.com',
    role: 'operator',
    name: 'Security Operator',
    phone: '+1234567891'
  });

  users.set('security', {
    id: '3',
    username: 'security',
    password: hashedSec,
    email: 'security@atmguard.com',
    role: 'security',
    name: 'Security Officer',
    phone: '+1234567892'
  });
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate temp token
function generateTempToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ============ AUTH ROUTES ============

// Step 1: Login - Send OTP
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  // Generate OTP
  const otp = generateOTP();
  const tempToken = generateTempToken();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store OTP
  otpStore.set(tempToken, {
    code: otp,
    expiresAt,
    userId: user.id,
    attempts: 0
  });

  // TODO: Send OTP via SMS (Twilio) or Email (SendGrid)
  console.log(`\n🔐 OTP for ${username}: ${otp}\n`);

  // Determine delivery method (in real app, check user preference)
  const deliveryMethod = user.phone ? 'sms' : 'email';

  res.json({
    success: true,
    message: `Verification code sent to your ${deliveryMethod === 'sms' ? 'phone' : 'email'}`,
    tempToken,
    username: user.username,
    email: user.email,
    deliveryMethod,
    // Include OTP for demo/development purposes
    // REMOVE THIS IN PRODUCTION - only for testing
    demoOtp: otp
  });
});

// Step 2: Verify OTP
app.post('/api/auth/verify-2fa', (req, res) => {
  const { tempToken, code } = req.body;

  const otpData = otpStore.get(tempToken);
  if (!otpData) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }

  // Check expiry
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(tempToken);
    return res.status(401).json({ success: false, message: 'Verification code expired. Please login again.' });
  }

  // Check max attempts
  if (otpData.attempts >= 3) {
    otpStore.delete(tempToken);
    return res.status(401).json({ success: false, message: 'Too many failed attempts. Please login again.' });
  }

  // Verify code
  if (code !== otpData.code) {
    otpData.attempts++;
    return res.status(401).json({ success: false, message: 'Invalid verification code' });
  }

  // Find user
  let user = null;
  for (const u of users.values()) {
    if (u.id === otpData.userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    return res.status(500).json({ success: false, message: 'User not found' });
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Clean up OTP
  otpStore.delete(tempToken);

  // Log audit
  auditLogs.unshift({
    id: Date.now().toString(),
    timestamp: Date.now(),
    userId: user.id,
    username: user.username,
    action: 'LOGIN',
    details: 'User logged in successfully',
    ipAddress: req.ip || req.socket.remoteAddress
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

// Resend OTP
app.post('/api/auth/resend-2fa', (req, res) => {
  const { tempToken } = req.body;

  const otpData = otpStore.get(tempToken);
  if (!otpData) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }

  // Generate new OTP
  const newOtp = generateOTP();
  otpData.code = newOtp;
  otpData.expiresAt = Date.now() + 5 * 60 * 1000;
  otpData.attempts = 0;

  // Find user
  let user = null;
  for (const u of users.values()) {
    if (u.id === otpData.userId) {
      user = u;
      break;
    }
  }

  // TODO: Send new OTP via SMS/Email
  console.log(`\n🔐 New OTP for ${user?.username}: ${newOtp}\n`);

  res.json({
    success: true,
    message: 'New verification code sent',
    // Include OTP for demo/development purposes
    // REMOVE THIS IN PRODUCTION - only for testing
    demoOtp: newOtp
  });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  auditLogs.unshift({
    id: Date.now().toString(),
    timestamp: Date.now(),
    userId: req.user.userId,
    username: req.user.username,
    action: 'LOGOUT',
    details: 'User logged out',
    ipAddress: req.ip || req.socket.remoteAddress
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

// ============ AUDIT LOGS ROUTES ============

// Get audit logs
app.get('/api/audit-logs', authenticateToken, (req, res) => {
  // Only admin can view all logs
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, logs: auditLogs });
});

// Add audit log
app.post('/api/audit-logs', authenticateToken, (req, res) => {
  const { action, details } = req.body;

  auditLogs.unshift({
    id: Date.now().toString(),
    timestamp: Date.now(),
    userId: req.user.userId,
    username: req.user.username,
    action,
    details,
    ipAddress: req.ip || req.socket.remoteAddress
  });

  res.json({ success: true });
});

// ============ WEBSOCKET (SOCKET.IO) ============

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Invalid token'));
    }
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`\n🔌 Client connected: ${socket.user.username} (${socket.id})`);
  
  connectedClients.set(socket.id, {
    userId: socket.user.userId,
    username: socket.user.username,
    socketId: socket.id
  });

  // Send initial data
  socket.emit('initial-data', {
    atms: generateATMSnapshot(),
    alerts: generateRecentAlerts(),
    connectedUsers: Array.from(connectedClients.values()).map(c => c.username)
  });

  // Broadcast user joined
  socket.broadcast.emit('user-joined', {
    username: socket.user.username,
    timestamp: Date.now(),
    connectedUsers: Array.from(connectedClients.values()).map(c => c.username)
  });

  // Handle sensor updates from ATM
  socket.on('sensor-update', (data) => {
    // Broadcast to all connected clients
    io.emit('sensor-update', {
      atmId: data.atmId,
      sensors: data.sensors,
      timestamp: Date.now(),
      updatedBy: socket.user.username
    });
  });

  // Handle fraud alert
  socket.on('fraud-alert', (data) => {
    const alert = {
      id: Date.now().toString(),
      type: data.type,
      severity: data.severity,
      atmId: data.atmId,
      message: data.message,
      timestamp: Date.now(),
      detectedBy: socket.user.username
    };
    
    // Broadcast to all clients
    io.emit('fraud-alert', alert);
    
    // Add to audit logs
    auditLogs.unshift({
      id: Date.now().toString(),
      timestamp: Date.now(),
      userId: socket.user.userId,
      username: socket.user.username,
      action: 'FRAUD_ALERT',
      details: `Fraud detected: ${data.type} at ATM ${data.atmId}`,
      ipAddress: socket.handshake.address
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`\n🔌 Client disconnected: ${socket.user.username} (${socket.id})`);
    connectedClients.delete(socket.id);
    
    socket.broadcast.emit('user-left', {
      username: socket.user.username,
      timestamp: Date.now(),
      connectedUsers: Array.from(connectedClients.values()).map(c => c.username)
    });
  });
});

// Helper functions for generating mock data
function generateATMSnapshot() {
  return [
    {
      id: 'atm-001',
      name: 'ATM-001 Downtown',
      status: 'online',
      sensors: {
        camera: { activityDetected: Math.random() > 0.7, personPresent: Math.random() > 0.6, faceVisible: Math.random() > 0.5, suspiciousObject: Math.random() > 0.9 },
        cardReader: { cardInserted: Math.random() > 0.8, swipeCount: Math.floor(Math.random() * 50), isJammed: Math.random() > 0.95, isLocked: false },
        keypad: { keysPressed: Math.floor(Math.random() * 100), shielded: Math.random() > 0.9, rapidInput: Math.random() > 0.85, isDisabled: false },
        vibration: { level: Math.random() * 10 }
      },
      lastTransaction: new Date(Date.now() - Math.random() * 3600000).toISOString()
    },
    {
      id: 'atm-002',
      name: 'ATM-002 Mall',
      status: 'online',
      sensors: {
        camera: { activityDetected: Math.random() > 0.7, personPresent: Math.random() > 0.6, faceVisible: Math.random() > 0.5, suspiciousObject: Math.random() > 0.9 },
        cardReader: { cardInserted: Math.random() > 0.8, swipeCount: Math.floor(Math.random() * 50), isJammed: Math.random() > 0.95, isLocked: false },
        keypad: { keysPressed: Math.floor(Math.random() * 100), shielded: Math.random() > 0.9, rapidInput: Math.random() > 0.85, isDisabled: false },
        vibration: { level: Math.random() * 10 }
      },
      lastTransaction: new Date(Date.now() - Math.random() * 3600000).toISOString()
    },
    {
      id: 'atm-003',
      name: 'ATM-003 Airport',
      status: 'online',
      sensors: {
        camera: { activityDetected: Math.random() > 0.7, personPresent: Math.random() > 0.6, faceVisible: Math.random() > 0.5, suspiciousObject: Math.random() > 0.9 },
        cardReader: { cardInserted: Math.random() > 0.8, swipeCount: Math.floor(Math.random() * 50), isJammed: Math.random() > 0.95, isLocked: false },
        keypad: { keysPressed: Math.floor(Math.random() * 100), shielded: Math.random() > 0.9, rapidInput: Math.random() > 0.85, isDisabled: false },
        vibration: { level: Math.random() * 10 }
      },
      lastTransaction: new Date(Date.now() - Math.random() * 3600000).toISOString()
    }
  ];
}

function generateRecentAlerts() {
  const alertTypes = ['skimming', 'shoulder_surfing', 'suspicious_behavior', 'none'];
  const severities = ['low', 'medium', 'high'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `alert-${Date.now()}-${i}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    atmId: `atm-00${Math.floor(Math.random() * 3) + 1}`,
    timestamp: Date.now() - Math.random() * 3600000,
    message: 'Automated fraud detection alert'
  })).filter(a => a.type !== 'none');
}

// Simulate real-time sensor updates
setInterval(() => {
  const atms = generateATMSnapshot();
  io.emit('sensor-broadcast', {
    atms: atms,
    timestamp: Date.now()
  });
}, 5000); // Update every 5 seconds

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: io.engine.clientsCount
  });
});

// Start server
initUsers().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 ATM Guard Backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ready for real-time updates`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   POST /api/auth/login       - Login with credentials`);
    console.log(`   POST /api/auth/verify-2fa  - Verify OTP code`);
    console.log(`   POST /api/auth/resend-2fa  - Resend OTP code`);
    console.log(`   POST /api/auth/logout      - Logout (requires auth)`);
    console.log(`   GET  /api/audit-logs       - Get audit logs (admin only)`);
    console.log(`   POST /api/audit-logs       - Add audit log (requires auth)`);
    console.log(`   GET  /api/health           - Health check`);
    console.log(`\n👤 Demo accounts:`);
    console.log(`   admin    / admin123`);
    console.log(`   operator / op123`);
    console.log(`   security / sec123\n`);
  });
});
