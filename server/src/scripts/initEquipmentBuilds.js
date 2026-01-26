require('dotenv').config();
const { sequelize } = require('../config/database');
const db = require('../models');

const { Hero, Equipment, EquipmentBuild, HeroEquipment, HeroHex } = db;

/**
 * 初始化出装思路数据
 * 为每个英雄创建预设的出装思路
 */
async function initEquipmentBuilds() {
  try {
    await sequelize.sync({ alter: false });

    console.log('开始初始化出装思路数据...\n');

    // 检查是否已有数据
    const existingBuildsCount = await EquipmentBuild.count();
    if (existingBuildsCount > 0) {
      console.log(`已存在 ${existingBuildsCount} 条出装思路数据`);
      console.log('如需重新初始化，请先清空 equipment_builds 和 hero_equipment 表\n');
      await sequelize.close();
      return;
    }

    // 获取所有英雄和装备
    const heroes = await Hero.findAll({
      attributes: ['id', 'name', 'tags'],
      where: { status: 1 }
    });

    const equipments = await Equipment.findAll({
      attributes: ['id', 'name', 'type'],
      where: { status: 1 }
    });

    // 按类型分组装备
    const equipByType = {
      1: equipments.filter(e => e.type === 1), // 物理攻击
      2: equipments.filter(e => e.type === 2), // 坦克/防御
      3: equipments.filter(e => e.type === 3), // 移动/鞋子
      4: equipments.filter(e => e.type === 4), // 法术强度
      5: equipments.filter(e => e.type === 5), // 攻击速度
    };

    console.log(`找到 ${heroes.length} 个英雄`);
    console.log(`找到 ${equipments.length} 件装备\n`);

    let totalBuildsCreated = 0;
    let totalEquipmentsLinked = 0;

    // 为每个英雄创建出装思路
    for (const hero of heroes) {
      const tags = JSON.parse(hero.tags || '[]');

      // 根据英雄标签选择装备类型
      let mainEquipType = 1; // 默认物理
      let secondaryEquipType = 2; // 默认防御

      if (tags.includes('法师') || tags.includes('魔法输出')) {
        mainEquipType = 4; // 法术
        secondaryEquipType = 2;
      } else if (tags.includes('坦克')) {
        mainEquipType = 2; // 坦克
        secondaryEquipType = 5;
      } else if (tags.includes('刺客')) {
        mainEquipType = 1; // 物理
        secondaryEquipType = 5;
      } else if (tags.includes('辅助')) {
        mainEquipType = 2; // 坦克/辅助
        secondaryEquipType = 4;
      }

      const mainEquips = equipByType[mainEquipType] || [];
      const secondaryEquips = equipByType[secondaryEquipType] || [];
      const shoesEquips = equipByType[3] || [];

      if (mainEquips.length === 0) {
        console.log(`  ${hero.name}: 无可用装备，跳过`);
        continue;
      }

      // 创建出装思路1：标准输出装
      const build1Equips = [
        ...shoesEquips.slice(0, 1).map((e, i) => ({ equipmentId: e.id, priority: i + 1 })),
        ...mainEquips.slice(0, 4).map((e, i) => ({ equipmentId: e.id, priority: i + 2 })),
        ...secondaryEquips.slice(0, 2).map((e, i) => ({ equipmentId: e.id, priority: i + 6 })),
      ];

      if (build1Equips.length > 0) {
        const build1 = await EquipmentBuild.create({
          heroId: hero.id,
          name: '标准输出装',
          description: '主打输出的标准出装思路',
          priority: 10,
          status: 1
        });

        for (const equip of build1Equips) {
          await HeroEquipment.create({
            buildId: build1.id,
            heroId: hero.id,
            equipmentId: equip.equipmentId,
            priority: equip.priority
          });
        }

        totalBuildsCreated++;
        totalEquipmentsLinked += build1Equips.length;
        console.log(`  ${hero.name}: 创建 "标准输出装" (${build1Equips.length}件)`);
      }

      // 创建出装思路2：半肉出装
      if (secondaryEquips.length >= 2) {
        const build2Equips = [
          ...shoesEquips.slice(0, 1).map((e, i) => ({ equipmentId: e.id, priority: i + 1 })),
          ...mainEquips.slice(0, 2).map((e, i) => ({ equipmentId: e.id, priority: i + 2 })),
          ...secondaryEquips.slice(0, 4).map((e, i) => ({ equipmentId: e.id, priority: i + 4 })),
        ];

        if (build2Equips.length > 0) {
          const build2 = await EquipmentBuild.create({
            heroId: hero.id,
            name: '半肉出装',
            description: '兼顾输出和生存的出装思路',
            priority: 5,
            status: 1
          });

          for (const equip of build2Equips) {
            await HeroEquipment.create({
              buildId: build2.id,
              heroId: hero.id,
              equipmentId: equip.equipmentId,
              priority: equip.priority
            });
          }

          totalBuildsCreated++;
          totalEquipmentsLinked += build2Equips.length;
          console.log(`  ${hero.name}: 创建 "半肉出装" (${build2Equips.length}件)`);
        }
      }

      // 创建出装思路3：爆发出装（仅限输出英雄）
      if ((tags.includes('刺客') || tags.includes('法师') || tags.includes('射手')) && mainEquips.length >= 5) {
        const build3Equips = [
          ...shoesEquips.slice(0, 1).map((e, i) => ({ equipmentId: e.id, priority: i + 1 })),
          ...mainEquips.slice(0, 6).map((e, i) => ({ equipmentId: e.id, priority: i + 2 })),
        ];

        const build3 = await EquipmentBuild.create({
          heroId: hero.id,
          name: '极致爆发装',
          description: '全输出装，追求极致伤害',
          priority: 8,
          status: 1
        });

        for (const equip of build3Equips) {
          await HeroEquipment.create({
            buildId: build3.id,
            heroId: hero.id,
            equipmentId: equip.equipmentId,
            priority: equip.priority
          });
        }

        totalBuildsCreated++;
        totalEquipmentsLinked += build3Equips.length;
        console.log(`  ${hero.name}: 创建 "极致爆发装" (${build3Equips.length}件)`);
      }
    }

    console.log('\n=================================');
    console.log('初始化完成！');
    console.log('=================================');
    console.log(`创建出装思路: ${totalBuildsCreated} 个`);
    console.log(`关联装备: ${totalEquipmentsLinked} 条`);
    console.log('=================================\n');

    await sequelize.close();
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initEquipmentBuilds();
