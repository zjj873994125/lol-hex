require('dotenv').config();
const { sequelize } = require('../config/database');
const { Equipment } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * 导入装备数据到数据库
 */
async function importEquipments() {
  try {
    console.log('开始同步数据库...');
    await sequelize.sync({ alter: false });
    console.log('✓ 数据库同步完成');

    // 读取 equip.json
    const jsonPath = path.join(__dirname, '../models/equip.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const equipmentsData = JSON.parse(rawData);

    console.log(`读取到 ${equipmentsData.length} 个装备数据`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const equipData of equipmentsData) {
      try {
        // 数据映射
        const data = {
          id: parseInt(equipData.itemId),
          name: equipData.name,
          icon: equipData.iconPath,
          price: parseInt(equipData.price) || 0,
          keywords: equipData.keywords || '',
          description: equipData.item_desc || '',
          status: 1
        };

        // 使用 findOrCreate，如果不存在则创建
        const [equipment, isNewRecord] = await Equipment.findOrCreate({
          where: { id: data.id },
          defaults: data
        });

        if (isNewRecord) {
          createdCount++;
        } else {
          // 如果已存在，更新数据
          await equipment.update(data);
          updatedCount++;
        }

        process.stdout.write(`\r处理中... ${Math.round((equipmentsData.indexOf(equipData) + 1) / equipmentsData.length * 100)}%`);
      } catch (error) {
        console.error(`\n导入装备 ${equipData.name} 失败:`, error.message);
      }
    }

    console.log(`\n\n导入完成！`);
    console.log(`- 新增: ${createdCount}`);
    console.log(`- 更新: ${updatedCount}`);
    console.log(`- 总计: ${equipmentsData.length}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importEquipments();
