import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Spin, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const { Title } = Typography

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 40px auto;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  h2 {
    margin-top: 16px;
    color: var(--primary-color);
  }
`;

const StyledCard = styled(Card)`
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

function AdminLoginPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loginFailed, setLoginFailed] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setLoginFailed(false)
      
      const success = await login(values.username, values.password)
      
      if (success) {
        navigate('/admin/dashboard')
      } else {
        setLoginFailed(true)
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      setLoginFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <LoginContainer>
        <LogoSection>
          <Title level={2}>管理員登入</Title>
        </LogoSection>
        
        <StyledCard variant="outlined">
          <Spin spinning={loading}>
            {loginFailed && (
              <Alert
                message="登入失敗"
                description="用戶名或密碼錯誤，請重試。"
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}
            
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '請輸入用戶名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用戶名"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '請輸入密碼' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密碼"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                >
                  登入
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </StyledCard>
      </LoginContainer>
    </div>
  )
}

export default AdminLoginPage