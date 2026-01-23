const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HeroHex = sequelize.define('HeroHex', {
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
  hexId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '海克斯ID'
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
  tableName: 'hero_hex',
  indexes: [
    { fields: ['heroId'] },
    { fields: ['hexId'] },
    { unique: true, fields: ['heroId', 'hexId'] }
  ]
});

module.exports = HeroHex;
