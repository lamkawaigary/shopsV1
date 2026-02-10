import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function DeliveryHome() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          配送中心 🚗
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          歡迎，{profile?.displayName || '外送員'}！查看待配送訂單
        </p>
      </div>

      {/* Today's Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: '待配送', value: '0', emoji: '📦' },
          { label: '已完成', value: '0', emoji: '✅' },
          { label: '今日收入', value: '$0.00', emoji: '💵' },
          { label: '評分', value: '4.8⭐', emoji: '⭐' }
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
          { emoji: '📍', label: '查看任務', action: () => navigate('/delivery/tasks') },
          { emoji: '📋', label: '配送歷史', action: () => navigate('/delivery/history') },
          { emoji: '💰', label: '收入統計', action: () => navigate('/delivery/earnings') },
          { emoji: '⭐', label: '評價反饋', action: () => navigate('/delivery/ratings') }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            style={{
              background: 'white',
              border: '2px solid #10b981',
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
              el.style.background = '#ecfdf5'
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

      {/* Active Tasks */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          🎯 進行中的任務
        </h2>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>暫時沒有待配送的訂單</p>
        </div>
      </div>
    </div>
  )
}
