const Router = require('koa-router');
const AuthController = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth');
const { loadUserPermissions } = require('../middleware/rbac');
const db = require('../models');

const router = new Router({
  prefix: '/api/auth'
});

// 登录（不需要认证）
router.post('/login', AuthController.login);

// 注册（不需要认证）
router.post('/register', AuthController.register);

// 获取当前用户信息（需要认证）
router.get('/userInfo', authMiddleware, loadUserPermissions(db.User), AuthController.getUserInfo);

module.exports = router;
