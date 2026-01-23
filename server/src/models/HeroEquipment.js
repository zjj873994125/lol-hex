const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HeroEquipment = sequelize.define('HeroEquipment', {
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
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '装备ID'
  },
  isRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否推荐'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '优先级，数值越大优先级越高'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '推荐描述'
  }
}, {
  tableName: 'hero_equipment',
  indexes: [
    { fields: ['heroId'] },
    { fields: ['equipmentId'] },
    { unique: true, fields: ['heroId', 'equipmentId'] }
  ]
});

module.exports = HeroEquipment;
