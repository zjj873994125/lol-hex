import { Outlet } from 'react-router-dom'
import MobileTabBar from '@/mobile/components/MobileTabBar'
import '@/mobile/styles/rem.css'
import '@/mobile/styles/mobile.css'
import './MobileLayout.css'

interface MobileLayoutProps {
  hideTabBar?: boolean
}

const MobileLayout = ({ hideTabBar = false }: MobileLayoutProps) => {
  return (
    <div className="mobile-layout">
      <div className="mobile-content">
        <Outlet />
      </div>
      {!hideTabBar && <MobileTabBar />}
    </div>
  )
}

export default MobileLayout
