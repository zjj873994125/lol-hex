require('dotenv').config();
const { sequelize } = require('../config/database');
const { Hex } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * tier 映射表
 */
const tierMap = {
  '棱彩': 1,
  '白银': 2,
  '黄金': 3,
};

/**
 * 导入海克斯数据到数据库
 */
async function importHexes() {
  try {
    console.log('开始同步数据库...');
    await sequelize.sync({ alter: false });
    console.log('✓ 数据库同步完成');

    // 读取 hex.json
    const jsonPath = path.join(__dirname, '../models/hex.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const hexesData = JSON.parse(rawData);

    console.log(`读取到 ${hexesData.length} 个海克斯数据`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const hexData of hexesData) {
      try {
        // 数据映射
        const data = {
          name: hexData.name,
          icon: hexData.icon_url,
          tier: tierMap[hexData.tier] || 3,
          description: hexData.description,
          status: 1
        };

        // 使用 findOrCreate，如果不存在则创建
        const [hex, isNewRecord] = await Hex.findOrCreate({
          where: { name: data.name },
          defaults: data
        });

        if (isNewRecord) {
          createdCount++;
        } else {
          // 如果已存在，更新数据
          await hex.update(data);
          updatedCount++;
        }

        process.stdout.write(`\r处理中... ${Math.round((hexesData.indexOf(hexData) + 1) / hexesData.length * 100)}%`);
      } catch (error) {
        console.error(`\n导入海克斯 ${hexData.name} 失败:`, error.message);
      }
    }

    console.log(`\n\n导入完成！`);
    console.log(`- 新增: ${createdCount}`);
    console.log(`- 更新: ${updatedCount}`);
    console.log(`- 总计: ${hexesData.length}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importHexes();
