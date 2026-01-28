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
import { authApi } from '@/api/auth'
import { useMemo, useEffect, useState } from 'react'

const { Header, Sider, Content } = Layout

// 菜单配置（所有可用的菜单项）
const allMenus = [
  {
    key: '/admin/heroes',
    code: 'hero:list',
    icon: <UserOutlined />,
    label: '英雄管理',
    path: '/admin/heroes',
  },
  {
    key: '/admin/equipments',
    code: 'equipment:list',
    icon: <IeOutlined />,
    label: '装备管理',
    path: '/admin/equipments',
  },
  {
    key: '/admin/hexes',
    code: 'hex:list',
    icon: <ThunderboltOutlined />,
    label: '海克斯管理',
    path: '/admin/hexes',
  },
  {
    key: '/admin/users',
    code: 'user:list',
    icon: <TeamOutlined />,
    label: '用户管理',
    path: '/admin/users',
  },
  {
    key: '/admin/roles',
    code: 'role:list',
    icon: <SafetyOutlined />,
    label: '角色管理',
    path: '/admin/roles',
  },
  {
    key: '/admin/menus',
    code: 'menu:list',
    icon: <AppstoreOutlined />,
    label: '菜单管理',
    path: '/admin/menus',
  },
]

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, setUser } = useUserStore()
  const { collapsed, setCollapsed } = useAppStore()
  const [userMenus, setUserMenus] = useState(allMenus)
  const [loading, setLoading] = useState(true)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 获取用户菜单权限
  useEffect(() => {
    const fetchUserMenus = async () => {
      try {
        const res = await authApi.getUserInfo()
        if (res.code === 200 || res.code === 0) {
          const { permissions, role } = res.data
          // 更新用户信息到 store 和 localStorage
          const updatedUser = { ...user, permissions, role }
          setUser(updatedUser)
          localStorage.setItem('hex_user', JSON.stringify(updatedUser))

          // 根据权限过滤菜单
          if (permissions && permissions.length > 0) {
            const filteredMenus = allMenus.filter(menu =>
              permissions.includes(menu.code)
            )
            setUserMenus(filteredMenus)
          } else if (role?.code) {
            // 如果没有权限信息，根据角色判断
            if (role.code === 'content_admin') {
              // 内容管理员只能看英雄、装备、海克斯
              setUserMenus(allMenus.filter(m =>
                ['hero:list', 'equipment:list', 'hex:list'].includes(m.code)
              ))
            } else if (role.code === 'admin') {
              setUserMenus(allMenus)
            } else {
              setUserMenus([])
            }
          }
        }
      } catch (error) {
        console.error('获取用户菜单失败:', error)
      } finally {
        setLoading(false)
      }
    }

    // 检查本地是否有权限信息
    if (user?.permissions && user.permissions.length > 0) {
      const filteredMenus = allMenus.filter(menu =>
        user.permissions.includes(menu.code)
      )
      setUserMenus(filteredMenus)
      setLoading(false)
    } else if (user?.role?.code === 'content_admin') {
      setUserMenus(allMenus.filter(m =>
        ['hero:list', 'equipment:list', 'hex:list'].includes(m.code)
      ))
      setLoading(false)
    } else if (user?.role?.code === 'admin') {
      setUserMenus(allMenus)
      setLoading(false)
    } else if (user) {
      // 有用户但没有权限信息，去获取
      fetchUserMenus()
    } else {
      setLoading(false)
    }
  }, [])

  // 当前选中的菜单
  const selectedKeys = useMemo(() => {
    const path = location.pathname
    if (userMenus.some(m => m.key === path)) {
      return [path]
    }
    for (const menu of userMenus) {
      if (path.startsWith(menu.key + '/')) {
        return [menu.key]
      }
    }
    return []
  }, [location.pathname, userMenus])

  // 菜单项
  const sideMenuItems = useMemo(() => {
    return userMenus.map(item => ({
      key: item.key,
      icon: item.icon,
      label: <Link to={item.path}>{item.label}</Link>,
    }))
  }, [userMenus])

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

  // 如果没有菜单权限，显示提示
  if (!loading && userMenus.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>您没有管理后台权限</p>
          <Button type="link" onClick={goHome}>返回首页</Button>
        </div>
      </div>
    )
  }

  return (
    <Layout className="min-h-screen" style={{ cursor: 'url("@/assets/cursor2.png") 0 0, auto' }}>
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
                <Avatar src={user?.avatar || ''} style={{ marginRight: '8px' }}/>
                <span>{user?.username || '管理员'}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  ({user?.role?.name || '未知角色'})
                </span>
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
