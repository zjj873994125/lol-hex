import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { PhoneOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { gsap } from 'gsap'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api/auth'
import './login.css'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { login } = useUserStore()

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 创建粒子容器 - 添加到 body 避免被裁剪
    if (!particlesRef.current) {
      const particlesContainer = document.createElement('div')
      particlesContainer.className = 'cursor-particles'
      particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `
      document.body.appendChild(particlesContainer)
      particlesRef.current = particlesContainer
      console.log('粒子容器已创建')
    }

    // 鼠标移动粒子效果
    const handleMouseMove = (e: MouseEvent) => {
      if (!particlesRef.current) return

      // 限制生成频率，每3帧生成一次
      if (Math.random() > 0.4) return

      // 创建新粒子
      const particle = document.createElement('div')
      particle.className = 'cursor-particle'

      const size = Math.random() * 12 + 8
      const color = Math.random() > 0.5 ? '102, 126, 234' : '118, 75, 162'

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(${color}, 1) 0%, rgba(${color}, 0.4) 40%, rgba(${color}, 0) 70%);
        border-radius: 50%;
        pointer-events: none;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%);
      `

      particlesRef.current.appendChild(particle)

      // 粒子动画
      const angle = Math.random() * Math.PI * 2
      const velocity = Math.random() * 100 + 50
      const tx = Math.cos(angle) * velocity
      const ty = Math.sin(angle) * velocity

      gsap.fromTo(particle,
        { opacity: 1, scale: 1, x: 0, y: 0 },
        {
          opacity: 0,
          scale: 0,
          x: tx,
          y: ty,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => {
            if (particle.parentNode) {
              particle.remove()
            }
          }
        }
      )

      // 限制粒子数量
      while (particlesRef.current.children.length > 60) {
        if (particlesRef.current.firstChild) {
          particlesRef.current.removeChild(particlesRef.current.firstChild!)
        }
      }
    }

    // 卡片 3D 倾斜效果
    const handleCardMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      gsap.to(cardRef.current, {
        rotationY: x * 10,
        rotationX: -y * 10,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    const handleCardMouseLeave = () => {
      if (!cardRef.current) return
      gsap.to(cardRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    // 点击波纹效果
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return

      const ripple = document.createElement('div')
      ripple.className = 'click-ripple'
      ripple.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, rgba(102, 126, 234, 0) 70%);
        border-radius: 50%;
        pointer-events: none;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%);
        z-index: 9999;
      `

      containerRef.current.appendChild(ripple)

      gsap.fromTo(ripple,
        { scale: 1, opacity: 0.8 },
        {
          scale: 30,
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      )
    }

    // 绑定事件
    window.addEventListener('mousemove', handleMouseMove)
    if (cardRef.current) {
      cardRef.current.addEventListener('mousemove', handleCardMouseMove)
      cardRef.current.addEventListener('mouseleave', handleCardMouseLeave)
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (cardRef.current) {
        cardRef.current.removeEventListener('mousemove', handleCardMouseMove)
        cardRef.current.removeEventListener('mouseleave', handleCardMouseLeave)
      }
      window.removeEventListener('click', handleClick)
      particlesRef.current?.remove()
    }
  }, [])

  // 登录
  const onLoginFinish = async (values: { phone: string; password: string }) => {
    try {
      setLoading(true)
      const res = await authApi.login(values)
      if (res.code === 200 || res.code === 0) {
        const { token, user } = res.data
        login(user, token)
        message.success('登录成功')

        // 登录成功动画
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.1,
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => navigate('/')
          })
        } else {
          navigate('/')
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败')
      // 错误抖动动画
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => gsap.set(cardRef.current, { x: 0 })
          }
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const onRegisterFinish = async (values: { username: string; phone: string; password: string; email?: string }) => {
    try {
      setLoading(true)
      const res = await authApi.register(values)
      if (res.code === 200 || res.code === 0) {
        const { token, user } = res.data
        login(user, token)
        message.success('注册成功')

        // 注册成功动画
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.1,
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => navigate('/')
          })
        } else {
          navigate('/')
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败')
      // 错误抖动动画
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { x: -10 },
          {
            x: 10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => gsap.set(cardRef.current, { x: 0 })
          }
        )
      }
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
        name="phone"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="手机号"
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
          className="login-submit-btn"
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
          { min: 2, message: '用户名至少2个字符' }
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名"
        />
      </Form.Item>

      <Form.Item
        name="phone"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
        ]}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="手机号"
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
          className="login-submit-btn"
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
    <div className="login-container" ref={containerRef}>
      <Card className="login-card" ref={cardRef}>
        <div className="text-center mb-4">
          <h2 className="login-title">{import.meta.env.VITE_APP_TITLE}</h2>
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
