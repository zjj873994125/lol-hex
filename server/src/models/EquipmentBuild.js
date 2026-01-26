const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EquipmentBuild = sequelize.define('EquipmentBuild', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  heroId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '英雄ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '出装思路名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '出装思路描述'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '优先级，数值越大优先级越高'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'equipment_builds',
  indexes: [
    { fields: ['heroId'] },
    { fields: ['status'] },
    { fields: ['priority'] }
  ]
});

module.exports = EquipmentBuild;
