import { Input, Select, Button, Space, Radio, Checkbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useState, useImperativeHandle, forwardRef } from 'react'
import './SearchBar.css'

export interface SearchBarRef {
  search: () => void
  reset: () => void
}

interface SearchOption {
  label: string
  value: string | number
}

type FilterType = 'select' | 'select-multi' | 'radio' | 'checkbox'

interface SearchBarProps {
  onSearch: (keyword: string, filters?: Record<string, any>) => void
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    label: string
    type?: FilterType
    options: SearchOption[]
    defaultValue?: any
  }>
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({
  onSearch,
  searchPlaceholder = '请输入关键词',
  filters = [],
}, ref) => {
  const [keyword, setKeyword] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})

  const handleSearch = (searchKeyword?: string, searchFilters?: Record<string, any>) => {
    const finalKeyword = searchKeyword ?? keyword
    const finalFilters = searchFilters ?? activeFilters
    onSearch(finalKeyword, finalFilters)
  }

  useImperativeHandle(ref, () => ({
    search: handleSearch,
    reset: handleReset,
  }))

  const handleFilterChange = (key: string, value: any, triggerSearch = false) => {
    const newFilters = {
      ...activeFilters,
      [key]: value,
    }
    setActiveFilters(newFilters)
    if (triggerSearch) {
      handleSearch(keyword, newFilters)
    }
  }

  const handleReset = () => {
    setKeyword('')
    setActiveFilters({})
    onSearch('', {})
  }

  const renderFilter = (filter: { key: string; label: string; type?: FilterType; options: SearchOption[]; defaultValue?: any }) => {
    const type = filter.type || 'select'
    const value = activeFilters[filter.key]
    const defaultValue = filter.defaultValue ?? null
    switch (type) {
      case 'radio':
        return (
          <div className="filter-radio-group">
            {/* <span className="filter-label">{filter.label}:</span> */}
            <Radio.Group
              value={value ?? defaultValue}
              onChange={(e) => handleFilterChange(filter.key, e.target.value, true)}
              optionType="button"
              buttonStyle="solid"
              // styles={{
              //   label: {
              //     color: '#000',
              //   },
              // }}
            >
              {filter.options.map((option) => (
                <Radio.Button style={{ color: '#000' }} key={option.value} value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        )

      case 'checkbox':
        return (
          <div className="filter-checkbox-group">
            {/* <span className="filter-label">{filter.label}:</span> */}
            <Checkbox.Group
              value={value || []}
              onChange={(values) => handleFilterChange(filter.key, values, true)}
              options={filter.options.map((opt) => ({ label: opt.label, value: opt.value }))}
            />
          </div>
        )

      case 'select-multi':
        return (
          <Select
            placeholder={filter.label}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
            allowClear
            mode="multiple"
            style={{ width: 180 }}
            options={filter.options}
          />
        )

      case 'select':
      default:
        return (
          <Select
            placeholder={filter.label}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
            allowClear
            style={{ width: 150 }}
            options={filter.options}
          />
        )
    }
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
          <div key={filter.key}>{renderFilter(filter)}</div>
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
})

SearchBar.displayName = 'SearchBar'

export default SearchBar
