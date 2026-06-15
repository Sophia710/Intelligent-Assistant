/**
 * 智能体中心页面 (02-智能体中心)
 *
 * 功能：展示平台内置 AI 智能体 + 用户自定义智能体，支持新建自定义智能体。
 * 路由：/agents
 *
 * 页面结构：
 * - 顶部标题区："发现理想的 AI 助手" + 副标题 + 搜索框
 * - 4 大分类卡片网格（Bento Grid 布局）
 * - "我的自定义" 智能体独立分块展示
 * - 类型筛选芯片：全部 / 系统内置 / 我的自定义
 * - 右下角浮动按钮：新建智能体
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAgents from '../hooks/useAgents'
import useCustomAgents from '../hooks/useCustomAgents'
import { useToast } from '../contexts/ToastContext'
import CreateAgentModal from '../components/agents/CreateAgentModal'
import AgentTypeBadge from '../components/agents/AgentTypeBadge'

// 智能体分类配置（系统内置）
const CATEGORIES = [
  {
    key: 'terminal',
    title: '用户终端智能化测试',
    icon: 'smartphone',
  },
  {
    key: 'network',
    title: '星地网络智能化测试',
    icon: 'language',
  },
  {
    key: 'payload',
    title: '卫星载荷智能化测试',
    icon: 'memory',
  },
  {
    key: 'e2e',
    title: '全链路智能化验收与运维测试',
    icon: 'checklist',
  },
]

// 图标背景色映射
const ICON_BG_MAP = {
  primary:   { bgVar: '--color-primary',           hoverBgVar: '--color-primary',           iconColorVar: '--color-primary' },
  tertiary:  { bgVar: '--color-tertiary',          hoverBgVar: '--color-tertiary',          iconColorVar: '--color-tertiary' },
  variant:   { bgVar: '--color-surface-container', hoverBgVar: '--color-surface-container-high', iconColorVar: '--color-on-surface' },
  error:     { bgVar: '--color-error-container',   hoverBgVar: '--color-error-container',   iconColorVar: '--color-error' },
}

export default function AgentCenterPage() {
  const navigate = useNavigate()
  const { agents: builtinAgents, loading } = useAgents()
  const { list: customAgents, addAgent, removeAgent } = useCustomAgents()
  const toast = useToast()

  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')  // all | builtin | custom
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  /**
   * 合并内置 + 自定义智能体
   *  - 为每条记录注入 type 字段
   *  - 自定义智能体在合并数组的开头（优先展示）
   */
  const allAgents = useMemo(() => {
    const custom = customAgents.map((a) => ({ ...a, type: 'custom' }))
    const builtin = builtinAgents.map((a) => ({ ...a, type: 'builtin' }))
    return [...custom, ...builtin]
  }, [builtinAgents, customAgents])

  // 关键词过滤
  const keywordFiltered = useMemo(() => {
    const k = keyword.trim()
    if (!k) return allAgents
    return allAgents.filter(
      (a) =>
        a.name.includes(k) ||
        (a.description || '').includes(k) ||
        (a.category || '').includes(k)
    )
  }, [allAgents, keyword])

  // 类型过滤
  const filteredAgents = useMemo(() => {
    if (typeFilter === 'all') return keywordFiltered
    return keywordFiltered.filter((a) => a.type === typeFilter)
  }, [keywordFiltered, typeFilter])

  // 系统内置按类别分组（仅当筛选包含内置时计算）
  const groupedBuiltin = useMemo(() => {
    const source = typeFilter === 'custom' ? [] : keywordFiltered.filter((a) => a.type === 'builtin')
    return CATEGORIES.map((cat) => ({
      ...cat,
      agents: source.filter((a) => a.category === cat.key),
    })).filter((cat) => cat.agents.length > 0)
  }, [keywordFiltered, typeFilter])

  // 自定义智能体（仅当筛选包含自定义时计算）
  const filteredCustom = useMemo(() => {
    if (typeFilter === 'builtin') return []
    return keywordFiltered.filter((a) => a.type === 'custom')
  }, [keywordFiltered, typeFilter])

  const countBuiltin = keywordFiltered.filter((a) => a.type === 'builtin').length
  const countCustom = keywordFiltered.filter((a) => a.type === 'custom').length

  // 点击系统内置智能体
  const handleSelectAgent = async (agent) => {
    navigate(`/chat/new`, {
      state: { agentId: agent.id, agentName: agent.name, agentType: agent.type },
    })
  }

  // 点击自定义智能体
  const handleSelectCustom = (agent) => {
    if (deletingId) return
    navigate(`/chat/new`, {
      state: { agentId: agent.id, agentName: agent.name, agentType: 'custom' },
    })
  }

  // 提交新建
  const handleCreate = (draft) => {
    const created = addAgent(draft)
    toast.success(`已创建智能体「${created.name}」`)
    setCreateOpen(false)
  }

  // 删除自定义智能体
  const handleDelete = (agent) => {
    if (!window.confirm(`确定要删除自定义智能体「${agent.name}」吗？`)) return
    removeAgent(agent.id)
    toast.info(`已删除「${agent.name}」`)
    setDeletingId(null)
  }

  return (
    <main
      className="flex-1 pt-24 pb-10 px-4 md:px-10 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-64px)] transition-colors duration-200 relative"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 头部搜索区 */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 mb-8 py-8">
        <h2
          className="text-2xl md:text-3xl font-bold transition-colors duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
        >
          发现理想的卫星互联网AI助手
        </h2>
        <p
          className="text-sm max-w-2xl mx-auto transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          浏览我们的智能体市场，或创建专属于你的自定义智能体。
        </p>

        {/* 搜索框 + 新建入口 */}
        <div className="w-full max-w-3xl flex items-center gap-3">
          <div
            className="flex-1 rounded-full flex items-center px-5 py-3 transition-all duration-200"
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
              boxShadow: '0 10px 30px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
          >
            <span
              className="material-symbols-outlined mr-3 transition-colors duration-200"
              style={{ color: 'var(--color-outline)' }}
            >search</span>
            <input
              className="flex-1 bg-transparent border-none outline-none text-sm py-1 transition-colors duration-200"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="搜索 AI 助手..."
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="ml-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                style={{ color: 'var(--color-on-surface-variant)' }}
                aria-label="清空搜索"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="px-5 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.92'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 20px color-mix(in srgb, var(--color-primary) 40%, transparent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)'
            }}
            title="新建自定义智能体"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">新建智能体</span>
          </button>
        </div>

        {/* 类型筛选芯片 */}
        <div className="w-full max-w-3xl flex items-center gap-2 flex-wrap justify-center">
          <FilterChip
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
            icon="apps"
            label="全部"
            count={keywordFiltered.length}
          />
          <FilterChip
            active={typeFilter === 'builtin'}
            onClick={() => setTypeFilter('builtin')}
            icon="verified"
            label="系统内置"
            count={countBuiltin}
            activeColor="variant"
          />
          <FilterChip
            active={typeFilter === 'custom'}
            onClick={() => setTypeFilter('custom')}
            icon="person"
            label="我的自定义"
            count={countCustom}
            activeColor="primary"
          />
        </div>
      </div>

      {/* 分类卡片网格 */}
      <div className="space-y-10">
        {loading && typeFilter !== 'custom' ? (
          <div className="flex justify-center py-20">
            <div
              className="animate-spin w-10 h-10 border-3 rounded-full"
              style={{
                borderColor: 'var(--color-surface-variant)',
                borderTopColor: 'var(--color-primary)',
              }}
            ></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <EmptyState
            keyword={keyword}
            typeFilter={typeFilter}
            onCreate={() => setCreateOpen(true)}
          />
        ) : (
          <>
            {/* 我的自定义智能体区 */}
            {filteredCustom.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="material-symbols-outlined transition-colors duration-200"
                    style={{ color: 'var(--color-primary)' }}
                  >person</span>
                  <h3
                    className="text-xl font-semibold transition-colors duration-200"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
                  >
                    我的自定义智能体
                  </h3>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {filteredCustom.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCustom.map((agent) => (
                    <CustomAgentCard
                      key={agent.id}
                      agent={agent}
                      onClick={() => handleSelectCustom(agent)}
                      onDelete={() => handleDelete(agent)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 系统内置智能体区（按分类） */}
            {groupedBuiltin.map((category) => (
              <section key={category.key}>
                {/* 分类标题 */}
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="material-symbols-outlined transition-colors duration-200"
                    style={{ color: 'var(--color-primary)' }}
                  >{category.icon}</span>
                  <h3
                    className="text-xl font-semibold transition-colors duration-200"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
                  >
                    {category.title}
                  </h3>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    {category.agents.length}
                  </span>
                </div>

                {/* 卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.agents.map((agent) => {
                    const theme = ICON_BG_MAP[agent.color_theme] || ICON_BG_MAP.primary
                    return (
                      <div
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent)}
                        className="group rounded-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full p-6"
                        style={{
                          backgroundColor: 'var(--color-surface-container-lowest)',
                          border: '1px solid var(--color-surface-variant)',
                          boxShadow: '0 4px 14px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px color-mix(in srgb, var(--color-on-surface) 12%, transparent)'
                          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
                          e.currentTarget.style.borderColor = 'var(--color-surface-variant)'
                        }}
                      >
                        {/* 图标 + 类型徽章 */}
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="rounded-lg flex items-center justify-center w-14 h-14 transition-colors duration-200"
                            style={{
                              backgroundColor: `color-mix(in srgb, var(${theme.bgVar}) 20%, transparent)`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `var(${theme.hoverBgVar})`
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `color-mix(in srgb, var(${theme.bgVar}) 20%, transparent)`
                            }}
                          >
                            <span
                              className="material-symbols-outlined transition-colors duration-200"
                              style={{ fontSize: '32px', color: `var(${theme.iconColorVar})` }}
                            >
                              {agent.icon}
                            </span>
                          </div>
                          <AgentTypeBadge type="builtin" />
                        </div>

                        {/* 标题 */}
                        <h4
                          className="text-lg font-semibold mb-2 transition-colors duration-200"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
                        >
                          {agent.name}
                        </h4>

                        {/* 描述 */}
                        <p
                          className="text-sm flex-1 leading-relaxed transition-colors duration-200"
                          style={{ color: 'var(--color-on-surface-variant)' }}
                        >
                          {agent.description}
                        </p>

                        {/* Hover CTA */}
                        <div
                          className="mt-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <span className="text-xs font-medium mr-1">开始使用</span>
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </>
        )}
      </div>

      {/* ====== 新建智能体模态框 ====== */}
      <CreateAgentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </main>
  )
}

/* ====== 自定义智能体卡片 ====== */
function CustomAgentCard({ agent, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group rounded-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full p-6 relative"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-surface-variant))',
        boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 6%, transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px color-mix(in srgb, var(--color-primary) 14%, transparent)'
        e.currentTarget.style.borderColor = 'var(--color-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 14px color-mix(in srgb, var(--color-primary) 6%, transparent)'
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 25%, var(--color-surface-variant))'
      }}
    >
      {/* 右上角操作区 */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <AgentTypeBadge type="custom" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.()
          }}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-error) 12%, transparent)'
            e.currentTarget.style.color = 'var(--color-error)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-on-surface-variant)'
          }}
          title="删除"
          aria-label="删除智能体"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>

      {/* 图标 */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="rounded-lg flex items-center justify-center w-14 h-14 shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ background: agent.iconBg }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>
            {agent.icon}
          </span>
        </div>
      </div>

      {/* 标题 */}
      <h4
        className="text-lg font-semibold mb-1 transition-colors duration-200"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
      >
        {agent.name}
      </h4>

      {/* 触发命令（如果有） */}
      {agent.triggerCommand && (
        <div className="mb-2">
          <code
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              backgroundColor: 'var(--color-surface-container)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            /{agent.triggerCommand}
          </code>
        </div>
      )}

      {/* 描述 */}
      <p
        className="text-sm flex-1 leading-relaxed transition-colors duration-200 line-clamp-3"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {agent.description}
      </p>

      {/* Hover CTA */}
      <div
        className="mt-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ color: 'var(--color-primary)' }}
      >
        <span className="text-xs font-medium mr-1">开始使用</span>
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </div>
    </div>
  )
}

