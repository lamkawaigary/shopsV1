import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function MerchantHome() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          商店管理面板 🏪
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          歡迎回來，{profile?.displayName || '商戶'}！管理你的商品和訂單
        </p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: '待處理訂單', value: '0', emoji: '📦' },
          { label: '今日銷售', value: '$0.00', emoji: '💰' },
          { label: '商品數量', value: '0', emoji: '🏷️' },
          { label: '評價', value: '0', emoji: '⭐' }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.emoji}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { emoji: '📦', label: '管理訂單', path: '/merchant/orders' },
          { emoji: '🏷️', label: '管理商品', path: '/merchant/products' },
          { emoji: '📊', label: '銷售統計', path: '/merchant/stats' },
          { emoji: '⚙️', label: '店舖設定', path: '/merchant/settings' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            style={{
              background: 'white',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = '#fef3c7'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = 'white'
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.emoji}</span>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          📋 最近訂單
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>訂單管理系統快將推出...</p>
        </div>
      </div>
    </div>
  )
}
