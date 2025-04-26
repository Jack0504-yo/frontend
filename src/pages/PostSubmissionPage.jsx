import React, { useState } from 'react'
import { Form, Input, Button, Upload, message, Card, Typography, Spin, Alert, App } from 'antd'
import { InboxOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { savePost, checkDailySubmission } from '../services/postService'
import { v4 as uuidv4 } from 'uuid'

const { Title, Text } = Typography
const { Dragger, TextArea } = Upload

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

function PostSubmissionPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [image168File, setImage168File] = useState(null)
  const [imageDCFile, setImageDCFile] = useState(null)
  const navigate = useNavigate()
  const { message: appMessage } = App.useApp()

  const uploadProps = (setFileFunc) => ({
    accept: '.jpg,.jpeg,.png',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        appMessage.error('您只能上傳圖片檔案!')
      }
      const isLessThan5M = file.size / 1024 / 1024 < 5
      if (!isLessThan5M) {
        appMessage.error('圖片必須小於 5MB!')
      }
      return isImage && isLessThan5M ? true : Upload.LIST_IGNORE
    },
    onChange: (info) => {
      const { status } = info.file
      if (status === 'done') {
        setFileFunc(info.file.originFileObj)
        appMessage.success(`${info.file.name} 圖片上傳成功`)
      } else if (status === 'error') {
        appMessage.error(`${info.file.name} 圖片上傳失敗`)
      }
    },
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess('ok')
      }, 0)
    }
  })

  const onFinish = async (values) => {
    try {
      setLoading(true)
      
      // 檢查是否已提交過
      const alreadySubmitted = await checkDailySubmission(values.game_id)
      if (alreadySubmitted) {
        appMessage.error('該遊戲帳號今日已經提交過推文')
        setLoading(false)
        return
      }
      
      if (!image168File || !imageDCFile) {
        appMessage.error('請上傳兩張必要的圖片')
        setLoading(false)
        return
      }
      
      // 模擬圖片上傳並獲取 URL
      const image168Url = URL.createObjectURL(image168File)
      const imageDCUrl = URL.createObjectURL(imageDCFile)
      
      // 儲存推文
      await savePost({
        id: uuidv4(),
        game_id: values.game_id,
        image_168: image168Url,
        image_dc: imageDCUrl,
        status: 'pending',
        created_at: new Date()
      })
      
      appMessage.success('推文提交成功！')
      form.resetFields()
      setImage168File(null)
      setImageDCFile(null)
      
      // 短暫延遲後重定向到首頁
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      console.error('提交錯誤:', error)
      appMessage.error('提交過程中發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Title level={2}>推文提交</Title>
      
      <FormContainer>
        <Card variant="outlined">
          <Alert
            message="提交須知"
            description="每個遊戲帳號每天只能提交一次。請確保上傳的圖片符合要求：一張來自 168 論壇，一張來自 DC。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="game_id"
                label="遊戲帳號 ID"
                rules={[{ required: true, message: '請輸入您的遊戲帳號 ID' }]}
              >
                <Input placeholder="請輸入您的遊戲帳號 ID" />
              </Form.Item>
              
              <Form.Item
                name="image_168"
                label="168 論壇圖片"
                rules={[{ required: true, message: '請上傳 168 論壇圖片' }]}
                valuePropName="fileList"
                getValueFromEvent={e => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Dragger {...uploadProps(setImage168File)}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">點擊或拖拽文件到此區域以上傳</p>
                  <p className="ant-upload-hint">支持單個圖片上傳，大小不超過 5MB</p>
                </Dragger>
              </Form.Item>
              
              <Form.Item
                name="image_dc"
                label="DC 圖片"
                rules={[{ required: true, message: '請上傳 DC 圖片' }]}
                valuePropName="fileList"
                getValueFromEvent={e => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Dragger {...uploadProps(setImageDCFile)}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">點擊或拖拽文件到此區域以上傳</p>
                  <p className="ant-upload-hint">支持單個圖片上傳，大小不超過 5MB</p>
                </Dragger>
              </Form.Item>
              
              <ButtonContainer>
                <Button icon={<ArrowLeftOutlined />}>
                  <Link to="/">返回首頁</Link>
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  提交推文
                </Button>
              </ButtonContainer>
            </Form>
          </Spin>
        </Card>
      </FormContainer>
    </div>
  )
}

export default PostSubmissionPage