/* ====== 筛选芯片 ====== */
function FilterChip({ active, onClick, icon, label, count, activeColor = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
      style={
        active
          ? {
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }
          : {
              backgroundColor: 'var(--color-surface-container-lowest)',
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-outline-variant)',
            }
      }
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '14px' }}
      >
        {icon}
      </span>
      {label}
      {typeof count === 'number' && (
        <span
          className="text-[10px] px-1 py-0 rounded font-semibold"
          style={{
            backgroundColor: active
              ? 'color-mix(in srgb, var(--color-on-primary) 25%, transparent)'
              : 'var(--color-surface-container-high)',
            color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/* ====== 空状态 ====== */
function EmptyState({ keyword, typeFilter, onCreate }) {
  const isCustomFilter = typeFilter === 'custom'
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-3 transition-colors duration-200"
      style={{ color: 'var(--color-on-surface-variant)' }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '56px', opacity: 0.4 }}
      >
        {keyword ? 'search_off' : isCustomFilter ? 'person_off' : 'smart_toy'}
      </span>
      <p
        className="text-sm font-medium transition-colors duration-200"
        style={{ color: 'var(--color-on-surface)' }}
      >
        {keyword
          ? `未找到匹配「${keyword}」的智能体`
          : isCustomFilter
            ? '你还没有创建任何自定义智能体'
            : '暂无可用智能体'}
      </p>
      {!keyword && isCustomFilter && (
        <button
          onClick={onCreate}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          新建我的第一个智能体
        </button>
      )}
    </div>
  )
}
