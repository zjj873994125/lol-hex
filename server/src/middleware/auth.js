const JWTUtil = require('../utils/jwt');
const Response = require('../utils/response');

/**
 * JWT 认证中间件
 * 验证请求头中的 Token，解析用户信息
 */
async function authMiddleware(ctx, next) {
  // 获取 Token
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = Response.unauthorized('请先登录');
    return;
  }

  // 验证 Token
  const decoded = JWTUtil.verify(token);

  if (!decoded) {
    ctx.status = 401;
    ctx.body = Response.unauthorized('Token 无效或已过期');
    return;
  }

  // 将用户信息存入 ctx.state
  ctx.state.user = decoded;

  await next();
}

/**
 * 可选认证中间件
 * 如果有 Token 则解析，没有则跳过
 */
async function optionalAuth(ctx, next) {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const decoded = JWTUtil.verify(token);
    if (decoded) {
      ctx.state.user = decoded;
    }
  }

  await next();
}

module.exports = { authMiddleware, optionalAuth };
