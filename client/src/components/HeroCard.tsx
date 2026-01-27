import { useNavigate } from 'react-router-dom'
import type { Hero } from '@/types/hero'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroCard.css'

interface HeroCardProps {
  hero: Hero
}

const HeroCard = ({ hero }: HeroCardProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/heroes/${hero.id}`)
  }

  return (
    <div className="hero-card" onClick={handleClick}>
      <div className="hero-avatar-section">
        <img
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
