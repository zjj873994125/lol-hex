import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Badge } from 'antd'
import { ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'
import MobileHeader from '@/mobile/components/MobileHeader'
import { hexApi } from '@/api/hex'
import { HexTierMap, HexTierColorMap } from '@/types/hex'
import type { Hex } from '@/types/hex'
import './detail.css'

const MobileHexDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [hex, setHex] = useState<Hex | null>(null)
  const [loading, setLoading] = useState(true)

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchHexDetail(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (!loading && hex && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.hex-icon-container',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
        )
        gsap.fromTo('.hex-name',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2 }
        )
        gsap.fromTo('.hex-tier-badge',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.3 }
        )
        gsap.fromTo('.section-title, .content-block',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.4 }
        )
      }, pageRef.current)

      return () => ctx.revert()
    }
  }, [loading, hex])

  const fetchHexDetail = async (hexId: number) => {
    try {
      setLoading(true)
      const res = await hexApi.getDetail(hexId)
      if (res.code === 200 || res.code === 0) {
        setHex(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch hex detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mobile-page mobile-loading">
        <MobileHeader title="海克斯详情" showBack />
        <Spin size="large" />
      </div>
    )
  }

  if (!hex) {
    return (
      <div className="mobile-page">
        <MobileHeader title="海克斯详情" showBack />
        <Empty description="海克斯不存在" className="mobile-empty" />
      </div>
    )
  }

  const tierColor = HexTierColorMap[hex.tier]
  const tierName = HexTierMap[hex.tier]

  return (
    <div
      className="mobile-page hex-detail-page"
      ref={pageRef}
      style={{ '--hex-color': tierColor } as React.CSSProperties}
    >
      <MobileHeader title="海克斯详情" showBack transparent />

      {/* 顶部背景 */}
      <div className="hex-detail-bg">
        <div className="hex-bg-glow" style={{ background: tierColor }} />
      </div>

      {/* 海克斯图标区域 */}
      <div className="hex-icon-section">
        <div className="hex-icon-container">
          <div
            className="hex-icon-bg-large"
            style={{ borderColor: tierColor, boxShadow: `0 0 40px ${tierColor}40` }}
          >
            {hex.icon ? (
              <img src={hex.icon} alt={hex.name} className="hex-icon-img" />
            ) : (
              <ThunderboltOutlined style={{ color: tierColor, fontSize: '5rem' }} />
            )}
          </div>
          <div className="hex-icon-pulse" style={{ borderColor: tierColor }} />
        </div>
      </div>

      {/* 海克斯信息 */}
      <div className="hex-info-section">
        <div className="hex-tier-badge">
          <Badge color={tierColor} text={tierName} />
        </div>
        <h1 className="hex-name">{hex.name}</h1>
      </div>

      {/* 内容区域 */}
      <div className="hex-content-section">
        {/* 海克斯描述 */}
        <div className="content-block">
          <div className="section-title">
            <InfoCircleOutlined />
            <span>海克斯描述</span>
          </div>
          <div className="description-content">
            {hex.description || '暂无描述'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileHexDetail
