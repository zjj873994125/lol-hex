import { Breadcrumb, ConfigProvider, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

const { Title } = Typography

interface PageHeaderProps {
  title: string
  items?: Array<{
    title: string
    path?: string
  }>
  extra?: React.ReactNode
}

const PageHeader = ({ title, items = [], extra }: PageHeaderProps) => {
  const breadcrumbItems = [
    {
      title: (
        <>
          <HomeOutlined /> 首页
        </>
      ),
      href: '/',
    },
    ...items.map((item) => ({
      title: item.title,
      href: item.path,
    })),
    {
      title: title,
    },
  ]

  return (
    <ConfigProvider
      theme={{
        components: {
          Breadcrumb: {
            /* 这里是你的组件 token */
            linkColor: '#fff',
            linkHoverColor: '#ffd700',
          },
        },
      }}
    >
      <div className="page-header mb-6">
          <Breadcrumb items={breadcrumbItems} className="mb-4" 
          styles={{
            item: {
              color: '#fff',
            },
            root: {
              color: '#fff',
            },
            separator: {
              color: '#fff',
            },
          }} />
          <div className="flex justify-between items-center text-white">
            <Title level={2} className="m-0 text-white" style={{ color: '#fff' }}>
              {title}
            </Title>
            {extra}
          </div>
        </div>
    </ConfigProvider>
  )
}

export default PageHeader
