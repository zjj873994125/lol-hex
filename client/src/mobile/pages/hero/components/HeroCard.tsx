import type { Hero } from '@/types/hero'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroCard.css'

interface HeroCardProps {
  hero: Hero
  onClick?: () => void
}

const HeroCard = ({ hero, onClick }: HeroCardProps) => {
  return (
    <div className="mobile-hero-card" onClick={onClick}>
      <img
        src={hero.avatar}
        alt={hero.name}
        className="mobile-hero-avatar"
        onError={(e) => {
          const target = e.currentTarget
          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%234a5568"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3E?%3C/text%3E%3C/svg%3E'
        }}
      />
      <div className="mobile-hero-info">
        <div className="mobile-hero-name">{hero.name}</div>
        <div className="mobile-hero-title">{hero.title}</div>
      </div>
    </div>
  )
}

export default HeroCard
