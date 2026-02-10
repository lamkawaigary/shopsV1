import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/stores/authStore'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, initialized } = useAuthStore()
  
  console.log('🔐 ProtectedRoute:', { user: !!user, loading, initialized, role: profile?.role })
  
  if (loading || !initialized) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <div style={{ fontSize: '18px' }}>載入中...</div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    console.log('↪️ No user, redirecting to /login')
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    console.log('↪️ User role not allowed, redirecting to /unauthorized')
    return <Navigate to="/unauthorized" replace />
  }
  
  console.log('✅ ProtectedRoute: User authorized')
  return <Outlet />
}
