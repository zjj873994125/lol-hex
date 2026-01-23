const Router = require('koa-router');
const RoleController = require('../controllers/role');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/roles'
});

// 获取所有角色（不分页，用于下拉选择）- 必须在 /:id 之前
router.get('/all', authMiddleware, adminMiddleware, RoleController.getAll);

// 获取角色列表（需要管理员权限）
router.get('/', authMiddleware, adminMiddleware, RoleController.getList);

// 获取角色详情（需要管理员权限）
router.get('/:id', authMiddleware, adminMiddleware, RoleController.getDetail);

// 获取角色的菜单（需要管理员权限）
router.get('/:id/menus', authMiddleware, adminMiddleware, RoleController.getMenus);

// 创建角色（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, RoleController.create);

// 更新角色（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, RoleController.update);

// 删除角色（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, RoleController.delete);

// 更新角色菜单（需要管理员权限）
router.put('/:id/menus', authMiddleware, adminMiddleware, RoleController.updateMenus);

module.exports = router;
