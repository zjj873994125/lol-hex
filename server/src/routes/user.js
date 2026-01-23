const Router = require('koa-router');
const UserController = require('../controllers/user');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/users'
});

// 获取用户列表（需要管理员权限）
router.get('/', authMiddleware, adminMiddleware, UserController.getList);

// 获取用户详情（需要管理员权限）
router.get('/:id', authMiddleware, adminMiddleware, UserController.getDetail);

// 创建用户（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, UserController.create);

// 更新用户（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, UserController.update);

// 删除用户（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, UserController.delete);

// 更新用户状态（需要管理员权限）
router.put('/:id/status', authMiddleware, adminMiddleware, UserController.updateStatus);

// 重置用户密码（需要管理员权限）
router.put('/:id/resetPassword', authMiddleware, adminMiddleware, UserController.resetPassword);

module.exports = router;
