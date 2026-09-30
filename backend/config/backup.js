const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const { sequelize } = require('../models');

// Ensure backup directory
const backupDir = path.join(__dirname, '..', 'backups');
fs.ensureDirSync(backupDir);

// Create a backup
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.db`);

  // Copy database file
  const dbPath = process.env.DB_PATH || './data/portfolio.db';
  await fs.copy(dbPath, backupFile);

  // Also export to JSON
  const jsonFile = path.join(backupDir, `backup-${timestamp}.json`);
  const data = {
    timestamp,
    tables: {
      Users: await sequelize.models.User.findAll(),
      Visitors: await sequelize.models.Visitor.findAll(),
      AuditLogs: await sequelize.models.AuditLog.findAll()
    }
  };
  await fs.writeJson(jsonFile, data, { spaces: 2 });

  // Keep only last 7 backups
  const files = await fs.readdir(backupDir);
  const dbBackups = files.filter(f => f.endsWith('.db')).sort();
  while (dbBackups.length > 7) {
    const oldest = dbBackups.shift();
    await fs.remove(path.join(backupDir, oldest));
  }

  return backupFile;
}

// Schedule backup
function scheduleBackups() {
  const cronTime = process.env.BACKUP_CRON || '0 2 * * *';
  cron.schedule(cronTime, async () => {
    console.log('🔄 Running scheduled backup...');
    await createBackup();
    console.log('✅ Backup completed');
  });
  console.log(`📅 Backup scheduled: ${cronTime}`);
}

module.exports = { createBackup, scheduleBackups };
