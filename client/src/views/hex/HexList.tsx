import { useEffect, useState } from 'react'
import { Row, Col, Spin, Empty, Pagination, Card } from 'antd'
import HexCard from '@/components/HexCard'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import { hexApi } from '@/api/hex'
import { HexTierOptions } from '@/types/hex'
import type { Hex } from '@/types/hex'
import './HexList.css'

const HexList = () => {
  const [hexes, setHexes] = useState<Hex[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(18)

  useEffect(() => {
    fetchHexes()
  }, [page, pageSize])

  const fetchHexes = async (params?: { keyword?: string; tier?: number }) => {
    try {
      setLoading(true)
      const res = await hexApi.getList({
        page,
        pageSize,
        ...params,
        tier: params?.tier, // 默认值为 1，如果 params 中没有 tier 或为 undefined/null，则使用默认值
      })
      if (res.code === 200 || res.code === 0) {
        setHexes(res.data?.list || [])
        setTotal(res.data?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch hexes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string, filters?: Record<string, any>) => {
    setPage(1)
    fetchHexes({
      keyword: keyword || undefined,
      tier: filters?.tier,
    })
  }

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage)
    setPageSize(newPageSize)
  }

  return (
    <div className="hex-list-page">
      <PageHeader
        title="海克斯列表"
        items={[{ title: '海克斯', path: '/hexes' }]}
      />
      <div className="hex-list-search">
        <SearchBar
          onSearch={handleSearch}
          searchPlaceholder="请输入海克斯名称"
          filters={[
            {
              key: 'tier',
              label: '海克斯等级',
              type: 'radio',
              options: HexTierOptions,
            },
          ]}
        />
      </div>
      {loading ? (
        <div className="hex-list-loading">
          <Spin size="large" />
        </div>
      ) : hexes.length > 0 ? (
        <Card className="hex-list-content" bordered={false}>
          <Row gutter={[16, 16]} align="stretch" justify="center">
            {hexes.map((hex) => (
              <Col key={hex.id} xs={12} sm={8} md={7} lg={12} xl={6} xxl={4}>
                <HexCard hex={hex} />
              </Col>
            ))}
          </Row>
          <div className="hex-list-pagination">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 个海克斯`}
            />
          </div>
        </Card>
      ) : (
        <Card className="hex-list-content" bordered={false}>
          <Empty description="暂无数据" />
        </Card>
      )}
    </div>
  )
}

export default HexList
