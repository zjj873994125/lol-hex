import { IeOutlined } from '@ant-design/icons'
import type { Equipment } from '@/types/equipment'
import './EquipmentCard.css'

interface EquipmentCardProps {
  equipment: Equipment
  onClick?: () => void
}

const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  return (
    <div className="mobile-equipment-card" onClick={onClick}>
      <div className="mobile-equipment-icon-wrapper">
        <img
          src={equipment.icon}
          alt={equipment.name}
          className="mobile-equipment-icon"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.classList.remove('hidden')
          }}
        />
        <div className="mobile-equipment-icon-fallback hidden">
          <IeOutlined />
        </div>
      </div>
      <div className="mobile-equipment-name">{equipment.name}</div>
    </div>
  )
}

export default EquipmentCard
