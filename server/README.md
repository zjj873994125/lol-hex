# 海克斯大乱斗后端服务

基于 Koa + Sequelize + MySQL 的后端 API 服务，提供英雄、装备、海克斯数据的 CRUD 管理功能，以及完整的 RBAC 权限管理系统。

## 功能特性

### 业务功能
- **英雄管理**：英雄的增删改查，支持推荐装备和海克斯配置
- **装备管理**：装备的增删改查，支持类型分类
- **海克斯管理**：海克斯的增删改查，支持层级分类
- **用户认证**：登录、注册、JWT Token 验证

### 系统功能
- **RBAC 权限系统**：用户-角色-菜单三级权限控制
- **角色管理**：角色的增删改查，菜单权限分配
- **菜单管理**：菜单的增删改查，支持树形结构
- **用户管理**：用户的增删改查，状态管理，密码重置

## 技术栈

- **框架**：Koa 2.x
- **数据库 ORM**：Sequelize 6.x
- **数据库**：MySQL 8.x
- **认证**：JWT (jsonwebtoken)
- **密码加密**：bcryptjs
- **CORS**：koa-cors
- **开发工具**：nodemon

## 目录结构

```
server/
├── src/
│   ├── app.js              # 应用入口
│   ├── config/
│   │   └── database.js     # 数据库配置
│   ├── models/             # 数据模型
│   │   ├── index.js        # 模型关联定义
│   │   ├── User.js         # 用户模型
│   │   ├── Role.js         # 角色模型
│   │   ├── Menu.js         # 菜单模型
│   │   ├── Hero.js         # 英雄模型
│   │   ├── Equipment.js    # 装备模型
│   │   ├── Hex.js          # 海克斯模型
│   │   ├── HeroEquipment.js # 英雄装备关联
│   │   └── HeroHex.js      # 英雄海克斯关联
│   ├── controllers/        # 控制器
│   │   ├── auth.js         # 认证控制器
│   │   ├── hero.js         # 英雄控制器
│   │   ├── equipment.js    # 装备控制器
│   │   ├── hex.js          # 海克斯控制器
│   │   ├── user.js         # 用户控制器
│   │   ├── role.js         # 角色控制器
│   │   └── menu.js         # 菜单控制器
│   ├── routes/             # 路由
│   │   ├── index.js        # 路由入口
│   │   ├── auth.js         # 认证路由
│   │   ├── hero.js         # 英雄路由
│   │   ├── equipment.js    # 装备路由
│   │   ├── hex.js          # 海克斯路由
│   │   ├── user.js         # 用户路由
│   │   ├── role.js         # 角色路由
│   │   └── menu.js         # 菜单路由
│   ├── middleware/         # 中间件
│   │   ├── auth.js         # JWT 认证中间件
│   │   ├── rbac.js         # 权限检查中间件
│   │   └── errorHandler.js # 错误处理中间件
│   ├── utils/              # 工具类
│   │   ├── jwt.js          # JWT 工具
│   │   └── response.js     # 统一响应格式
│   └── scripts/            # 脚本
│       ├── createDatabase.js # 创建数据库
│       ├── migrate.js      # 数据库迁移
│       └── seed.js         # 初始数据
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── package.json
└── README.md
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并修改数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lolhaikesisql
PORT=3000
```

### 3. 创建数据库

```bash
npm run db:create
```

### 4. 数据库迁移

```bash
npm run db:migrate
```

### 5. 填充初始数据（可选）

```bash
npm run db:seed
```

这将创建：
- 超级管理员账号：`admin` / `admin123`
- 示例角色和菜单
- 示例英雄、装备、海克斯数据

### 6. 启动服务

```bash
# 开发模式（使用 nodemon，自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 文档

### 认证相关

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 用户登录 | 公开 |
| POST | `/api/auth/register` | 用户注册 | 公开 |
| GET | `/api/auth/userInfo` | 获取当前用户信息 | 需登录 |

### 英雄管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/heroes` | 获取英雄列表 | 公开 |
| GET | `/api/heroes/:id` | 获取英雄详情 | 公开 |
| POST | `/api/heroes` | 创建英雄 | 管理员 |
| PUT | `/api/heroes/:id` | 更新英雄 | 管理员 |
| DELETE | `/api/heroes/:id` | 删除英雄 | 管理员 |
| PUT | `/api/heroes/:id/equipments` | 更新英雄推荐装备 | 管理员 |
| PUT | `/api/heroes/:id/hexes` | 更新英雄推荐海克斯 | 管理员 |

