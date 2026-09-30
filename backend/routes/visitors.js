const express = require('express');
const { Visitor } = require('../models');
const router = express.Router();

// Get all visitors (admin only)
router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.findAll({
      order: [['timestamp', 'DESC']]
    });
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
});

// Track a visitor (public)
router.post('/track', async (req, res) => {
  try {
    const { userAgent, pageVisited, referer, location } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Encrypt sensitive data
    const crypto = require('crypto-js');
    const encrypted = crypto.AES.encrypt(JSON.stringify({ ip, userAgent }), process.env.ENCRYPT_KEY).toString();

    await Visitor.create({
      ip,
      userAgent,
      location: location || null,
      pageVisited,
      referer,
      encryptedData: encrypted
    });

    res.status(201).json({ message: 'Visitor tracked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

module.exports = router;
