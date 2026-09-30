// scripts/backup.js - run with: node scripts/backup.js
require('dotenv').config();
const { createBackup } = require('../config/backup');

createBackup()
  .then(file => console.log('Backup created:', file))
  .catch(err => console.error('Backup failed:', err));
