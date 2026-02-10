import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/stores/authStore'

const roleOptions: Array<{ role: UserRole; label: string; emoji: string; description: string }> = [
  {
    role: 'customer',
    label: '客戶',
    emoji: '🛍️',
    description: '購買商品，瀏覽商店'
  },
  {
    role: 'merchant',
    label: '商戶',
    emoji: '🏪',
    description: '銷售商品，管理店鋪'
  },
  {
    role: 'delivery',
    label: '外送員',
    emoji: '🚗',
    description: '配送訂單，賺取收入'
  }
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!user || !profile) return

    setLoading(true)
    try {
      await updateProfile({ role: selectedRole })
      navigate('/')
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            歡迎！ 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            請選擇你的身份類型來開始使用
          </p>
        </div>

        {/* Role Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {roleOptions.map((option) => (
            <button
              key={option.role}
              onClick={() => setSelectedRole(option.role)}
              style={{
                padding: '16px',
                border: selectedRole === option.role ? '2px solid #2563eb' : '2px solid #e2e8f0',
                borderRadius: '12px',
                background: selectedRole === option.role ? '#eff6ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (selectedRole !== option.role) {
                  (e.target as HTMLButtonElement).style.borderColor = '#cbd5e1'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRole !== option.role) {
                  (e.target as HTMLButtonElement).style.borderColor = '#e2e8f0'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>{option.emoji}</div>
                <div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {option.label}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    {option.description}
                  </div>
                </div>
                {selectedRole === option.role && (
                  <div style={{ marginLeft: 'auto', fontSize: '20px' }}>✅</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '24px',
          fontSize: '12px',
          color: '#0369a1',
          lineHeight: '1.6'
        }}>
          💡 <strong>提示：</strong>你可以稍後在設置中更改身份類型
        </div>

        {/* Button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#cbd5e1' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? '設置中...' : '開始使用'}
        </button>
      </div>
    </div>
  )
}
