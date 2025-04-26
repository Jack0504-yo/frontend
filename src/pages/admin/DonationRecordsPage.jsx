import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Typography, message, Tag, Input, DatePicker, Form } from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { getAllDonations } from '../../services/donationService'
import styled from 'styled-components'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    .search-form {
      margin-bottom: 16px;
      width: 100%;
    }
    
    .action-buttons {
      width: 100%;
    }
  }
`;

function DonationRecordsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [form] = Form.useForm()

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const donations = await getAllDonations()
      setData(donations)
      setFilteredData(donations)
    } catch (error) {
      console.error('獲取抖內記錄錯誤:', error)
      message.error('獲取抖內記錄失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  const handleSearch = () => {
    const values = form.getFieldsValue()
    
    let filtered = [...data]
    
    if (values.gameId) {
      filtered = filtered.filter(
        item => item.game_id.toLowerCase().includes(values.gameId.toLowerCase())
      )
    }
    
    if (values.dateRange && values.dateRange.length === 2) {
      const startDate = values.dateRange[0].startOf('day')
      const endDate = values.dateRange[1].endOf('day')
      
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.created_at)
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate)
      })
    }
    
    setFilteredData(filtered)
  }

  const resetSearch = () => {
    form.resetFields()
    setFilteredData(data)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '遊戲帳號',
      dataIndex: 'game_id',
      key: 'game_id',
      width: 150,
    },
    {
      title: '抖內單數',
      dataIndex: 'units',
      key: 'units',
      width: 100,
    },
    {
      title: '總金額',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `${price} 元`,
      width: 120,
    },
    {
      title: '是否代抖',
      dataIndex: 'is_proxy',
      key: 'is_proxy',
      render: (isProxy) => (
        isProxy ? <Tag color="green">是</Tag> : <Tag color="blue">否</Tag>
      ),
      width: 100,
    },
    {
      title: '代抖目標',
      dataIndex: 'proxy_game_id',
      key: 'proxy_game_id',
      render: (id) => id || '-',
      width: 150,
    },
    {
      title: '抖內時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt) => dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
      width: 180,
    },
  ]

  const totalAmount = filteredData.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <div className="page-container">
      <Title level={2}>抖內記錄</Title>
      
      <Card variant="outlined">
        <ActionsContainer>
          <Form 
            form={form} 
            layout="inline" 
            onFinish={handleSearch}
            className="search-form"
          >
            <Form.Item name="gameId" label="遊戲帳號">
              <Input placeholder="輸入遊戲帳號搜尋" />
            </Form.Item>
            
            <Form.Item name="dateRange" label="日期範圍">
              <RangePicker />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SearchOutlined />}
              >
                搜尋
              </Button>
            </Form.Item>
            
            <Form.Item>
              <Button onClick={resetSearch}>
                重置
              </Button>
            </Form.Item>
          </Form>
          
          <div className="action-buttons">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDonations}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </ActionsContainer>
        
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>
            共 {filteredData.length} 條記錄，總金額：{totalAmount} 元
          </Typography.Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}

export default DonationRecordsPage