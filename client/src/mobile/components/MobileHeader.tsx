import { useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import './MobileHeader.css'

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  transparent?: boolean
  rightContent?: React.ReactNode
}

const MobileHeader = ({
  title,
  showBack = true,
  showHome = false,
  transparent = false,
  rightContent,
}: MobileHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div className={`mobile-header${transparent ? ' mobile-header-transparent' : ''}`}>
      <div className="mobile-header-left">
        {showBack && (
          <button className="mobile-header-btn" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined />
          </button>
        )}
      </div>
      <div className="mobile-header-title">{title || ''}</div>
      <div className="mobile-header-right">
        {showHome && (
          <button className="mobile-header-btn" onClick={() => navigate('/m')}>
            🏠
          </button>
        )}
        {rightContent}
      </div>
    </div>
  )
}

export default MobileHeader
