require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const https = require('https');
const http = require('http');
const { sequelize, User, Visitor } = require('./models');
const authRoutes = require('./routes/auth');
const visitorRoutes = require('./routes/visitors');
const adminRoutes = require('./routes/admin');
const { authenticate } = require('./middleware/auth');
const { auditLog } = require('./middleware/audit');
const { ipWhitelist } = require('./middleware/ipWhitelist');
const { scheduleBackups } = require('./config/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (with timeout)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.HTTPS_ENABLED === 'true',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TIMEOUT) * 60 * 1000 // minutes to ms
  }
}));

// Static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', authenticate, ipWhitelist, visitorRoutes);
app.use('/api/admin', authenticate, ipWhitelist, adminRoutes);

// Serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Sync database and start server
async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ridwanfarah.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      await User.create({
        email: adminEmail,
        password: adminPass,
        role: 'admin',
        twoFactorEnabled: false
      });
      console.log('✅ Admin user created');
    }

    // Schedule automatic backups
    scheduleBackups();

    // Start server
    if (process.env.HTTPS_ENABLED === 'true') {
      // Load SSL certificates
      const key = fs.readFileSync(process.env.SSL_KEY);
      const cert = fs.readFileSync(process.env.SSL_CERT);
      https.createServer({ key, cert }, app).listen(PORT, () => {
        console.log(`🔒 HTTPS server running on port ${PORT}`);
      });
    } else {
      http.createServer(app).listen(PORT, () => {
        console.log(`🚀 HTTP server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
}

startServer();
