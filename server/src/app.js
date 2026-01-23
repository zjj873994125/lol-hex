require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');

const { sequelize, testConnection } = require('./config/database');
const setupRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 错误处理中间件（最外层）
app.use(errorHandler);

// CORS 跨域
app.use(cors({
  origin: (ctx) => {
    // 允许所有来源，或者指定具体域名
    const allowedOrigins = ctx.get('Origin');
    return allowedOrigins || '*';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 预检请求缓存 24 小时
}));

// 请求体解析
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}));

// 响应时间中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// 日志中间件
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url} - ${new Date().toISOString()}`);
  await next();
  console.log(`Response: ${ctx.status} - ${ctx.body?.code || ''} ${ctx.body?.message || ''}`);
});

// 设置路由
setupRoutes(app);

// 404 处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    code: 404,
    message: 'Not Found',
    data: null,
    timestamp: Date.now()
  };
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型（开发环境）
    // await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
