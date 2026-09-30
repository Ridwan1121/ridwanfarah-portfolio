const jwt = require('jsonwebtoken');
const { User } = require('../models');
const speakeasy = require('speakeasy');
const { auditLog } = require('./audit');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const require2FA = async (req, res, next) => {
  // Check if user has 2FA enabled and if token is provided
  const { twoFactorToken } = req.body;
  if (req.user.twoFactorEnabled) {
    if (!twoFactorToken) {
      return res.status(401).json({ error: '2FA required' });
    }
    const verified = speakeasy.totp.verify({
      secret: req.user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken
    });
    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }
  }
  next();
};

module.exports = { authenticate, require2FA };
