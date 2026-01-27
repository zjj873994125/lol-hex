const Router = require('koa-router');

const authRouter = require('./auth');
const heroRouter = require('./hero');
const equipmentRouter = require('./equipment');
const hexRouter = require('./hex');
const userRouter = require('./user');
const roleRouter = require('./role');
const menuRouter = require('./menu');
const notifyRouter = require('./notify');

function setupRoutes(app) {
  const router = new Router();

  // 健康检查
  router.get('/health', (ctx) => {
    ctx.body = {
      code: 200,
      message: 'OK',
      data: { status: 'healthy', timestamp: Date.now() }
    };
  });

  // 注册各模块路由
  app.use(authRouter.routes());
  app.use(authRouter.allowedMethods());

  app.use(heroRouter.routes());
  app.use(heroRouter.allowedMethods());

  app.use(equipmentRouter.routes());
  app.use(equipmentRouter.allowedMethods());

  app.use(hexRouter.routes());
  app.use(hexRouter.allowedMethods());

  app.use(userRouter.routes());
  app.use(userRouter.allowedMethods());

  app.use(roleRouter.routes());
  app.use(roleRouter.allowedMethods());

  app.use(menuRouter.routes());
  app.use(menuRouter.allowedMethods());

  // 通知路由（钉钉机器人）
  app.use(notifyRouter.routes());
  app.use(notifyRouter.allowedMethods());

  // 健康检查路由
  app.use(router.routes());
  app.use(router.allowedMethods());
}

module.exports = setupRoutes;
