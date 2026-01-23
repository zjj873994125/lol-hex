const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Hero = sequelize.define('Hero', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '英雄名称'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '英雄称号'
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '英雄别称'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头像URL'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '标签（JSON数组字符串）'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '英雄描述'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'heroes',
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] }
  ]
});

module.exports = Hero;
