const { User } = require('../models');

const ipWhitelist = (req, res, next) => {
  // If no whitelist configured, allow all
  if (!process.env.ADMIN_IP_WHITELIST) {
    return next();
  }

  const whitelist = process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim());
  const clientIp = req.ip || req.connection.remoteAddress;

  // Check if IP is in whitelist
  if (whitelist.includes(clientIp) || whitelist.includes('*')) {
    return next();
  }

  // For logged in admin, check user-specific whitelist
  if (req.user && req.user.role === 'admin') {
    const userWhitelist = req.user.ipWhitelist || [];
    if (userWhitelist.includes(clientIp) || userWhitelist.includes('*')) {
      return next();
    }
  }

  return res.status(403).json({ error: 'Access denied: IP not whitelisted' });
};

module.exports = { ipWhitelist };
