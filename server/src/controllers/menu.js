const { Menu, RoleMenu } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 菜单控制器
 */
class MenuController {
  /**
   * 获取菜单树
   */
  static async getTree(ctx) {
    const { status } = ctx.query;

    try {
      const where = {};

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const menus = await Menu.findAll({
        where,
        order: [['sort', 'ASC'], ['id', 'ASC']]
      });

      const tree = buildMenuTree(menus);

      ctx.body = Response.success(tree);
    } catch (error) {
      console.error('Get menu tree error:', error);
      ctx.body = Response.serverError('获取菜单树失败');
    }
  }

  /**
   * 获取菜单列表（扁平结构）
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 50, keyword, type, status } = ctx.query;

    try {
      const where = {};

      // 关键词搜索
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      // 类型筛选
      if (type !== undefined) {
        where.type = parseInt(type);
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await Menu.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['sort', 'ASC'], ['createdAt', 'DESC']]
      });

      ctx.body = Response.success({
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows
      });
    } catch (error) {
      console.error('Get menus error:', error);
      ctx.body = Response.serverError('获取菜单列表失败');
    }
  }

  /**
   * 获取菜单详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const menu = await Menu.findByPk(id);

      if (!menu) {
        ctx.body = Response.notFound('菜单不存在');
        return;
      }

      ctx.body = Response.success(menu);
    } catch (error) {
      console.error('Get menu detail error:', error);
      ctx.body = Response.serverError('获取菜单详情失败');
    }
  }

  /**
   * 创建菜单
   */
  static async create(ctx) {
    const { parentId, name, path, icon, type = 2, code, sort = 0, status = 1 } = ctx.request.body;

    if (!name) {
      ctx.body = Response.paramError('菜单名称不能为空');
      return;
    }

    // 如果有父级ID，检查父级是否存在
    if (parentId !== null && parentId !== undefined && parentId > 0) {
      const parentMenu = await Menu.findByPk(parentId);
      if (!parentMenu) {
        ctx.body = Response.paramError('父菜单不存在');
        return;
      }
    }

    try {
      const menu = await Menu.create({
        parentId,
        name,
        path,
        icon,
        type,
        code,
        sort,
        status
      });

      ctx.body = Response.success(menu, '创建成功');
    } catch (error) {
      console.error('Create menu error:', error);
      ctx.body = Response.serverError('创建菜单失败');
    }
  }

  /**
   * 更新菜单
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { parentId, name, path, icon, type, code, sort, status } = ctx.request.body;

    try {
      const menu = await Menu.findByPk(id);

      if (!menu) {
        ctx.body = Response.notFound('菜单不存在');
        return;
      }

      // 检查是否将自己设为父级
      if (parentId !== undefined && parseInt(parentId) === parseInt(id)) {
        ctx.body = Response.paramError('不能将自己设为父级');
        return;
      }

      // 如果有父级ID，检查父级是否存在
      if (parentId !== undefined && parentId > 0) {
        const parentMenu = await Menu.findByPk(parentId);
        if (!parentMenu) {
          ctx.body = Response.paramError('父菜单不存在');
          return;
        }
      }

      await menu.update({
        parentId: parentId !== undefined ? parentId : menu.parentId,
        name: name || menu.name,
        path: path !== undefined ? path : menu.path,
        icon: icon !== undefined ? icon : menu.icon,
        type: type !== undefined ? type : menu.type,
        code: code !== undefined ? code : menu.code,
        sort: sort !== undefined ? sort : menu.sort,
        status: status !== undefined ? status : menu.status
      });

      ctx.body = Response.success(menu, '更新成功');
    } catch (error) {
      console.error('Update menu error:', error);
      ctx.body = Response.serverError('更新菜单失败');
    }
  }

  /**
   * 删除菜单
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    try {
      const menu = await Menu.findByPk(id);

      if (!menu) {
        ctx.body = Response.notFound('菜单不存在');
        return;
      }

      // 检查是否有子菜单
      const childCount = await Menu.count({ where: { parentId: id } });
      if (childCount > 0) {
        ctx.body = Response.error('请先删除子菜单', 400);
        return;
      }

      // 删除角色菜单关联
      await RoleMenu.destroy({ where: { menuId: id } });

      await menu.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete menu error:', error);
      ctx.body = Response.serverError('删除菜单失败');
    }
  }
}

/**
 * 构建菜单树
 */
function buildMenuTree(menus, parentId = -1) {
  const result = [];

  for (const menu of menus) {
    if (menu.parentId === parentId) {
      const children = buildMenuTree(menus, menu.id);
      result.push({
        id: menu.id,
        parentId: menu.parentId,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        type: menu.type,
        code: menu.code,
        sort: menu.sort,
        status: menu.status,
        children: children.length > 0 ? children : undefined
      });
    }
  }

  return result;
}

module.exports = MenuController;
