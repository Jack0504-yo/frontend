import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Typography, message, Tag, Popconfirm, Modal } from 'antd'
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import { getPendingPosts, updatePostStatus } from '../../services/postService'
import styled from 'styled-components'
import dayjs from 'dayjs'

const { Title } = Typography

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  
  &:hover {
    border-color: #1890ff;
  }
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
`;

function ImageReviewPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const posts = await getPendingPosts()
      setData(posts)
    } catch (error) {
      console.error('獲取待審核圖片錯誤:', error)
      message.error('獲取待審核圖片失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleApprove = async (id) => {
    try {
      await updatePostStatus(id, 'approved')
      message.success('審核通過，已添加至資格名單')
      fetchPosts()
    } catch (error) {
      console.error('審核錯誤:', error)
      message.error(error.message || '審核操作失敗')
    }
  }

  const handleReject = async (id) => {
    try {
      await updatePostStatus(id, 'rejected')
      message.success('已拒絕')
      fetchPosts()
    } catch (error) {
      console.error('審核錯誤:', error)
      message.error('審核操作失敗')
    }
  }

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl)
    setPreviewVisible(true)
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
      title: '168 論壇圖片',
      dataIndex: 'image_168',
      key: 'image_168',
      render: (image) => (
        <ImagePreview 
          src={image}
          alt="168 論壇圖片"
          onClick={() => handlePreview(image)}
        />
      ),
    },
    {
      title: 'DC 圖片',
      dataIndex: 'image_dc',
      key: 'image_dc',
      render: (image) => (
        <ImagePreview 
          src={image}
          alt="DC 圖片"
          onClick={() => handlePreview(image)}
        />
      ),
    },
    {
      title: '提交時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => dayjs(created_at).format('YYYY-MM-DD HH:mm'),
      width: 180,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = '待審核';
        
        if (status === 'approved') {
          color = 'green';
          text = '已通過';
        } else if (status === 'rejected') {
          color = 'red';
          text = '已拒絕';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="確認審核通過？"
            description="通過後將自動添加至資格名單"
            onConfirm={() => handleApprove(record.id)}
            okText="確認"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckOutlined />}
              disabled={record.status !== 'pending'}
            >
              通過
            </Button>
          </Popconfirm>
          
          <Popconfirm
            title="確認拒絕？"
            onConfirm={() => handleReject(record.id)}
            okText="確認"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<CloseOutlined />}
              disabled={record.status !== 'pending'}
            >
              拒絕
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ]

  return (
    <div className="page-container">
      <Title level={2}>圖片審核</Title>
      
      <Card>
        <ActionsContainer>
          <div>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPosts}
              loading={loading}
            >
              刷新
            </Button>
          </div>
          
          <div>
            共 {data.length} 條待審核記錄
          </div>
        </ActionsContainer>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        centered
      >
        <ModalImage src={previewImage} alt="預覽圖片" />
      </Modal>
    </div>
  )
}

export default ImageReviewPage