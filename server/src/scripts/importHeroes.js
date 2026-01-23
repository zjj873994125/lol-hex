require('dotenv').config();
const { sequelize } = require('../config/database');
const { Hero } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * 导入英雄数据到数据库
 */
async function importHeroes() {
  try {
    console.log('开始同步数据库...');
    await sequelize.sync({ alter: false });
    console.log('✓ 数据库同步完成');

    // 读取 hero.json
    const jsonPath = path.join(__dirname, '../models/hero.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const heroesData = JSON.parse(rawData);

    console.log(`读取到 ${heroesData.length} 个英雄数据`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const heroData of heroesData) {
      try {
        // 数据映射
        const data = {
          id: parseInt(heroData.heroId),
          name: heroData.name,
          title: heroData.title,
          nickname: heroData.keywords,
          avatar: heroData.heroPic,
          tags: JSON.stringify(heroData.roles || []),
          description: heroData.keywords,
          status: 1
        };

        // 使用 findOrCreate，如果不存在则创建
        const [hero, isNewRecord] = await Hero.findOrCreate({
          where: { id: data.id },
          defaults: data
        });

        if (isNewRecord) {
          createdCount++;
        } else {
          // 如果已存在，更新数据
          await hero.update(data);
          updatedCount++;
        }

        process.stdout.write(`\r处理中... ${Math.round((heroesData.indexOf(heroData) + 1) / heroesData.length * 100)}%`);
      } catch (error) {
        console.error(`\n导入英雄 ${heroData.name} 失败:`, error.message);
      }
    }

    console.log(`\n\n导入完成！`);
    console.log(`- 新增: ${createdCount}`);
    console.log(`- 更新: ${updatedCount}`);
    console.log(`- 总计: ${heroesData.length}`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

importHeroes();
