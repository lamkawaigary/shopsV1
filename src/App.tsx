import { Routes, Route, Navigate } from 'react-router-dom'
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
          <Route path="/shop" element={<div style={{ padding: '24px' }}>🛒 商店頁面</div>} />
          <Route path="/orders" element={<div style={{ padding: '24px' }}>📦 訂單頁面</div>} />
          <Route path="/projects" element={<div style={{ padding: '24px' }}>📋 專案頁面</div>} />
          <Route path="/cart" element={<div style={{ padding: '24px' }}>🛒 購物車頁面</div>} />
          <Route path="/favorites" element={<div style={{ padding: '24px' }}>❤️ 收藏頁面</div>} />
          
          {/* Merchant Pages */}
          <Route path="/merchant/orders" element={<div style={{ padding: '24px' }}>商戶訂單管理</div>} />
          <Route path="/merchant/products" element={<div style={{ padding: '24px' }}>商品管理</div>} />
          <Route path="/merchant/stats" element={<div style={{ padding: '24px' }}>銷售統計</div>} />
          <Route path="/merchant/settings" element={<div style={{ padding: '24px' }}>店舖設定</div>} />
          
          {/* Delivery Pages */}
          <Route path="/delivery/tasks" element={<div style={{ padding: '24px' }}>配送任務</div>} />
          <Route path="/delivery/history" element={<div style={{ padding: '24px' }}>配送歷史</div>} />
          <Route path="/delivery/earnings" element={<div style={{ padding: '24px' }}>收入統計</div>} />
          <Route path="/delivery/ratings" element={<div style={{ padding: '24px' }}>評價反饋</div>} />
          
          {/* Admin Pages */}
          <Route path="/admin/users" element={<div style={{ padding: '24px' }}>用戶管理</div>} />
          <Route path="/admin/merchants" element={<div style={{ padding: '24px' }}>商戶管理</div>} />
          <Route path="/admin/orders" element={<div style={{ padding: '24px' }}>訂單管理</div>} />
          <Route path="/admin/analytics" element={<div style={{ padding: '24px' }}>數據分析</div>} />
          <Route path="/admin/messages" element={<div style={{ padding: '24px' }}>消息中心</div>} />
          <Route path="/admin/settings" element={<div style={{ padding: '24px' }}>系統設定</div>} />
          
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
