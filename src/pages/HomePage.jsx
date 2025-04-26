import React from 'react'
import { Button, Card, Row, Col, Typography } from 'antd'
import { FileImageOutlined, DollarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const { Title, Paragraph } = Typography

const FeatureCard = styled(Card)`
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-head {
    background: #f7f7f7;
  }
  
  .card-icon {
    font-size: 40px;
    color: var(--primary-color);
    margin-bottom: 16px;
  }
`;

function HomePage() {
  return (
    <div className="page-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <FeatureCard
            title="推文提交"
            variant={false}
          >
            <div className="card-icon">
              <FileImageOutlined />
            </div>
            <Typography.Title level={4}>遊戲帳戶推文</Typography.Title>
            <Paragraph>
              提交您的遊戲帳號 ID 並上傳來自 168 論壇和 DC 的兩張圖片。
              每個遊戲帳號每天只能提交一次。
            </Paragraph>
            <Button type="primary">
              <Link to="/submit-post">立即提交</Link>
            </Button>
          </FeatureCard>
        </Col>
        
        <Col xs={24} md={12}>
          <FeatureCard
            title="歐拉谷抖內"
            variant={false}
          >
            <div className="card-icon">
              <DollarOutlined />
            </div>
            <Typography.Title level={4}>遊戲帳戶抖內</Typography.Title>
            <Paragraph>
              進行歐拉谷抖內，支持您喜愛的遊戲。可選擇代抖功能，
              支持指定的遊戲帳號。每單位 1000，自動計算總金額。
            </Paragraph>
            <Button type="primary">
              <Link to="/donate">開始抖內</Link>
            </Button>
          </FeatureCard>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage