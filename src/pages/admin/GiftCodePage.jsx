import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  App,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getGiftCodes,
  createGiftCode,
  deleteGiftCode,
  extendGiftCode,
  getGiftCodeRedemptions,
  getGiftCodeLogs,
  updateGiftCodeAccounts,
} from '../../services/giftCodeService'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 24px;
  }
`

function GiftCodePage() {
  // 使用 App.useApp() 來獲取上下文功能
  const { message: contextMessage, modal: contextModal } = App.useApp();
  const { currentUser } = useAuth(); // 獲取當前用戶信息
  
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedCode, setSelectedCode] = useState(null)
  const [extendDatePickerValue, setExtendDatePickerValue] = useState(null)
  const [extendModalVisible, setExtendModalVisible] = useState(false)
  const [currentExtendId, setCurrentExtendId] = useState(null)
  const [accountModalVisible, setAccountModalVisible] = useState(false)
  const [currentAccountsId, setCurrentAccountsId] = useState(null)
  const [accountForm] = Form.useForm()
  const [form] = Form.useForm()

  // 檢查認證狀態
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('當前認證狀態:', {
      hasToken: !!token,
      currentUser: currentUser ? `${currentUser.username} (${currentUser.role})` : '未登錄'
    });
  }, [currentUser]);

  // 獲取禮包碼列表
  const fetchGiftCodes = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await getGiftCodes(page, pageSize)
      setData(response.data)
      setPagination({
        ...pagination,
        current: page,
        total: response.total,
      })
    } catch (error) {
      contextMessage.error(`獲取禮包碼列表失敗: ${error.message || '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGiftCodes()
  }, []) // 移除 form 依賴

  // 處理表格變更
  const handleTableChange = (newPagination) => {
    fetchGiftCodes(newPagination.current, newPagination.pageSize)
  }

  // 創建禮包碼
  const handleCreate = async (values) => {
    try {
      setLoading(true)
      const rewards = values.rewards.map((item) => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity),
      }))

      const data = {
        ...values,
        rewards: JSON.stringify(rewards),
        specific_accounts: values.type === 'specific' && values.specific_accounts 
          ? JSON.stringify(values.specific_accounts.split('\n').filter(line => line.trim())) 
          : null,
        expiry_date: values.expiry_date.format('YYYY-MM-DD HH:mm:ss'),
      }

      await createGiftCode(data)
      contextMessage.success('創建禮包碼成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchGiftCodes()
    } catch (error) {
      contextMessage.error(`創建禮包碼失敗: ${error.message || '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  // 刪除禮包碼
  const handleDelete = async (id) => {
    try {
      await deleteGiftCode(id)
      contextMessage.success('刪除禮包碼成功')
      fetchGiftCodes(pagination.current, pagination.pageSize)
    } catch (error) {
      contextMessage.error(`刪除禮包碼失敗: ${error.message || '未知錯誤'}`)
    }
  }

  // 延長有效期
  const handleExtend = async () => {
    try {
      if (!extendDatePickerValue || !currentExtendId) return;
      
      await extendGiftCode(currentExtendId, extendDatePickerValue.format('YYYY-MM-DD HH:mm:ss'))
      contextMessage.success('延長有效期成功')
      fetchGiftCodes(pagination.current, pagination.pageSize)
      setExtendModalVisible(false)
      setExtendDatePickerValue(null)
      setCurrentExtendId(null)
    } catch (error) {
      contextMessage.error(`延長有效期失敗: ${error.message || '未知錯誤'}`)
    }
  }

  // 顯示延長有效期的模態框
  const showExtendModal = (record) => {
    setCurrentExtendId(record.id)
    setExtendDatePickerValue(record.expiry_date ? dayjs(record.expiry_date) : null)
    setExtendModalVisible(true)
  }

  // 顯示添加帳號的模態框
  const showAccountModal = (record) => {
    if (record.type !== 'specific') {
      contextMessage.warning('只有特定帳號禮包才能添加帳號')
      return
    }
    
    setCurrentAccountsId(record.id)
    setSelectedCode(record)
    
    // 先設置 Modal 可見狀態，確保表單能夠正確綁定
    setAccountModalVisible(true)
    
    // 重置表單放在最後
    setTimeout(() => {
      accountForm.resetFields()
    }, 0)
  }

  // 處理添加帳號
  const handleAddAccounts = async (values) => {
    try {
      setLoading(true)
      
      // 解析現有帳號列表
      const existingAccounts = selectedCode.specific_accounts 
        ? JSON.parse(selectedCode.specific_accounts) 
        : []
      
      console.log('現有帳號數量:', existingAccounts.length);
      
      // 獲取新帳號列表 (去除空白行並去重)
      const newAccountsArray = values.accounts
        .split('\n')
        .map(acc => acc.trim())
        .filter(acc => acc && !existingAccounts.includes(acc))
      
      console.log('新帳號數量:', newAccountsArray.length);
      
      if (newAccountsArray.length === 0) {
        contextMessage.info('沒有需要添加的新帳號')
        setAccountModalVisible(false)
        return
      }
      
      // 合併帳號列表
      const updatedAccounts = [...existingAccounts, ...newAccountsArray]
      console.log('更新後總帳號數量:', updatedAccounts.length);
      
      // 向後端發送請求
      try {
        await updateGiftCodeAccounts(currentAccountsId, updatedAccounts)
        
        contextMessage.success(`成功添加 ${newAccountsArray.length} 個帳號`)
        setAccountModalVisible(false)
        fetchGiftCodes(pagination.current, pagination.pageSize)
      } catch (error) {
        console.error('API 調用失敗:', error);
        contextMessage.error(`添加帳號失敗: ${error.message || '未知錯誤'}`)
        if (error.response) {
          console.error('錯誤響應:', error.response.data);
        }
      }
    } catch (error) {
      contextMessage.error(`處理帳號數據失敗: ${error.message || '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  // 查看詳情
  const showDetails = (record) => {
    setSelectedCode(record)
    setDetailModalVisible(true)
  }

  // 確認刪除
  const confirmDelete = (id) => {
    contextModal.confirm({
      title: '確定要刪除這個禮包碼嗎？',
      content: '刪除後不可恢復',
      onOk: () => handleDelete(id),
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '禮包碼',
      dataIndex: 'code',
      width: 150,
    },
    {
      title: '類型',
      dataIndex: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'normal' ? 'blue' : 'green'}>
          {type === 'normal' ? '普通' : '特定帳號'}
        </Tag>
      ),
    },
    {
      title: '獎勵內容',
      dataIndex: 'rewards',
      width: 200,
      render: (rewards) => {
        try {
          const items = rewards ? JSON.parse(rewards) : [];
          return (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {items.map((item, index) => (
                <li key={index}>
                  物品ID: {item.itemId}, 數量: {item.quantity}
                </li>
              ))}
            </ul>
          )
        } catch (error) {
          console.error('解析獎勵內容錯誤:', error);
          return <span style={{ color: 'red' }}>格式錯誤</span>
        }
      },
    },
    {
      title: '到期日期',
      dataIndex: 'expiry_date',
      width: 180,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '',
    },
    {
      title: '兌換次數',
      dataIndex: 'redeem_count',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看詳情">
            <Button icon={<EyeOutlined />} onClick={() => showDetails(record)} />
          </Tooltip>
          <Tooltip title="延長有效期">
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => showExtendModal(record)}
            />
          </Tooltip>
          {record.type === 'specific' && (
            <Tooltip title="添加帳號">
              <Button
                icon={<UserAddOutlined />}
                onClick={() => showAccountModal(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="刪除">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => confirmDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // 生成 Tabs 的 items 配置
  const getDetailTabItems = () => {
    if (!selectedCode) return [];
    
    const items = [
      {
        key: '1',
        label: '基本信息',
        children: (
          <div style={{ marginBottom: 16 }}>
            <p>
              <strong>禮包碼：</strong> {selectedCode.code}
            </p>
            <p>
              <strong>類型：</strong>{' '}
              {selectedCode.type === 'normal' ? '普通' : '特定帳號'}
            </p>
            <p>
              <strong>到期日期：</strong>{' '}
              {selectedCode.expiry_date
                ? dayjs(selectedCode.expiry_date).format('YYYY-MM-DD HH:mm:ss')
                : '無'}
            </p>
            <p>
              <strong>創建時間：</strong>{' '}
              {selectedCode.created_at
                ? dayjs(selectedCode.created_at).format('YYYY-MM-DD HH:mm:ss')
                : '無'}
            </p>
            <p>
              <strong>檢查帳號創建時間：</strong>{' '}
              {selectedCode.check_creation_time ? '是' : '否'}
            </p>
          </div>
        )
      },
      {
        key: '2',
        label: '獎勵內容',
        children: (() => {
          try {
            const rewards = selectedCode.rewards ? JSON.parse(selectedCode.rewards) : [];
            return (
              <ul>
                {rewards.map((item, index) => (
                  <li key={index}>
                    物品ID: {item.itemId}, 數量: {item.quantity}
                  </li>
                ))}
              </ul>
            );
          } catch (error) {
            console.error('解析獎勵內容錯誤:', error);
            return <div style={{ color: 'red' }}>獎勵內容格式錯誤</div>;
          }
        })()
      }
    ];
    
    // 條件添加特定帳號列表標籤
    if (selectedCode.type === 'specific' && selectedCode.specific_accounts) {
      items.push({
        key: '3',
        label: '特定帳號列表',
        children: (() => {
          try {
            const accounts = JSON.parse(selectedCode.specific_accounts);
            
            // 處理刪除特定帳號
            const handleDeleteAccount = (accountToDelete) => {
              contextModal.confirm({
                title: '確認刪除',
                content: `確定要刪除帳號 "${accountToDelete}" 嗎？`,
                okText: '確定',
                cancelText: '取消',
                onOk: () => {
                  return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                      try {
                        // 從帳號列表中移除該帳號
                        const accounts = JSON.parse(selectedCode.specific_accounts);
                        const updatedAccounts = accounts.filter(account => account !== accountToDelete);
                        
                        // 更新禮包碼的特定帳號列表
                        await updateGiftCodeAccounts(selectedCode.id, updatedAccounts);
                        
                        contextMessage.success('成功刪除帳號');
                        
                        // 重新獲取數據並更新詳情
                        await fetchGiftCodes(pagination.current, pagination.pageSize);
                        
                        // 關閉詳情並重新打開以刷新
                        setDetailModalVisible(false);
                        // 使用延遲重新打開，確保數據已更新
                        setTimeout(() => {
                          const updatedCode = data.find(item => item.id === selectedCode.id);
                          if (updatedCode) {
                            setSelectedCode(updatedCode);
                            setDetailModalVisible(true);
                          }
                        }, 300);
                        
                        resolve(); // 完成 Promise
                      } catch (error) {
                        contextMessage.error(`刪除帳號失敗: ${error.message || '未知錯誤'}`);
                        reject(error); // 拒絕 Promise
                      }
                    }, 0);
                  });
                }
              });
            };
            
            return (
              <div>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>帳號總數：{accounts.length}</strong>
                  <div>
                    <Button 
                      type="primary" 
                      icon={<UserAddOutlined />} 
                      size="small"
                      onClick={() => {
                        setDetailModalVisible(false);
                        showAccountModal(selectedCode);
                      }}
                    >
                      添加帳號
                    </Button>
                  </div>
                </div>
                <ul style={{ maxHeight: '300px', overflowY: 'auto', padding: '0 20px' }}>
                  {accounts.map((account, index) => (
                    <li key={index} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{account}</span>
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={() => handleDeleteAccount(account)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          } catch (error) {
            console.error('解析特定帳號列表錯誤:', error);
            return <div style={{ color: 'red' }}>特定帳號列表格式錯誤</div>;
          }
        })()
      });
    }
    
    return items;
  };

  return (
    <div className="page-container">
      <PageHeader>
        <Title level={2}>禮包碼管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          創建禮包碼
        </Button>
      </PageHeader>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </StyledCard>

      {/* 創建禮包碼表單 */}
      <Modal
        title="創建禮包碼"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        afterClose={() => form.resetFields()}
        destroyOnClose // 確保 Modal 關閉時銷毀內容
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            type: 'normal',
            check_creation_time: false,
            rewards: [{ itemId: '', quantity: '' }],
          }}
        >
          <Form.Item
            name="code"
            label="禮包碼"
            rules={[{ required: true, message: '請輸入禮包碼' }]}
          >
            <Input placeholder="請輸入禮包碼" />
          </Form.Item>

          <Form.Item
            name="type"
            label="禮包類型"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="normal">普通禮包</Option>
              <Option value="specific">特定帳號禮包</Option>
            </Select>
          </Form.Item>

          <Form.List name="rewards">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'itemId']}
                      rules={[{ required: true, message: '請輸入物品ID' }]}
                    >
                      <Input placeholder="物品ID" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: '請輸入數量' }]}
                    >
                      <InputNumber placeholder="數量" min={1} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        onClick={() => remove(name)}
                        icon={<DeleteOutlined />}
                      />
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加獎勵
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => 
              getFieldValue('type') === 'specific' ? (
                <Form.Item
                  name="specific_accounts"
                  label="特定帳號列表"
                  rules={[{ required: true, message: '請輸入特定帳號列表' }]}
                >
                  <TextArea
                    placeholder="請輸入帳號ID，每行一個"
                    autoSize={{ minRows: 3, maxRows: 10 }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="expiry_date"
            label="到期日期"
            rules={[{ required: true, message: '請選擇到期日期' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>

          <Form.Item
            name="check_creation_time"
            label="檢查帳號創建時間"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setCreateModalVisible(false)
                  form.resetFields()
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                創建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 詳情彈窗 - 使用新版 Tabs API */}
      <Modal
        title="禮包碼詳情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedCode(null)
        }}
        destroyOnClose // 確保 Modal 關閉時銷毀內容
        footer={null}
        width={800}
      >
        {selectedCode && (
          <Tabs defaultActiveKey="1" items={getDetailTabItems()} />
        )}
      </Modal>

      {/* 延長有效期彈窗 */}
      <Modal
        title="延長有效期"
        open={extendModalVisible}
        onOk={handleExtend}
        onCancel={() => {
          setExtendModalVisible(false)
          setExtendDatePickerValue(null)
          setCurrentExtendId(null)
        }}
        destroyOnClose
      >
        <DatePicker
          showTime
          style={{ width: '100%' }}
          value={extendDatePickerValue}
          onChange={setExtendDatePickerValue}
          disabledDate={(current) =>
            current && current < dayjs().startOf('day')
          }
        />
      </Modal>

      {/* 添加帳號彈窗 */}
      <Modal
        title="添加帳號"
        open={accountModalVisible}
        onCancel={() => {
          setAccountModalVisible(false)
          setCurrentAccountsId(null)
          accountForm.resetFields()
        }}
        footer={null}
        destroyOnClose
      >
        {accountModalVisible && (
          <Form
            form={accountForm}
            layout="vertical"
            onFinish={handleAddAccounts}
          >
            <Form.Item
              name="accounts"
              label="新增帳號列表"
              rules={[{ required: true, message: '請輸入要添加的帳號' }]}
              extra="請輸入帳號ID，每行一個。系統會自動過濾已存在的帳號。"
            >
              <TextArea
                placeholder="請輸入帳號ID，每行一個"
                autoSize={{ minRows: 5, maxRows: 15 }}
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    setAccountModalVisible(false)
                    accountForm.resetFields()
                  }}
                >
                  取消
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  添加
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default GiftCodePage