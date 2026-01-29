import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Tag } from 'antd'
import { StarFilled, ThunderboltOutlined, AppstoreOutlined } from '@ant-design/icons'
import MobileHeader from '@/mobile/components/MobileHeader'
import { heroApi } from '@/api/hero'
import type { Hero, HeroHex } from '@/types/hero'
import { HexTierColorMap } from '@/types/hex'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './detail.css'

const MobileHeroDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [hero, setHero] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchHeroDetail(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (!loading && hero && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.hero-avatar-container',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
        )
        gsap.fromTo('.hero-title',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2 }
        )
        gsap.fromTo('.hero-name',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.3 }
        )
        gsap.fromTo('.hero-tags-section',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.4 }
        )
        gsap.fromTo('.section-title',
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.15, delay: 0.5 }
        )
        gsap.fromTo('.build-item, .hex-tier-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, delay: 0.7 }
        )
      }, pageRef.current)

      return () => ctx.revert()
    }
  }, [loading, hero])

  const fetchHeroDetail = async (heroId: number) => {
    try {
      setLoading(true)
      const res = await heroApi.getDetail(heroId)
      if (res.code === 200 || res.code === 0) {
        setHero(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch hero detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return '#ff4d4f'
    if (priority === 2) return '#faad14'
    if (priority === 3) return '#52c41a'
    return '#d9d9d9'
  }

  const getTierName = (tier: number) => {
    if (tier === 1) return '棱彩'
    if (tier === 2) return '白银'
    if (tier === 3) return '黄金'
    return ''
  }

  const getTierLabelStyle = (tier: number) => {
    if (tier === 1) return { background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)' }
    if (tier === 2) return { background: 'linear-gradient(135deg, #a8a8a8 0%, #e0e0e0 100%)' }
    if (tier === 3) return { background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }
    return {}
  }

  if (loading) {
    return (
      <div className="mobile-page mobile-loading">
        <MobileHeader title="英雄详情" showBack />
        <Spin size="large" />
      </div>
    )
  }

  if (!hero) {
    return (
      <div className="mobile-page">
        <MobileHeader title="英雄详情" showBack />
        <Empty description="英雄不存在" className="mobile-empty" />
      </div>
    )
  }

  const equipmentBuilds = hero.equipmentBuilds || []
  const tierOrder = [1, 3, 2]
  const hexesByTier: Record<number, HeroHex[]> = { 1: [], 2: [], 3: [] }

  if (hero.recommendedHexes) {
    hero.recommendedHexes.forEach((heroHex: HeroHex) => {
      const tier = heroHex.hex?.tier || 1
      if (!hexesByTier[tier]) hexesByTier[tier] = []
      hexesByTier[tier].push(heroHex)
    })
    Object.keys(hexesByTier).forEach((key) => {
      hexesByTier[Number(key)]?.sort((a: HeroHex, b: HeroHex) => a.priority - b.priority)
    })
  }

  return (
    <div className="mobile-page hero-detail-page" ref={pageRef}>
      <MobileHeader title="英雄详情" showBack transparent />

      {/* 顶部背景 */}
      <div className="hero-detail-bg">
        <div className="hero-bg-glow" />
      </div>

      {/* 英雄头像区域 */}
      <div className="hero-avatar-section">
        <div className="hero-avatar-container">
          <img
            src={hero.avatar}
            alt={hero.name}
            className="hero-avatar-img"
          />
          <div className="hero-avatar-shine" />
        </div>
      </div>

      {/* 英雄信息 */}
      <div className="hero-info-section">
        <div className="hero-title">{hero.title}</div>
        <h1 className="hero-name">{hero.name}</h1>
        {hero.description && (
          <div className="hero-description">“{hero.description}”</div>
        )}

        {/* 属性标签 */}
        <div className="hero-tags-section">
          {hero.tags.map((tag) => (
            <Tag key={tag} className="hero-tag" style={{ borderColor: getRoleColor(tag) }}>
              {getRoleLabel(tag)}
            </Tag>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="hero-content-section">
        {/* 推荐出装 */}
        {equipmentBuilds.length > 0 && (
          <div className="content-block">
            <div className="section-title">
              <AppstoreOutlined />
              <span>推荐出装</span>
            </div>
            <div className="build-list">
              {equipmentBuilds.map((build, index) => (
                <div key={index} className="build-item">
                  <div className="build-label">{build.name}</div>
                  <div className="build-items">
                    {build.equipments?.map((heroEquip) => (
                      <div key={heroEquip.id} className="equip-icon-wrap">
                        <img
                          src={heroEquip.equipment?.icon}
                          alt={heroEquip.equipment?.name}
                          className="equip-icon"
                        />
                        <span
                          className="priority-badge"
                          style={{ background: getPriorityColor(heroEquip.priority) }}
                        >
                          {heroEquip.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推荐海克斯 */}
        {tierOrder.some((tier) => (hexesByTier[tier]?.length || 0) > 0) && (
          <div className="content-block">
            <div className="section-title">
              <ThunderboltOutlined />
              <span>推荐海克斯</span>
            </div>
            <div className="hex-list">
              {tierOrder.map((tier) => {
                const tierHexes = hexesByTier[tier] || []
                if (tierHexes.length === 0) return null

                return (
                  <div key={tier} className="hex-tier-item">
                    <div className="tier-label" style={getTierLabelStyle(tier)}>
                      {getTierName(tier)}
                    </div>
                    <div className="hex-items">
                      {tierHexes.map((heroHex: HeroHex) => (
                        <div key={heroHex.id} className="hex-icon-wrap">
                          <div
                            className="hex-icon-bg"
                            style={{ borderColor: HexTierColorMap[heroHex.hex?.tier || 1] }}
                          >
                            <img
                              src={heroHex.hex?.icon}
                              alt={heroHex.hex?.name}
                              className="hex-icon"
                            />
                          </div>
                          <span
                            className="priority-badge"
                            style={{ background: getPriorityColor(heroHex.priority) }}
                          >
                            {heroHex.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileHeroDetail
