import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Avatar, Dropdown, theme } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  ApiOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/store/user'
import backgroundImg from '@/assets/background.jpg'
import './BasicLayout.css'

const { Header, Content, Footer } = Layout

const BasicLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 检查是否是管理员
  const isAdmin = user?.roles?.some((r: any) => r.code === 'admin')

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    ...(isAdmin ? [{
      key: 'admin',
      icon: <AppstoreOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin'),
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const navItems = [
    { path: '/', label: '首页', icon: <HomeOutlined /> },
    { path: '/heroes', label: '英雄', icon: <CrownOutlined /> },
    { path: '/equipments', label: '装备', icon: <ApiOutlined /> },
    { path: '/hexes', label: '海克斯', icon: <ThunderboltOutlined /> },
  ]

  return (
    <Layout className="min-h-screen basic-layout">
      <Header className="custom-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">{import.meta.env.VITE_APP_TITLE}</span>
          </div>
          <nav className="nav-menu">
            {navItems.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </nav>
          <div className="user-section">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} className="user-avatar" />
                <span className="user-name">{user?.username || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Content className="p-6 content-area">
        <div className="flex">
          {/* 左侧留白区 */}
          <div className="w-1/6 bg-gray-100 min-h-[calc(100vh-200px)] rounded-l-lg" />

          {/* 中间内容区 */}
          <div className="w-2/3 bg-white">
            <div
              style={{
                padding: '24px 354px',
                minHeight: 'calc(100vh - 74px)',
              }}
            >
              <Outlet />
            </div>
          </div>

          {/* 右侧留白区 */}
          <div className="w-1/6 bg-gray-100 min-h-[calc(100vh-200px)] rounded-r-lg" />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', backgroundColor: '#B5B5B5', height: '30px', lineHeight: '30px', padding: '0', color: '#fff' }}>
        杰哥的推荐出装 ©{new Date().getFullYear()} Created with ❤️
      </Footer>
    </Layout>
  )
}

export default BasicLayout
