const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HeroEquipment = sequelize.define('HeroEquipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  buildId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '出装思路ID，关联到 equipment_builds 表'
  },
  heroId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '英雄ID'
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '装备ID'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '在出装思路中的排序顺序'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '推荐描述'
  }
}, {
  tableName: 'hero_equipment',
  indexes: [
    { fields: ['buildId'] },
    { fields: ['heroId'] },
    { fields: ['equipmentId'] },
    { unique: true, fields: ['buildId', 'equipmentId'] }
  ]
});

module.exports = HeroEquipment;
