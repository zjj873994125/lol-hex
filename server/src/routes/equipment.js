const Router = require('koa-router');
const EquipmentController = require('../controllers/equipment');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/equipments'
});

// 获取装备列表（游客可访问）
router.get('/', optionalAuth, EquipmentController.getList);

// 获取装备详情（游客可访问）
router.get('/:id', optionalAuth, EquipmentController.getDetail);

// 创建装备（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, EquipmentController.create);

// 更新装备（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, EquipmentController.update);

// 删除装备（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, EquipmentController.delete);

module.exports = router;
