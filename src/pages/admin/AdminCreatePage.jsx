import React, { useState } from 'react'
import { Form, Input, Button, Card, Radio, Typography, Spin, App } from 'antd'
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { createAdmin, getAdminByUsername } from '../../services/adminService'

const { Title } = Typography

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

function AdminCreatePage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const onFinish = async (values) => {
    try {
      setLoading(true)
      
      // 檢查用戶名是否已存在
      const existingAdmin = await getAdminByUsername(values.username)
      
      if (existingAdmin) {
        message.error('該用戶名已存在')
        setLoading(false)
        return
      }
      
      // 創建新管理員
      await createAdmin({
        username: values.username,
        password: values.password,
        role: values.role
      })
      
      message.success('管理員創建成功')
      form.resetFields()
      
      // 短暫延遲後重定向到首頁
      setTimeout(() => {
        navigate('/admin/dashboard')
      }, 1500)
    } catch (error) {
      console.error('創建管理員錯誤:', error)
      message.error('創建過程中發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Title level={2}>新增管理員帳戶</Title>
      
      <FormContainer>
        <Card>
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ role: 'admin' }}
            >
              <Form.Item
                name="username"
                label="用戶名"
                rules={[
                  { required: true, message: '請輸入用戶名' },
                  { min: 3, message: '用戶名至少 3 個字元' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="請輸入用戶名"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密碼"
                rules={[
                  { required: true, message: '請輸入密碼' },
                  { min: 6, message: '密碼至少 6 個字元' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="請輸入密碼"
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="確認密碼"
                dependencies={['password']}
                rules={[
                  { required: true, message: '請確認密碼' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('兩次輸入的密碼不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="請再次輸入密碼"
                />
              </Form.Item>
              
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '請選擇角色' }]}
              >
                <Radio.Group>
                  <Radio value="admin">一般管理員</Radio>
                  <Radio value="super_admin">超級管理員</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />} 
                  loading={loading}
                >
                  創建管理員
                </Button>
                <Button 
                  style={{ marginLeft: 8 }}
                  onClick={() => navigate('/admin/dashboard')}
                >
                  返回
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </FormContainer>
    </div>
  )
}

export default AdminCreatePage