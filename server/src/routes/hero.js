const Router = require('koa-router');
const HeroController = require('../controllers/hero');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/rbac');

const router = new Router({
  prefix: '/api/heroes'
});

// 获取最新英雄（游客可访问）
router.get('/hot', optionalAuth, HeroController.getHotHeroes);

// 根据标签搜索英雄（游客可访问）
router.get('/search/tags', optionalAuth, HeroController.searchByTags);

// 获取英雄列表（游客可访问）
router.get('/list', optionalAuth, HeroController.getList);

// 获取英雄详情（游客可访问）
router.get('/:id', optionalAuth, HeroController.getDetail);

// 创建英雄（需要管理员权限）
router.post('/', authMiddleware, adminMiddleware, HeroController.create);

// 更新英雄（需要管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, HeroController.update);

// 删除英雄（需要管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, HeroController.delete);

// 更新英雄推荐装备（需要管理员权限）
router.put('/:id/equipments', authMiddleware, adminMiddleware, HeroController.updateEquipments);

// 更新英雄推荐海克斯（需要管理员权限）
router.put('/:id/hexes', authMiddleware, adminMiddleware, HeroController.updateHexes);

// ==================== 出装思路相关路由 ====================

// 获取英雄的出装思路列表（需要管理员权限）
router.get('/:id/builds', authMiddleware, adminMiddleware, HeroController.getBuilds);

// 创建出装思路（需要管理员权限）
router.post('/:id/builds', authMiddleware, adminMiddleware, HeroController.createBuild);

// 更新出装思路（需要管理员权限）
router.put('/:id/builds/:buildId', authMiddleware, adminMiddleware, HeroController.updateBuild);

// 删除出装思路（需要管理员权限）
router.delete('/:id/builds/:buildId', authMiddleware, adminMiddleware, HeroController.deleteBuild);

// 更新出装思路中的装备（需要管理员权限）
router.put('/:id/builds/:buildId/equipments', authMiddleware, adminMiddleware, HeroController.updateBuildEquipments);

module.exports = router;
