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
  Badge,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { hexApi } from '@/api/hex'
import { HexTierOptions, HexTierColorMap } from '@/types/hex'
import type { Hex, HexFormData } from '@/types/hex'

const HexManage = () => {
  const [hexes, setHexes] = useState<Hex[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingHex, setEditingHex] = useState<Hex | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    fetchHexes()
  }, [pagination.current, pagination.pageSize])

  const fetchHexes = async () => {
    try {
      setLoading(true)
      const res = await hexApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      if (res.code === 200 || res.code === 0) {
        setHexes(res.data?.list || [])
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch hexes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingHex(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (hex: Hex) => {
    setEditingHex(hex)
    form.setFieldsValue(hex)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await hexApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchHexes()
      }
    } catch (error) {
      console.error('Failed to delete hex:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: HexFormData = values

      if (editingHex) {
        await hexApi.update(editingHex.id, data)
        message.success('更新成功')
      } else {
        await hexApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchHexes()
    } catch (error) {
      console.error('Failed to save hex:', error)
    }
  }

  const columns: ColumnsType<Hex> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      render: (icon) => (
        <img src={icon} alt="" style={{ width: 40, height: 40, borderRadius: 4 }} />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '等级',
      dataIndex: 'tier',
      width: 100,
      render: (tier) => (
        <Badge color={HexTierColorMap[tier]} text={HexTierOptions.find((o) => o.value === tier)?.label} />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
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
      width: 150,
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
        title="海克斯管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '海克斯管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增海克斯
          </Button>
        }
        blackColor={true}
      />
      <Table
        columns={columns}
        dataSource={hexes}
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
        title={editingHex ? '编辑海克斯' : '新增海克斯'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="海克斯名称"
            rules={[{ required: true, message: '请输入海克斯名称' }]}
          >
            <Input placeholder="请输入海克斯名称" />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标URL"
            rules={[{ required: true, message: '请输入图标URL' }]}
          >
            <Input placeholder="请输入图标URL" />
          </Form.Item>
          <Form.Item
            name="tier"
            label="等级"
            rules={[{ required: true, message: '请选择等级' }]}
          >
            <Select options={HexTierOptions} placeholder="请选择等级" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
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

export default HexManage
