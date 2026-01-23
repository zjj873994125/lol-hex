import { Input, Select, Button, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'

interface SearchOption {
  label: string
  value: string | number
}

interface SearchBarProps {
  onSearch: (keyword: string, filters?: Record<string, any>) => void
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    label: string
    options: SearchOption[]
  }>
}

const SearchBar = ({
  onSearch,
  searchPlaceholder = '请输入关键词',
  filters = [],
}: SearchBarProps) => {
  const [keyword, setKeyword] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  const handleSearch = () => {
    onSearch(keyword, activeFilters)
  }

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleReset = () => {
    setKeyword('')
    setActiveFilters({})
    onSearch('', {})
  }

  return (
    <div className="search-bar mb-4">
      <Space wrap size="middle">
        <Input
          placeholder={searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          style={{ width: 200 }}
        />
        {filters.map((filter) => (
          <Select
            key={filter.key}
            placeholder={filter.label}
            value={activeFilters[filter.key]}
            onChange={(value) => handleFilterChange(filter.key, value)}
            allowClear
            style={{ width: 150 }}
            options={filter.options}
          />
        ))}
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          搜索
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </Space>
    </div>
  )
}

export default SearchBar
