import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { shouldUseMobileRoute } from '@/utils/device'
import BasicLayout from '@/layouts/BasicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import { Spin } from 'antd'
import './router.css'

// 懒加载页面组件
const Home = lazy(() => import('@/views/home/index'))
const HeroList = lazy(() => import('@/views/hero/HeroList'))
const HeroDetail = lazy(() => import('@/views/hero/HeroDetail'))
const EquipmentList = lazy(() => import('@/views/equipment/EquipmentList'))
const HexList = lazy(() => import('@/views/hex/HexList'))
const Profile = lazy(() => import('@/views/profile/index'))
const Login = lazy(() => import('@/views/login/index'))
const MobileRouter = lazy(() => import('@/router/mobile'))

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

// 路由重定向检测组件
const RouteRedirect = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  // 移动端访问 PC 路由时重定向到移动端路由
  if (shouldUseMobileRoute() && !location.pathname.startsWith('/m')) {
    const mobilePath = '/m' + (location.pathname === '/' ? '' : location.pathname)
    return <Navigate to={mobilePath} replace />
  }

  return <>{children}</>
}

const RouterSetup = () => {
  return (
    <Suspense fallback={<div className="router-loading"><Spin size="large" /> loading...</div>}>
      <Routes>
        {/* 移动端路由 */}
        <Route path="/m/*" element={<MobileRouter />} />

        {/* PC端登录页 */}
        <Route path="/login" element={
          <RouteRedirect>
            <PublicRoute><Login /></PublicRoute>
          </RouteRedirect>
        } />

        {/* PC端主路由 */}
        <Route path="/" element={
          <RouteRedirect>
            <ProtectedRoute>
              <BasicLayout />
            </ProtectedRoute>
          </RouteRedirect>
        }>
          <Route index element={<Home />} />
          <Route path="heroes" element={<HeroList />} />
          <Route path="heroes/:id" element={<HeroDetail />} />
          <Route path="equipments" element={<EquipmentList />} />
          <Route path="hexes" element={<HexList />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* PC端管理路由 */}
        <Route path="/admin" element={
          <RouteRedirect>
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          </RouteRedirect>
        }>
          <Route index element={<Navigate to="/admin/heroes" replace />} />
          <Route path="heroes" element={<HeroManage />} />
          <Route path="equipments" element={<EquipmentManage />} />
          <Route path="hexes" element={<HexManage />} />
          <Route path="users" element={<UserManage />} />
          <Route path="roles" element={<RoleManage />} />
          <Route path="menus" element={<MenuManage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default RouterSetup
