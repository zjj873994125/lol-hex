import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Popconfirm,
  message,
  Switch,
  Select,
  Row,
  Col,
  Card,
  InputNumber,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShieldOutlined,
  ThunderboltOutlined,
  IeOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import { equipmentApi } from '@/api/equipment'
import { hexApi } from '@/api/hex'
import type { Hero, HeroFormData } from '@/types/hero'
import type { Equipment } from '@/types/equipment'
import type { Hex } from '@/types/hex'
import { getRoleLabel, getRoleColor } from '@/utils/heroMapping'
import './HeroManage.css'

// 角色标签选项
const roleOptions = [
  { label: '坦克', value: 'tank' },
  { label: '辅助', value: 'support' },
  { label: '法师', value: 'mage' },
  { label: '战士', value: 'fighter' },
  { label: '射手', value: 'marksman' },
  { label: '刺客', value: 'assassin' },
]

interface RecommendationItem {
  equipmentId?: number
  hexId?: number
  priority: number
  description?: string
}

const HeroManage = () => {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [equipModalVisible, setEquipModalVisible] = useState(false)
  const [hexModalVisible, setHexModalVisible] = useState(false)
  const [editingHero, setEditingHero] = useState<Hero | null>(null)
  const [currentHero, setCurrentHero] = useState<Hero | null>(null)
  const [form] = Form.useForm()
  const [equipForm] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // 装备和海克斯选项
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [hexes, setHexes] = useState<Hex[]>([])
  // 选中的海克斯列表
  const [selectedHexes, setSelectedHexes] = useState<RecommendationItem[]>([])

  useEffect(() => {
    fetchHeroes()
    fetchEquipments()
    fetchHexes()
  }, [pagination.current, pagination.pageSize])

  const fetchHeroes = async () => {
    try {
      setLoading(true)
      const res = await heroApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      })
      if (res.code === 200 || res.code === 0) {
        setHeroes(res.data?.list || [])
        setPagination((prev) => ({
          ...prev,
          total: res.data?.total || 0,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch heroes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipments = async () => {
    try {
      const res = await equipmentApi.getList({ page: 1, pageSize: 1000 })
      if (res.code === 200 || res.code === 0) {
        setEquipments(res.data?.list || [])
      }
    } catch (error) {
      console.error('Failed to fetch equipments:', error)
    }
  }

  const fetchHexes = async () => {
    try {
      const res = await hexApi.getList({ page: 1, pageSize: 1000 })
      if (res.code === 200 || res.code === 0) {
        setHexes(res.data?.list || [])
      }
    } catch (error) {
      console.error('Failed to fetch hexes:', error)
    }
  }

  const handleAdd = () => {
    setEditingHero(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (hero: Hero) => {
    setEditingHero(hero)
    form.setFieldsValue({
      ...hero,
      tags: hero.tags,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await heroApi.delete(id)
      if (res.code === 200 || res.code === 0) {
        message.success('删除成功')
        fetchHeroes()
      }
    } catch (error) {
      console.error('Failed to delete hero:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: HeroFormData = {
        ...values,
        tags: values.tags || [],
      }

      if (editingHero) {
        await heroApi.update(editingHero.id, data)
        message.success('更新成功')
      } else {
        await heroApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchHeroes()
    } catch (error) {
      console.error('Failed to save hero:', error)
    }
  }

  // 打开推荐装备弹窗
  const openEquipModal = async (hero: Hero) => {
    setCurrentHero(hero)
    // 获取英雄详情，包括推荐装备
    try {
      const res = await heroApi.getDetail(hero.id)
      if (res.code === 200 || res.code === 0 && res.data) {
        const recommendedEquipments = res.data.recommendedEquipments || []
        equipForm.setFieldsValue({
          equipments: recommendedEquipments.map((e: any) => ({
            equipmentId: e.equipment?.id,
            priority: e.priority,
            description: e.description,
          })),
        })
      }
    } catch (error) {
      console.error('Failed to fetch hero detail:', error)
    }
    setEquipModalVisible(true)
  }

  // 打开推荐海克斯弹窗
  const openHexModal = async (hero: Hero) => {
    setCurrentHero(hero)
    // 先清空选中列表
    setSelectedHexes([])
    try {
      const res = await heroApi.getDetail(hero.id)
      if (res.code === 200 || res.code === 0 && res.data) {
        const recommendedHexes = res.data.recommendedHexes || []
        setSelectedHexes(recommendedHexes.map((h: any) => ({
          hexId: h.hex?.id,
          priority: h.priority || 0,
          description: h.description || '',
        })))
      }
    } catch (error) {
      console.error('Failed to fetch hero detail:', error)
    }
    setHexModalVisible(true)
  }

  // 保存推荐装备
  const handleSaveEquipments = async () => {
    if (!currentHero) return

    try {
      const values = await equipForm.validateFields()
      const equipments = values.equipments?.map((item: RecommendationItem) => ({
        equipmentId: item.equipmentId,
        priority: item.priority || 0,
        description: item.description || '',
      })) || []

      await heroApi.updateEquipments(currentHero.id, equipments)
      message.success('保存推荐装备成功')
      setEquipModalVisible(false)
    } catch (error) {
      console.error('Failed to save equipments:', error)
    }
  }

  // 保存推荐海克斯
  const handleSaveHexes = async () => {
    if (!currentHero) return

    try {
      const hexes = selectedHexes.map((item) => ({
        hexId: item.hexId!,
        priority: item.priority || 0,
        description: item.description || '',
      }))

      await heroApi.updateHexes(currentHero.id, hexes)
      message.success('保存推荐海克斯成功')
      setHexModalVisible(false)
    } catch (error) {
      console.error('Failed to save hexes:', error)
      message.error('保存失败，请重试')
    }
  }

  // 添加海克斯到已选列表
  const addHex = (hex: Hex) => {
    // 检查是否已经添加
    if (selectedHexes.some((item) => item.hexId === hex.id)) {
      message.warning('该海克斯已添加')
      return
    }
    // 添加到列表
    setSelectedHexes([
      ...selectedHexes,
      {
        hexId: hex.id,
        priority: 0,
        description: '',
      },
    ])
  }

  // 移除海克斯
  const removeHex = (index: number) => {
    setSelectedHexes(selectedHexes.filter((_, i) => i !== index))
  }

  const columns: ColumnsType<Hero> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 80,
      render: (avatar) => (
        <img src={avatar} alt="" style={{ width: 48, height: 48, borderRadius: 4 }} />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '称号',
      dataIndex: 'title',
      width: 150,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 120,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags?.map((tag: string) => (
            <Tag key={tag} color={getRoleColor(tag)}>
              {getRoleLabel(tag)}
            </Tag>
          ))}
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
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<IeOutlined />}
            onClick={() => openEquipModal(record)}
          >
            推荐装备
          </Button>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => openHexModal(record)}
          >
            推荐海克斯
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
        title="英雄管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '英雄管理' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增英雄
          </Button>
        }
      />
      <Table
        columns={columns}
        dataSource={heroes}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize, total: pagination.total }),
        }}
      />

      {/* 编辑英雄弹窗 */}
      <Modal
        title={editingHero ? '编辑英雄' : '新增英雄'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="英雄名称"
            rules={[{ required: true, message: '请输入英雄名称' }]}
          >
            <Input placeholder="请输入英雄名称" />
          </Form.Item>
          <Form.Item
            name="title"
            label="英雄称号"
            rules={[{ required: true, message: '请输入英雄称号' }]}
          >
            <Input placeholder="请输入英雄称号" />
          </Form.Item>
          <Form.Item name="nickname" label="英雄昵称">
            <Input placeholder="请输入英雄昵称" />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="头像URL"
            rules={[{ required: true, message: '请输入头像URL' }]}
          >
            <Input placeholder="请输入头像URL" />
          </Form.Item>
          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择标签"
              options={roleOptions}
              allowClear
            />
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

      {/* 推荐装备弹窗 */}
      <Modal
        title={`推荐装备 - ${currentHero?.name}`}
        open={equipModalVisible}
        onOk={handleSaveEquipments}
        onCancel={() => setEquipModalVisible(false)}
        width={700}
      >
        <Form form={equipForm} layout="vertical">
          <Form.List name="equipments">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        删除
                      </Button>
                    }
                  >
                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'equipmentId']}
                          label="装备"
                          rules={[{ required: true, message: '请选择装备' }]}
                        >
                          <Select
                            placeholder="请选择装备"
                            options={equipments.map((e) => ({
                              label: `${e.name} (${e.price}金币)`,
                              value: e.id,
                            }))}
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'priority']}
                          label="优先级"
                          initialValue={0}
                        >
                          <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'description']} label="说明">
                          <Input placeholder="推荐理由" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加装备
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* 推荐海克斯弹窗 */}
      <Modal
        title={`推荐海克斯 - ${currentHero?.name}`}
        open={hexModalVisible}
        onOk={handleSaveHexes}
        onCancel={() => setHexModalVisible(false)}
        width={800}
      >
        <div className="hex-selection-container">
          {[
            { tier: 3, label: '黄金', color: '#ffd700' },
            { tier: 2, label: '白银', color: '#c0c0c0' },
            { tier: 1, label: '棱彩', color: '#0ac8b9' },
          ].map((tierInfo) => {
            const tierHexes = hexes.filter((h) => h.tier === tierInfo.tier)
            return (
              <div key={tierInfo.tier} className="hex-tier-section">
                <div className="tier-header" style={{ borderColor: tierInfo.color }}>
                  <span className="tier-name">{tierInfo.label}海克斯</span>
                  <span className="tier-count">{tierHexes.length} 个</span>
                </div>
                <div className="tier-hexes">
                  {tierHexes.map((hex) => {
                    const isSelected = selectedHexes.some((item) => item.hexId === hex.id)
                    return (
                      <div
                        key={hex.id}
                        className={`hex-option-item ${isSelected ? 'hex-option-selected' : ''}`}
                        onClick={() => addHex(hex)}
                      >
                        <div
                          className="hex-option-icon"
                          style={{
                            backgroundColor: '#091428',
                            borderColor: tierInfo.color,
                            boxShadow: isSelected ? `0 0 0 2px ${tierInfo.color}, 0 0 8px ${tierInfo.color}` : 'none',
                          }}
                        >
                          <img src={hex.icon} alt={hex.name} />
                        </div>
                        <span className="hex-option-name">{hex.name}</span>
                      </div>
                    )
                  })}
                  {tierHexes.length === 0 && (
                    <div className="tier-empty">暂无{tierInfo.label}海克斯</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="selected-hexes-section">
          <div className="selected-hexes-title">已选择的海克斯：</div>
          <div className="selected-hexes-list">
            {selectedHexes.map((item, index) => {
              const hex = hexes.find((h) => h.id === item.hexId)
              return (
                <div key={index} className="selected-hex-item">
                  <span className="selected-hex-name">
                    {hex?.name || '未知'}
                  </span>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeHex(index)}
                  >
                    移除
                  </Button>
                </div>
              )
            })}
            {selectedHexes.length === 0 && (
              <div className="selected-hexes-empty">未选择任何海克斯</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HeroManage
