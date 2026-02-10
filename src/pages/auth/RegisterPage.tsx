import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, signInWithGoogle, user, loading: storeLoading, needsOnboarding, initialized } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [useGoogle, setUseGoogle] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!initialized) {
      return
    }

    if (storeLoading) {
      return
    }

    if (user) {
      if (needsOnboarding) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [user, storeLoading, needsOnboarding, navigate, initialized])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('密碼不一致')
      return
    }

    if (password.length < 6) {
      setError('密碼必須至少6位')
      return
    }

    setLoading(true)
    
    try {
      await register(email, password, role)
      // Auto redirect happened through user state change
    } catch (err: any) {
      setError(err.message || '註冊失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError('')
    setLoading(true)
    
    try {
      // Pass the selected role to Google registration
      await signInWithGoogle(role)
      // Auto redirect happens via useEffect watching user state
    } catch (err: any) {
      setError(err.message || 'Google 註冊失敗')
      setLoading(false)
    }
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
        borderRadius: '16px', 
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>ShopS</h1>
          <p style={{ color: '#666' }}>建立新帳戶</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            帳戶類型
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={{
              width: '100%',
              padding: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="customer">客戶</option>
            <option value="merchant">商戶</option>
            <option value="delivery">外送員</option>
          </select>
        </div>

        {!useGoogle ? (
          <>
            <form onSubmit={handleRegister} style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="電郵地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <input
                type="password"
                placeholder="密碼 (最少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
                minLength={6}
              />
              <input
                type="password"
                placeholder="確認密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#ccc' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {loading ? '註冊中...' : '使用電郵註冊'}
              </button>
            </form>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
              <span style={{ padding: '0 16px', color: '#999', fontSize: '14px' }}>或者</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            </div>

            <button
              onClick={() => setUseGoogle(true)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>🔵</span> 使用 Google 註冊
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              ✅ 身份類型已選擇：<strong>{role === 'customer' ? '客戶' : role === 'merchant' ? '商戶' : '外送員'}</strong>
            </div>

            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {loading ? '註冊中...' : '確認並使用 Google 註冊'}
            </button>

            <button
              onClick={() => setUseGoogle(false)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ☜ 回到電郵註冊
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          已有帳戶？{' '}
          <span 
            onClick={() => navigate('/login')}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
          >
            立即登入
          </span>
        </p>
      </div>
    </div>
  )
}
