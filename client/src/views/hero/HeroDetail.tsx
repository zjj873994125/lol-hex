import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Tag, Spin, Empty, Badge, Popover, Divider } from 'antd'
import { IeOutlined, ThunderboltOutlined, StarFilled, TrophyOutlined, RocketOutlined } from '@ant-design/icons'
import { gsap } from 'gsap'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import type { Hero, EquipmentBuild, BuildEquipment, HeroHex } from '@/types/hero'
import { HexTierColorMap } from '@/types/hex'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroDetail.css'

const HeroDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [hero, setHero] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)
  const [animationsPlayed, setAnimationsPlayed] = useState(false)

  // Refs for GSAP animations
  const bannerRef = useRef<HTMLDivElement>(null)
  const bannerBgRef = useRef<HTMLDivElement>(null)
  const bannerAvatarRef = useRef<HTMLDivElement>(null)
  const bannerInfoRef = useRef<HTMLDivElement>(null)
  const statsCardRef = useRef<HTMLDivElement>(null)
  const equipCardRef = useRef<HTMLDivElement>(null)
  const hexCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchHeroDetail(Number(id))
    }
  }, [id])

  // 页面入场动画
  useEffect(() => {
    if (!loading && hero && !animationsPlayed) {
      setAnimationsPlayed(true)
      playEntranceAnimation()
    }
  }, [loading, hero, animationsPlayed])

  const playEntranceAnimation = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 横幅背景缩放效果
    if (bannerBgRef.current) {
      gsap.fromTo(bannerBgRef.current,
        { scale: 1.3 },
        { scale: 1.1, duration: 1.5, ease: 'power2.out' }
      )
    }

    // 横幅内容淡入
    tl.fromTo(bannerAvatarRef.current,
      { y: -50, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
    )
    .fromTo(bannerInfoRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      '-=0.4'
    )
    // 标签依次出现
    .fromTo('.hero-tag-glow',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
      '-=0.2'
    )
    // 卡片一起进场
    .fromTo('.detail-card-entrance',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', clearProps: 'all' },
      '-=0.2'
    )
    // 装备图标交错入场
    .fromTo('.build-equip-icon',
      { scale: 0, rotation: -10 },
      { scale: 1, rotation: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)' },
      '-=0.2'
    )
    // 海克斯卡片交错入场
    .fromTo('.hex-card-item',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
      '-=0.2'
    )
  }

  // 横幅鼠标移动视差效果
  const handleBannerMouseMove = (e: React.MouseEvent) => {
    if (!bannerRef.current || !bannerAvatarRef.current) return

    const rect = bannerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    gsap.to(bannerAvatarRef.current, {
      x: x * 20,
      y: y * 20,
      rotationY: x * 10,
      rotationX: -y * 10,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

  const handleBannerMouseLeave = () => {
    if (!bannerAvatarRef.current) return
    gsap.to(bannerAvatarRef.current, {
      x: 0,
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 0.5,
      ease: 'power2.out',
    })
  }

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

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
      </div>
    )
  }

  if (!hero) {
    return <Empty description="英雄不存在" />
  }

  // 获取出装思路
  const equipmentBuilds = hero.equipmentBuilds || []

  // 统计总装备数
  const totalEquipmentsCount = equipmentBuilds.reduce(
    (sum, build) => sum + (build.equipments?.length || 0),
    0
  )

  // 按等级分组海克斯，并在组内按优先级排序 (棱彩1 > 黄金3 > 白银2)
  const tierOrder = [1, 3, 2] // 棱彩 > 黄金 > 白银
  const hexesByTier: Record<number, HeroHex[]> = {
    1: [],
    2: [],
    3: [],
  }

  if (hero.recommendedHexes) {
    hero.recommendedHexes.forEach((heroHex: HeroHex) => {
      const tier = heroHex.hex?.tier || 1
      if (!hexesByTier[tier]) {
        hexesByTier[tier] = []
      }
      hexesByTier[tier].push(heroHex)
    })
    // 每个等级内按优先级排序
    Object.keys(hexesByTier).forEach((key) => {
      hexesByTier[Number(key)]?.sort((a: HeroHex, b: HeroHex) => a.priority - b.priority)
    })
  }

  const getTierName = (tier: number) => {
    if (tier === 1) return '棱彩'
    if (tier === 2) return '白银'
    if (tier === 3) return '黄金'
    return ''
  }

  // 获取优先级颜色：1=红色，2=黄色，3=绿色
  const getPriorityColor = (priority: number) => {
    if (priority === 1) return '#ff4d4f' // 红色
    if (priority === 2) return '#faad14' // 黄色
    if (priority === 3) return '#52c41a' // 绿色
    return '#d9d9d9' // 默认灰色
  }

  return (
    <div className="hero-detail-page">
      {/* 英雄头部横幅 */}
      <div
        className="hero-banner"
        ref={bannerRef}
        onMouseMove={handleBannerMouseMove}
        onMouseLeave={handleBannerMouseLeave}
      >
        <div className="hero-banner-bg" ref={bannerBgRef} style={{ backgroundImage: `url(${hero.avatar})` }} />
        <div className="hero-banner-overlay" />
        <div className="hero-banner-content">
          <div className="hero-banner-avatar" ref={bannerAvatarRef}>
            <img src={hero.avatar} alt={hero.name} />
          </div>
          <div className="hero-banner-info" ref={bannerInfoRef}>
            <div className="hero-banner-title">{hero.title}</div>
            <h1 className="hero-banner-name">{hero.name}</h1>
            <div className="hero-banner-tags">
              {hero.tags.map((tag) => (
                <Tag key={tag} color={getRoleColor(tag)} className="hero-tag-glow">
                  {getRoleLabel(tag)}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title={hero.name}
        items={[{ title: '英雄', path: '/heroes' }]}
      />

      <Row gutter={[24, 24]} align="stretch">
        {/* 左侧：英雄属性卡片 */}
        <Col xs={24} lg={8}>
          <Card className="hero-stats-card detail-card-entrance" bordered={false} ref={statsCardRef}>
            <div className="hero-card-image-wrapper">
              <img src={hero.avatar} alt={hero.name} className="hero-card-image" />
            </div>
            <div className="stats-card-header">
              <StarFilled className="stats-icon" />
              <span>英雄属性</span>
            </div>
            <div className="hero-stats-grid">
              <div className="stat-item">
                <div className="stat-label">称号</div>
                <div className="stat-value">{hero.title}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">职业</div>
                <div className="stat-value stat-tags">
                  {hero.tags.map((tag) => (
                    <Tag key={tag} color={getRoleColor(tag)} className="stat-tag">
                      {getRoleLabel(tag)}
                    </Tag>
                  ))}
                </div>
              </div>
              <div className="stat-item stat-item-full">
                <div className="stat-label">出装思路数</div>
                <div className="stat-value stat-highlight">
                  <RocketOutlined /> {equipmentBuilds.length}
                </div>
              </div>
              <div className="stat-item stat-item-full">
                <div className="stat-label">推荐装备数</div>
                <div className="stat-value stat-highlight">
                  <IeOutlined /> {totalEquipmentsCount}
                </div>
              </div>
              <div className="stat-item stat-item-full">
                <div className="stat-label">推荐海克斯数</div>
                <div className="stat-value stat-highlight">
                  <ThunderboltOutlined /> {hero.recommendedHexes?.length || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧：推荐内容卡片 */}
        <Col xs={24} lg={16}>
          {/* 推荐装备 - 按出装思路分组 */}
          <Card className="recommend-card equipment-card detail-card-entrance" bordered={false} ref={equipCardRef}>
            <div className="recommend-card-header">
              <div className="recommend-header-icon equipment-icon">
                <IeOutlined />
              </div>
              <div className="recommend-header-text">
                <div className="recommend-header-title">出装思路</div>
                <div className="recommend-header-subtitle">Equipment Builds</div>
              </div>
              <div className="recommend-count-badge">
                {equipmentBuilds.length}
              </div>
            </div>

            {equipmentBuilds.length > 0 ? (
              <div className="build-list">
                {equipmentBuilds.map((build, index) => (
                  <div key={index} className="build-list-item">
                    <div className="build-list-name">{build.name}</div>
                    <div className="build-list-equipments">
                      {build.equipments?.map((heroEquip) => {
                        const content = (
                          <div className="popover-content">
                            <div className="popover-name">{heroEquip.equipment?.name}</div>
                            <div className="popover-price">
                              <TrophyOutlined /> {heroEquip.equipment?.price} 金币
                            </div>
                            {heroEquip.description && (
                              <div className="popover-desc">{heroEquip.description}</div>
                            )}
                            <div className="popover-desc">{heroEquip.equipment?.description}</div>
                          </div>
                        )

                        return (
                          <Popover key={heroEquip.id} content={content} trigger="hover" placement="top">
                            <div className="build-equip-icon">
                              <img
                                src={heroEquip.equipment?.icon}
                                alt={heroEquip.equipment?.name}
                              />
                              <div
                                className="build-equip-priority"
                                style={{
                                  background: getPriorityColor(heroEquip.priority),
                                }}
                              >
                                {heroEquip.priority}
                              </div>
                            </div>
                          </Popover>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无出装思路" className="recommend-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* 推荐海克斯 */}
          <Card className="recommend-card hex-card detail-card-entrance" bordered={false} ref={hexCardRef}>
            <div className="recommend-card-header">
              <div className="recommend-header-icon hex-icon-header">
                <ThunderboltOutlined />
              </div>
              <div className="recommend-header-text">
                <div className="recommend-header-title">推荐海克斯</div>
                <div className="recommend-header-subtitle">Recommended Hexes</div>
              </div>
              <div className="recommend-count-badge">
                {hero.recommendedHexes?.length || 0}
              </div>
            </div>

            {tierOrder.some((tier) => (hexesByTier[tier]?.length || 0) > 0) ? (
              <div className="hex-tier-sections">
                {tierOrder.map((tier) => {
                  const tierHexes = hexesByTier[tier] || []
                  if (tierHexes.length === 0) return null

                  return (
                    <div key={tier} className="hex-tier-section">
                      <div className="hex-tier-items">
                        {tierHexes.map((heroHex: HeroHex) => {
                          const content = (
                            <div className="popover-content">
                              <div className="popover-name">{heroHex.hex?.name}</div>
                              <div className="popover-tier">
                                {heroHex.hex?.tier === 1 && '棱彩'}
                                {heroHex.hex?.tier === 2 && '白银'}
                                {heroHex.hex?.tier === 3 && '黄金'}
                              </div>
                              {heroHex.description && (
                                <div className="popover-desc">{heroHex.description}</div>
                              )}
                              <div className="popover-desc">{heroHex.hex?.description}</div>
                            </div>
                          )

                          return (
                            <Popover key={heroHex.id} content={content} trigger="hover" placement="top">
                              <div className="hex-card-item">
                                <div
                                  className="hex-priority"
                                  style={{
                                    background: getPriorityColor(heroHex.priority),
                                  }}
                                >
                                  {heroHex.priority}
                                </div>
                                <div
                                  className="hex-card-icon-bg"
                                  style={{
                                    backgroundColor: '#091428',
                                    borderColor: HexTierColorMap[heroHex.hex?.tier || 1],
                                    boxShadow: `0 0 8px ${HexTierColorMap[heroHex.hex?.tier || 1]}30`,
                                  }}
                                >
                                  <img
                                    src={heroHex.hex?.icon}
                                    alt={heroHex.hex?.name}
                                    className="hex-card-icon"
                                  />
                                </div>
                                <div className="hex-card-name">{heroHex.hex?.name}</div>
                              </div>
                            </Popover>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty description="暂无推荐海克斯" className="recommend-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HeroDetail
