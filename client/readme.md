# 移动端适配方案

## 方案概述

采用**独立移动端路由/页面**方案，新增 `/m` 前缀的移动端路由，共享 API 和类型，独立页面组件。

---

## 目录结构设计

```
client/src/
├── mobile/                          # 移动端专用目录
│   ├── layouts/
│   │   └── MobileLayout.tsx         # 移动端布局（含顶部导航+底部TabBar）
│   ├── pages/
│   │   ├── home/
│   │   │   └── index.tsx            # 移动端首页
│   │   ├── hero/
│   │   │   ├── HeroList.tsx         # 移动端英雄列表
│   │   │   ├── HeroDetail.tsx       # 移动端英雄详情
│   │   │   └── components/
│   │   │       └── HeroCard.tsx     # 移动端英雄卡片
│   │   ├── equipment/
│   │   │   ├── EquipmentList.tsx
│   │   │   └── components/
│   │   │       └── EquipmentCard.tsx
│   │   ├── hex/
│   │   │   ├── HexList.tsx
│   │   │   └── components/
│   │   │       └── HexCard.tsx
│   │   └── profile/
│   │       └── index.tsx            # 移动端个人中心
│   ├── components/
│   │   ├── MobileHeader.tsx         # 顶部导航栏
│   │   ├── MobileTabBar.tsx         # 底部Tab导航
│   │   └── PullRefresh.tsx          # 下拉刷新组件
│   ├── hooks/
│   │   ├── useMobileRouter.ts
│   │   └── useInfiniteScroll.ts     # 无限滚动hook
│   └── styles/
│       └── mobile.scss              # 移动端全局样式
├── router/
│   ├── pc.tsx                       # PC端路由（现有）
│   ├── mobile.tsx                   # 移动端路由（新增）
│   └── index.tsx                    # 路由入口（设备检测）
├── utils/
│   └── device.ts                    # 设备检测工具
```

---

## 路由配置

### PC端路由（现有路由保持不变）
```
/                    → 首页
/heroes             → 英雄列表
/heroes/:id         → 英雄详情
/equipments        → 装备列表
/hexes             → 海克斯列表
/profile           → 个人中心
/login             → 登录页
/admin/*           → 管理后台
```

### 移动端路由
```
/m                    → 首页
/m/heroes            → 英雄列表
/m/heroes/:id        → 英雄详情
/m/equipments        → 装备列表
/m/hexes             → 海克斯列表
/m/profile           → 个人中心
```

### 设备检测与自动跳转
```typescript
// 访问 /heroes 时检测设备
// - PC端：正常显示
// - 移动端：重定向到 /m/heroes
```

---

## 移动端页面设计

### 底部 TabBar 导航

```
┌─────────────────────────────┐
│         移动端页面内容         │
│                             │
│                             │
├─────────────────────────────┤
│  🏠首页 │ 🧙英雄 │ 🗡️装备 │ 👤我的 │
└─────────────────────────────┘
```

### 页面布局规范

| 页面 | 移动端特性 |
|------|-----------|
| **首页** | 轮播图、快捷入口、热门英雄推荐 |
| **英雄列表** | 大卡片展示、一行2个、下拉刷新、上拉加载 |
| **英雄详情** | 顶部固定英雄头像+信息、可滚动详情区域、推荐出装横向滚动 |
| **装备列表** | 网格展示、一行3-4个 |
| **海克斯列表** | 按等级分组、卡片展示 |
| **个人中心** | 头部个人信息、设置列表 |

---

## API 复用

移动端复用现有的 API，无需改动后端：

```typescript
// 现有 API（复用）
import { heroApi } from '@/api/hero'
import { equipmentApi } from '@/api/equipment'
import { hexApi } from '@/api/hex'
import { authApi } from '@/api/auth'
```

---

## 移动端特性

| 特性 | 说明 | 优先级 |
|------|------|--------|
| 下拉刷新 | 下拉刷新数据列表 | P0 |
| 上拉加载 | 滚动到底部加载更多 | P0 |
| 页面过渡 | 路由切换动画效果 | P1 |
| 返回顶部 | 长列表快速返回顶部 | P1 |
| 图片懒加载 | 优化加载性能 | P2 |
| 虚拟列表 | 大数据量优化 | P2 |
| 离线缓存 | PWA支持 | P3 |

---

## 实施步骤

### 第一阶段：基础框架
- [ ] 创建 mobile 目录结构
- [ ] 实现设备检测工具 `utils/device.ts`
- [ ] 创建移动端路由 `router/mobile.tsx`
- [ ] 实现路由入口设备检测 `router/index.tsx`
- [ ] 创建 MobileLayout 布局组件
- [ ] 创建底部 TabBar 组件

### 第二阶段：核心页面
- [ ] 移动端首页
- [ ] 移动端英雄列表（卡片布局+下拉刷新）
- [ ] 移动端英雄详情
- [ ] 移动端装备列表
- [ ] 移动端海克斯列表
- [ ] 移动端个人中心

### 第三阶段：移动端特性
- [ ] 下拉刷新组件
- [ ] 上拉加载更多 hook
- [ ] 页面过渡动画
- [ ] 返回顶部按钮

### 第四阶段：优化
- [ ] 图片懒加载
- [ ] 虚拟列表（数据量大时）
- [ ] 性能优化

---

## 技术栈

- **路由**: React Router v6
- **UI组件**: Ant Design Mobile (可选) 或 自定义组件
- **样式**: SCSS + CSS Modules
- **状态管理**: Zustand (复用现有)
- **API请求**: Axios (复用现有)
- **下拉刷新**: react-pullload 或 自定义实现
