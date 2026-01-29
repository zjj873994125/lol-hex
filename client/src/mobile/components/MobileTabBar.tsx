import { useNavigate, useLocation } from 'react-router-dom'
import './MobileTabBar.css'

interface Tab {
  key: string
  label: string
  icon: string
  path: string
}

const tabs: Tab[] = [
  { key: 'home', label: '首页', icon: '🏠', path: '/m' },
  { key: 'heroes', label: '英雄', icon: '🧙', path: '/m/heroes' },
  { key: 'equipments', label: '装备', icon: '⚔️', path: '/m/equipments' },
  { key: 'hexes', label: '海克斯', icon: '⚡', path: '/m/hexes' },
]

const MobileTabBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 获取当前激活的 tab
  const getActiveKey = () => {
    const path = location.pathname
    if (path === '/m' || path === '/m/') return 'home'
    if (path.startsWith('/m/heroes')) return 'heroes'
    if (path.startsWith('/m/equipments')) return 'equipments'
    if (path.startsWith('/m/hexes')) return 'hexes'
    return 'home'
  }

  const handleTabClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="mobile-tab-bar">
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={`tab-item ${getActiveKey() === tab.key ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </div>
      ))}
    </div>
  )
}

export default MobileTabBar
