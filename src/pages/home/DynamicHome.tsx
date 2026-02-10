import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * 動態首頁 - 根據用戶身份自動路由到相應首頁
 * /               → 檢查身份 → /home/customer, /home/merchant 等
 */
export function DynamicHome() {
  const { profile } = useAuthStore()

  console.log('🏠 DynamicHome - profile:', { role: profile?.role, email: profile?.email })

  // Fallback to customer if role is undefined
  const role = profile?.role || 'customer'
  const routePath = `/home/${role}`
  console.log('🏠 DynamicHome - routing to:', routePath)

  switch (role) {
    case 'customer':
      return <Navigate to="/home/customer" replace />
    case 'merchant':
      return <Navigate to="/home/merchant" replace />
    case 'delivery':
      return <Navigate to="/home/delivery" replace />
    case 'admin':
      return <Navigate to="/home/admin" replace />
    default:
      // Final fallback to customer
      return <Navigate to="/home/customer" replace />
  }
}
