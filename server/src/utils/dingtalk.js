const crypto = require('crypto');

/**
 * 钉钉机器人通知工具类
 * 支持文本、链接、Markdown等消息类型
 */
class DingTalkRobot {
  constructor(webhook, secret) {
    this.webhook = webhook;
    this.secret = secret;
  }

  /**
   * 生成签名
   * @param {number} timestamp - 时间戳
   * @returns {string} 签名后的字符串
   */
  generateSignature(timestamp) {
    const stringToSign = `${timestamp}\n${this.secret}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(stringToSign);
    const signature = encodeURIComponent(hmac.digest('base64'));
    return signature;
  }

  /**
   * 发送消息到钉钉
   * @param {object} message - 消息对象
   * @returns {Promise<object>} 响应结果
   */
  async send(message) {
    const timestamp = Date.now();
    const sign = this.generateSignature(timestamp);
    const url = `${this.webhook}&timestamp=${timestamp}&sign=${sign}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.errcode === 0) {
        console.log('钉钉消息发送成功');
        return { success: true, data: result };
      } else {
        console.error('钉钉消息发送失败:', result.errmsg);
        return { success: false, error: result.errmsg };
      }
    } catch (error) {
      console.error('钉钉消息发送异常:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送文本消息
   * @param {string} content - 文本内容
   * @param {array<string>} atMobiles - @的手机号列表
   * @param {boolean} atAll - 是否@所有人
   * @returns {Promise<object>}
   */
  async sendText(content, atMobiles = [], atAll = false) {
    const message = {
      msgtype: 'text',
      text: {
        content,
      },
      at: {
        atMobiles,
        isAtAll: atAll,
      },
    };
    return this.send(message);
  }

  /**
   * 发送链接消息
   * @param {string} title - 标题
   * @param {string} text - 内容
   * @param {string} messageUrl - 跳转链接
   * @param {string} picUrl - 图片URL（可选）
   * @returns {Promise<object>}
   */
  async sendLink(title, text, messageUrl, picUrl = '') {
    const message = {
      msgtype: 'link',
      link: {
        title,
        text,
        messageUrl,
        picUrl,
      },
    };
    return this.send(message);
  }

  /**
   * 发送Markdown消息
   * @param {string} title - 标题
   * @param {string} text - Markdown内容
   * @param {array<string>} atMobiles - @的手机号列表
   * @param {boolean} atAll - 是否@所有人
   * @returns {Promise<object>}
   */
  async sendMarkdown(title, text, atMobiles = [], atAll = false) {
    const message = {
      msgtype: 'markdown',
      markdown: {
        title,
        text,
      },
      at: {
        atMobiles,
        isAtAll: atAll,
      },
    };
    return this.send(message);
  }

  /**
   * 发送代码发布通知
   * @param {object} params - 发布参数
   * @param {string} params.projectName - 项目名称
   * @param {string} params.environment - 环境（dev/test/prod）
   * @param {string} params.status - 状态（success/failed/start）
   * @param {string} params.version - 版本号
   * @param {string} params.deployer - 发布人
   * @param {string} params.error - 错误信息（失败时）
   * @returns {Promise<object>}
   */
  async sendDeployNotification(params) {
    const {
      projectName = '海克斯大乱斗',
      environment = 'prod',
      status = 'success',
      version = '',
      deployer = '系统',
      error = '',
      duration = '',
    } = params;

    const envMap = {
      dev: '开发环境',
      test: '测试环境',
      prod: '生产环境',
    };

    const statusMap = {
      success: { emoji: '✅', text: '发布成功', color: 'info' },
      failed: { emoji: '❌', text: '发布失败', color: 'warning' },
      start: { emoji: '🚀', text: '开始发布', color: 'comment' },
    };

    const statusInfo = statusMap[status] || statusMap.success;
    const envText = envMap[environment] || environment;

    let markdown = `### ${statusInfo.emoji} ${projectName} - ${statusInfo.text}\n\n`;
    markdown += `> **环境**: ${envText}\n`;
    markdown += `> **时间**: ${new Date().toLocaleString('zh-CN')}\n`;

    if (version) {
      markdown += `> **版本**: ${version}\n`;
    }

    if (deployer) {
      markdown += `> **操作人**: ${deployer}\n`;
    }

    if (duration) {
      markdown += `> **耗时**: ${duration}\n`;
    }

    if (status === 'failed' && error) {
      markdown += `\n> **错误信息**:\n> ${error}\n`;
    }

    if (status === 'failed') {
      markdown += '\n\n@请相关同学检查！';
    }

    return this.sendMarkdown(`${projectName} ${statusInfo.text}`, markdown, [], status === 'failed');
  }

  /**
   * 发告警通知
   * @param {object} params - 告警参数
   * @param {string} params.title - 告警标题
   * @param {string} params.content - 告警内容
   * @param {string} params.level - 告警级别（info/warning/error/critical）
   * @returns {Promise<object>}
   */
  async sendAlert(params) {
    const {
      title = '系统告警',
      content = '',
      level = 'warning',
    } = params;

    const levelMap = {
      info: { emoji: 'ℹ️', text: '信息' },
      warning: { emoji: '⚠️', text: '警告' },
      error: { emoji: '❌', text: '错误' },
      critical: { emoji: '🔥', text: '严重' },
    };

    const levelInfo = levelMap[level] || levelMap.warning;

    let markdown = `### ${levelInfo.emoji} ${title}\n\n`;
    markdown += `> **级别**: ${levelInfo.text}\n`;
    markdown += `> **时间**: ${new Date().toLocaleString('zh-CN')}\n`;
    markdown += `> **内容**: ${content}\n`;

    // 严重级别@所有人
    const atAll = level === 'critical' || level === 'error';
    if (atAll) {
      markdown += '\n\n@请立即处理！';
    }

    return this.sendMarkdown(title, markdown, [], atAll);
  }
}

// 创建默认实例
const defaultWebhook = process.env.DINGTALK_WEBHOOK || 'https://oapi.dingtalk.com/robot/send?access_token=e15092dc6020b27c7b85db68598328663a67cdf29c628a26955b61237a874050';
const defaultSecret = process.env.DINGTALK_SECRET || 'SECda2414d43883e28d6f3d35e1eaf8cfac221ca3dc971bc55bd167839ee54431a7';

const dingtalkRobot = new DingTalkRobot(defaultWebhook, defaultSecret);

module.exports = {
  DingTalkRobot,
  dingtalkRobot,
};