### 装备管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/equipments` | 获取装备列表 | 公开 |
| GET | `/api/equipments/:id` | 获取装备详情 | 公开 |
| POST | `/api/equipments` | 创建装备 | 管理员 |
| PUT | `/api/equipments/:id` | 更新装备 | 管理员 |
| DELETE | `/api/equipments/:id` | 删除装备 | 管理员 |

### 海克斯管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/hexes` | 获取海克斯列表 | 公开 |
| GET | `/api/hexes/:id` | 获取海克斯详情 | 公开 |
| POST | `/api/hexes` | 创建海克斯 | 管理员 |
| PUT | `/api/hexes/:id` | 更新海克斯 | 管理员 |
| DELETE | `/api/hexes/:id` | 删除海克斯 | 管理员 |

### 用户管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/users` | 获取用户列表 | 管理员 |
| GET | `/api/users/:id` | 获取用户详情 | 管理员 |
| POST | `/api/users` | 创建用户 | 管理员 |
| PUT | `/api/users/:id` | 更新用户 | 管理员 |
| DELETE | `/api/users/:id` | 删除用户 | 管理员 |
| PUT | `/api/users/:id/status` | 更新用户状态 | 管理员 |
| PUT | `/api/users/:id/resetPassword` | 重置用户密码 | 管理员 |

### 角色管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/roles/all` | 获取所有角色（不分页） | 管理员 |
| GET | `/api/roles` | 获取角色列表 | 管理员 |
| GET | `/api/roles/:id` | 获取角色详情 | 管理员 |
| GET | `/api/roles/:id/menus` | 获取角色菜单 | 管理员 |
| POST | `/api/roles` | 创建角色 | 管理员 |
| PUT | `/api/roles/:id` | 更新角色 | 管理员 |
| DELETE | `/api/roles/:id` | 删除角色 | 管理员 |
| PUT | `/api/roles/:id/menus` | 更新角色菜单 | 管理员 |

### 菜单管理

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/menus/tree` | 获取菜单树 | 管理员 |
| GET | `/api/menus` | 获取菜单列表 | 管理员 |
| GET | `/api/menus/:id` | 获取菜单详情 | 管理员 |
| POST | `/api/menus` | 创建菜单 | 管理员 |
| PUT | `/api/menus/:id` | 更新菜单 | 管理员 |
| DELETE | `/api/menus/:id` | 删除菜单 | 管理员 |

## 权限说明

### 权限类型

1. **公开访问**：游客可访问，无需登录
2. **需登录**：需要有效的 JWT Token
3. **管理员权限**：需要管理员角色（roleCode = 'admin'）

### Token 使用

在请求头中添加 Authorization：

```
Authorization: Bearer <your_token>
```

## 数据模型

### 用户 (User)
- `id`: 主键
- `username`: 用户名（唯一）
- `password`: 密码（bcrypt 加密）
- `email`: 邮箱
- `roleId`: 角色ID（外键）
- `status`: 状态（1-启用，0-禁用）

### 角色 (Role)
- `id`: 主键
- `name`: 角色名称
- `code`: 角色代码（唯一）
- `description`: 描述

### 菜单 (Menu)
- `id`: 主键
- `parentId`: 父菜单ID
- `name`: 菜单名称
- `path`: 路由路径
- `icon`: 图标
- `type`: 类型（1-目录，2-菜单，3-按钮）
- `code`: 权限代码
- `sort`: 排序
- `status`: 状态

### 英雄 (Hero)
- `id`: 主键
- `name`: 英雄名称
- `title`: 英雄称号
- `nickname`: 别称
- `avatar`: 头像URL
- `tags`: 标签（JSON 数组）
- `description`: 描述
- `status`: 状态

### 装备 (Equipment)
- `id`: 主键
- `name`: 装备名称
- `icon`: 图标URL
- `price`: 价格
- `type`: 类型（1-进攻，2-防御，3-移动，4-法术）
- `description`: 描述
- `status`: 状态

### 海克斯 (Hex)
- `id`: 主键
- `name`: 海克斯名称
- `icon`: 图标URL
- `tier`: 层级（1-初级，2-高级，3-珍贵）
- `description`: 描述
- `status`: 状态

## 响应格式

所有 API 响应遵循统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1234567890
}
```

### 状态码

- `200`: 成功
- `400`: 参数错误
- `401`: 未授权
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器错误

## 健康检查

```
GET /health
```

响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "status": "healthy",
    "timestamp": 1234567890
  }
}
```
