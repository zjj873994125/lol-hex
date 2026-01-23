const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: -1,
    comment: '父菜单ID，-1表示顶级菜单'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '菜单名称'
  },
  path: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '路由路径'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '菜单图标'
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 2,
    comment: '类型：1-目录，2-菜单，3-按钮'
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '权限代码'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'menus',
  indexes: [
    { fields: ['parentId'] },
    { fields: ['type'] },
    { fields: ['status'] }
  ]
});

module.exports = Menu;
