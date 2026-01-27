const Router = require('koa-router');
const notifyController = require('../controllers/notify');

const notifyRouter = new Router({
  prefix: '/api/notify',
});

/**
 * @api {post} /api/notify/text 发送文本消息
 * @apiGroup Notify
 * @apiParam {String} content 消息内容
 * @apiParam {Array} atMobiles @的手机号列表
 * @apiParam {Boolean} atAll 是否@所有人
 */
notifyRouter.post('/text', notifyController.sendText);

/**
 * @api {post} /api/notify/markdown 发送Markdown消息
 * @apiGroup Notify
 * @apiParam {String} title 标题
 * @apiParam {String} text Markdown内容
 * @apiParam {Array} atMobiles @的手机号列表
 * @apiParam {Boolean} atAll 是否@所有人
 */
notifyRouter.post('/markdown', notifyController.sendMarkdown);

/**
 * @api {post} /api/notify/deploy 发送代码发布通知
 * @apiGroup Notify
 * @apiParam {String} projectName 项目名称
 * @apiParam {String} environment 环境（dev/test/prod）
 * @apiParam {String} status 状态（success/failed/start）
 * @apiParam {String} version 版本号
 * @apiParam {String} deployer 发布人
 * @apiParam {String} error 错误信息
 * @apiParam {String} duration 耗时
 */
notifyRouter.post('/deploy', notifyController.sendDeploy);

/**
 * @api {post} /api/notify/alert 发送告警通知
 * @apiGroup Notify
 * @apiParam {String} title 告警标题
 * @apiParam {String} content 告警内容
 * @apiParam {String} level 告警级别（info/warning/error/critical）
 */
notifyRouter.post('/alert', notifyController.sendAlert);

/**
 * @api {post} /api/notify/test 测试连接
 * @apiGroup Notify
 */
notifyRouter.post('/test', notifyController.test);

module.exports = notifyRouter;
