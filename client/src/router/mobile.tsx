import { Routes, Route } from 'react-router-dom'
import MobileLayout from '@/mobile/layouts/MobileLayout'
import MobileHome from '@/mobile/pages/home/index'
import MobileHeroList from '@/mobile/pages/hero/index'
import MobileHeroDetail from '@/mobile/pages/hero/detail'
import MobileEquipmentList from '@/mobile/pages/equipment/index'
import MobileEquipmentDetail from '@/mobile/pages/equipment/detail'
import MobileHexList from '@/mobile/pages/hex/index'
import MobileHexDetail from '@/mobile/pages/hex/detail'

const MobileRouter = () => {
  return (
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
  )
}

export default MobileRouter
