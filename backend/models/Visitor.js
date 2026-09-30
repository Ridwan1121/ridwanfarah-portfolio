module.exports = (sequelize, DataTypes) => {
  const Visitor = sequelize.define('Visitor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true
    },
    pageVisited: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    // Encrypted data (if needed)
    encryptedData: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
  return Visitor;
};
