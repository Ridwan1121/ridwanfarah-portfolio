const express = require('express');
const { User, AuditLog, Visitor } = require('../models');
const router = express.Router();

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.count();
    const visitorCount = await Visitor.count();
    const auditCount = await AuditLog.count();
    const recentVisitors = await Visitor.findAll({
      limit: 5,
      order: [['timestamp', 'DESC']]
    });
    res.json({
      userCount,
      visitorCount,
      auditCount,
      recentVisitors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['timestamp', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Backup database (trigger manually)
router.post('/backup', async (req, res) => {
  try {
    const backup = require('../config/backup');
    const result = await backup.createBackup();
    res.json({ message: 'Backup created', file: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Backup failed' });
  }
});

module.exports = router;
