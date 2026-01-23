const { Hex, HeroHex } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 海克斯控制器
 */
class HexController {
  /**
   * 获取海克斯列表
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 50, keyword, tier, status } = ctx.query;

    try {
      const where = {};

      // 关键词搜索
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      // 层级筛选
      if (tier !== undefined) {
        where.tier = parseInt(tier);
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await Hex.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['tier', 'ASC'], ['createdAt', 'DESC']]
      });

      ctx.body = Response.success({
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows
      });
    } catch (error) {
      console.error('Get hexes error:', error);
      ctx.body = Response.serverError('获取海克斯列表失败');
    }
  }

  /**
   * 获取海克斯详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const hex = await Hex.findByPk(id);

      if (!hex) {
        ctx.body = Response.notFound('海克斯不存在');
        return;
      }

      ctx.body = Response.success(hex);
    } catch (error) {
      console.error('Get hex detail error:', error);
      ctx.body = Response.serverError('获取海克斯详情失败');
    }
  }

  /**
   * 创建海克斯
   */
  static async create(ctx) {
    const { name, icon, tier, description, status = 1 } = ctx.request.body;

    if (!name) {
      ctx.body = Response.paramError('海克斯名称不能为空');
      return;
    }

    try {
      const hex = await Hex.create({
        name,
        icon,
        tier,
        description,
        status
      });

      ctx.body = Response.success(hex, '创建成功');
    } catch (error) {
      console.error('Create hex error:', error);
      ctx.body = Response.serverError('创建海克斯失败');
    }
  }

  /**
   * 更新海克斯
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { name, icon, tier, description, status } = ctx.request.body;

    try {
      const hex = await Hex.findByPk(id);

      if (!hex) {
        ctx.body = Response.notFound('海克斯不存在');
        return;
      }

      await hex.update({
        name,
        icon,
        tier,
        description,
        status
      });

      ctx.body = Response.success(hex, '更新成功');
    } catch (error) {
      console.error('Update hex error:', error);
      ctx.body = Response.serverError('更新海克斯失败');
    }
  }

  /**
   * 删除海克斯
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    try {
      const hex = await Hex.findByPk(id);

      if (!hex) {
        ctx.body = Response.notFound('海克斯不存在');
        return;
      }

      // 删除海克斯前，删除英雄海克斯关联
      await HeroHex.destroy({ where: { hexId: id } });

      await hex.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete hex error:', error);
      ctx.body = Response.serverError('删除海克斯失败');
    }
  }
}

module.exports = HexController;
