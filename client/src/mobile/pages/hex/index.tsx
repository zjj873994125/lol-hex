import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Input, Radio } from 'antd'
import HexCard from '@/mobile/pages/hex/components/HexCard'
import MobileHeader from '@/mobile/components/MobileHeader'
import { hexApi } from '@/api/hex'
import { HexTierOptions } from '@/types/hex'
import type { Hex } from '@/types/hex'
import useDebounce from '@/mobile/hooks/useDebounce'
import './index.css'

const MobileHexList = () => {
  const navigate = useNavigate()
  const [hexes, setHexes] = useState<Hex[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [tier, setTier] = useState<number | undefined>(undefined)

  const pageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHexes(true)
  }, [])

  // 入场动画
  useEffect(() => {
    if (!loading && hexes.length > 0 && listRef.current) {
      gsap.fromTo('.mobile-hex-list-item',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [loading, hexes.length])

  const fetchHexes = async (reset = false, searchKeyword?: string, searchTier?: number) => {
    if (loading) return

    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const res = await hexApi.getList({
        page: currentPage,
        pageSize: 12,
        keyword: searchKeyword !== undefined ? searchKeyword : keyword,
        tier: searchTier !== undefined ? searchTier : tier,
      })

      if (res.code === 200 || res.code === 0) {
        const newList = res.data?.list || []
        if (reset) {
          setHexes(newList)
          setPage(1)
        } else {
          setHexes(prev => [...prev, ...newList])
          setPage(prev => prev + 1)
        }
        setHasMore(newList.length >= 12)
      }
    } catch (error) {
      console.error('Failed to fetch hexes:', error)
    } finally {
      setLoading(false)
    }
  }

  // 防抖搜索
  const debouncedSearch = useDebounce((value: string) => {
    fetchHexes(true, value, tier)
  }, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    debouncedSearch(value)
  }

  const handleTierChange = (e: any) => {
    const newTier = e.target.value
    setTier(newTier)
    setPage(1)
    fetchHexes(true, keyword, newTier)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchHexes(false)
    }
  }

  const handleHexClick = (hex: Hex) => {
    gsap.to('.mobile-hex-list-item', {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => navigate(`/m/hexes/${hex.id}`)
    })
  }

  return (
    <div className="mobile-page mobile-hex-list" ref={pageRef}>
      <MobileHeader title="海克斯" showBack={false} />

      {/* 搜索栏 */}
      <div className="mobile-search-bar">
        <Input
          placeholder="搜索海克斯名称"
          value={keyword}
          onChange={handleInputChange}
          allowClear
        />
      </div>

      {/* 等级筛选 */}
      <div className="mobile-hex-filters">
        <Radio.Group
          value={tier}
          onChange={handleTierChange}
          size="small"
        >
          <Radio.Button value={null}>全部</Radio.Button>
          <Radio.Button value={1}>棱彩</Radio.Button>
          <Radio.Button value={2}>白银</Radio.Button>
          <Radio.Button value={3}>黄金</Radio.Button>
        </Radio.Group>
      </div>

      {/* 海克斯列表 */}
      {hexes.length === 0 && loading ? (
        <div className="mobile-loading">
          <Spin size="large" />
        </div>
      ) : hexes.length > 0 ? (
        <>
          <div className="mobile-grid-3" ref={listRef}>
            {hexes.map((hex) => (
              <div key={hex.id} className="mobile-hex-list-item">
                <HexCard hex={hex} onClick={() => handleHexClick(hex)} />
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
        <Empty description="暂无海克斯数据" className="mobile-empty" />
      )}
    </div>
  )
}

export default MobileHexList
