import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  ApiOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/store/user'

const { Header, Content, Footer } = Layout

const BasicLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 检查是否是管理员
  const isAdmin = user?.roles?.some((r: any) => r.code === 'admin')

  const userMenuItems = [
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

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/heroes',
      icon: <UserOutlined />,
      label: <Link to="/heroes">英雄</Link>,
    },
    {
      key: '/equipments',
      icon: <ApiOutlined />,
      label: <Link to="/equipments">装备</Link>,
    },
    {
      key: '/hexes',
      icon: <ThunderboltOutlined />,
      label: <Link to="/hexes">海克斯</Link>,
    },
  ]

  const selectedKeys = [location.pathname]

  return (
    <Layout className="min-h-screen">
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 50px',
        }}
      >
        <div className="demo-logo text-white text-xl font-bold mr-8">
          {import.meta.env.VITE_APP_TITLE}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        <div className="ml-auto">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer text-white hover:text-gray-200">
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Content className="p-6">
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        杰哥的推荐出装 ©{new Date().getFullYear()} Created by Ant Design
      </Footer>
    </Layout>
  )
}

export default BasicLayout
