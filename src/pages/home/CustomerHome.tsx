import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function CustomerHome() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          歡迎，{profile?.displayName || '客戶'}！👋
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          探索我們的商店，購買優質商品
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { emoji: '🛍️', label: '瀏覽商店', action: () => navigate('/shop') },
          { emoji: '📦', label: '查看訂單', action: () => navigate('/orders') },
          { emoji: '❤️', label: '我的收藏', action: () => navigate('/favorites') },
          { emoji: '📋', label: '我的專案', action: () => navigate('/projects') }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
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
              el.style.borderColor = '#667eea'
              el.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = '#e2e8f0'
              el.style.boxShadow = 'none'
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.emoji}</span>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Products Section */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          🌟 熱門商品
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>商品列表快將推出...</p>
        </div>
      </div>
    </div>
  )
}
