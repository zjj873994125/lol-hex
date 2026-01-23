const Router = require('koa-router');
const HexController = require('../controllers/hex');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/hexes'
});

// 获取海克斯列表（游客可访问）
router.get('/', optionalAuth, HexController.getList);

// 获取海克斯详情（游客可访问）
router.get('/:id', optionalAuth, HexController.getDetail);

// 创建海克斯（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, HexController.create);

// 更新海克斯（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, HexController.update);

// 删除海克斯（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, HexController.delete);

module.exports = router;
