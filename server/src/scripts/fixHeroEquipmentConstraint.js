require('dotenv').config();
const { sequelize } = require('../config/database');

/**
 * 修复 hero_equipment 表的唯一约束
 * 删除旧的 heroId + equipmentId 唯一约束
 * 添加新的 buildId + equipmentId 唯一约束
 */
async function fixHeroEquipmentConstraint() {
  try {
    console.log('开始修复 hero_equipment 表约束...\n');

    // 删除旧的唯一约束
    await sequelize.query(`
      ALTER TABLE \`hero_equipment\`
      DROP INDEX \`hero_equipment_hero_id_equipment_id\`
    `);
    console.log('✓ 已删除旧的唯一约束 (heroId + equipmentId)');

    // 添加新的唯一约束
    await sequelize.query(`
      ALTER TABLE \`hero_equipment\`
      ADD UNIQUE INDEX \`hero_equipment_build_id_equipment_id\` (\`buildId\`, \`equipmentId\`)
    `);
    console.log('✓ 已添加新的唯一约束 (buildId + equipmentId)');

    // 清理没有 buildId 的旧数据（可选）
    const result = await sequelize.query(`
      DELETE FROM \`hero_equipment\`
      WHERE \`buildId\` IS NULL
    `);
    console.log(`✓ 已清理 ${result[0].affectedRows || 0} 条没有 buildId 的旧数据`);

    console.log('\n修复完成！');
    await sequelize.close();
  } catch (error) {
    // 如果约束已存在，忽略错误
    if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
      console.log('约束已存在，跳过创建');
    } else {
      console.error('修复失败:', error.message);
      if (error.message.includes("doesn't exist")) {
        console.log('\n提示: 旧的约束可能已被删除，请忽略此错误');
      }
    }
    await sequelize.close();
  }
}

fixHeroEquipmentConstraint();
