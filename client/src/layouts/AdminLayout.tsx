import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd'
import {
  UserOutlined,
  IeOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/index'
import { useMemo } from 'react'

const { Header, Sider, Content } = Layout

// 管理后台菜单配置
const menuConfig = [
  {
    key: '/admin/heroes',
    icon: <UserOutlined />,
    label: <Link to="/admin/heroes">英雄管理</Link>,
  },
  {
    key: '/admin/equipments',
    icon: <IeOutlined />,
    label: <Link to="/admin/equipments">装备管理</Link>,
  },
  {
    key: '/admin/hexes',
    icon: <ThunderboltOutlined />,
    label: <Link to="/admin/hexes">海克斯管理</Link>,
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: <Link to="/admin/users">用户管理</Link>,
  },
  {
    key: '/admin/roles',
    icon: <SafetyOutlined />,
    label: <Link to="/admin/roles">角色管理</Link>,
  },
  {
    key: '/admin/menus',
    icon: <AppstoreOutlined />,
    label: <Link to="/admin/menus">菜单管理</Link>,
  },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUserStore()
  const { collapsed, setCollapsed } = useAppStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 当前选中的菜单
  const selectedKeys = useMemo(() => {
    const path = location.pathname
    // 精确匹配或前缀匹配
    if (menuConfig.some(m => m.key === path)) {
      return [path]
    }
    // 查找父级菜单
    for (const menu of menuConfig) {
      if (path.startsWith(menu.key + '/')) {
        return [menu.key]
      }
    }
    return []
  }, [location.pathname])

  // 菜单项（折叠时不显示文字）
  const sideMenuItems = useMemo(() => {
    return menuConfig.map(item => ({
      key: item.key,
      icon: item.icon,
      label: !collapsed ? item.label : item.key,
    }))
  }, [collapsed])

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  // 回到首页
  const goHome = () => {
    navigate('/')
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        width={200}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          
          onClick={goHome}
        >
          {!collapsed && (
             <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}> 
             海克斯管理后台
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={sideMenuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48 }}
          />
          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{user?.username || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
