import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Modal, Avatar, Row, Col } from 'antd'
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  CameraOutlined,
  SafetyOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import PageHeader from '@/components/PageHeader'
import { authApi } from '@/api/auth'
import type { UpdateProfileParams, ChangePasswordParams, UserInfo } from '@/types/user'
import { useUserStore } from '@/store/user'
import './profile.css'

const Profile = () => {
  const { user, setUser } = useUserStore()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string>('')

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
      })
      setPreviewAvatar(user.avatar || '')
    }
  }, [user, profileForm])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreviewAvatar(url)
  }

  const handleUpdateProfile = async (values: UpdateProfileParams) => {
    try {
      setLoading(true)
      const res = await authApi.updateProfile(values)
      if (res.code === 200 || res.code === 0) {
        const updatedUser = res.data
        setUser(updatedUser)
        message.success('更新成功')
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values: ChangePasswordParams) => {
    try {
      setLoading(true)
      const res = await authApi.changePassword(values)
      if (res.code === 200 || res.code === 0) {
        message.success('密码修改成功')
        setPasswordModalOpen(false)
        passwordForm.resetFields()
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <PageHeader title="个人中心" items={[{ title: '个人中心' }]} />

      <div className="profile-container">
        <Row gutter={[24, 24]}>
          {/* 左侧：个人信息卡片 */}
          <Col xs={24} lg={8}>
            <Card className="profile-info-card" bordered={false}>
              <div className="profile-avatar-section">
                <Avatar
                  size={100}
                  src={previewAvatar || user?.avatar}
                  icon={<UserOutlined />}
                  className="profile-avatar-large"
                />
                <h2 className="profile-username">{user?.username || '用户'}</h2>
                <p className="profile-phone">
                  <PhoneOutlined /> {user?.phone || '未绑定'}
                </p>
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-label">账号状态</div>
                  <div className="stat-value">
                    {user?.status === 1 ? (
                      <span className="status-active">正常</span>
                    ) : (
                      <span className="status-inactive">禁用</span>
                    )}
                  </div>
                </div>
                {user?.role && (
                  <div className="stat-item">
                    <div className="stat-label">角色</div>
                    <div className="stat-value">{user.role.name}</div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* 右侧：编辑表单 */}
          <Col xs={24} lg={16}>
            {/* 基本信息编辑 */}
            <Card
              title={
                <span className="card-title">
                  <UserOutlined /> 基本信息
                </span>
              }
              className="profile-form-card"
              style={{ marginBottom: '20px' }}
              bordered={false}
            >
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="用户名"
                      name="username"
                      rules={[{ required: true, message: '请输入用户名' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="手机号"
                      name="phone"
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="手机号" disabled />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="邮箱" name="email">
                  <Input prefix={<MailOutlined />} placeholder="邮箱（可选）" />
                </Form.Item>

                <Form.Item label="头像URL" name="avatar">
                  <Input
                    prefix={<CameraOutlined />}
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

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* 安全设置 */}
            <Card
              title={
                <span className="card-title">
                  <SafetyOutlined /> 安全设置
                </span>
              }
              className="profile-security-card"
              bordered={false}
            >
              <div className="security-list">
                <div className="security-item">
                  <div className="security-item-left">
                    <KeyOutlined className="security-icon" />
                    <div>
                      <h4>登录密码</h4>
                      <p className="text-gray-500 text-sm">定期修改密码，保护账号安全</p>
                    </div>
                  </div>
                  <Button onClick={() => setPasswordModalOpen(true)}>修改</Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        footer={null}
        width={450}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="旧密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入旧密码" />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少6个字符）" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
