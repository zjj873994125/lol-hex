import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { shouldUseMobileRoute } from '@/utils/device'
import MobileLayout from '@/mobile/layouts/MobileLayout'
import MobileHome from '@/mobile/pages/home/index'
import MobileHeroList from '@/mobile/pages/hero/index'
import MobileHeroDetail from '@/mobile/pages/hero/detail'
import MobileEquipmentList from '@/mobile/pages/equipment/index'
import MobileEquipmentDetail from '@/mobile/pages/equipment/detail'
import MobileHexList from '@/mobile/pages/hex/index'
import MobileHexDetail from '@/mobile/pages/hex/detail'

// 桌面端访问移动端路由时重定向回 PC 路由
const MobileRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  if (!shouldUseMobileRoute()) {
    // 移除 /m 前缀，跳转到对应的 PC 路由
    const pcPath = location.pathname.replace(/^\/m/, '') || '/'
    return <Navigate to={pcPath} replace />
  }

  return <>{children}</>
}

const MobileRouter = () => {
  return (
    <MobileRouteGuard>
      <Routes>
        <Route path="/" element={<MobileLayout />}>
          <Route index element={<MobileHome />} />
          <Route path="heroes" element={<MobileHeroList />} />
          <Route path="heroes/:id" element={<MobileHeroDetail />} />
          <Route path="equipments" element={<MobileEquipmentList />} />
          <Route path="equipments/:id" element={<MobileEquipmentDetail />} />
          <Route path="hexes" element={<MobileHexList />} />
          <Route path="hexes/:id" element={<MobileHexDetail />} />
          {/* 个人中心稍后添加 */}
          {/* <Route path="profile" element={<MobileProfile />} /> */}
        </Route>
      </Routes>
    </MobileRouteGuard>
  )
}

export default MobileRouter
