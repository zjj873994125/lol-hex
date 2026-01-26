const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（bcrypt加密）'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号（登录用）'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: 'https://img.duoziwang.com/2018/18/06051452332913.jpg',
    comment: '头像URL'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: '角色ID（外键）'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['roleId'] },
    { fields: ['status'] }
  ]
});

// 密码加密钩子
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// 验证密码方法
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
