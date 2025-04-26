import React from 'react'
import { Layout, Menu, Button } from 'antd'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import styled from 'styled-components'

const { Header } = Layout

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #3366CC;
  padding: 0 24px;
  
  .logo {
    color: white;
    font-size: 20px;
    font-weight: bold;
    margin-right: 24px;
  }
  
  .ant-menu {
    flex: 1;
    background: transparent;
    border-bottom: none;
    
    .ant-menu-item {
      color: rgba(255, 255, 255, 0.8);
      
      &:hover {
        color: white;
      }
      
      &.ant-menu-item-selected {
        color: white;
        background-color: rgba(255, 255, 255, 0.1);
        
        &:after {
          border-bottom-color: #FF9900;
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 10px;
    
    .logo {
      margin-bottom: 10px;
    }
    
    .ant-menu {
      width: 100%;
    }
    
    .right-section {
      margin-top: 10px;
      align-self: flex-end;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

function AppHeader() {
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  const adminMenuItems = [
    { key: 'dashboard', label: '管理員首頁', icon: <DashboardOutlined />, onClick: () => navigate('/admin/dashboard') },
    { key: 'logout', label: '登出', icon: <LogoutOutlined />, onClick: handleLogout },
  ]
  
  const menuItems = [
    {
      key: '/submit-post',
      label: <Link to="/submit-post">提交推文</Link>
    },
    {
      key: '/donate',
      label: <Link to="/donate">歐拉谷抖內</Link>
    },
    {
      key: '/admin/login',
      label: <Link to="/admin/login">後台管理</Link>
    }
  ]
  
  return (
    <StyledHeader>
      <Link to="/" className="logo">歐拉谷</Link>
      
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ background: 'transparent' }}
        items={menuItems}
      />
      
      <RightSection className="right-section">
        {isAdmin && (
          <Button type="primary" ghost icon={<UserOutlined />} onClick={handleLogout}>
            登出
          </Button>
        )}
      </RightSection>
    </StyledHeader>
  )
}

export default AppHeader