const Router = require('koa-router');
const MenuController = require('../controllers/menu');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/menus'
});

// 获取菜单树（需要管理员权限）- 必须在 /:id 之前
router.get('/tree', authMiddleware, adminMiddleware, MenuController.getTree);

// 获取菜单列表（需要管理员权限）
router.get('/', authMiddleware, adminMiddleware, MenuController.getList);

// 获取菜单详情（需要管理员权限）
router.get('/:id', authMiddleware, adminMiddleware, MenuController.getDetail);

// 创建菜单（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, MenuController.create);

// 更新菜单（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, MenuController.update);

// 删除菜单（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, MenuController.delete);

module.exports = router;
