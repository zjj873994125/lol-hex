const { dingtalkRobot } = require('../utils/dingtalk');
const response = require('../utils/response');

/**
 * 发送文本消息
 */
async function sendText(ctx) {
  const { content, atMobiles = [], atAll = false } = ctx.request.body;

  if (!content) {
    return response.error(ctx, '请输入消息内容');
  }

  const result = await dingtalkRobot.sendText(content, atMobiles, atAll);

  if (result.success) {
    return response.success(ctx, null, '发送成功');
  } else {
    return response.error(ctx, result.error || '发送失败');
  }
}

/**
 * 发送Markdown消息
 */
async function sendMarkdown(ctx) {
  const { title, text, atMobiles = [], atAll = false } = ctx.request.body;

  if (!title || !text) {
    return response.error(ctx, '请输入标题和内容');
  }

  const result = await dingtalkRobot.sendMarkdown(title, text, atMobiles, atAll);

  if (result.success) {
    return response.success(ctx, null, '发送成功');
  } else {
    return response.error(ctx, result.error || '发送失败');
  }
}

/**
 * 发送代码发布通知
 */
async function sendDeploy(ctx) {
  const {
    projectName = '海克斯大乱斗',
    environment = 'prod',
    status = 'success',
    version = '',
    deployer = '系统',
    error = '',
    duration = '',
  } = ctx.request.body;

  const result = await dingtalkRobot.sendDeployNotification({
    projectName,
    environment,
    status,
    version,
    deployer,
    error,
    duration,
  });

  if (result.success) {
    return response.success(ctx, null, '发送成功');
  } else {
    return response.error(ctx, result.error || '发送失败');
  }
}

/**
 * 发送告警通知
 */
async function sendAlert(ctx) {
  const { title = '系统告警', content = '', level = 'warning' } = ctx.request.body;

  if (!content) {
    return response.error(ctx, '请输入告警内容');
  }

  const result = await dingtalkRobot.sendAlert({
    title,
    content,
    level,
  });

  if (result.success) {
    return response.success(ctx, null, '发送成功');
  } else {
    return response.error(ctx, result.error || '发送失败');
  }
}

/**
 * 测试连接
 */
async function test(ctx) {
  const result = await dingtalkRobot.sendText('📢 钉钉机器人连接测试成功！');

  if (result.success) {
    return response.success(ctx, null, '连接正常');
  } else {
    return response.error(ctx, result.error || '连接失败');
  }
}

module.exports = {
  sendText,
  sendMarkdown,
  sendDeploy,
  sendAlert,
  test,
};
