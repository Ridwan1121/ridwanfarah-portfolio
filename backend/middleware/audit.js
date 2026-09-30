const { AuditLog } = require('../models');

const auditLog = async (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Log after response
    if (req.user) {
      AuditLog.create({
        userId: req.user.id,
        action: req.method + ' ' + req.path,
        details: JSON.stringify({ body: req.body, query: req.query }),
        ip: req.ip
      }).catch(err => console.error('Audit log error:', err));
    }
    originalJson.call(this, data);
  };
  next();
};

module.exports = { auditLog };
