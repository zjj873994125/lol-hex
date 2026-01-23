require('dotenv').config();
const { sequelize } = require('../config/database');

/**
 * 重置数据库 - 删除所有表并重新创建
 */
async function resetDatabase() {
  try {
    console.log('开始重置数据库...');

    // 强制同步：删除所有表并重新创建
    await sequelize.sync({ force: true });

    console.log('✓ 数据库表已重置完成');
    console.log('  - users');
    console.log('  - roles');
    console.log('  - menus');
    console.log('  - role_menus');
    console.log('  - heroes');
    console.log('  - equipments');
    console.log('  - hexes');
    console.log('  - hero_equipments');
    console.log('  - hero_hexes');
    console.log('\n现在可以运行: npm run db:init');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('重置失败:', error);
    process.exit(1);
  }
}

resetDatabase();
