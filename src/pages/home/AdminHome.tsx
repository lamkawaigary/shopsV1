import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export function AdminHome() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          系統管理後台 🔧
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          歡迎，{profile?.displayName || '管理員'}！管理整個平台
        </p>
      </div>

      {/* System Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { label: '總用戶', value: '0', emoji: '👥' },
          { label: '活躍商戶', value: '0', emoji: '🏪' },
          { label: '總訂單', value: '0', emoji: '📦' },
          { label: '平台收入', value: '$0.00', emoji: '💵' }
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

      {/* Management Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { emoji: '👥', label: '用戶管理', path: '/admin/users' },
          { emoji: '🏪', label: '商戶管理', path: '/admin/merchants' },
          { emoji: '📦', label: '訂單管理', path: '/admin/orders' },
          { emoji: '📊', label: '數據分析', path: '/admin/analytics' },
          { emoji: '🔔', label: '消息中心', path: '/admin/messages' },
          { emoji: '⚙️', label: '系統設定', path: '/admin/settings' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => navigate(item.path)}
            style={{
              background: 'white',
              border: '2px solid #8b5cf6',
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
              (e.currentTarget as HTMLElement).style.background = '#f5f3ff'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'white'
            }}
          >
            <span style={{ fontSize: '32px' }}>{item.emoji}</span>
            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {[
          { title: '🆕 新用戶註冊', items: ['最近沒有新註冊'] },
          { title: '⚠️ 待審批', items: ['商戶申請: 0件', '申訴: 0件'] },
          { title: '📈 今日統計', items: ['新訂單: 0件', '交易額: $0.00'] }
        ].map((section, idx) => (
          <div
            key={idx}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              {section.title}
            </h3>
            {section.items.map((item, i) => (
              <p key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
