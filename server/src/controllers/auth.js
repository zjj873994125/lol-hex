const { User, Role } = require('../models');
const JWTUtil = require('../utils/jwt');
const Response = require('../utils/response');

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 用户登录
   */
  static async login(ctx) {
    const { phone, password } = ctx.request.body;

    if (!phone || !password) {
      ctx.body = Response.paramError('手机号和密码不能为空');
      return;
    }

    try {
      // 查找用户
      const user = await User.findOne({
        where: { phone },
        include: [
          {
            model: Role,
            as: 'Role',
            include: [
              {
                model: require('../models').Menu,
                as: 'Menus',
                attributes: ['id', 'name', 'code', 'path']
              }
            ]
          }
        ]
      });

      if (!user) {
        ctx.body = Response.unauthorized('手机号或密码错误');
        return;
      }

      // 检查用户状态
      if (user.status !== 1) {
        ctx.body = Response.forbidden('账号已被禁用');
        return;
      }

      // 验证密码
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        ctx.body = Response.unauthorized('手机号或密码错误');
        return;
      }

      // 提取权限
      let permissions = [];
      let roleInfo = null;
      let roleCode = null;

      if (user.Role) {
        permissions = user.Role.Menus ? user.Role.Menus.map(m => m.code).filter(Boolean) : [];
        roleCode = user.Role.code;
        roleInfo = {
          id: user.Role.id,
          name: user.Role.name,
          code: user.Role.code
        };
      }

      // 生成 Token（包含 roleCode）
      const token = JWTUtil.generate({
        id: user.id,
        phone: user.phone,
        roleId: user.roleId,
        roleCode
      });

      ctx.body = Response.success({
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          role: roleInfo,
          permissions
        }
      }, '登录成功');
    } catch (error) {
      console.error('Login error:', error);
      ctx.body = Response.serverError('登录失败');
    }
  }

  /**
   * 用户注册
   */
  static async register(ctx) {
    const { username, phone, password, email } = ctx.request.body;

    if (!username || !phone || !password) {
      ctx.body = Response.paramError('用户名、手机号和密码不能为空');
      return;
    }

    try {
      // 检查手机号是否已存在
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        ctx.body = Response.paramError('该手机号已注册');
        return;
      }

      // 查找默认角色（普通用户）
      let defaultRole = await Role.findOne({ where: { code: 'user' } });

      // 如果不存在默认角色，则创建
      if (!defaultRole) {
        defaultRole = await Role.create({
          name: '普通用户',
          code: 'user',
          description: '系统默认普通用户角色'
        });
      }

      // 创建用户
      const user = await User.create({
        username,
        phone,
        password,
        email: email || null,
        avatar: 'https://img.duoziwang.com/2018/18/06051452332913.jpg',
        roleId: defaultRole.id,
        status: 1
      });

      // 生成 Token（包含 roleCode）
      const token = JWTUtil.generate({
        id: user.id,
        phone: user.phone,
        roleId: user.roleId,
        roleCode: defaultRole.code
      });

      ctx.body = Response.success({
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          role: {
            id: defaultRole.id,
            name: defaultRole.name,
            code: defaultRole.code
          }
        }
      }, '注册成功');
    } catch (error) {
      console.error('Register error:', error);
      ctx.body = Response.serverError('注册失败');
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getUserInfo(ctx) {
    const user = ctx.state.user;

    if (!user) {
      ctx.body = Response.unauthorized('未登录');
      return;
    }

    try {
      // 获取完整用户信息
      const userData = await User.findByPk(user.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Role,
            as: 'Role',
            include: [
              {
                model: require('../models').Menu,
                as: 'Menus',
                attributes: ['id', 'name', 'code', 'path', 'icon', 'type']
              }
            ]
          }
        ]
      });

      if (!userData) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      // 提取权限和菜单
      let permissions = [];
      let menus = [];
      let roleInfo = null;

      if (userData.Role) {
        permissions = userData.Role.Menus ? userData.Role.Menus.map(m => m.code).filter(Boolean) : [];
        // 构建菜单树
        menus = buildMenuTree(userData.Role.Menus || []);
        roleInfo = {
          id: userData.Role.id,
          name: userData.Role.name,
          code: userData.Role.code
        };
      }

      ctx.body = Response.success({
        id: userData.id,
        username: userData.username,
        phone: userData.phone,
        email: userData.email,
        avatar: userData.avatar,
        status: userData.status,
        role: roleInfo,
        permissions,
        menus
      });
    } catch (error) {
      console.error('Get user info error:', error);
      ctx.body = Response.serverError('获取用户信息失败');
    }
  }

  /**
   * 更新个人信息
   */
  static async updateProfile(ctx) {
    const user = ctx.state.user;
    const { username, email, avatar } = ctx.request.body;

    if (!user) {
      ctx.body = Response.unauthorized('未登录');
      return;
    }

    try {
      const userData = await User.findByPk(user.id);

      if (!userData) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      await userData.update({
        username: username !== undefined ? username : userData.username,
        email: email !== undefined ? email : userData.email,
        avatar: avatar !== undefined ? avatar : userData.avatar,
      });

      const updatedUser = userData.toJSON();
      delete updatedUser.password;

      ctx.body = Response.success(updatedUser, '更新成功');
    } catch (error) {
      console.error('Update profile error:', error);
      ctx.body = Response.serverError('更新失败');
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(ctx) {
    const user = ctx.state.user;
    const { oldPassword, newPassword } = ctx.request.body;

    if (!user) {
      ctx.body = Response.unauthorized('未登录');
      return;
    }

    if (!oldPassword || !newPassword) {
      ctx.body = Response.paramError('旧密码和新密码不能为空');
      return;
    }

    if (newPassword.length < 6) {
      ctx.body = Response.paramError('新密码至少6位');
      return;
    }

    try {
      const userData = await User.findByPk(user.id);

      if (!userData) {
        ctx.body = Response.notFound('用户不存在');
        return;
      }

      // 验证旧密码
      const isPasswordValid = await userData.validatePassword(oldPassword);
      if (!isPasswordValid) {
        ctx.body = Response.unauthorized('旧密码错误');
        return;
      }

      await userData.update({ password: newPassword });

      ctx.body = Response.success(null, '密码修改成功');
    } catch (error) {
      console.error('Change password error:', error);
      ctx.body = Response.serverError('修改密码失败');
    }
  }
}

/**
 * 构建菜单树
 */
function buildMenuTree(menus, parentId = -1) {
  const result = [];
  const filtered = menus.filter(m => m.status === 1);

  for (const menu of filtered) {
    if (menu.parentId === parentId) {
      const children = buildMenuTree(filtered, menu.id);
      result.push({
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        type: menu.type,
        code: menu.code,
        children: children.length > 0 ? children : undefined
      });
    }
  }

  return result.sort((a, b) => (a.sort || 0) - (b.sort || 0));
}

module.exports = AuthController;
