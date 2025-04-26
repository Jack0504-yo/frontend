import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Result, Button } from 'antd'

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { currentUser, isSuperAdmin } = useAuth()

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="page-container">
        <Result
          status="403"
          title="權限不足"
          subTitle="對不起，您沒有訪問此頁面的權限。"
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              返回
            </Button>
          }
        />
      </div>
    )
  }

  return children
}

export default ProtectedRoute