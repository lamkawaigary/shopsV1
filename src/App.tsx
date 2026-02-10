import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OnboardingPage } from './pages/auth/OnboardingPage'
import { ProfilePage } from './pages/customer/ProfilePage'

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
        <Route element={<AppLayout />}>
          <Route path="/" element={
            <div style={{ padding: '16px', textAlign: 'center', marginTop: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>歡迎使用 ShopS</h1>
              <p style={{ color: '#64748b' }}>登入成功！呢度係首頁。</p>
            </div>
          } />
          <Route path="/projects" element={<div>專案</div>} />
          <Route path="/shop" element={<div>商店</div>} />
          <Route path="/orders" element={<div>訂單</div>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
