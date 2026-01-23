import { IeOutlined } from '@ant-design/icons'
import { Popover } from 'antd'
import type { Equipment } from '@/types/equipment'
import './EquipmentCard.css'

interface EquipmentCardProps {
  equipment: Equipment
  onClick?: () => void
}

const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  const handleClick = () => {
    onClick?.()
  }

  const content = (
    <div className="equipment-popover-content">
      <div className="popover-header">
        <img
          src={equipment.icon}
          alt={equipment.name}
          className="popover-icon"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        <div className="popover-title-section">
          <h4 className="popover-name">{equipment.name}</h4>
          <span className="popover-price">{equipment.price} 金币</span>
        </div>
      </div>
      {equipment.description && (
        <p className="popover-description">{equipment.description}</p>
      )}
    </div>
  )

  return (
    <Popover
      content={content}
      placement="top"
      trigger="hover"
      overlayClassName="equipment-popover"
    >
      <div
        className={`equipment-card ${onClick ? 'clickable' : ''}`}
        onClick={handleClick}
      >
        <div className="equipment-icon-wrapper">
          <img
            src={equipment.icon}
            alt={equipment.name}
            className="equipment-icon"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement
              if (fallback) fallback.classList.remove('hidden')
            }}
          />
          <div className="equipment-icon-fallback hidden">
            <IeOutlined />
          </div>
          <div className="equipment-price-badge">{equipment.price}</div>
        </div>
        <div className="equipment-name">{equipment.name}</div>
      </div>
    </Popover>
  )
}

export default EquipmentCard
