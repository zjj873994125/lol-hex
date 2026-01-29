import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { Spin, Empty, Tag } from 'antd'
import { TrophyOutlined, ShoppingOutlined } from '@ant-design/icons'
import MobileHeader from '@/mobile/components/MobileHeader'
import { equipmentApi } from '@/api/equipment'
import type { Equipment } from '@/types/equipment'
import './detail.css'

const MobileEquipmentDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchEquipmentDetail(Number(id))
    }
  }, [id])

  useEffect(() => {
    if (!loading && equipment && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.equip-icon-container',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
        )
        gsap.fromTo('.equip-name',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.2 }
        )
        gsap.fromTo('.equip-price',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.3 }
        )
        gsap.fromTo('.equip-keywords',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, delay: 0.4 }
        )
        gsap.fromTo('.section-title, .content-block',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 0.5 }
        )
      }, pageRef.current)

      return () => ctx.revert()
    }
  }, [loading, equipment])

  const fetchEquipmentDetail = async (equipmentId: number) => {
    try {
      setLoading(true)
      const res = await equipmentApi.getDetail(equipmentId)
      if (res.code === 200 || res.code === 0) {
        setEquipment(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch equipment detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mobile-page mobile-loading">
        <MobileHeader title="装备详情" showBack />
        <Spin size="large" />
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="mobile-page">
        <MobileHeader title="装备详情" showBack />
        <Empty description="装备不存在" className="mobile-empty" />
      </div>
    )
  }

  const keywords = equipment.keywords
    ? equipment.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  return (
    <div className="mobile-page equip-detail-page" ref={pageRef}>
      <MobileHeader title="装备详情" showBack transparent />

      {/* 顶部背景 */}
      <div className="equip-detail-bg">
        <div className="equip-bg-glow" />
      </div>

      {/* 装备图标区域 */}
      <div className="equip-icon-section">
        <div className="equip-icon-container">
          <img
            src={equipment.icon}
            alt={equipment.name}
            className="equip-icon-img"
          />
          <div className="equip-icon-shine" />
        </div>
      </div>

      {/* 装备信息 */}
      <div className="equip-info-section">
        <h1 className="equip-name">{equipment.name}</h1>
        <div className="equip-price">
          <TrophyOutlined /> {equipment.price} 金币
        </div>

        {/* 关键词标签 */}
        {keywords.length > 0 && (
          <div className="equip-keywords">
            {keywords.map((keyword, index) => (
              <Tag key={index} className="equip-keyword-tag">
                {keyword}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="equip-content-section">
        {/* 装备描述 */}
        <div className="content-block">
          <div className="section-title">
            <ShoppingOutlined />
            <span>装备描述</span>
          </div>
          <div className="description-content">
            {equipment.description || '暂无描述'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileEquipmentDetail
