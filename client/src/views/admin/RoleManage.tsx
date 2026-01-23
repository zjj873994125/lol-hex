import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tree,
  Popconfirm,
  message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TreeProps } from 'antd'
import PageHeader from '@/components/PageHeader'
import { roleApi } from '@/api/role'
import { menuApi } from '@/api/menu'
import type { Role, RoleFormData } from '@/types/role'
import type { MenuTree } from '@/types/menu'

const RoleManage = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<MenuTree[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])

  useEffect(() => {
    fetchRoles()
    fetchMenus()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await roleApi.getList()
      if (res.code === 200 || res.code === 0) {
        setRoles(res.data?.list || [])
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenus = async () => {
    try {
      const res = await menuApi.getTree()
      if (res.code === 200 || res.code === 0) {
        setMenus(res.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    }
  }

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setSelectedMenuIds([])
    setModalVisible(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    const menuIds = role.menus?.map((m) => m.id) || []
    setSelectedMenuIds(menuIds)
    form.setFieldsValue(role)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await roleApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchRoles()
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: RoleFormData = {
        ...values,
        menuIds: selectedMenuIds,
      }

      if (editingRole) {
        await roleApi.update(editingRole.id, data)
        message.success('更新成功')
      } else {
        await roleApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchRoles()
    } catch (error) {
      console.error('Failed to save role:', error)
    }
  }

  const onMenuCheck: TreeProps['onCheck'] = (checkedKeys) => {
    setSelectedMenuIds(checkedKeys as number[])
  }

  const renderMenuTree = (menus: MenuTree[]): TreeProps['treeData'] => {
    return menus.map((menu) => ({
      title: menu.name,
      key: menu.id,
      children: menu.children ? renderMenuTree(menu.children) : undefined,
    }))
  }

  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
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
        title="角色管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '角色管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        }
      />
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="请输入角色代码" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item label="菜单权限">
            <Tree
              checkable
              checkedKeys={selectedMenuIds}
              onCheck={onMenuCheck}
              treeData={renderMenuTree(menus)}
              height={300}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoleManage
