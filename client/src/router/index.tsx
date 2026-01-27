import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import BasicLayout from '@/layouts/BasicLayout'
import AdminLayout from '@/layouts/AdminLayout'

// 懒加载页面组件
const Home = lazy(() => import('@/views/home/index'))
const HeroList = lazy(() => import('@/views/hero/HeroList'))
const HeroDetail = lazy(() => import('@/views/hero/HeroDetail'))
const EquipmentList = lazy(() => import('@/views/equipment/EquipmentList'))
const HexList = lazy(() => import('@/views/hex/HexList'))
const Profile = lazy(() => import('@/views/profile/index'))
const Login = lazy(() => import('@/views/login/index'))

// 管理页面
const HeroManage = lazy(() => import('@/views/admin/HeroManage'))
const EquipmentManage = lazy(() => import('@/views/admin/EquipmentManage'))
const HexManage = lazy(() => import('@/views/admin/HexManage'))
const UserManage = lazy(() => import('@/views/admin/UserManage'))
const RoleManage = lazy(() => import('@/views/admin/RoleManage'))
const MenuManage = lazy(() => import('@/views/admin/MenuManage'))

// 检查是否登录
const isAuthenticated = () => {
  const token = localStorage.getItem('hex_token')
  return !!token && token !== 'null' && token !== 'undefined'
}

// 检查是否是管理员
const isAdmin = () => {
  const userStr = localStorage.getItem('hex_user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    return user.role?.code === 'admin' || user.role?.code === 'content_admin'
  } catch {
    return false
  }
}

// 检查是否有特定权限
const hasPermission = (permission: string) => {
  const userStr = localStorage.getItem('hex_user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    return user.permissions?.includes(permission)
  } catch {
    return false
  }
}

// 公共路由组件（不需要登录）
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// 受保护的路由组件（需要登录）
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <BasicLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'heroes',
        element: <HeroList />,
      },
      {
        path: 'heroes/:id',
        element: <HeroDetail />,
      },
      {
        path: 'equipments',
        element: <EquipmentList />,
      },
      {
        path: 'hexes',
        element: <HexList />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/heroes" replace />,
      },
      {
        path: 'heroes',
        element: <HeroManage />,
      },
      {
        path: 'equipments',
        element: <EquipmentManage />,
      },
      {
        path: 'hexes',
        element: <HexManage />,
      },
      {
        path: 'users',
        element: <UserManage />,
      },
      {
        path: 'roles',
        element: <RoleManage />,
      },
      {
        path: 'menus',
        element: <MenuManage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={isAuthenticated() ? "/" : "/login"} replace />,
  },
])

export default router
