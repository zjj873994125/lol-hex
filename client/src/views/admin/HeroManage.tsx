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
  Popover,
  Tabs,
  Empty,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/PageHeader'
import { heroApi } from '@/api/hero'
import { equipmentApi } from '@/api/equipment'
import { hexApi } from '@/api/hex'
import type { Hero, HeroFormData, EquipmentBuild, BuildEquipment, HeroHex } from '@/types/hero'
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

interface EquipmentBuildForm {
  id?: number
  name: string
  description?: string
  priority?: number
  equipments?: BuildEquipment[]
}

const HeroManage = () => {
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [buildModalVisible, setBuildModalVisible] = useState(false)
  const [hexModalVisible, setHexModalVisible] = useState(false)
  const [editingHero, setEditingHero] = useState<Hero | null>(null)
  const [currentHero, setCurrentHero] = useState<Hero | null>(null)
  const [form] = Form.useForm()
  const [buildsForm] = Form.useForm()
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchKeyword, setSearchKeyword] = useState('')

  // 装备和海克斯选项
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [hexes, setHexes] = useState<Hex[]>([])
  // 出装思路列表
  const [equipmentBuilds, setEquipmentBuilds] = useState<EquipmentBuildForm[]>([])
  // 选中的海克斯列表
  const [selectedHexes, setSelectedHexes] = useState<RecommendationItem[]>([])
  // 当前编辑的出装思路索引
  const [editingBuildIndex, setEditingBuildIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchHeroes()
    fetchEquipments()
    fetchHexes()
  }, [pagination.current, pagination.pageSize, searchKeyword])

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    setSearchKeyword('')
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const fetchHeroes = async () => {
    try {
      setLoading(true)
      const res = await heroApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchKeyword || undefined,
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

  // 打开出装思路弹窗
  const openBuildModal = async (hero: Hero) => {
    setCurrentHero(hero)
    try {
      const res = await heroApi.getBuilds(hero.id)
      if (res.code === 200 || res.code === 0 && res.data) {
        const builds = res.data.map((build: any) => ({
          id: build.id,
          name: build.name,
          description: build.description || '',
          priority: build.priority,
          // 后端返回的是 BuildEquipments（Sequelize 关联名）
          equipments: (build.BuildEquipments || []).map((e: any) => ({
            id: e.id,
            equipmentId: e.equipmentId,
            priority: e.priority,
            description: e.description,
          })),
        }))
        setEquipmentBuilds(builds)
        // 设置表单初始值
        buildsForm.setFieldsValue({ builds })
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error)
      setEquipmentBuilds([])
      buildsForm.setFieldsValue({ builds: [] })
    }
    setBuildModalVisible(true)
  }

  // 保存出装思路
  const handleSaveBuilds = async () => {
    if (!currentHero) return

    try {
      const values = await buildsForm.validateFields()
      const { builds } = values

      if (!Array.isArray(builds)) {
        message.error('出装思路数据格式错误')
        return
      }

      // 获取现有的出装思路
      const existingRes = await heroApi.getBuilds(currentHero.id)
      const existingBuilds = existingRes.code === 200 ? existingRes.data : []

      // 删除所有现有的出装思路
      for (const existingBuild of existingBuilds) {
        await heroApi.deleteBuild(currentHero.id, existingBuild.id)
      }

      // 创建新的出装思路
      for (const build of builds) {
        if (!build.name || build.name.trim() === '') continue

        // 创建出装思路
        const createRes = await heroApi.createBuild(currentHero.id, {
          name: build.name,
          description: build.description || '',
          priority: build.priority || 0,
        })

        if (createRes.code === 200 && createRes.data) {
          const buildId = createRes.data.id

          // 添加装备
          if (build.equipments && Array.isArray(build.equipments)) {
            const equipments = build.equipments
              .filter((e: any) => e.equipmentId)
              .map((e: any) => ({
                equipmentId: e.equipmentId,
                priority: e.priority || 0,
                description: e.description || '',
              }))

            if (equipments.length > 0) {
              await heroApi.updateBuildEquipments(currentHero.id, buildId, equipments)
            }
          }
        }
      }

      message.success('保存出装思路成功')
      setBuildModalVisible(false)
    } catch (error) {
      console.error('Failed to save builds:', error)
      message.error('保存失败，请重试')
    }
  }

  // 添加新出装思路
  const addNewBuild = () => {
    const newBuilds = [...equipmentBuilds, {
      name: `出装思路 ${equipmentBuilds.length + 1}`,
      description: '',
      priority: 0,
      equipments: [],
    }]
    setEquipmentBuilds(newBuilds)
    buildsForm.setFieldsValue({ builds: newBuilds })
  }

  // 删除出装思路
  const removeBuild = (index: number) => {
    const newBuilds = equipmentBuilds.filter((_, i) => i !== index)
    setEquipmentBuilds(newBuilds)
    buildsForm.setFieldsValue({ builds: newBuilds })
  }

  // 打开推荐海克斯弹窗
  const openHexModal = async (hero: Hero) => {
    setCurrentHero(hero)
    setSelectedHexes([])
    try {
      const res = await heroApi.getDetail(hero.id)
      if (res.code === 200 || res.code === 0 && res.data) {
        const recommendedHexes = res.data.recommendedHexes || []
        setSelectedHexes(recommendedHexes.map((h: HeroHex) => ({
          hexId: h.hex?.id,
          priority: h.priority || 1,
          description: h.description || '',
        })))
      }
    } catch (error) {
      console.error('Failed to fetch hero detail:', error)
    }
    setHexModalVisible(true)
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

  // 添加/移除海克斯（点击切换）
  const toggleHex = (hex: Hex) => {
    const existingIndex = selectedHexes.findIndex((item) => item.hexId === hex.id)
    if (existingIndex >= 0) {
      // 已选中，移除
      setSelectedHexes(selectedHexes.filter((_, i) => i !== existingIndex))
    } else {
      // 未选中，添加
      setSelectedHexes([
        ...selectedHexes,
        {
          hexId: hex.id,
          priority: 1,
          description: '',
        },
      ])
    }
  }

  // 移除海克斯
  const removeHex = (index: number) => {
    setSelectedHexes(selectedHexes.filter((_, i) => i !== index))
  }

  // 更新海克斯优先级
  const updateHexPriority = (index: number, priority: number) => {
    setSelectedHexes(
      selectedHexes.map((item, i) =>
        i === index ? { ...item, priority } : item
      )
    )
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
      width: 200,
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
          <Button
            type="link"
            size="small"
            icon={<RocketOutlined />}
            onClick={() => openBuildModal(record)}
          >
            出装思路
          </Button>
          <Button
            type="link"
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => openHexModal(record)}
          >
            推荐海克斯
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
        title="英雄管理"
        items={[{ title: '管理后台', path: '/admin' }, { title: '英雄管理' }]}
        blackColor={true}
      />
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Input.Search
            placeholder="搜索英雄名称、称号、昵称"
            allowClear
            style={{ width: 300, marginRight: 10 }}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          <Button onClick={handleReset}>重置</Button>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增英雄
          </Button>
      </div>
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

      {/* 出装思路弹窗 */}
      <Modal
        title={`出装思路管理 - ${currentHero?.name}`}
        open={buildModalVisible}
        onOk={handleSaveBuilds}
        onCancel={() => setBuildModalVisible(false)}
        width={900}
        forceRender
      >
        <Form
          form={buildsForm}
          layout="vertical"
        >
          <Form.List name="builds">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16 }}
                    className="build-card"
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => {
                          remove(name)
                          removeBuild(index)
                        }}
                      >
                        删除此套
                      </Button>
                    }
                  >
                    <Row gutter={16}>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="出装思路名称"
                          rules={[{ required: true, message: '请输入名称' }]}
                        >
                          <Input placeholder="如：标准输出装、半肉出装" />
                        </Form.Item>
                      </Col>
                      <Col span={14}>
                        <Form.Item {...restField} name={[name, 'description']} label="描述">
                          <Input placeholder="出装思路说明" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.List name={[name, 'equipments']}>
                      {(equipFields, { add: addEquip, remove: removeEquip }) => (
                        <>
                          {equipFields.map(({ key: equipKey, name: equipName, ...restEquipField }, equipIndex) => (
                            <Card
                              key={equipKey}
                              size="small"
                              style={{ marginBottom: 8, backgroundColor: '#fafafa' }}
                              extra={
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => removeEquip(equipName)}
                                >
                                  移除
                                </Button>
                              }
                            >
                              <Row gutter={16}>
                                <Col span={10}>
                                  <Form.Item
                                    {...restEquipField}
                                    name={[equipName, 'equipmentId']}
                                    label={`装备 ${equipIndex + 1}`}
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
                                    {...restEquipField}
                                    name={[equipName, 'priority']}
                                    label="顺序"
                                    initialValue={equipIndex + 1}
                                  >
                                    <InputNumber min={1} max={99} style={{ width: '100%' }} />
                                  </Form.Item>
                                </Col>
                                <Col span={8}>
                                  <Form.Item {...restEquipField} name={[equipName, 'description']} label="说明">
                                    <Input placeholder="推荐理由" />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addEquip({ equipmentId: null, priority: equipFields.length + 1, description: '' })}
                            block
                            icon={<PlusOutlined />}
                          >
                            添加装备
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => {
                    add({
                      name: `出装思路 ${fields.length + 1}`,
                      description: '',
                      priority: fields.length,
                      equipments: [],
                    })
                    addNewBuild()
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  添加出装思路
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
                        onClick={() => toggleHex(hex)}
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
          {[
            { tier: 3, label: '黄金', color: '#ffd700' },
            { tier: 2, label: '白银', color: '#c0c0c0' },
            { tier: 1, label: '棱彩', color: '#0ac8b9' },
          ].map((tierInfo) => {
            const tierSelectedHexes = selectedHexes.filter((item) => {
              const hex = hexes.find((h) => h.id === item.hexId)
              return hex?.tier === tierInfo.tier
            })
            if (tierSelectedHexes.length === 0) return null
            return (
              <div key={tierInfo.tier} className="selected-tier-group">
                <div className="selected-tier-title" style={{ color: tierInfo.color }}>
                  {tierInfo.label}海克斯
                </div>
                <div className="selected-hexes-list">
                  {tierSelectedHexes.map((item, idx) => {
                    // 找到该海克斯在原始selectedHexes中的索引
                    const originalIndex = selectedHexes.indexOf(item)
                    const hex = hexes.find((h) => h.id === item.hexId)
                    const priorityContent = (
                      <div className="priority-popover">
                        {[1, 2, 3].map((p) => (
                          <div
                            key={p}
                            className={`priority-option ${item.priority === p ? 'priority-option-active' : ''}`}
                            onClick={() => updateHexPriority(originalIndex, p)}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    )

                    return (
                      <div key={originalIndex} className="selected-hex-item">
                        <img src={hex?.icon} alt="" className="selected-hex-icon" />
                        <span className="selected-hex-name">
                          {hex?.name || '未知'}
                        </span>
                        <Popover
                          content={priorityContent}
                          trigger="click"
                          placement="top"
                          overlayClassName="priority-popover-overlay"
                        >
                          <div className={`priority-circle priority-${item.priority || 0}`}>
                            {item.priority || '-'}
                          </div>
                        </Popover>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeHex(originalIndex)}
                        >
                          移除
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {selectedHexes.length === 0 && (
            <div className="selected-hexes-empty">未选择任何海克斯</div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default HeroManage
