import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

const roleConfig: Record<UserRole, { navItems: Array<{ label: string; path: string; icon: string }> }> = {
  customer: {
    navItems: [
      { label: '首頁', path: '/home/customer', icon: '🏠' },
      { label: '專案', path: '/projects', icon: '📋' },
      { label: '商店', path: '/shop', icon: '🛒' },
      { label: '訂單', path: '/orders', icon: '📦' },
      { label: '我的', path: '/profile', icon: '👤' }
    ]
  },
  merchant: {
    navItems: [
      { label: '首頁', path: '/home/merchant', icon: '🏪' },
      { label: '訂單', path: '/merchant/orders', icon: '📦' },
      { label: '商品', path: '/merchant/products', icon: '🏷️' },
      { label: '統計', path: '/merchant/stats', icon: '📊' },
      { label: '設定', path: '/merchant/settings', icon: '⚙️' }
    ]
  },
  delivery: {
    navItems: [
      { label: '首頁', path: '/home/delivery', icon: '🚗' },
      { label: '任務', path: '/delivery/tasks', icon: '📍' },
      { label: '歷史', path: '/delivery/history', icon: '📋' },
      { label: '收入', path: '/delivery/earnings', icon: '💰' }
    ]
  },
  admin: {
    navItems: [
      { label: '總覽', path: '/home/admin', icon: '📊' },
      { label: '用戶', path: '/admin/users', icon: '👥' },
      { label: '商戶', path: '/admin/merchants', icon: '🏪' },
      { label: '訂單', path: '/admin/orders', icon: '📦' }
    ]
  }
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, loading, signOut } = useAuthStore()
  const { getItemCount } = useCartStore()
  const [signingOut, setSigningOut] = useState(false)
  const cartCount = getItemCount()
  
  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      console.log('🔑 Signed out, redirecting to login...')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
      setSigningOut(false)
    }
  }
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <div style={{ fontSize: '18px' }}>載入中...</div>
        </div>
      </div>
    )
  }
  
  const navConfig = profile?.role ? roleConfig[profile.role] : null
  
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🛒</span>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>ShopS</h1>
          </div>
          
          {user && profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {profile.role === 'customer' && (
                <button 
                  onClick={() => navigate('/cart')}
                  style={{ 
                    position: 'relative',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  🛒
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              
              <div style={{ 
                background: '#e2e8f0', 
                padding: '4px 12px', 
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {profile.role === 'customer' && '客戶'}
                {profile.role === 'merchant' && '商戶'}
                {profile.role === 'delivery' && '外送員'}
                {profile.role === 'admin' && '管理員'}
              </div>
              
              <button 
                onClick={handleSignOut}
                disabled={signingOut}
                style={{
                  background: signingOut ? '#a5f3fc' : '#ef4444',
                  color: signingOut ? '#0369a1' : 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: signingOut ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
              >
                {signingOut ? '登出中...' : '登出'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        paddingTop: '72px',
        paddingBottom: navConfig ? '80px' : '0',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {!user ? (
          <Outlet />
        ) : (
          <Outlet />
        )}
      </main>
      
      {/* Bottom Navigation */}
      {navConfig && (
        <nav style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          background: 'white', 
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 6px rgba(0,0,0,0.05)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {navConfig.navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: location.pathname === item.path ? '#2563eb' : '#94a3b8',
                  transition: 'color 0.2s'
                }}
              >
                <span style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: location.pathname === item.path ? 'bold' : 'normal' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
