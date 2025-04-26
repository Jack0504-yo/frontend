import React from 'react'
import { Card, Row, Col, Statistic, Typography, Button } from 'antd'
import { TeamOutlined, FileImageOutlined, DollarOutlined, PlusOutlined, GiftOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getPendingPostsCount } from '../../services/postService'
import { getDonationsTotal } from '../../services/donationService'
import { getAdminsCount } from '../../services/adminService'
import styled from 'styled-components'

const { Title } = Typography

const StyledCard = styled(Card)`
  height: 100%;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
  
  .ant-statistic-title {
    font-size: 16px;
  }
  
  .ant-statistic-content {
    color: var(--primary-color);
  }
`;

const ActionButton = styled(Button)`
  display: block;
  margin: 16px 0 0;
`;

function AdminDashboardPage() {
  const { currentUser, isSuperAdmin } = useAuth()
  const [pendingPostsCount, setPendingPostsCount] = useState(0)
  const [donationsTotal, setDonationsTotal] = useState(0)
  const [adminsCount, setAdminsCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const postsCount = await getPendingPostsCount()
      const total = isSuperAdmin ? await getDonationsTotal() : 0
      const admins = isSuperAdmin ? await getAdminsCount() : 0
      
      setPendingPostsCount(postsCount)
      setDonationsTotal(total)
      setAdminsCount(admins)
    }
    
    fetchData()
  }, [isSuperAdmin])

  return (
    <div className="page-container">
      <Title level={2}>管理員控制面板</Title>
      <Title level={5} style={{ marginBottom: 24 }}>
        歡迎回來，{currentUser.username}
        {isSuperAdmin && <span style={{ marginLeft: 8, color: '#ff9900' }}>(超級管理員)</span>}
      </Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={isSuperAdmin ? 6 : 8}>
          <StyledCard>
            <Statistic
              title="待審核圖片"
              value={pendingPostsCount}
              prefix={<FileImageOutlined style={{ color: '#3366CC' }} />}
            />
            <ActionButton type="primary" ghost onClick={() => navigate('/admin/image-review')}>
              查看待審核圖片
            </ActionButton>
          </StyledCard>
        </Col>
        
        {isSuperAdmin && (
          <Col xs={24} md={6}>
            <StyledCard>
              <Statistic
                title="抖內總金額"
                value={donationsTotal}
                suffix="元"
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
              <ActionButton type="primary" ghost onClick={() => navigate('/admin/donation-records')}>
                查看抖內記錄
              </ActionButton>
            </StyledCard>
          </Col>
        )}
        
        {isSuperAdmin && (
          <Col xs={24} md={6}>
            <StyledCard>
              <Statistic
                title="管理員帳戶"
                value={adminsCount}
                prefix={<TeamOutlined style={{ color: '#faad14' }} />}
              />
              <ActionButton type="primary" ghost onClick={() => navigate('/admin/list')}>
                查看管理員列表
              </ActionButton>
              <ActionButton type="primary" ghost onClick={() => navigate('/admin/create')}>
                <PlusOutlined /> 新增管理員
              </ActionButton>
            </StyledCard>
          </Col>
        )}

        {/* 禮包管理入口 - 對所有管理員可見 */}
        <Col xs={24} md={isSuperAdmin ? 6 : 8}>
          <StyledCard>
            <Statistic
              title="禮包管理"
              value="禮包碼"
              prefix={<GiftOutlined style={{ color: '#eb2f96' }} />}
            />
            <ActionButton type="primary" ghost onClick={() => navigate('/admin/gift-codes')}>
              管理禮包碼
            </ActionButton>
          </StyledCard>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="系統資訊" variant="outlined">
            <p>後台版本: 1.0.0</p>
            <p>最後登入時間: {new Date().toLocaleString()}</p>
            {isSuperAdmin && <p>帳戶類型: 超級管理員</p>}
            {!isSuperAdmin && <p>帳戶類型: 一般管理員</p>}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboardPage