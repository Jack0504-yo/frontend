import React, { useState } from 'react'
import { Form, Input, Button, InputNumber, Switch, Card, Typography, Spin, Divider, Alert, message, Tooltip } from 'antd'
import { ArrowLeftOutlined, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { saveDonation } from '../services/donationService'
import { v4 as uuidv4 } from 'uuid'

const { Title, Text } = Typography

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const TotalAmount = styled.div`
  background-color: #f6f6f6;
  padding: 16px;
  border-radius: 4px;
  margin: 24px 0;
  text-align: center;
  border: 1px dashed #d9d9d9;
  
  .amount {
    font-size: 28px;
    font-weight: bold;
    color: var(--primary-color);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

function DonationPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [totalPrice, setTotalPrice] = useState(1000)
  const [isProxy, setIsProxy] = useState(false)
  const navigate = useNavigate()

  const calculateTotal = (units) => {
    const unitPrice = 1000
    return units ? units * unitPrice : unitPrice
  }

  const handleUnitsChange = (value) => {
    setTotalPrice(calculateTotal(value))
  }

  const handleProxyChange = (checked) => {
    setIsProxy(checked)
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      
      await saveDonation({
        id: uuidv4(),
        game_id: values.game_id,
        units: values.units,
        total_price: totalPrice,
        is_proxy: values.is_proxy,
        proxy_game_id: values.is_proxy ? values.proxy_game_id : null,
        created_at: new Date()
      })
      
      message.success('抖內提交成功！')
      form.resetFields()
      setTotalPrice(1000)
      
      // 短暫延遲後重定向到首頁
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      console.error('提交錯誤:', error)
      message.error('提交過程中發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Title level={2}>歐拉谷抖內</Title>
      
      <FormContainer>
        <Card variant="outlined">
          <Alert
            message="系統維護通知"
            description="抖內功能目前正在維護中，暫時無法使用。造成不便敬請見諒。"
            type="warning"
            showIcon
            icon={<ToolOutlined />}
            style={{ marginBottom: 24 }}
          />
          
          <Alert
            message="抖內說明"
            description="每單位金額為 1000。選擇代抖可以為其他遊戲帳號進行抖內。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ units: 1, is_proxy: false }}
            >
              <Form.Item
                name="game_id"
                label="遊戲帳號 ID"
                rules={[{ required: true, message: '請輸入您的遊戲帳號 ID' }]}
              >
                <Input placeholder="請輸入您的遊戲帳號 ID" disabled />
              </Form.Item>
              
              <Form.Item
                name="units"
                label="抖內單數"
                rules={[{ required: true, message: '請輸入抖內單數' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  onChange={handleUnitsChange}
                  disabled
                />
              </Form.Item>
              
              <Form.Item
                name="is_proxy"
                label="是否代抖"
                valuePropName="checked"
              >
                <Switch onChange={handleProxyChange} disabled />
              </Form.Item>
              
              {isProxy && (
                <Form.Item
                  name="proxy_game_id"
                  label="代抖目標 ID"
                  rules={[{ required: isProxy, message: '請輸入代抖目標 ID' }]}
                >
                  <Input placeholder="請輸入代抖目標的遊戲帳號 ID" disabled />
                </Form.Item>
              )}
              
              <Divider />
              
              <TotalAmount>
                <Text>總金額</Text>
                <div className="amount">{totalPrice} 元</div>
              </TotalAmount>
              
              <ButtonContainer>
                <Button icon={<ArrowLeftOutlined />}>
                  <Link to="/">返回首頁</Link>
                </Button>
                <Tooltip title="系統維護中，暫時無法使用">
                  <Button type="primary" htmlType="submit" loading={loading} disabled>
                    維護中
                  </Button>
                </Tooltip>
              </ButtonContainer>
            </Form>
          </Spin>
        </Card>
      </FormContainer>
    </div>
  )
}

export default DonationPage