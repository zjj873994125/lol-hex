import { Card, Badge } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { HexTierMap, HexTierColorMap } from '@/types/hex'
import type { Hex } from '@/types/hex'
import './HexCard.css'

interface HexCardProps {
  hex: Hex
  onClick?: () => void
}

const HexCard = ({ hex, onClick }: HexCardProps) => {
  const handleClick = () => {
    onClick?.()
  }

  const tierColor = HexTierColorMap[hex.tier] || '#888'

  return (
    <Card
      hoverable
      className={onClick ? 'hex-card clickable' : 'hex-card'}
      onClick={handleClick}
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
      <div className="hex-description">
        {hex.description.slice(0, 80)}
        {hex.description.length > 80 ? '...' : ''}
      </div>
    </Card>
  )
}

export default HexCard
