import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api/auth'
import './login.css'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { login } = useUserStore()

  // 登录
  const onLoginFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true)
      const res = await authApi.login(values)
      if (res.code === 200 || res.code === 0) {
        const { token, user } = res.data
        login(user, token)
        message.success('登录成功')
        navigate('/admin')
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const onRegisterFinish = async (values: { username: string; password: string; email?: string }) => {
    try {
      setLoading(true)
      const res = await authApi.register(values)
      if (res.code === 200 || res.code === 0) {
        const { token, user } = res.data
        login(user, token)
        message.success('注册成功')
        navigate('/admin')
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const loginForm = (
    <Form
      name="login"
      onFinish={onLoginFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form
      name="register"
      onFinish={onRegisterFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, message: '用户名至少3个字符' }
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名（至少3个字符）"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="邮箱（可选）"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（至少6个字符）"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次密码不一致'))
            }
          })
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="确认密码"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: loginForm,
    },
    {
      key: 'register',
      label: '注册',
      children: registerForm,
    },
  ]

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="text-center mb-4">
          <h2>{import.meta.env.VITE_APP_TITLE}</h2>
        </div>
        <Tabs
          defaultActiveKey="login"
          centered
          items={tabItems}
        />
        <div className="text-center text-gray-500 mt-4">
          <a onClick={() => navigate('/')}>返回首页</a>
        </div>
      </Card>
    </div>
  )
}

export default Login
