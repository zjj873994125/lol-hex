const { sequelize } = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Menu = require('./Menu');
const Hero = require('./Hero');
const Equipment = require('./Equipment');
const Hex = require('./Hex');
const HeroEquipment = require('./HeroEquipment');
const HeroHex = require('./HeroHex');

// 定义关联关系

// User - Role (多对一)
User.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'Users' });

// User_Role 多对多关联表
const UserRole = sequelize.define('UserRole', {
  userId: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true
  },
  roleId: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'user_role',
  timestamps: false
});

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId', as: 'Roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId', as: 'UsersList' });

// Role_Menu 多对多关联表
const RoleMenu = sequelize.define('RoleMenu', {
  roleId: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true
  },
  menuId: {
    type: require('sequelize').DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'role_menu',
  timestamps: false
});

Role.belongsToMany(Menu, { through: RoleMenu, foreignKey: 'roleId', otherKey: 'menuId', as: 'Menus' });
Menu.belongsToMany(Role, { through: RoleMenu, foreignKey: 'menuId', otherKey: 'roleId', as: 'Roles' });

// Menu 自关联（父菜单）- 禁用外键约束以允许 -1 作为顶级菜单标识
Menu.hasMany(Menu, { foreignKey: 'parentId', as: 'Children', constraints: false });
Menu.belongsTo(Menu, { foreignKey: 'parentId', as: 'Parent', constraints: false });

// Hero - HeroEquipment (一对多)
Hero.hasMany(HeroEquipment, { foreignKey: 'heroId', as: 'HeroEquipments' });
HeroEquipment.belongsTo(Hero, { foreignKey: 'heroId', as: 'Hero' });

// Equipment - HeroEquipment (一对多)
Equipment.hasMany(HeroEquipment, { foreignKey: 'equipmentId', as: 'HeroEquipments' });
HeroEquipment.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'Equipment' });

// Hero - HeroHex (一对多)
Hero.hasMany(HeroHex, { foreignKey: 'heroId', as: 'HeroHexes' });
HeroHex.belongsTo(Hero, { foreignKey: 'heroId', as: 'Hero' });

// Hex - HeroHex (一对多)
Hex.hasMany(HeroHex, { foreignKey: 'hexId', as: 'HeroHexes' });
HeroHex.belongsTo(Hex, { foreignKey: 'hexId', as: 'Hex' });

// 导出所有模型
const db = {
  sequelize,
  User,
  Role,
  Menu,
  Hero,
  Equipment,
  Hex,
  HeroEquipment,
  HeroHex,
  UserRole,
  RoleMenu
};

module.exports = db;
