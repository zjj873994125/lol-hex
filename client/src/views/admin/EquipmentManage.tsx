import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Switch,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { equipmentApi } from '@/api/equipment'
import type { Equipment, EquipmentFormData } from '@/types/equipment'

const EquipmentManage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  useEffect(() => {
    fetchEquipments()
  }, [pagination.current, pagination.pageSize])

  const fetchEquipments = async () => {
    try {
      setLoading(true)
      const res = await equipmentApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      if (res.code === 200 || res.code === 0) {
        setEquipments(res.data?.list || [])
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingEquipment(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment)
    form.setFieldsValue(equipment)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await equipmentApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchEquipments()
      }
    } catch (error) {
      console.error('Failed to delete equipment:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: EquipmentFormData = values

      if (editingEquipment) {
        await equipmentApi.update(editingEquipment.id, data)
        message.success('更新成功')
      } else {
        await equipmentApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchEquipments()
    } catch (error) {
      console.error('Failed to save equipment:', error)
    }
  }

  const columns: ColumnsType<Equipment> = [
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
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (price) => `${price} 金币`,
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
        title="装备管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '装备管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增装备
          </Button>
        }
      />
      <Table
        columns={columns}
        dataSource={equipments}
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
        title={editingEquipment ? '编辑装备' : '新增装备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="装备名称"
            rules={[{ required: true, message: '请输入装备名称' }]}
          >
            <Input placeholder="请输入装备名称" />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标URL"
            rules={[{ required: true, message: '请输入图标URL' }]}
          >
            <Input placeholder="请输入图标URL" />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入价格"
            />
          </Form.Item>
          <Form.Item name="keywords" label="关键词">
            <Input placeholder="请输入关键词" />
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

export default EquipmentManage
