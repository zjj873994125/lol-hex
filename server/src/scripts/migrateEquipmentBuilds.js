require('dotenv').config();
const { sequelize } = require('../config/database');
const db = require('../models');

const { Hero, Equipment, EquipmentBuild, HeroEquipment, HeroHex } = db;

/**
 * 将现有的 hero_equipment 数据迁移到新的出装思路结构
 * 1. 为每个英雄创建默认的出装思路
 * 2. 将现有的 hero_equipment 关联到对应的出装思路
 */
async function migrateEquipmentBuilds() {
  try {
    console.log('开始迁移装备数据到出装思路结构...\n');

    // 1. 获取所有英雄
    const heroes = await Hero.findAll({
      attributes: ['id', 'name']
    });

    console.log(`找到 ${heroes.length} 个英雄\n`);

    let totalBuildsCreated = 0;
    let totalEquipmentsUpdated = 0;

    // 2. 为每个英雄创建出装思路
    for (const hero of heroes) {
      // 获取该英雄现有的装备关联
      const heroEquipments = await HeroEquipment.findAll({
        where: {
          heroId: hero.id,
          buildId: null // 只处理还没有关联到出装思路的装备
        },
        include: [
          {
            model: Equipment,
            as: 'Equipment',
            attributes: ['id', 'name']
          }
        ]
      });

      if (heroEquipments.length === 0) {
        console.log(`  ${hero.name} (ID: ${hero.id}): 无装备需要迁移`);
        continue;
      }

      // 创建默认出装思路
      const build = await EquipmentBuild.create({
        heroId: hero.id,
        name: '默认出装',
        description: '系统迁移的默认出装思路',
        priority: 0,
        status: 1
      });

      totalBuildsCreated++;

      console.log(`  ${hero.name} (ID: ${hero.id}):`);
      console.log(`    创建出装思路: ${build.name} (ID: ${build.id})`);

      // 更新装备关联，添加 buildId
      const equipmentIds = heroEquipments.map(he => he.id);
      await HeroEquipment.update(
        { buildId: build.id },
        {
          where: {
            id: equipmentIds
          }
        }
      );

      totalEquipmentsUpdated += equipmentIds.length;

      console.log(`    关联 ${equipmentIds.length} 件装备`);
      console.log(`    装备列表: ${heroEquipments.map(he => he.Equipment?.name).join(', ')}`);
    }

    console.log('\n=================================');
    console.log('迁移完成！');
    console.log('=================================');
    console.log(`创建出装思路: ${totalBuildsCreated} 个`);
    console.log(`更新装备关联: ${totalEquipmentsUpdated} 条`);
    console.log('=================================\n');

    await sequelize.close();
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

migrateEquipmentBuilds();
