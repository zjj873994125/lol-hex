import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Popconfirm,
  message,
  Switch,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { menuApi } from '@/api/menu'
import { MenuTypeOptions } from '@/types/menu'
import type { Menu, MenuFormData } from '@/types/menu'

const MenuManage = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const res = await menuApi.getList()
      if (res.code === 200 || res.code === 0) {
        // 后端返回 { total, page, pageSize, list }
        const data = res.data as any
        const menuList = data?.list || res.data || []
        setMenus(Array.isArray(menuList) ? menuList : [])
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = (parentId?: number) => {
    setEditingMenu(null)
    form.resetFields()
    if (parentId) {
      form.setFieldValue('parentId', parentId)
    }
    setModalVisible(true)
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    form.setFieldsValue({
      ...menu,
      status: menu.status === 1,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await menuApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchMenus()
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: MenuFormData = {
        ...values,
        status: values.status ? 1 : 0,
      }

      if (editingMenu) {
        await menuApi.update(editingMenu.id, data)
        message.success('更新成功')
      } else {
        await menuApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchMenus()
    } catch (error) {
      console.error('Failed to save menu:', error)
    }
  }

  // 将菜单转换为扁平列表，用于表格展示
  const flattenMenus = (menuList: Menu[], level = 0): Array<Menu & { level: number }> => {
    const result: Array<Menu & { level: number }> = []
    menuList.forEach((menu) => {
      result.push({ ...menu, level })
      if (menu.children && menu.children.length > 0) {
        result.push(...flattenMenus(menu.children, level + 1))
      }
    })
    return result
  }

  const flatMenus = flattenMenus(menus)

  const columns: ColumnsType<Menu> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      render: (name, record) => {
        const level = (record as any).level || 0
        return (
          <span style={{ paddingLeft: `${level * 20}px` }}>
            {name}
          </span>
        )
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => {
        const option = MenuTypeOptions.find((o) => o.value === type)
        return <Tag color="blue">{option?.label}</Tag>
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
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
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0} wrap>
          <Button
            type="link"
            size="small"
            onClick={() => handleAdd(record.id)}
          >
            新增子菜单
          </Button>
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

  // 父级菜单选项（递归构建）
  const buildParentOptions = (menuList: Menu[]): Array<{ label: string; value: number }> => {
    const options: Array<{ label: string; value: number }> = []
    menuList.forEach((menu) => {
      options.push({ label: menu.name, value: menu.id })
      if (menu.children && menu.children.length > 0) {
        options.push(...buildParentOptions(menu.children))
      }
    })
    return options
  }

  const parentOptions = buildParentOptions(menus)

  return (
    <div>
      <PageHeader
        title="菜单管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '菜单管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增菜单
          </Button>
        }
        blackColor={true}
      />
      <Table
        columns={columns}
        dataSource={flatMenus}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={false}
      />

      <Modal
        title={editingMenu ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" label="父级菜单">
            <Select
              allowClear
              options={parentOptions}
              placeholder="请选择父级菜单"
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '请输入路径' }]}
          >
            <Input placeholder="请输入路径" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="请输入图标" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select options={MenuTypeOptions} placeholder="请选择类型" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            initialValue={0}
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入排序" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue={true}
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MenuManage
