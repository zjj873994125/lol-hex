const { User, Role, UserRole } = require('../models');
const { Op } = require('sequelize');
const Response = require('../utils/response');

/**
 * 用户控制器
 */
class UserController {
  /**
   * 获取用户列表
   */
  static async getList(ctx) {
    const { page = 1, pageSize = 10, keyword, status } = ctx.query;

    try {
      const where = {};

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { username: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 状态筛选
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Role,
            as: 'Role',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      ctx.body = Response.success({
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      ctx.body = Response.serverError('获取用户列表失败');
    }
  }

  /**
   * 获取用户详情
   */
  static async getDetail(ctx) {
    const { id } = ctx.params;

    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'Role',
            attributes: ['id', 'name', 'code', 'description']
          }
        ]
      });

      if (!user) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      ctx.body = Response.success(user);
    } catch (error) {
      console.error('Get user detail error:', error);
      ctx.body = Response.serverError('获取用户详情失败');
    }
  }

  /**
   * 创建用户
   */
  static async create(ctx) {
    const { username, password, email, roleId, status = 1 } = ctx.request.body;

    if (!username || !password) {
      ctx.body = Response.paramError('用户名和密码不能为空');
      return;
    }

    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        ctx.body = Response.paramError('用户名已存在');
        return;
      }

      const user = await User.create({
        username,
        password,
        email,
        roleId: roleId || null,
        status
      });

      const userData = user.toJSON();
      delete userData.password;

      ctx.body = Response.success(userData, '创建成功');
    } catch (error) {
      console.error('Create user error:', error);
      ctx.body = Response.serverError('创建用户失败');
    }
  }

  /**
   * 更新用户
   */
  static async update(ctx) {
    const { id } = ctx.params;
    const { username, email, roleId, status } = ctx.request.body;

    try {
      const user = await User.findByPk(id);

      if (!user) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      // 检查用户名是否被其他用户使用
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          ctx.body = Response.paramError('用户名已存在');
          return;
        }
      }

      await user.update({
        username: username || user.username,
        email: email !== undefined ? email : user.email,
        roleId: roleId !== undefined ? roleId : user.roleId,
        status: status !== undefined ? status : user.status
      });

      const userData = user.toJSON();
      delete userData.password;

      ctx.body = Response.success(userData, '更新成功');
    } catch (error) {
      console.error('Update user error:', error);
      ctx.body = Response.serverError('更新用户失败');
    }
  }

  /**
   * 删除用户
   */
  static async delete(ctx) {
    const { id } = ctx.params;

    // 不能删除自己
    if (ctx.state.user && ctx.state.user.id === parseInt(id)) {
      ctx.body = Response.error('不能删除自己', 400);
      return;
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      await user.destroy();

      ctx.body = Response.success(null, '删除成功');
    } catch (error) {
      console.error('Delete user error:', error);
      ctx.body = Response.serverError('删除用户失败');
    }
  }

  /**
   * 更新用户状态
   */
  static async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    if (status === undefined) {
      ctx.body = Response.paramError('状态不能为空');
      return;
    }

    // 不能禁用自己
    if (ctx.state.user && ctx.state.user.id === parseInt(id) && status !== 1) {
      ctx.body = Response.error('不能禁用自己', 400);
      return;
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      await user.update({ status: parseInt(status) });

      ctx.body = Response.success(null, '状态更新成功');
    } catch (error) {
      console.error('Update user status error:', error);
      ctx.body = Response.serverError('更新用户状态失败');
    }
  }

  /**
   * 重置用户密码
   */
  static async resetPassword(ctx) {
    const { id } = ctx.params;
    const { password } = ctx.request.body;

    if (!password) {
      ctx.body = Response.paramError('新密码不能为空');
      return;
    }

    try {
      const user = await User.findByPk(id);

      if (!user) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      await user.update({ password });

      ctx.body = Response.success(null, '密码重置成功');
    } catch (error) {
      console.error('Reset password error:', error);
      ctx.body = Response.serverError('重置密码失败');
    }
  }
}

module.exports = UserController;
