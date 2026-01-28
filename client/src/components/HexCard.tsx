import { useRef, useEffect } from 'react'
import { Card, Badge, Popover } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { gsap } from 'gsap'
import { HexTierMap, HexTierColorMap } from '@/types/hex'
import type { Hex } from '@/types/hex'
import './HexCard.css'

interface HexCardProps {
  hex: Hex
  onClick?: () => void
}

const HexCard = ({ hex, onClick }: HexCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert()
      }
    }
  }, [])

  const handleClick = () => {
    onClick?.()
  }

  const tierColor = HexTierColorMap[hex.tier] || '#888'

  const handleMouseEnter = () => {
    if (!cardRef.current) return

    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    ctxRef.current = gsap.context(() => {
      gsap.to(cardRef.current, {
        y: -6,
        duration: 0.3,
        ease: 'power2.out',
      })
    }, cardRef.current)
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return

    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    ctxRef.current = gsap.context(() => {
      gsap.to(cardRef.current, {
        y: 0,
        duration: 0.25,
        ease: 'power2.inOut',
      })
    }, cardRef.current)
  }

  const content = (
    <div className="hex-popover-content">
      <div className="popover-header">
        <div
          className="popover-icon"
          style={{
            backgroundColor: '#091428',
            borderColor: tierColor
          }}
        >
          <img src={hex.icon} alt={hex.name} />
        </div>
        <div className="popover-title-section">
          <h4 className="popover-name">{hex.name}</h4>
          <Badge color={tierColor} text={HexTierMap[hex.tier]} />
        </div>
      </div>
      <p className="popover-description">{hex.description}</p>
    </div>
  )

  return (
    <Popover
      content={content}
      placement="top"
      trigger="hover"
      overlayClassName="hex-popover"
    >
      <Card
        ref={cardRef}
        hoverable
        className={onClick ? 'hex-card clickable' : 'hex-card'}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hex-header">
          <div
            className="hex-icon"
            style={{
              backgroundColor: '#091428',
              borderColor: tierColor
            }}
          >
            <img src={hex.icon} alt={hex.name} />
          </div>
          <div className="hex-tier">
            <Badge color={tierColor} text={HexTierMap[hex.tier]} />
          </div>
        </div>
        <div className="hex-name">{hex.name}</div>
        <div className="hex-description">{hex.description}</div>
      </Card>
    </Popover>
  )
}

export default HexCard
