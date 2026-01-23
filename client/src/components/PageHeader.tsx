import { Breadcrumb, Typography } from 'antd'
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
    <div className="page-header mb-6">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <div className="flex justify-between items-center">
        <Title level={2} className="m-0">
          {title}
        </Title>
        {extra}
      </div>
    </div>
  )
}

export default PageHeader
