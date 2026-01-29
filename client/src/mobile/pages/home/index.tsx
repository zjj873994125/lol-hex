import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty } from 'antd'
import { heroApi } from '@/api/hero'
import type { Hero } from '@/types/hero'
import HeroCard from '@/mobile/pages/hero/components/HeroCard'
import './home.css'

const MobileHome = () => {
  const navigate = useNavigate()
  const [hotHeroes, setHotHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)

  // GSAP refs
  const pageRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const heroesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHotHeroes()
  }, [])

  // 页面入场动画
  useEffect(() => {
    if (!pageRef.current) return

    const ctx = gsap.context(() => {
      // 横幅入场
      gsap.fromTo('.mobile-banner',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )

      // 快捷菜单入场
      gsap.set('.mobile-quick-menu', { y: 60, opacity: 0 })
      gsap.to('.mobile-quick-menu', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.2)',
        clearProps: 'all',
        delay: 0.2,
      })

      // 区块标题入场
      gsap.fromTo('.mobile-section-header',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.4 }
      )
    }, pageRef.current)

    return () => ctx.revert()
  }, [])

  // 英雄卡片加载完成后入场
  useEffect(() => {
    if (!loading && hotHeroes.length > 0 && heroesContainerRef.current) {
      gsap.fromTo('.mobile-hero-card-entrance',
        {
          y: 60,
          opacity: 0,
          scale: 0.9,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'back.out(1.2)',
          clearProps: 'all',
        }
      )
    }
  }, [loading, hotHeroes.length])

  // 页面退出动画
  const handleNavigate = (path: string) => {
    const tl = gsap.timeline({
      onComplete: () => navigate(path),
    })

    tl.to('.mobile-quick-menu, .mobile-hero-card-entrance', {
      y: -30,
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.in',
    })
  }

  const fetchHotHeroes = async () => {
    try {
      setLoading(true)
      const res = await heroApi.getHotHeroes(6)
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
      title: '英雄',
      icon: '🦸',
      color: '#667eea',
      path: '/m/heroes',
    },
    {
      title: '装备',
      icon: '⚔️',
      color: '#ffa940',
      path: '/m/equipments',
    },
    {
      title: '海克斯',
      icon: '⚡',
      color: '#8b5cf6',
      path: '/m/hexes',
    },
  ]

  return (
    <div className="mobile-page mobile-home" ref={pageRef}>
      {/* 欢迎横幅 */}
      <div className="mobile-banner" ref={bannerRef}>
        <h1 className="mobile-banner-title">欢迎来到嚎哭深渊</h1>
        <p className="mobile-banner-subtitle">海克斯大乱斗 - 英雄对决</p>
      </div>

      {/* 快捷入口 */}
      <div className="mobile-quick-menus">
        {quickMenus.map((menu) => (
          <div
            key={menu.path}
            className="mobile-quick-menu"
            onClick={() => handleNavigate(menu.path)}
            style={{ '--menu-color': menu.color } as React.CSSProperties}
          >
            <div className="quick-menu-icon">{menu.icon}</div>
            <div className="quick-menu-title">{menu.title}</div>
          </div>
        ))}
      </div>

      {/* 热门英雄 */}
      <div className="mobile-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">热门英雄</h2>
          <span className="mobile-section-more" onClick={() => handleNavigate('/m/heroes')}>
            更多 &gt;
          </span>
        </div>

        {loading ? (
          <div className="mobile-loading">
            <Spin size="large" />
          </div>
        ) : hotHeroes.length > 0 ? (
          <div className="mobile-grid-2" ref={heroesContainerRef}>
            {hotHeroes.map((hero) => (
              <div key={hero.id} className="mobile-hero-card-entrance">
                <HeroCard hero={hero} onClick={() => handleNavigate(`/m/heroes/${hero.id}`)} />
              </div>
            ))}
          </div>
        ) : (
          <Empty description="暂无数据" className="mobile-empty" />
        )}
      </div>
    </div>
  )
}

export default MobileHome
