import { useEffect, useState } from 'react'
import { Row, Col, Card, Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import HeroCard from '@/components/HeroCard'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import type { Hero } from '@/types/hero'
import './home.css'

const Home = () => {
  const navigate = useNavigate()
  const [hotHeroes, setHotHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotHeroes()
  }, [])

  const fetchHotHeroes = async () => {
    try {
      setLoading(true)
      const res = await heroApi.getHotHeroes(16)
      if (res.code === 200 || res.code === 0) {
        setHotHeroes(res.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch hot heroes:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickMenus = [
    {
      title: '英雄列表',
      description: '查看所有英雄信息',
      icon: '🦸',
      path: '/heroes',
      color: '#667eea',
    },
    {
      title: '装备列表',
      description: '查看所有装备信息',
      icon: '⚔️',
      path: '/equipments',
      color: '#ffa940',
    },
    {
      title: '海克斯列表',
      description: '查看所有海克斯科技',
      icon: '⚡',
      path: '/hexes',
      color: '#8b5cf6',
    },
    {
      title: '管理后台',
      description: '管理所有数据',
      icon: '⚙️',
      path: '/admin',
      color: '#06b6d4',
    },
  ]

  return (
    <div className="home-page">
      <PageHeader title="欢迎来到嚎哭深渊" />

      <Card className="quick-menus-card" bordered={false}>
        <Row gutter={[16, 16]}>
          {quickMenus.map((menu) => (
            <Col key={menu.path} xs={12} sm={12} md={6} lg={6}>
              <div
                className="quick-menu-item"
                onClick={() => navigate(menu.path)}
                style={{ '--menu-color': menu.color } as React.CSSProperties}
              >
                <div className="menu-icon">{menu.icon}</div>
                <div className="menu-title">{menu.title}</div>
                <div className="menu-description">{menu.description}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="最新英雄" className="hot-heroes-card" bordered={false}>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : hotHeroes.length > 0 ? (
          <Row gutter={[16, 16]} align="stretch">
            {hotHeroes.map((hero) => (
              <Col key={hero.id} xs={6} sm={4} md={3} lg={3} xl={3}>
                <HeroCard hero={hero} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>
    </div>
  )
}

export default Home
