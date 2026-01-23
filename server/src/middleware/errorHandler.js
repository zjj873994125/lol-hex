const Response = require('../utils/response');

/**
 * 错误处理中间件
 */
async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);

    // Sequelize 唯一约束错误
    if (err.name === 'SequelizeUniqueConstraintError') {
      ctx.status = 400;
      ctx.body = Response.paramError('数据已存在');
      return;
    }

    // Sequelize 验证错误
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message).join('; ');
      ctx.status = 400;
      ctx.body = Response.paramError(messages);
      return;
    }

    // Sequelize 外键约束错误
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      ctx.status = 400;
      ctx.body = Response.paramError('关联数据不存在');
      return;
    }

    // 自定义业务错误
    if (err.code) {
      ctx.status = err.code >= 400 && err.code < 600 ? err.code : 500;
      ctx.body = Response.error(err.message, err.code);
      return;
    }

    // 默认服务器错误
    ctx.status = 500;
    ctx.body = Response.serverError(err.message || '服务器内部错误');
  }
}

module.exports = errorHandler;
