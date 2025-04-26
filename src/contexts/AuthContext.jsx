import React, { createContext, useState, useEffect, useContext } from 'react'
import { message, App } from 'antd'
import { getAdminByUsername } from '../services/adminService'
import { jwtDecode } from 'jwt-decode'
import { API_BASE_URL } from '../config/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { message: antMessage } = App.useApp()  // 使用 App 的 message API

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    
    if (token) {
      try {
        const decoded = jwtDecode(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp && decoded.exp > currentTime) {
          setCurrentUser({
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          })
        } else {
          localStorage.removeItem('authToken')
        }
      } catch (error) {
        console.error('Token 解析錯誤:', error)
        localStorage.removeItem('authToken')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)  // 5秒超時

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        antMessage.error(data.message || '用戶名或密碼錯誤')
        return false
      }

      localStorage.setItem('authToken', data.token)
      
      setCurrentUser({
        id: data.user.id,
        username: data.user.username,
        role: data.user.role
      })
      
      return true
    } catch (error) {
      console.error('登入錯誤:', error)
      if (error.name === 'AbortError') {
        antMessage.error('連接超時，請檢查網絡連接')
      } else {
        antMessage.error('登入過程中發生錯誤，請稍後重試')
      }
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setCurrentUser(null)
    antMessage.success('已成功登出')
  }

  const value = {
    currentUser,
    login,
    logout,
    isSuperAdmin: currentUser?.role === 'super_admin',
    isAdmin: !!currentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}