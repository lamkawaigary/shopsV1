import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  })

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      await updateProfile(formData)
      setSuccess('個人資料已更新！')
      setEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || '更新失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        請先登入
      </div>
    )
  }

  const roleLabels = {
    customer: '客戶',
    merchant: '商戶',
    delivery: '外送員',
    admin: '管理員'
  }

  const roleEmojis = {
    customer: '🛍️',
    merchant: '🏪',
    delivery: '🚗',
    admin: '⚙️'
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Success/Error Messages */}
      {success && (
        <div style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '24px'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'white', 
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px'
        }}>
          {roleEmojis[profile.role]}
        </div>
        <h1 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: 'bold' }}>
          {profile.displayName || user.email?.split('@')[0] || '用戶'}
        </h1>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>{user.email}</p>
        <div style={{ 
          marginTop: '14px',
          display: 'inline-block',
          background: 'rgba(255,255,255,0.25)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          {roleLabels[profile.role]}
        </div>
      </div>

      {/* Edit Form */}
      {editing ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
            編輯個人資料
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#64748b' }}>
              名稱
            </label>
            <input
              type="text"
              placeholder="請輸入你的名稱"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#64748b' }}>
              電話
            </label>
            <input
              type="tel"
              placeholder="請輸入你的電話號碼"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxSizing: 'border-box',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#64748b' }}>
              地址
            </label>
            <textarea
              placeholder="請輸入你的地址"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                minHeight: '100px',
                boxSizing: 'border-box',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setEditing(false)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: loading ? 0.5 : 1
              }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#cbd5e1' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>個人資料</h2>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#2563eb'
              }}
            >
              ✏️ 編輯
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
                👤 名稱
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                {profile.displayName || <span style={{ color: '#cbd5e1' }}>未設置</span>}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
                📞 電話
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                {profile.phone || <span style={{ color: '#cbd5e1' }}>未設置</span>}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
                📍 地址
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                {profile.address || <span style={{ color: '#cbd5e1' }}>未設置</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Info */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          帳戶資訊
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>📧 電郵</span>
            <span style={{ fontWeight: '500' }}>{user.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>🏷️ 帳戶類型</span>
            <span style={{ fontWeight: '500', background: '#f0f4f8', padding: '4px 12px', borderRadius: '6px' }}>
              {roleLabels[profile.role]}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>📅 註冊日期</span>
            <span style={{ fontWeight: '500' }}>
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-HK') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          快捷功能
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            background: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}>
            🔒 更改密碼
          </button>
          <button style={{
            width: '100%',
            padding: '12px',
            background: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}>
            🔔 通知設置
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => {
          if (confirm('確定要登出嗎？')) {
            signOut()
          }
        }}
        style={{
          width: '100%',
          padding: '14px',
          background: '#fee2e2',
          color: '#dc2626',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        🚪 登出帳戶
      </button>
    </div>
  )
}
