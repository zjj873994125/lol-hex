const { Hero, HeroEquipment, HeroHex, Equipment, Hex } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 解析英雄数据中的 tags 字段（JSON 字符串 -> 数组）
 */
function parseHeroTags(hero) {
  const heroData = hero.toJSON ? hero.toJSON() : hero;
  if (heroData.tags && typeof heroData.tags === 'string') {
    try {
      heroData.tags = JSON.parse(heroData.tags);
    } catch (e) {
      heroData.tags = [];
    }
  }
  return heroData;
}

/**
 * 批量解析英雄列表的 tags
 */
function parseHeroList(heroes) {
  return heroes.map(parseHeroTags);
}

/**
 * 英雄控制器
 */
class HeroController {
  /**
   * 获取热门英雄
   */
  static async getHotHeroes(ctx) {
    const { limit = 6 } = ctx.query;

    try {
      const heroes = await Hero.findAll({
        where: { status: 1 },
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      ctx.body = Response.success(parseHeroList(heroes));
    } catch (error) {
      console.error('Get hot heroes error:', error);
      ctx.body = Response.serverError('获取热门英雄失败');
    }
  }

  /**
   * 根据标签搜索英雄
   */
  static async searchByTags(ctx) {
    const { tags } = ctx.query;

    if (!tags) {
      ctx.body = Response.paramError('请提供标签');
      return;
    }

    try {
      const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());

      const allHeroes = await Hero.findAll({
        where: { status: 1 }
      });

      const filteredHeroes = allHeroes.filter(hero => {
        const heroTags = hero.tags ? JSON.parse(hero.tags) : [];
        return tagList.some(tag => heroTags.includes(tag));
      });

      ctx.body = Response.success(parseHeroList(filteredHeroes));
    } catch (error) {
      console.error('Search heroes by tags error:', error);
      ctx.body = Response.serverError('搜索英雄失败');
    }
  }

  /**
   * 获取英雄列表
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 10, keyword, tags, status } = ctx.query;

    try {
      const where = {};

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { title: { [Op.like]: `%${keyword}%` } },
          { nickname: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // 标签筛选（需要从数据库获取所有数据后在应用层过滤）
      let tagList = [];
      if (tags) {
        tagList = tags.split(',').map(t => t.trim());
      }

      // 如果有标签筛选，需要获取所有数据后过滤
      if (tagList.length > 0) {
        const allHeroes = await Hero.findAll({
          where,
          order: [['createdAt', 'DESC']]
        });

        const filteredHeroes = allHeroes.filter(hero => {
          const heroTags = hero.tags ? JSON.parse(hero.tags) : [];
          return tagList.some(tag => heroTags.includes(tag));
        });

        // 手动分页
        const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedHeroes = filteredHeroes.slice(startIndex, endIndex);

        ctx.body = Response.success({
          total: filteredHeroes.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          list: parseHeroList(paginatedHeroes)
        });
      } else {
        // 无标签筛选，直接使用数据库分页
        const { count, rows } = await Hero.findAndCountAll({
          where,
          limit: parseInt(pageSize),
          offset: (parseInt(page) - 1) * parseInt(pageSize),
          order: [['createdAt', 'DESC']]
        });

        ctx.body = Response.success({
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          list: parseHeroList(rows)
        });
      }
    } catch (error) {
      console.error('Get heroes error:', error);
      ctx.body = Response.serverError('获取英雄列表失败');
    }
  }

  /**
   * 获取英雄详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const hero = await Hero.findByPk(id, {
        include: [
          {
            model: HeroEquipment,
            as: 'HeroEquipments',
            include: [
              {
                model: Equipment,
                as: 'Equipment'
              }
            ],
            where: { isRecommended: true },
            required: false
          },
          {
            model: HeroHex,
            as: 'HeroHexes',
            include: [
              {
                model: Hex,
                as: 'Hex'
              }
            ],
            where: { isRecommended: true },
            required: false
          }
        ]
      });

      if (!hero) {
        ctx.body = Response.notFound('英雄不存在');
        return;
      }

      // 解析标签并格式化数据
      const heroData = parseHeroTags(hero);

      // 格式化推荐装备
      heroData.recommendedEquipments = heroData.HeroEquipments
        ? heroData.HeroEquipments.filter(he => he.Equipment)
            .map(he => ({
              equipment: he.Equipment,
              priority: he.priority,
              description: he.description
            }))
            .sort((a, b) => b.priority - a.priority)
        : [];

      // 格式化推荐海克斯
      heroData.recommendedHexes = heroData.HeroHexes
        ? heroData.HeroHexes.filter(hh => hh.Hex)
            .map(hh => ({
              hex: hh.Hex,
              priority: hh.priority,
              description: hh.description
            }))
            .sort((a, b) => b.priority - a.priority)
        : [];

      delete heroData.HeroEquipments;
      delete heroData.HeroHexes;

      ctx.body = Response.success(heroData);
    } catch (error) {
      console.error('Get hero detail error:', error);
      ctx.body = Response.serverError('获取英雄详情失败');
    }
  }

  /**
   * 创建英雄
   */
  static async create(ctx) {
    const { name, title, nickname, avatar, tags, description, status = 1 } = ctx.request.body;

    if (!name) {
      ctx.body = Response.paramError('英雄名称不能为空');
      return;
    }

    try {
      const hero = await Hero.create({
        name,
        title,
        nickname,
        avatar,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
        description,
        status
      });

      ctx.body = Response.success(parseHeroTags(hero), '创建成功');
    } catch (error) {
      console.error('Create hero error:', error);
      ctx.body = Response.serverError('创建英雄失败');
    }
  }

  /**
   * 更新英雄
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { name, title, nickname, avatar, tags, description, status } = ctx.request.body;

    try {
      const hero = await Hero.findByPk(id);

      if (!hero) {
        ctx.body = Response.notFound('英雄不存在');
        return;
      }

      await hero.update({
        name,
        title,
        nickname,
        avatar,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : tags,
        description,
        status
      });

      // 重新获取更新后的数据
      const updatedHero = await Hero.findByPk(id);
      ctx.body = Response.success(parseHeroTags(updatedHero), '更新成功');
    } catch (error) {
      console.error('Update hero error:', error);
      ctx.body = Response.serverError('更新英雄失败');
    }
  }

  /**
   * 删除英雄
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    try {
      const hero = await Hero.findByPk(id);

      if (!hero) {
        ctx.body = Response.notFound('英雄不存在');
        return;
      }

      await hero.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete hero error:', error);
      ctx.body = Response.serverError('删除英雄失败');
    }
  }

  /**
   * 更新英雄推荐装备
   */
  static async updateEquipments(ctx) {
    const { id } = ctx.params;
    const { equipments } = ctx.request.body; // [{ equipmentId, isRecommended, priority, description }]

    if (!Array.isArray(equipments)) {
      ctx.body = Response.paramError('装备列表格式错误');
      return;
    }

    try {
      const hero = await Hero.findByPk(id);

      if (!hero) {
        ctx.body = Response.notFound('英雄不存在');
        return;
      }

      // 删除旧的关联
      await HeroEquipment.destroy({ where: { heroId: id } });

      // 创建新的关联
      const heroEquipments = await Promise.all(
        equipments.map(e => HeroEquipment.create({
          heroId: id,
          equipmentId: e.equipmentId,
          isRecommended: e.isRecommended !== undefined ? e.isRecommended : true,
          priority: e.priority || 0,
          description: e.description || null
        }))
      );

      ctx.body = Response.success(heroEquipments, '更新推荐装备成功');
    } catch (error) {
      console.error('Update hero equipments error:', error);
      ctx.body = Response.serverError('更新推荐装备失败');
    }
  }

  /**
   * 更新英雄推荐海克斯
   */
  static async updateHexes(ctx) {
    const { id } = ctx.params;
    const { hexes } = ctx.request.body; // [{ hexId, isRecommended, priority, description }]

    if (!Array.isArray(hexes)) {
      ctx.body = Response.paramError('海克斯列表格式错误');
      return;
    }

    try {
      const hero = await Hero.findByPk(id);

      if (!hero) {
        ctx.body = Response.notFound('英雄不存在');
        return;
      }

      // 删除旧的关联
      await HeroHex.destroy({ where: { heroId: id } });

      // 创建新的关联
      const heroHexes = await Promise.all(
        hexes.map(h => HeroHex.create({
          heroId: id,
          hexId: h.hexId,
          isRecommended: h.isRecommended !== undefined ? h.isRecommended : true,
          priority: h.priority || 0,
          description: h.description || null
        }))
      );

      ctx.body = Response.success(heroHexes, '更新推荐海克斯成功');
    } catch (error) {
      console.error('Update hero hexes error:', error);
      ctx.body = Response.serverError('更新推荐海克斯失败');
    }
  }
}

module.exports = HeroController;
