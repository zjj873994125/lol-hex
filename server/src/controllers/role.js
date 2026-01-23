const { Role, Menu, RoleMenu, User } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 角色控制器
 */
class RoleController {
  /**
   * 获取角色列表
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 50, keyword } = ctx.query;

    try {
      const where = {};

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { code: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await Role.findAndCountAll({
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
      console.error('Get roles error:', error);
      ctx.body = Response.serverError('获取角色列表失败');
    }
  }

  /**
   * 获取所有角色（不分页）
   */
  static async getAll(ctx) {
    try {
      const roles = await Role.findAll({
        order: [['createdAt', 'DESC']]
      });

      ctx.body = Response.success(roles);
    } catch (error) {
      console.error('Get all roles error:', error);
      ctx.body = Response.serverError('获取角色列表失败');
    }
  }

  /**
   * 获取角色详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const role = await Role.findByPk(id, {
        include: [
          {
            model: Menu,
            as: 'Menus',
            attributes: ['id', 'name', 'code', 'type']
          }
        ]
      });

      if (!role) {
        ctx.body = Response.notFound('角色不存在');
        return;
      }

      const roleData = role.toJSON();
      // 提取菜单ID列表
      roleData.menuIds = roleData.Menus ? roleData.Menus.map(m => m.id) : [];

      ctx.body = Response.success(roleData);
    } catch (error) {
      console.error('Get role detail error:', error);
      ctx.body = Response.serverError('获取角色详情失败');
    }
  }

  /**
   * 获取角色的菜单
   */
  static async getMenus(ctx) {
    const { id } = ctx.params;

    try {
      const role = await Role.findByPk(id, {
        include: [
          {
            model: Menu,
            as: 'Menus',
            attributes: ['id', 'name', 'code', 'type']
          }
        ]
      });

      if (!role) {
        ctx.body = Response.notFound('角色不存在');
        return;
      }

      const menuIds = role.Menus ? role.Menus.map(m => m.id) : [];

      ctx.body = Response.success({
        roleId: role.id,
        roleName: role.name,
        menuIds
      });
    } catch (error) {
      console.error('Get role menus error:', error);
      ctx.body = Response.serverError('获取角色菜单失败');
    }
  }

  /**
   * 创建角色
   */
  static async create(ctx) {
    const { name, code, description } = ctx.request.body;

    if (!name || !code) {
      ctx.body = Response.paramError('角色名称和代码不能为空');
      return;
    }

    try {
      // 检查代码是否已存在
      const existingRole = await Role.findOne({ where: { code } });
      if (existingRole) {
        ctx.body = Response.paramError('角色代码已存在');
        return;
      }

      const role = await Role.create({
        name,
        code,
        description
      });

      ctx.body = Response.success(role, '创建成功');
    } catch (error) {
      console.error('Create role error:', error);
      ctx.body = Response.serverError('创建角色失败');
    }
  }

  /**
   * 更新角色
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { name, code, description } = ctx.request.body;

    try {
      const role = await Role.findByPk(id);

      if (!role) {
        ctx.body = Response.notFound('角色不存在');
        return;
      }

      // 检查代码是否被其他角色使用
      if (code && code !== role.code) {
        const existingRole = await Role.findOne({ where: { code } });
        if (existingRole) {
          ctx.body = Response.paramError('角色代码已存在');
          return;
        }
      }

      await role.update({
        name: name || role.name,
        code: code || role.code,
        description: description !== undefined ? description : role.description
      });

      ctx.body = Response.success(role, '更新成功');
    } catch (error) {
      console.error('Update role error:', error);
      ctx.body = Response.serverError('更新角色失败');
    }
  }

  /**
   * 删除角色
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    try {
      const role = await Role.findByPk(id);

      if (!role) {
        ctx.body = Response.notFound('角色不存在');
        return;
      }

      // 检查是否有用户使用该角色
      const userCount = await User.count({ where: { roleId: id } });
      if (userCount > 0) {
        ctx.body = Response.error('该角色下还有用户，无法删除', 400);
        return;
      }

      // 删除角色菜单关联
      await RoleMenu.destroy({ where: { roleId: id } });

      await role.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete role error:', error);
      ctx.body = Response.serverError('删除角色失败');
    }
  }

  /**
   * 更新角色菜单
   */
  static async updateMenus(ctx) {
    const { id } = ctx.params;
    const { menuIds } = ctx.request.body;

    if (!Array.isArray(menuIds)) {
      ctx.body = Response.paramError('菜单ID列表格式错误');
      return;
    }

    try {
      const role = await Role.findByPk(id);

      if (!role) {
        ctx.body = Response.notFound('角色不存在');
        return;
      }

      // 删除旧的关联
      await RoleMenu.destroy({ where: { roleId: id } });

      // 创建新的关联
      if (menuIds.length > 0) {
        const roleMenus = menuIds.map(menuId => ({
          roleId: id,
          menuId
        }));
        await RoleMenu.bulkCreate(roleMenus);
      }

      ctx.body = Response.success(null, '更新成功');
    } catch (error) {
      console.error('Update role menus error:', error);
      ctx.body = Response.serverError('更新角色菜单失败');
    }
  }
}

module.exports = RoleController;
