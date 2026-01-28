import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

interface QuickMenuItemProps {
  title: string
  description: string
  icon: string
  color: string
  onClick: () => void
}

const QuickMenuItem = ({ title, description, icon, color, onClick }: QuickMenuItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert()
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (!itemRef.current || !iconRef.current) return

    // 清理之前的动画，避免堆积
    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    // 创建新的 context
    ctxRef.current = gsap.context(() => {
      // 卡片上浮效果
      gsap.to(itemRef.current, {
        y: -8,
        duration: 0.3,
        ease: 'power2.out',
      })

      // 图标放大效果
      gsap.to(iconRef.current, {
        scale: 1.15,
        duration: 0.3,
        ease: 'power2.out',
      })

      // 顶部线条展开
      gsap.to(itemRef.current, {
        '--border-scale': 1,
        duration: 0.25,
        ease: 'power2.out',
      })
    }, itemRef.current)
  }

  const handleMouseLeave = () => {
    if (!itemRef.current || !iconRef.current) return

    // 清理之前的动画
    if (ctxRef.current) {
      ctxRef.current.revert()
    }

    // 创建新的 context 用于退出动画
    ctxRef.current = gsap.context(() => {
      // 恢复卡片位置
      gsap.to(itemRef.current, {
        y: 0,
        duration: 0.25,
        ease: 'power2.inOut',
      })

      // 恢复图标
      gsap.to(iconRef.current, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.inOut',
      })

      // 顶部线条收起
      gsap.to(itemRef.current, {
        '--border-scale': 0,
        duration: 0.25,
        ease: 'power2.inOut',
      })
    }, itemRef.current)
  }

  return (
    <div
      ref={itemRef}
      className="quick-menu-item"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ '--menu-color': color, '--border-scale': 0 } as React.CSSProperties}
    >
      <div className="menu-icon" ref={iconRef}>
        {icon}
      </div>
      <div className="menu-title">{title}</div>
      <div className="menu-description">{description}</div>
    </div>
  )
}

export default QuickMenuItem
