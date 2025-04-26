import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import zhTW from 'antd/lib/locale/zh_TW'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
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
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      },
    }}
  >
    <AntApp>
      <App />
    </AntApp>
  </ConfigProvider>
)