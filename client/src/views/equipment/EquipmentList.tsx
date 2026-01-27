import { useEffect, useState } from 'react'
import { Row, Col, Spin, Empty, Pagination, Card } from 'antd'
import EquipmentCard from '@/components/EquipmentCard'
import PageHeader from '@/components/PageHeader'
import SearchBar from '@/components/SearchBar'
import { equipmentApi } from '@/api/equipment'
import type { Equipment } from '@/types/equipment'
import './EquipmentList.css'

const EquipmentList = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(48) // 一页60个

  useEffect(() => {
    fetchEquipments()
    console.log(page, pageSize)
  }, [page, pageSize])

  const fetchEquipments = async (params?: { keyword?: string }) => {
    try {
      setLoading(true)
      const res = await equipmentApi.getList({
        page,
        pageSize,
        ...params,
      })
      if (res.code === 200 || res.code === 0) {
        setEquipments(res.data?.list || [])
        setTotal(res.data?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (keyword: string) => {
    setPage(1)
    fetchEquipments({
      keyword: keyword || undefined,
    })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size)
    setPage(1) // 改变每页数量时重置到第一页
  }

  return (
    <div className="equipment-list-page">
      <PageHeader title="装备列表" items={[{ title: '装备', path: '/equipments' }]} />
      <div className="equipment-list-search">
        <SearchBar onSearch={handleSearch} searchPlaceholder="请输入装备关键词搜索" />
      </div>
      {loading ? (
        <div className="equipment-list-loading">
          <Spin size="large" />
        </div>
      ) : equipments.length > 0 ? (
        <Card className="equipment-list-content" bordered={false}>
          <Row gutter={[12, 12]} align="stretch" justify="center">
            {equipments.map((equipment) => (
              <Col key={equipment.id} xs={8} sm={7} md={6} lg={6} xl={4} xxl={2}>
                <EquipmentCard equipment={equipment} />
              </Col>
            ))}
          </Row>
          <div className="equipment-list-pagination">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              onShowSizeChange={handlePageSizeChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 件装备`}
            />
          </div>
        </Card>
      ) : (
        <Card className="equipment-list-content" bordered={false}>
          <Empty description="暂无数据" />
        </Card>
      )}
    </div>
  )
}

export default EquipmentList
