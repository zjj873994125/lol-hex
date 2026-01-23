const jwt = require('jsonwebtoken');

// JWT 密钥
const JWT_SECRET = 'lolhaikesi-secret-key-2024';
// JWT 过期时间（7天）
const JWT_EXPIRES_IN = '7d';

/**
 * JWT 工具类
 */
class JWTUtil {
  /**
   * 生成 Token
   * @param {Object} payload - 载荷数据
   * @returns {string} Token
   */
  static generate(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  /**
   * 验证 Token
   * @param {string} token - JWT Token
   * @returns {Object|null} 解码后的载荷，验证失败返回 null
   */
  static verify(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * 解码 Token（不验证）
   * @param {string} token - JWT Token
   * @returns {Object|null} 解码后的载荷
   */
  static decode(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtil;
