import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Radio, message, Popconfirm, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { getAllAdmins, updateAdmin, deleteAdmin, changeAdminPassword } from '../../services/adminService'

const { Title } = Typography

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

function AdminListPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      message.error('獲取管理員列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEdit = (record) => {
    setSelectedAdmin(record);
    form.setFieldsValue({
      email: record.email,
      role: record.role
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id);
      message.success('刪除成功');
      fetchAdmins();
    } catch (error) {
      message.error('刪除失敗');
    }
  };

  const handlePasswordChange = (record) => {
    setSelectedAdmin(record);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateAdmin(selectedAdmin.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchAdmins();
    } catch (error) {
      message.error('更新失敗');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      await changeAdminPassword(selectedAdmin.id, values.oldPassword, values.newPassword);
      message.success('密碼修改成功');
      setPasswordModalVisible(false);
    } catch (error) {
      message.error('密碼修改失敗');
    }
  };

  const columns = [
    {
      title: '用戶名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '郵箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role === 'super_admin' ? '超級管理員' : '管理員',
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '最後登入',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => date ? new Date(date).toLocaleString() : '從未登入',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            icon={<LockOutlined />}
            onClick={() => handlePasswordChange(record)}
          >
            修改密碼
          </Button>
          <Popconfirm
            title="確定要刪除此管理員嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              刪除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader>
        <Title level={2}>管理員列表</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/create')}
        >
          新增管理員
        </Button>
      </PageHeader>

      <Table
        columns={columns}
        dataSource={admins}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="編輯管理員"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="郵箱"
            rules={[{ type: 'email', message: '請輸入有效的郵箱地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '請選擇角色' }]}
          >
            <Radio.Group>
              <Radio value="admin">管理員</Radio>
              <Radio value="super_admin">超級管理員</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="修改密碼"
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => setPasswordModalVisible(false)}
      >
        <Form form={passwordForm} layout="vertical">
          {currentUser.role !== 'super_admin' && (
            <Form.Item
              name="oldPassword"
              label="舊密碼"
              rules={[{ required: true, message: '請輸入舊密碼' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="newPassword"
            label="新密碼"
            rules={[
              { required: true, message: '請輸入新密碼' },
              { min: 6, message: '密碼至少 6 個字元' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="確認新密碼"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '請確認新密碼' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('兩次輸入的密碼不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminListPage; 