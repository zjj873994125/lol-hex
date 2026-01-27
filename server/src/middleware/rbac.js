const Response = require('../utils/response');

/**
 * RBAC 权限中间件
 * 检查用户是否有指定权限
 * @param {...string} permissions - 所需的权限代码
 */
function rbacMiddleware(...permissions) {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = Response.unauthorized('请先登录');
      return;
    }

    // 超级管理员拥有所有权限
    if (user.isSuperAdmin) {
      await next();
      return;
    }

    // 检查用户角色权限
    const userPermissions = user.permissions || [];

    // 检查是否拥有所需权限（任一权限即可）
    const hasPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      ctx.status = 403;
      ctx.body = Response.forbidden('无权限访问');
      return;
    }

    await next();
  };
}

/**
 * 管理员权限中间件
 * 检查用户是否为管理员
 */
function adminMiddleware(ctx, next) {
  const user = ctx.state.user;

  if (!user) {
    ctx.status = 401;
    ctx.body = Response.unauthorized('请先登录');
    return;
  }

  // 超级管理员、管理员或内容管理员角色都可以访问管理后台
  if (user.isSuperAdmin || user.roleCode === 'admin' || user.roleCode === 'content_admin') {
    return next();
  }

  ctx.status = 403;
  ctx.body = Response.forbidden('需要管理员权限');
}

/**
 * 加载用户权限中间件
 * 从数据库加载用户的完整权限信息
 * @param {Model} User - User 模型
 */
function loadUserPermissions(User) {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      await next();
      return;
    }

    try {
      // 从数据库获取用户完整信息及权限
      const userData = await User.findByPk(user.id, {
        include: [
          {
            model: require('../models').Role,
            as: 'Role',
            include: [
              {
                model: require('../models').Menu,
                as: 'Menus',
                attributes: ['id', 'code']
              }
            ]
          }
        ]
      });

      if (userData && userData.Role) {
        // 提取所有菜单代码作为权限
        const permissions = userData.Role.Menus
          ? userData.Role.Menus.map(m => m.code).filter(Boolean)
          : [];

        ctx.state.user = {
          ...ctx.state.user,
          roleCode: userData.Role.code,
          roleName: userData.Role.name,
          permissions
        };
      }
    } catch (error) {
      console.error('Load user permissions error:', error);
    }

    await next();
  };
}

module.exports = {
  rbacMiddleware,
  adminMiddleware,
  loadUserPermissions
};
