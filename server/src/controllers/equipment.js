const { Equipment, HeroEquipment } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 装备控制器
 */
class EquipmentController {
  /**
   * 获取装备列表
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 50, keyword, status } = ctx.query;

    try {
      const where = {};

      // 关键词搜索（同时搜索 name 和 keywords 字段）
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { keywords: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await Equipment.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']]
      });

      ctx.body = Response.success({
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows
      });
    } catch (error) {
      console.error('Get equipments error:', error);
      ctx.body = Response.serverError('获取装备列表失败');
    }
  }

  /**
   * 获取装备详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        ctx.body = Response.notFound('装备不存在');
        return;
      }

      ctx.body = Response.success(equipment);
    } catch (error) {
      console.error('Get equipment detail error:', error);
      ctx.body = Response.serverError('获取装备详情失败');
    }
  }

  /**
   * 创建装备
   */
  static async create(ctx) {
    const { name, icon, price, keywords, description, status = 1 } = ctx.request.body;

    if (!name) {
      ctx.body = Response.paramError('装备名称不能为空');
      return;
    }

    try {
      const equipment = await Equipment.create({
        name,
        icon,
        price,
        keywords,
        description,
        status
      });

      ctx.body = Response.success(equipment, '创建成功');
    } catch (error) {
      console.error('Create equipment error:', error);
      ctx.body = Response.serverError('创建装备失败');
    }
  }

  /**
   * 更新装备
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { name, icon, price, keywords, description, status } = ctx.request.body;

    try {
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        ctx.body = Response.notFound('装备不存在');
        return;
      }

      await equipment.update({
        name,
        icon,
        price,
        keywords,
        description,
        status
      });

      ctx.body = Response.success(equipment, '更新成功');
    } catch (error) {
      console.error('Update equipment error:', error);
      ctx.body = Response.serverError('更新装备失败');
    }
  }

  /**
   * 删除装备
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    try {
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        ctx.body = Response.notFound('装备不存在');
        return;
      }

      // 删除装备前，删除英雄装备关联
      await HeroEquipment.destroy({ where: { equipmentId: id } });

      await equipment.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete equipment error:', error);
      ctx.body = Response.serverError('删除装备失败');
    }
  }
}

module.exports = EquipmentController;
