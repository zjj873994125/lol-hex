require('dotenv').config();
const { sequelize } = require('../config/database');
const db = require('../models');
const bcrypt = require('bcryptjs');

const { User, Role, Menu, RoleMenu, Hero, Equipment, Hex, HeroEquipment, HeroHex } = db;

async function seed() {
  try {
    console.log('Starting database seeding...');

    // 清空现有数据（开发环境）
    await sequelize.sync({ force: true });
    console.log('Database tables cleared.');

    // 创建角色
    const adminRole = await Role.create({
      name: '超级管理员',
      code: 'admin',
      description: '系统超级管理员，拥有所有权限'
    });

    const userRole = await Role.create({
      name: '普通用户',
      code: 'user',
      description: '普通用户，只能查看数据'
    });

    console.log('Roles created.');

    // 创建菜单
    const menus = await Menu.bulkCreate([
      // 系统管理
      { id: 1, parentId: 0, name: '系统管理', path: '/system', icon: 'Setting', type: 1, sort: 100, status: 1 },
      { id: 2, parentId: 1, name: '用户管理', path: '/system/users', icon: 'User', type: 2, code: 'system:user:list', sort: 1, status: 1 },
      { id: 3, parentId: 1, name: '角色管理', path: '/system/roles', icon: 'UserFilled', type: 2, code: 'system:role:list', sort: 2, status: 1 },
      { id: 4, parentId: 1, name: '菜单管理', path: '/system/menus', icon: 'Menu', type: 2, code: 'system:menu:list', sort: 3, status: 1 },

      // 英雄管理
      { id: 10, parentId: 0, name: '英雄管理', path: '/heroes', icon: 'Star', type: 1, sort: 10, status: 1 },
      { id: 11, parentId: 10, name: '英雄列表', path: '/heroes/list', icon: 'List', type: 2, code: 'hero:list', sort: 1, status: 1 },
      { id: 12, parentId: 10, name: '英雄添加', path: '/heroes/add', icon: 'Plus', type: 2, code: 'hero:add', sort: 2, status: 1 },
      { id: 13, parentId: 10, name: '英雄编辑', path: '/heroes/edit', icon: 'Edit', type: 2, code: 'hero:edit', sort: 3, status: 1 },
      { id: 14, parentId: 10, name: '英雄删除', path: '', icon: '', type: 3, code: 'hero:delete', sort: 4, status: 1 },

      // 装备管理
      { id: 20, parentId: 0, name: '装备管理', path: '/equipments', icon: 'Goods', type: 1, sort: 20, status: 1 },
      { id: 21, parentId: 20, name: '装备列表', path: '/equipments/list', icon: 'List', type: 2, code: 'equipment:list', sort: 1, status: 1 },
      { id: 22, parentId: 20, name: '装备添加', path: '/equipments/add', icon: 'Plus', type: 2, code: 'equipment:add', sort: 2, status: 1 },
      { id: 23, parentId: 20, name: '装备编辑', path: '/equipments/edit', icon: 'Edit', type: 2, code: 'equipment:edit', sort: 3, status: 1 },
      { id: 24, parentId: 20, name: '装备删除', path: '', icon: '', type: 3, code: 'equipment:delete', sort: 4, status: 1 },

      // 海克斯管理
      { id: 30, parentId: 0, name: '海克斯管理', path: '/hexes', icon: 'MagicStick', type: 1, sort: 30, status: 1 },
      { id: 31, parentId: 30, name: '海克斯列表', path: '/hexes/list', icon: 'List', type: 2, code: 'hex:list', sort: 1, status: 1 },
      { id: 32, parentId: 30, name: '海克斯添加', path: '/hexes/add', icon: 'Plus', type: 2, code: 'hex:add', sort: 2, status: 1 },
      { id: 33, parentId: 30, name: '海克斯编辑', path: '/hexes/edit', icon: 'Edit', type: 2, code: 'hex:edit', sort: 3, status: 1 },
      { id: 34, parentId: 30, name: '海克斯删除', path: '', icon: '', type: 3, code: 'hex:delete', sort: 4, status: 1 },
    ]);

    console.log('Menus created.');

    // 为管理员角色分配所有菜单权限
    const roleMenus = menus.map(menu => ({
      roleId: adminRole.id,
      menuId: menu.id
    }));
    await RoleMenu.bulkCreate(roleMenus);
    console.log('Admin role permissions assigned.');

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      password: adminPassword,
      email: 'admin@lolhaikesi.com',
      roleId: adminRole.id,
      status: 1
    });
    console.log('Admin user created (username: admin, password: admin123)');

    // 创建示例装备
    const equipments = await Equipment.bulkCreate([
      { name: '灭世者的死亡之帽', icon: '/images/equipments/rabadons.png', price: 3600, type: 4, description: '大幅提高法术强度', status: 1 },
      { name: '无尽之刃', icon: '/images/equipments/infinity_edge.png', price: 3400, type: 1, description: '大幅提高攻击力和暴击伤害', status: 1 },
      { name: '斯特拉克的挑战护手', icon: '/images/equipments/sterak.png', price: 3100, type: 2, description: '提供生命值和护盾', status: 1 },
      { name: '三相之力', icon: '/images/equipments/trinity.png', price: 3333, type: 1, description: '提供全面的属性加成', status: 1 },
      { name: '莫雷洛秘典', icon: '/images/equipments/morellonomicon.png', price: 2300, type: 4, description: '提供法术强度和重伤效果', status: 1 },
      { name: '守护天使', icon: '/images/equipments/guardian_angel.png', price: 3200, type: 2, description: '死亡后可复活', status: 1 },
      { name: '幻影之舞', icon: '/images/equipments/phantom_dancer.png', price: 2800, type: 1, description: '提高攻击速度和移速', status: 1 },
      { name: '水银之靴', icon: '/images/equipments/mercury_treads.png', price: 1200, type: 3, description: '提供魔抗和控制减免', status: 1 },
    ]);
    console.log('Sample equipments created.');

    // 创建示例海克斯
    const hexes = await Hex.bulkCreate([
      { name: '海克斯科技火箭腰带', icon: '/images/hexes/hextech_rocketbelt.png', tier: 1, description: '提供位移和爆发伤害', status: 1 },
      { name: '帝国指令', icon: '/images/hexes/imperial_command.png', tier: 2, description: '友军造成伤害时附带额外伤害', status: 1 },
      { name: '日炎圣盾', icon: '/images/hexes/sunfire.png', tier: 1, description: '对周围敌人造成持续魔法伤害', status: 1 },
      { name: '巫妖之祸', icon: '/images/hexes/lichbane.png', tier: 2, description: '施放技能后下次攻击造成额外魔法伤害', status: 1 },
      { name: '挺进破坏者', icon: '/images/hexes/stridebreaker.png', tier: 1, description: '主动使用可进行位移并减速敌人', status: 1 },
      { name: '神圣分离者', icon: '/images/hexes/divine.png', tier: 2, description: '根据最大生命值造成额外伤害', status: 1 },
      { name: '峡谷制造者', icon: '/images/hexes/abyssal.png', tier: 3, description: '造成伤害时获得治疗和护盾', status: 1 },
      { name: '薄暮法袍', icon: '/images/hexes/anathemas.png', tier: 3, description: '受到伤害时对攻击者造成魔法伤害', status: 1 },
    ]);
    console.log('Sample hexes created.');

    // 创建示例英雄
    const heroes = await Hero.bulkCreate([
      { name: '金克丝', title: '暴走萝莉', nickname: 'ADC', avatar: '/images/heroes/jinx.png', tags: '["射手","物理输出","高爆发"]', description: '金克丝是来自祖安的暴躁罪犯，她热爱制造混乱和破坏。', status: 1 },
      { name: '艾希', title: '寒冰射手', nickname: '冰射手', avatar: '/images/heroes/ashe.png', tags: '["射手","控制","远程"]', description: '艾希是来自弗雷尔卓德的冰弓射手，她的箭矢能冻结敌人。', status: 1 },
      { name: '李青', title: '盲僧', nickname: '瞎子', avatar: '/images/heroes/lee.png', tags: '["战士","刺客","高机动"]', description: '李青是艾欧尼亚的武术大师，尽管失明但心明眼亮。', status: 1 },
      { name: '亚索', title: '疾风剑豪', nickname: '快乐风男', avatar: '/images/heroes/yasuo.png', tags: '["战士","刺客","高机动"]', description: '亚索是艾欧尼亚的剑客，驾驭风的力量进行战斗。', status: 1 },
      { name: '阿狸', title: '九尾妖狐', nickname: '狐狸', avatar: '/images/heroes/ahri.png', tags: '["法师","刺客","爆发"]', description: '阿狸是瓦斯塔亚的九尾狐，能够魅惑并吞噬敌人的生命精华。', status: 1 },
      { name: '盖伦', title: '德玛西亚之力', nickname: '大宝剑', avatar: '/images/heroes/garen.png', tags: '["战士","坦克","续航"]', description: '盖伦是德玛西亚的骄傲，以正义和勇气著称。', status: 1 },
      { name: '提莫', title: '迅捷斥候', nickname: '提百万', avatar: '/images/heroes/teemo.png', tags: '["射手","法师","陷阱"]', description: '提莫是班德尔城的约德尔人，擅长使用毒蘑菇陷阱。', status: 1 },
      { name: '瑞文', title: '放逐之刃', nickname: '光速QA', avatar: '/images/heroes/riven.png', tags: '["战士","刺客","高操作"]', description: '瑞文曾是诺克萨斯的战士，现在寻找救赎之路。', status: 1 },
      { name: '锤石', title: '魂锁典狱长', nickname: '钩子', avatar: '/images/heroes/thresh.png', tags: '["辅助","坦克","控制"]', description: '锤石是暗影岛的亡灵，收集灵魂以增强力量。', status: 1 },
      { name: '劫', title: '影流之主', nickname: '影子', avatar: '/images/heroes/zed.png', tags: '["刺客","物理输出","高爆发"]', description: '劫是艾欧尼亚的影流教派首领，使用暗影之力进行战斗。', status: 1 },
    ]);
    console.log('Sample heroes created.');

    // 创建英雄装备关联（金克丝）
    await HeroEquipment.bulkCreate([
      { heroId: 1, equipmentId: 2, isRecommended: true, priority: 10, description: '核心输出装' },
      { heroId: 1, equipmentId: 4, isRecommended: true, priority: 9, description: '提高综合能力' },
      { heroId: 1, equipmentId: 7, isRecommended: true, priority: 8, description: '提高攻速' },
    ]);

    // 创建英雄海克斯关联
    await HeroHex.bulkCreate([
      { heroId: 1, hexId: 1, isRecommended: true, priority: 10, description: '提供位移和爆发' },
      { heroId: 1, hexId: 5, isRecommended: true, priority: 9, description: '追击敌人' },
    ]);

    console.log('Hero equipment and hex relations created.');

    console.log('\n=================================');
    console.log('Database seeding completed!');
    console.log('=================================');
    console.log('Default admin account:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('=================================\n');

    await sequelize.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
