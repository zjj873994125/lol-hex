const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hex = sequelize.define('Hex', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '海克斯名称'
  },
  icon: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '海克斯图标URL'
  },
  tier: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '层级：1-初级，2-高级，3-珍贵'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '海克斯描述'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'hexes',
  indexes: [
    { fields: ['name'] },
    { fields: ['tier'] },
    { fields: ['status'] }
  ]
});

module.exports = Hex;
