import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Switch,
  Tag,
  Avatar,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { userApi } from '@/api/user'
import { roleApi } from '@/api/role'
import type { User, UserFormData } from '@/types/user'
import type { Role } from '@/types/role'

const UserManage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [previewAvatar, setPreviewAvatar] = useState<string>('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreviewAvatar(url)
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [pagination.current, pagination.pageSize])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      if (res.code === 200 || res.code === 0) {
        setUsers(res.data?.list || [])
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await roleApi.getAll()
      if (res.code === 200 || res.code === 0) {
        setRoles(res.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      ...user,
      // roleIds: user.roles?.map((r) => r.id),
    })
    setPreviewAvatar(user.avatar || '')
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await userApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: UserFormData = values

      if (editingUser) {
        await userApi.update(editingUser.id, data)
        message.success('更新成功')
      } else {
        await userApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'Role',
      width: 200,
      render: (Role: Role) => (
        <>
          <Tag key={Role.id} color="blue">
            {Role.name}
          </Tag>
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0} wrap>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="用户管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '用户管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      />
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize, total: pagination.total }),
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input placeholder="请输入手机号" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="roleId" label="角色">
            <Select
              options={roles.map((r) => ({ label: r.name, value: r.id }))}
              placeholder="请选择角色"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="头像URL" name="avatar">
              <Input
                placeholder="请输入头像图片链接"
                onChange={handleAvatarChange}
              />
            </Form.Item>
            {previewAvatar && (
              <div className="avatar-preview">
                <span>头像预览：</span>
                <Avatar size={48} src={previewAvatar} />
              </div>
            )}
          <Form.Item
            name="status"
            label="状态"
            initialValue={1}
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManage
