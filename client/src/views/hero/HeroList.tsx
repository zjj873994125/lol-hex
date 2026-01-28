import { useEffect, useState } from 'react'
import { Row, Col, Spin, Empty, Pagination, Card } from 'antd'
import { gsap } from 'gsap'
import HeroCard from '@/components/HeroCard'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import { heroApi } from '@/api/hero'
import { HeroPositionOptions } from '@/types/hero'
import type { Hero } from '@/types/hero'
import './HeroList.css'

const HeroList = () => {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(16) // 一页16个，2行每行8个

  useEffect(() => {
    fetchHeroes()
  }, [page, pageSize])

  // 卡片入场动画
  useEffect(() => {
    if (!loading && heroes.length > 0) {
      gsap.set('.hero-list-card-entrance', {
        y: 50,
        opacity: 0,
      })

      gsap.to('.hero-list-card-entrance', {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
      })
    }
  }, [loading, heroes])

  const fetchHeroes = async (params?: { keyword?: string; tags?: string[] }) => {
    try {
      setLoading(true)
      const res = await heroApi.getList({
        page,
        pageSize,
        ...params,
      })
      if (res.code === 200 || res.code === 0) {
        setHeroes(res.data?.list || [])
        setTotal(res.data?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch heroes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string, filters?: Record<string, any>) => {
    setPage(1)
    fetchHeroes({
      keyword: keyword || undefined,
      tags: filters?.tags?.join(','),
    })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="hero-list-page">
      <PageHeader title="英雄列表" items={[{ title: '英雄', path: '/heroes' }]} />
      <div className="hero-list-search">
        <SearchBar
          onSearch={handleSearch}
          searchPlaceholder="请输入英雄昵称搜索"
          filters={[
            {
              key: 'tags',
              label: '英雄定位',
              type: 'checkbox',
              options: HeroPositionOptions,
            },
          ]}
        />
      </div>
      {loading ? (
        <div className="hero-list-loading">
          <Spin size="large" />
        </div>
      ) : heroes.length > 0 ? (
        <Card className="hero-list-content" bordered={false}>
          <Row gutter={[16, 16]} align="stretch" justify="center">
            {heroes.map((hero) => (
              <Col key={hero.id} xs={12} sm={10} md={8} lg={8} xl={6} xxl={3}>
                <div className="hero-list-card-entrance">
                  <HeroCard hero={hero} />
                </div>
              </Col>
            ))}
          </Row>
          <div className="hero-list-pagination">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showTotal={(total) => `共 ${total} 位英雄`}
            />
          </div>
        </Card>
      ) : (
        <Card className="hero-list-content" bordered={false}>
          <Empty description="暂无数据" />
        </Card>
      )}
    </div>
  )
}

export default HeroList
