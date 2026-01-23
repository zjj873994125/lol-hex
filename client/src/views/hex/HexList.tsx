import { useEffect, useState } from 'react'
import { Row, Col, Spin, Empty, Pagination } from 'antd'
import HexCard from '@/components/HexCard'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import { hexApi } from '@/api/hex'
import { HexTierOptions } from '@/types/hex'
import type { Hex } from '@/types/hex'

const HexList = () => {
  const [hexes, setHexes] = useState<Hex[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

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
    <div>
      <PageHeader
        title="海克斯列表"
        items={[{ title: '海克斯', path: '/hexes' }]}
      />
      <SearchBar
        onSearch={handleSearch}
        searchPlaceholder="请输入海克斯名称"
        filters={[
          {
            key: 'tier',
            label: '海克斯等级',
            options: HexTierOptions,
          },
        ]}
      />
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      ) : hexes.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {hexes.map((hex) => (
              <Col key={hex.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <HexCard hex={hex} />
              </Col>
            ))}
          </Row>
          <div className="mt-6 flex justify-center">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无数据" />
      )}
    </div>
  )
}

export default HexList
