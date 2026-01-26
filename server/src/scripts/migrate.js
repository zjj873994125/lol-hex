require('dotenv').config();
const { sequelize } = require('../config/database');
const db = require('../models');

async function migrate() {
  try {
    console.log('Starting database migration...');

    // 同步所有模型到数据库
    await sequelize.sync({ alter: true, force: false });

    console.log('Database migration completed successfully.');
    console.log('Tables created/updated:');
    console.log('  - users');
    console.log('  - roles');
    console.log('  - menus');
    console.log('  - user_role');
    console.log('  - role_menu');
    console.log('  - heroes');
    console.log('  - equipments');
    console.log('  - hexes');
    console.log('  - hero_equipment');
    console.log('  - hero_hex');
    console.log('  - equipment_builds');

    await sequelize.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
