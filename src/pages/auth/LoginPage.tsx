import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/config/firebase'

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
      await signInWithGoogle()
      console.log('✅ Google login completed')

      // After Google login succeeds, immediately check Firebase auth state
      const firebaseUser = auth.currentUser
      
      if (firebaseUser) {
        console.log('🔍 Firebase user authenticated:', { uid: firebaseUser.uid, email: firebaseUser.email })
        
        // Try to fetch/create profile immediately
        const { fetchProfileByUid } = useAuthStore.getState()
        const profile = await fetchProfileByUid(firebaseUser.uid)
        console.log('✅ Profile fetched/created:', { role: profile?.role })
        
        // Manually update store to trigger redirect
        useAuthStore.setState({
          user: firebaseUser as any,
          initialized: true,
          loading: false,
          profile: profile || undefined,
          needsOnboarding: profile ? !profile.onboardingCompleted : false
        })
        
        // Navigation will happen via useEffect watching these state changes
        return
      }

      // Fallback: poll in case auth state is delayed
      console.log('⚠️ No Firebase user found immediately, falling back to polling')
      const start = Date.now()
      const timeout = 3000
      const checkInterval = setInterval(() => {
        const state = useAuthStore.getState()
        const currentAuthUser = auth.currentUser
        console.log('🔍 Polling:', { fbUser: !!currentAuthUser, storeUser: !!state.user, initialized: state.initialized })
        
        if (currentAuthUser && state.user && state.initialized) {
          clearInterval(checkInterval)
          console.log('✅ Auth state updated via polling')
          return
        }
        
        if (Date.now() - start > timeout) {
          clearInterval(checkInterval)
          console.warn('⚠️ Auth state timeout')
          setError('Google 登入已完成但狀態未更新，請重新整理頁面')
          setLoading(false)
        }
      }, 300)
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
