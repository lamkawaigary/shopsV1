import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, user, loading: storeLoading, needsOnboarding, initialized } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    console.log('🔍 LoginPage useEffect triggered:', { user: !!user, storeLoading, needsOnboarding, initialized })
    
    if (!initialized) {
      console.log('⏳ Waiting for auth initialization...')
      return
    }

    if (storeLoading) {
      console.log('⏳ Store is loading...')
      return
    }

    if (user) {
      if (needsOnboarding) {
        console.log('➡️ User needs onboarding, redirecting to /onboarding')
        navigate('/onboarding', { replace: true })
      } else {
        console.log('➡️ User already authenticated, redirecting to /')
        navigate('/', { replace: true })
      }
    } else {
      console.log('✅ Not authenticated, staying on login page')
    }
  }, [user, storeLoading, needsOnboarding, navigate, initialized])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || '登入失敗，請檢查電郵和密碼')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      console.log('🔵 Starting Google login...')
      const result = await signInWithGoogle()
      console.log('✅ Google login completed, result:', { uid: result?.user?.uid, email: result?.user?.email })

      // Try to fetch/create the profile immediately using the returned UID
      const uid = result?.user?.uid
      if (uid) {
        try {
          const profile = await useAuthStore.getState().fetchProfileByUid(uid)
          if (profile) {
            if (profile.onboardingCompleted) {
              navigate('/', { replace: true })
            } else {
              navigate('/onboarding', { replace: true })
            }
            setLoading(false)
            return
          }
        } catch (e) {
          console.warn('⚠️ Immediate profile fetch failed, will fallback to polling', e)
        }
      }

      // Fallback: if auth listener is delayed, poll the auth store and navigate
      const start = Date.now()
      const timeout = 3000
      const poll = async () => {
        while (Date.now() - start < timeout) {
          const state = useAuthStore.getState()
          if (state.initialized && state.user) {
            // If onboarding is needed, navigate there, else to home
            if (state.needsOnboarding) {
              navigate('/onboarding', { replace: true })
            } else {
              navigate('/', { replace: true })
            }
            return
          }
          // wait a bit
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 200))
        }
        // If still not initialized, show an error and stop loading
        console.warn('⚠️ Auth listener delayed after Google login')
        setError('登入已完成但尚未更新狀態，請稍候或重新整理頁面')
        setLoading(false)
      }
      void poll()
    } catch (err: any) {
      console.error('❌ Google login error:', err)
      setError(err.message || 'Google 登入失敗')
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>ShopS</h1>
          <p style={{ color: '#666' }}>登入你的帳戶</p>
        </div>

        {/* Error */}
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

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} style={{ marginBottom: '16px' }}>
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
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          <span style={{ padding: '0 16px', color: '#999', fontSize: '14px' }}>或者</span>
          <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
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
          <span>🔵</span> Google 登入
        </button>

        {/* Register Link */}
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          未有帳戶？{' '}
          <span 
            onClick={() => navigate('/register')}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
          >
            立即註冊
          </span>
        </p>
      </div>
    </div>
  )
}
