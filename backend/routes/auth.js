const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { User, AuditLog } = require('../models');
const { authenticate, require2FA } = require('../middleware/auth');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(401).json({ error: '2FA required', require2FA: true });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken
      });
      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Audit log
    await AuditLog.create({
      userId: user.id,
      action: 'Login',
      details: 'User logged in',
      ip: req.ip
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT + 'm' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Setup 2FA (admin only)
router.post('/setup-2fa', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can set up 2FA' });
    }

    const secret = speakeasy.generateSecret({
      name: process.env.TOTP_ISSUER + ':' + user.email,
      length: 20,
      issuer: process.env.TOTP_ISSUER
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const otpauth = secret.otpauth_url;
    const qrCode = await QRCode.toDataURL(otpauth);

    res.json({
      secret: secret.base32,
      qrCode,
      message: 'Scan the QR code with your authenticator app'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// Enable/disable 2FA
router.post('/toggle-2fa', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can toggle 2FA' });
    }
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    await AuditLog.create({
      userId: user.id,
      action: 'Toggle2FA',
      details: `2FA ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`,
      ip: req.ip
    });

    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle 2FA' });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    await AuditLog.create({
      userId: req.user.id,
      action: 'Logout',
      details: 'User logged out',
      ip: req.ip
    });
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
