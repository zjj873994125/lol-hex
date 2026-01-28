import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import type { Hero } from '@/types/hero'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroCard.css'

interface HeroCardProps {
  hero: Hero
}

const HeroCard = ({ hero }: HeroCardProps) => {
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLImageElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert()
      }
    }
  }, [])

  const handleClick = () => {
    navigate(`/heroes/${hero.id}`)
  }

  const handleMouseEnter = () => {
    if (!cardRef.current || !avatarRef.current) return

    // 清理之前的动画，避免堆积
    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    // 创建新的 context
    ctxRef.current = gsap.context(() => {
      // 卡片整体上浮效果
      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.35,
        ease: 'power2.out',
      })

      // 头像放大效果
      gsap.to(avatarRef.current, {
        scale: 1.08,
        duration: 0.35,
        ease: 'power2.out',
      })
    }, cardRef.current)
  }

  const handleMouseLeave = () => {
    if (!cardRef.current || !avatarRef.current) return

    // 清理之前的动画
    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    // 创建新的 context 用于退出动画
    ctxRef.current = gsap.context(() => {
      // 恢复卡片位置
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.inOut',
      })

      // 恢复头像大小
      gsap.to(avatarRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.inOut',
      })
    }, cardRef.current)
  }

  return (
    <div
      className="hero-card"
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-avatar-section">
        <img
          ref={avatarRef}
          src={hero.avatar}
          alt={hero.name}
          className="hero-avatar"
          onError={(e) => {
            const target = e.currentTarget
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%234a5568"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3E?%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>
      <div className="hero-info-section">
        <div className="hero-title-row">
          <span className="hero-name">{hero.name}</span>
          <span className="hero-title">{hero.title}</span>
        </div>
        <div className="hero-roles">
          {hero.tags?.map((tag) => (
            <span
              key={tag}
              className="hero-role-tag"
              style={{ backgroundColor: getRoleColor(tag), color: '#fff' }}
            >
              {getRoleLabel(tag)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroCard
