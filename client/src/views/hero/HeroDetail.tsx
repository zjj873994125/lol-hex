import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Avatar, Tag, Descriptions, Divider, Spin, Empty, Badge } from 'antd'
import { UserOutlined, IeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import type { Hero } from '@/types/hero'
import { HexTierColorMap } from '@/types/hex'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroDetail.css'

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

  // 按优先级排序装备
  const sortedEquipments = hero.recommendedEquipments
    ? [...hero.recommendedEquipments].sort((a, b) => b.priority - a.priority)
    : []

  // 按优先级排序海克斯
  const sortedHexes = hero.recommendedHexes
    ? [...hero.recommendedHexes].sort((a, b) => b.priority - a.priority)
    : []

  return (
    <div>
      <PageHeader
        title={hero.name}
        items={[{ title: '英雄', path: '/heroes' }]}
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div className="hero-detail-avatar">
              <Avatar
                size={128}
                src={hero.avatar}
                icon={<UserOutlined />}
                alt={hero.name}
              />
            </div>
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold">{hero.name}</h2>
              <p className="text-gray-500 text-lg">{hero.title}</p>
              {hero.nickname && (
                <p className="text-sm text-gray-400 mt-2">昵称: {hero.nickname}</p>
              )}
              <Divider />
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {hero.tags.map((tag) => (
                  <Tag key={tag} color={getRoleColor(tag)} className="px-3 py-1">
                    {getRoleLabel(tag)}
                  </Tag>
                ))}
              </div>
              <div className="text-left mt-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="状态">
                    <Tag color={hero.status === 1 ? 'green' : 'red'}>
                      {hero.status === 1 ? '启用' : '禁用'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="英雄介绍" className="mb-4 hero-description-card">
            <p className="text-gray-700 leading-relaxed">{hero.description}</p>
          </Card>

          {sortedEquipments.length > 0 && (
            <Card title={
              <div className="flex items-center gap-2">
                <IeOutlined />
                <span>推荐装备</span>
                <Tag color="blue" className="ml-2">{sortedEquipments.length} 件</Tag>
              </div>
            } className="mb-4">
              <Row gutter={[16, 16]}>
                {sortedEquipments.map((heroEquip) => (
                  <Col key={heroEquip.id} xs={12} sm={8} md={6}>
                    <Card
                      size="small"
                      hoverable
                      className="recommendation-card"
                      styles={{ body: { padding: '12px' } }}
                    >
                      <div className="text-center">
                        <div className="relative inline-block">
                          <Avatar
                            size={64}
                            src={heroEquip.equipment?.icon}
                            icon={<IeOutlined />}
                          />
                          <Badge
                            count={heroEquip.priority}
                            className="priority-badge"
                            style={{
                              backgroundColor: heroEquip.priority <= 3 ? '#52c41a' : '#faad14',
                            }}
                          />
                        </div>
                        <div className="mt-2 font-semibold text-sm">
                          {heroEquip.equipment?.name}
                        </div>
                        {heroEquip.equipment?.keywords && (
                          <div className="text-xs text-gray-500 mt-1">
                            {heroEquip.equipment.keywords}
                          </div>
                        )}
                        <div className="text-xs text-orange-500 mt-1 font-semibold">
                          {heroEquip.equipment?.price} 金币
                        </div>
                        {heroEquip.description && (
                          <div className="text-xs text-gray-400 mt-2 italic">
                            {heroEquip.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {sortedHexes.length > 0 && (
            <Card title={
              <div className="flex items-center gap-2">
                <ThunderboltOutlined />
                <span>推荐海克斯</span>
                <Tag color="purple" className="ml-2">{sortedHexes.length} 个</Tag>
              </div>
            }>
              <Row gutter={[16, 16]}>
                {sortedHexes.map((heroHex) => (
                  <Col key={heroHex.id} xs={12} sm={8} md={6}>
                    <Card
                      size="small"
                      hoverable
                      className="recommendation-card"
                      styles={{ body: { padding: '12px' } }}
                      style={{
                        borderTop: `3px solid ${HexTierColorMap[heroHex.hex?.tier || 1]}`,
                      }}
                    >
                      <div className="text-center">
                        <div className="relative inline-block">
                          <div
                            className="hex-icon-wrapper"
                            style={{
                              backgroundColor: '#091428',
                              borderColor: HexTierColorMap[heroHex.hex?.tier || 1],
                            }}
                          >
                            <Avatar
                              size={48}
                              src={heroHex.hex?.icon}
                              icon={<ThunderboltOutlined />}
                              style={{ backgroundColor: 'transparent' }}
                            />
                          </div>
                          <Badge
                            count={heroHex.priority}
                            className="priority-badge"
                            style={{
                              backgroundColor: heroHex.priority <= 3 ? '#52c41a' : '#faad14',
                            }}
                          />
                        </div>
                        <div className="mt-2 font-semibold text-sm">
                          {heroHex.hex?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {heroHex.hex?.tier === 1 && '棱彩'}
                          {heroHex.hex?.tier === 2 && '白银'}
                          {heroHex.hex?.tier === 3 && '黄金'}
                        </div>
                        {heroHex.description && (
                          <div className="text-xs text-gray-400 mt-2 italic">
                            {heroHex.description}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {sortedEquipments.length === 0 && sortedHexes.length === 0 && (
            <Card>
              <Empty description="暂无推荐装备和海克斯" />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default HeroDetail
