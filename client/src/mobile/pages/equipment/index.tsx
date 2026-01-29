import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Input } from 'antd'
import EquipmentCard from '@/mobile/pages/equipment/components/EquipmentCard'
import MobileHeader from '@/mobile/components/MobileHeader'
import { equipmentApi } from '@/api/equipment'
import type { Equipment } from '@/types/equipment'
import useDebounce from '@/mobile/hooks/useDebounce'
import './index.css'

const MobileEquipmentList = () => {
  const navigate = useNavigate()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const pageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEquipments(true)
  }, [])

  // 入场动画
  useEffect(() => {
    if (!loading && equipments.length > 0 && listRef.current) {
      gsap.fromTo('.mobile-equipment-list-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [loading, equipments.length])

  const fetchEquipments = async (reset = false, searchKeyword?: string) => {
    if (loading) return

    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const res = await equipmentApi.getList({
        page: currentPage,
        pageSize: 24,
        keyword: searchKeyword !== undefined ? searchKeyword : keyword,
      })

      if (res.code === 200 || res.code === 0) {
        const newList = res.data?.list || []
        if (reset) {
          setEquipments(newList)
          setPage(1)
        } else {
          setEquipments(prev => [...prev, ...newList])
          setPage(prev => prev + 1)
        }
        setHasMore(newList.length >= 24)
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error)
    } finally {
      setLoading(false)
    }
  }

  // 防抖搜索
  const debouncedSearch = useDebounce((value: string) => {
    fetchEquipments(true, value)
  }, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    debouncedSearch(value)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchEquipments(false)
    }
  }

  const handleEquipmentClick = (equipment: Equipment) => {
    gsap.to('.mobile-equipment-list-item', {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      stagger: 0.02,
      ease: 'power2.in',
      onComplete: () => navigate(`/m/equipments/${equipment.id}`)
    })
  }

  return (
    <div className="mobile-page mobile-equipment-list" ref={pageRef}>
      <MobileHeader title="装备" showBack={false} />

      {/* 搜索栏 */}
      <div className="mobile-search-bar">
        <Input
          placeholder="搜索装备名称"
          value={keyword}
          onChange={handleInputChange}
          allowClear
        />
      </div>

      {/* 装备列表 */}
      {equipments.length === 0 && loading ? (
        <div className="mobile-loading">
          <Spin size="large" />
        </div>
      ) : equipments.length > 0 ? (
        <>
          <div className="mobile-grid-3" ref={listRef}>
            {equipments.map((equipment) => (
              <div key={equipment.id} className="mobile-equipment-list-item">
                <EquipmentCard equipment={equipment} onClick={() => handleEquipmentClick(equipment)} />
              </div>
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="mobile-load-more">
              {loading ? (
                <Spin size="small" />
              ) : (
                <button className="mobile-load-more-btn" onClick={handleLoadMore}>
                  加载更多
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <Empty description="暂无装备数据" className="mobile-empty" />
      )}
    </div>
  )
}

export default MobileEquipmentList
