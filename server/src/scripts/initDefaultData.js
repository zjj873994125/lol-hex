require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Role, Menu, RoleMenu } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * 初始化默认数据
 * 使用 findOrCreate，如果数据已存在则跳过
 */
async function initDefaultData() {
  try {
    console.log('开始初始化...');

    // 1. 先同步数据库表（如果不存在则创建）
    console.log('检查/创建数据库表...');
    await sequelize.sync({ force: true });
    console.log('✓ 数据库表准备完成');

    console.log('开始初始化默认数据...');

    // ============ 创建默认角色 ============
    const [adminRole] = await Role.findOrCreate({
      where: { code: 'admin' },
      defaults: { name: '管理员', code: 'admin', description: '系统超级管理员，拥有所有权限' }
    });
    console.log(`✓ 角色 [管理员] ${adminRole.isNewRecord ? '创建成功' : '已存在'}`);

    const [userRole] = await Role.findOrCreate({
      where: { code: 'user' },
      defaults: { name: '普通用户', code: 'user', description: '普通用户，只能查看数据' }
    });
    console.log(`✓ 角色 [普通用户] ${userRole.isNewRecord ? '创建成功' : '已存在'}`);

    // ============ 创建默认菜单 ============
    const menusData = [
      // 系统管理
      { id: 1, parentId: -1, name: '系统管理', path: '/admin', icon: 'SettingOutlined', type: 1, sort: 100, status: 1 },
      { id: 2, parentId: 1, name: '英雄管理', path: '/admin/heroes', icon: 'StarOutlined', type: 2, code: 'hero:list', sort: 1, status: 1 },
      { id: 3, parentId: 1, name: '装备管理', path: '/admin/equipments', icon: 'ApiOutlined', type: 2, code: 'equipment:list', sort: 2, status: 1 },
      { id: 4, parentId: 1, name: '海克斯管理', path: '/admin/hexes', icon: 'ThunderboltOutlined', type: 2, code: 'hex:list', sort: 3, status: 1 },
      { id: 5, parentId: 1, name: '用户管理', path: '/admin/users', icon: 'UserOutlined', type: 2, code: 'user:list', sort: 4, status: 1 },
      { id: 6, parentId: 1, name: '角色管理', path: '/admin/roles', icon: 'TeamOutlined', type: 2, code: 'role:list', sort: 5, status: 1 },
      { id: 7, parentId: 1, name: '菜单管理', path: '/admin/menus', icon: 'MenuOutlined', type: 2, code: 'menu:list', sort: 6, status: 1 },
    ];

    const createdMenus = [];
    for (const m of menusData) {
      const [menu] = await Menu.findOrCreate({
        where: { id: m.id },
        defaults: m
      });
      if (menu.isNewRecord) {
        createdMenus.push(menu);
      }
    }
    console.log('✓ 默认菜单初始化完成');

    // ============ 创建角色菜单关联 ============
    // 管理员拥有所有菜单权限
    const adminMenuIds = [1, 2, 3, 4, 5, 6, 7];
    for (const menuId of adminMenuIds) {
      await RoleMenu.findOrCreate({
        where: { roleId: adminRole.id, menuId },
        defaults: { roleId: adminRole.id, menuId }
      });
    }
    console.log('✓ 管理员角色菜单权限分配完成');

    // 普通用户只读权限（暂时不给菜单，可根据需要添加）
    // const userMenuIds = [];
    // for (const menuId of userMenuIds) {
    //   await RoleMenu.findOrCreate({
    //     where: { roleId: userRole.id, menuId },
    //     defaults: { roleId: userRole.id, menuId }
    //   });
    // }

    // ============ 创建默认管理员账号 ============
    const hashedPwd = await bcrypt.hash('admin123', 10);
    const [adminUser] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password: hashedPwd,
        email: 'admin@lolhaikesi.com',
        roleId: adminRole.id,
        status: 1
      }
    });
    console.log(`✓ 管理员账号 ${adminUser.isNewRecord ? '创建成功' : '已存在'}`);

    console.log('\n=================================');
    console.log('默认数据初始化完成！');
    console.log('=================================');
    console.log('管理员账号信息:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('=================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initDefaultData();
