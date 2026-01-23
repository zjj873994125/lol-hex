/**
 * 统一响应格式
 */
class Response {
  /**
   * 成功响应
   * @param {*} data - 响应数据
   * @param {string} message - 响应消息
   * @param {number} code - 状态码
   */
  static success(data = null, message = 'success', code = 200) {
    return {
      code,
      message,
      data,
      timestamp: Date.now()
    };
  }

  /**
   * 失败响应
   * @param {string} message - 错误消息
   * @param {number} code - 状态码
   * @param {*} data - 响应数据
   */
  static error(message = 'error', code = 500, data = null) {
    return {
      code,
      message,
      data,
      timestamp: Date.now()
    };
  }

  /**
   * 参数错误响应
   */
  static paramError(message = '参数错误', data = null) {
    return this.error(message, 400, data);
  }

  /**
   * 未授权响应
   */
  static unauthorized(message = '未授权，请先登录', data = null) {
    return this.error(message, 401, data);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(message = '无权限访问', data = null) {
    return this.error(message, 403, data);
  }

  /**
   * 资源不存在响应
   */
  static notFound(message = '资源不存在', data = null) {
    return this.error(message, 404, data);
  }

  /**
   * 服务器错误响应
   */
  static serverError(message = '服务器内部错误', data = null) {
    return this.error(message, 500, data);
  }
}

module.exports = Response;
