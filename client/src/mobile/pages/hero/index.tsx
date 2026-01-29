import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Input } from 'antd'
import HeroCard from '@/mobile/pages/hero/components/HeroCard'
import MobileHeader from '@/mobile/components/MobileHeader'
import { heroApi } from '@/api/hero'
import { HeroPositionOptions } from '@/types/hero'
import type { Hero } from '@/types/hero'
import useDebounce from '@/mobile/hooks/useDebounce'
import './index.css'

const MobileHeroList = () => {
  const navigate = useNavigate()
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const pageRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHeroes(true)
  }, [])

  // 入场动画
  useEffect(() => {
    if (!loading && heroes.length > 0 && listRef.current) {
      gsap.fromTo('.mobile-hero-list-item',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
      )
    }
  }, [loading, heroes.length])

  const fetchHeroes = async (reset = false, searchKeyword?: string) => {
    if (loading) return

    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const res = await heroApi.getList({
        page: currentPage,
        pageSize: 12,
        keyword: searchKeyword !== undefined ? searchKeyword : keyword,
      })

      if (res.code === 200 || res.code === 0) {
        const newList = res.data?.list || []
        if (reset) {
          setHeroes(newList)
          setPage(1)
        } else {
          setHeroes(prev => [...prev, ...newList])
          setPage(prev => prev + 1)
        }
        setHasMore(newList.length >= 12)
      }
    } catch (error) {
      console.error('Failed to fetch heroes:', error)
    } finally {
      setLoading(false)
    }
  }

  // 防抖搜索
  const debouncedSearch = useDebounce((value: string) => {
    fetchHeroes(true, value)
  }, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    debouncedSearch(value)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchHeroes(false)
    }
  }

  const handleHeroClick = (hero: Hero) => {
    gsap.to('.mobile-hero-list-item', {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => navigate(`/m/heroes/${hero.id}`)
    })
  }

  return (
    <div className="mobile-page mobile-hero-list" ref={pageRef}>
      <MobileHeader title="英雄" showBack={false} />

      {/* 搜索栏 */}
      <div className="mobile-search-bar">
        <Input
          placeholder="搜索英雄昵称"
          value={keyword}
          onChange={handleInputChange}
          allowClear
        />
      </div>

      {/* 英雄列表 */}
      {heroes.length === 0 && loading ? (
        <div className="mobile-loading">
          <Spin size="large" />
        </div>
      ) : heroes.length > 0 ? (
        <>
          <div className="mobile-grid-2" ref={listRef}>
            {heroes.map((hero) => (
              <div key={hero.id} className="mobile-hero-list-item">
                <HeroCard hero={hero} onClick={() => handleHeroClick(hero)} />
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
        <Empty description="暂无英雄数据" className="mobile-empty" />
      )}
    </div>
  )
}

export default MobileHeroList
