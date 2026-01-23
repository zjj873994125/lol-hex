const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '装备名称'
  },
  icon: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '装备图标URL'
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '装备价格'
  },
  keywords: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '装备关键词'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '装备描述'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'equipments',
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] }
  ]
});

module.exports = Equipment;
