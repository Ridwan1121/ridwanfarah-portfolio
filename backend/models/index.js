const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs-extra');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
fs.ensureDirSync(dataDir);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dataDir, 'portfolio.db'),
  logging: console.log,
  define: {
    timestamps: true
  }
});

// Import models
const User = require('./User')(sequelize, DataTypes);
const Visitor = require('./Visitor')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);

// Associations
// (none yet)

module.exports = {
  sequelize,
  User,
  Visitor,
  AuditLog
};
