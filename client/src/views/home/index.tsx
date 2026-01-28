import { useEffect, useState, useRef } from 'react'
import { Row, Col, Card, Spin, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import HeroCard from '@/components/HeroCard'
import QuickMenuItem from '@/components/QuickMenuItem'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import type { Hero } from '@/types/hero'
import './home.css'

const Home = () => {
  const navigate = useNavigate()
  const [hotHeroes, setHotHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)
  const [heroesLoaded, setHeroesLoaded] = useState(false)

  // GSAP refs
  const pageRef = useRef<HTMLDivElement>(null)
  const menuCardRef = useRef<HTMLDivElement>(null)
  const heroesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHotHeroes()
  }, [])

  // 页面入场动画
  useEffect(() => {
    if (!pageRef.current) return

    // 先设置初始状态，避免闪烁
    gsap.set('.quick-menu-item', {
      y: 60,
      opacity: 0,
    })

    // 快捷菜单卡片入场 - 和英雄卡片一样从下往上
    gsap.to('.quick-menu-item', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'all',
    })
  }, [])

  // 英雄卡片加载完成后入场
  useEffect(() => {
    if (!loading && hotHeroes.length > 0 && heroesContainerRef.current) {
      gsap.fromTo('.hero-card-entrance',
        {
          y: 80,
          opacity: 0,
          scale: 0.9,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'back.out(1.2)',
          clearProps: 'all',
          onComplete: () => setHeroesLoaded(true),
        }
      )
    }
  }, [loading, hotHeroes.length])

  // 页面退出动画
  const handleNavigate = (path: string) => {
    const tl = gsap.timeline({
      onComplete: () => navigate(path),
    })

    tl.to('.quick-menu-item, .hero-card-entrance', {
      y: -30,
      opacity: 0,
      scale: 0.95,
      duration: 0.35,
      stagger: 0.05,
      ease: 'power2.in',
    })
  }

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
    <div className="home-page" ref={pageRef}>
      <PageHeader title="欢迎来到嚎哭深渊" />

      <Card className="quick-menus-card" bordered={false} ref={menuCardRef}>
        <Row gutter={[16, 16]}>
          {quickMenus.map((menu) => (
            <Col key={menu.path} xs={12} sm={12} md={6} lg={6}>
              <QuickMenuItem
                title={menu.title}
                description={menu.description}
                icon={menu.icon}
                color={menu.color}
                onClick={() => handleNavigate(menu.path)}
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="最新英雄" className="hot-heroes-card" bordered={false} ref={heroesContainerRef}>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : hotHeroes.length > 0 ? (
          <Row gutter={[16, 16]} align="stretch" justify="center">
            {hotHeroes.map((hero) => (
              <Col key={hero.id} xs={12} sm={8} md={7} lg={12} xl={6} xxl={3}>
                <div className="hero-card-entrance">
                  <HeroCard hero={hero} />
                </div>
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
