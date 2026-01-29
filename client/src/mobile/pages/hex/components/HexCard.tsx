import { Badge } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { HexTierMap, HexTierColorMap } from '@/types/hex'
import type { Hex } from '@/types/hex'
import './HexCard.css'

interface HexCardProps {
  hex: Hex
  onClick?: () => void
}

const HexCard = ({ hex, onClick }: HexCardProps) => {
  const tierColor = HexTierColorMap[hex.tier] || '#888'

  return (
    <div className="mobile-hex-card" onClick={onClick}>
      <div
        className="mobile-hex-icon"
        style={{ borderColor: tierColor }}
      >
        {hex.icon ? (
          <img src={hex.icon} alt={hex.name} />
        ) : (
          <ThunderboltOutlined style={{ color: tierColor, fontSize: 20 }} />
        )}
      </div>
      <div className="mobile-hex-tier">
        <Badge color={tierColor} text={HexTierMap[hex.tier]} style={{ color: tierColor }}   />
      </div>
      <div className="mobile-hex-name">{hex.name}</div>
    </div>
  )
}

export default HexCard
