import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OnboardingPage } from './pages/auth/OnboardingPage'
import { ProfilePage } from './pages/customer/ProfilePage'
import { CustomerHome } from './pages/home/CustomerHome'
import { MerchantHome } from './pages/home/MerchantHome'
import { DeliveryHome } from './pages/home/DeliveryHome'
import { AdminHome } from './pages/home/AdminHome'
import { DynamicHome } from './pages/home/DynamicHome'

// Simple placeholder page with back button to aid testing
function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← 返回
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <h2 style={{ fontSize: '24px' }}>{title}</h2>
      </div>
    </div>
  )
}

function App() {
  console.log('📱 App rendering')
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* All app pages wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          {/* Dynamic Home - routes to role-specific home */}
          <Route path="/" element={<DynamicHome />} />
          
          {/* Role-specific Homes */}
          <Route path="/home/customer" element={<CustomerHome />} />
          <Route path="/home/merchant" element={<MerchantHome />} />
          <Route path="/home/delivery" element={<DeliveryHome />} />
          <Route path="/home/admin" element={<AdminHome />} />
          
          {/* Customer Pages */}
          <Route path="/shop" element={<PlaceholderPage title="商店頁面" icon="🛒" />} />
          <Route path="/orders" element={<PlaceholderPage title="訂單頁面" icon="📦" />} />
          <Route path="/projects" element={<PlaceholderPage title="專案頁面" icon="📋" />} />
          <Route path="/cart" element={<PlaceholderPage title="購物車頁面" icon="🛒" />} />
          <Route path="/favorites" element={<PlaceholderPage title="收藏頁面" icon="❤️" />} />
          
          {/* Merchant Pages */}
          <Route path="/merchant/orders" element={<PlaceholderPage title="商戶訂單管理" icon="📦" />} />
          <Route path="/merchant/products" element={<PlaceholderPage title="商品管理" icon="🏷️" />} />
          <Route path="/merchant/stats" element={<PlaceholderPage title="銷售統計" icon="📊" />} />
          <Route path="/merchant/settings" element={<PlaceholderPage title="店舖設定" icon="⚙️" />} />
          
          {/* Delivery Pages */}
          <Route path="/delivery/tasks" element={<PlaceholderPage title="配送任務" icon="📍" />} />
          <Route path="/delivery/history" element={<PlaceholderPage title="配送歷史" icon="📋" />} />
          <Route path="/delivery/earnings" element={<PlaceholderPage title="收入統計" icon="💰" />} />
          <Route path="/delivery/ratings" element={<PlaceholderPage title="評價反饋" icon="⭐" />} />
          
          {/* Admin Pages */}
          <Route path="/admin/users" element={<PlaceholderPage title="用戶管理" icon="👥" />} />
          <Route path="/admin/merchants" element={<PlaceholderPage title="商戶管理" icon="🏪" />} />
          <Route path="/admin/orders" element={<PlaceholderPage title="訂單管理" icon="📦" />} />
          <Route path="/admin/analytics" element={<PlaceholderPage title="數據分析" icon="📊" />} />
          <Route path="/admin/messages" element={<PlaceholderPage title="消息中心" icon="💬" />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="系統設定" icon="⚙️" />} />
          
          {/* Common Pages */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
