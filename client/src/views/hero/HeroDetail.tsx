import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Tag, Spin, Empty, Badge, Popover, Divider, Collapse } from 'antd'
import { IeOutlined, ThunderboltOutlined, StarFilled, TrophyOutlined, RocketOutlined } from '@ant-design/icons'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import type { Hero, EquipmentBuild, BuildEquipment, HeroHex } from '@/types/hero'
import { HexTierColorMap } from '@/types/hex'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroDetail.css'

const { Panel } = Collapse

const HeroDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [hero, setHero] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchHeroDetail(Number(id))
    }
  }, [id])

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
      <div className="hero-banner">
        <div className="hero-banner-bg" style={{ backgroundImage: `url(${hero.avatar})` }} />
        <div className="hero-banner-overlay" />
        <div className="hero-banner-content">
          <div className="hero-banner-avatar">
            <img src={hero.avatar} alt={hero.name} />
          </div>
          <div className="hero-banner-info">
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
          <Card className="hero-stats-card" bordered={false}>
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
          <Card className="recommend-card equipment-card" bordered={false}>
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
              <div className="build-sections">
                <Collapse
                  defaultActiveKey={[0]}
                  className="equipment-build-collapse"
                  expandIconPosition="end"
                  ghost
                >
                  {equipmentBuilds.map((build, index) => (
                    <Panel
                      key={index}
                      header={
                        <div className="build-panel-header">
                          <div className="build-panel-title">{build.name}</div>
                          <div className="build-panel-count">{build.equipments?.length || 0} 件装备</div>
                        </div>
                      }
                      className="build-panel"
                    >
                      {build.description && (
                        <div className="build-description">{build.description}</div>
                      )}
                      <div className="recommend-grid modern-grid">
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
                              <div className="equipment-card-item">
                                <div
                                  className="equipment-priority"
                                  style={{
                                    background: getPriorityColor(heroEquip.priority),
                                  }}
                                >
                                  {heroEquip.priority}
                                </div>
                                <div className="equipment-icon-wrapper">
                                  <img
                                    src={heroEquip.equipment?.icon}
                                    alt={heroEquip.equipment?.name}
                                    className="equipment-card-icon"
                                  />
                                </div>
                                <div className="equipment-card-name">{heroEquip.equipment?.name}</div>
                                <div className="equipment-card-price">{heroEquip.equipment?.price}g</div>
                              </div>
                            </Popover>
                          )
                        })}
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </div>
            ) : (
              <Empty description="暂无出装思路" className="recommend-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>

          {/* 推荐海克斯 */}
          <Card className="recommend-card hex-card" bordered={false}>
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
