import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout, App as AntApp, ConfigProvider } from 'antd'
import zhTW from 'antd/lib/locale/zh_TW'
import AppHeader from './components/common/AppHeader'
import HomePage from './pages/HomePage'
import PostSubmissionPage from './pages/PostSubmissionPage'
import DonationPage from './pages/DonationPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCreatePage from './pages/admin/AdminCreatePage'
import AdminListPage from './pages/admin/AdminListPage'
import ImageReviewPage from './pages/admin/ImageReviewPage'
import DonationRecordsPage from './pages/admin/DonationRecordsPage'
import GiftCodePage from './pages/admin/GiftCodePage'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

const { Content, Footer } = Layout

// Router configuration with v7 features enabled
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

function App() {
  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        token: {
          colorPrimary: '#3366CC',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#1890ff',
          borderRadius: 4,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
        }
      }}
    >
      <AntApp>
        <AuthProvider>
          <Router {...routerConfig}>
            <Layout style={{ minHeight: '100vh' }}>
              <AppHeader />
              <Content className="site-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/submit-post" element={<PostSubmissionPage />} />
                  <Route path="/donate" element={<DonationPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/list" 
                    element={
                      <ProtectedRoute requireSuperAdmin={true}>
                        <AdminListPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/create" 
                    element={
                      <ProtectedRoute requireSuperAdmin={true}>
                        <AdminCreatePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/image-review" 
                    element={
                      <ProtectedRoute>
                        <ImageReviewPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/donation-records" 
                    element={
                      <ProtectedRoute>
                        <DonationRecordsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/gift-codes" 
                    element={
                      <ProtectedRoute>
                        <GiftCodePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Content>
              <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
                歐拉谷 ©{new Date().getFullYear()} 版權所有
              </Footer>
            </Layout>
          </Router>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  )
}

export default App