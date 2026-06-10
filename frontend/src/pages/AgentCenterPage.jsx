/**
 * 智能体中心页面 (02-智能体中心)
 *
 * 功能：展示平台提供的全部 AI 智能体，按专业领域分类呈现。
 * 路由：/agents
 *
 * 页面结构：
 * - 顶部标题区："发现理想的 AI 助手" + 副标题 + 搜索框
 * - 4 大分类卡片网格（Bento Grid 布局）
 * - 每个卡片含图标、名称、描述、hover CTA
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAgents from '../hooks/useAgents'

// 智能体分类配置
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

// 图标背景色映射（使用 CSS 变量 + Tailwind class 组合实现主题适配）
const ICON_BG_MAP = {
  primary:   { bgVar: '--color-primary',           hoverBgVar: '--color-primary',           iconColorVar: '--color-primary' },
  tertiary:  { bgVar: '--color-tertiary',          hoverBgVar: '--color-tertiary',          iconColorVar: '--color-tertiary' },
  variant:   { bgVar: '--color-surface-container', hoverBgVar: '--color-surface-container-high', iconColorVar: '--color-on-surface' },
  error:     { bgVar: '--color-error-container',   hoverBgVar: '--color-error-container',   iconColorVar: '--color-error' },
}

export default function AgentCenterPage() {
  const navigate = useNavigate()
  const { agents, loading } = useAgents()
  const [keyword, setKeyword] = useState('')

  // 按关键词过滤
  const filteredAgents = keyword.trim()
    ? agents.filter(a =>
        a.name.includes(keyword) ||
        a.description.includes(keyword) ||
        a.category.includes(keyword)
      )
    : agents

  // 按类别分组
  const groupedAgents = CATEGORIES.map(cat => ({
    ...cat,
    agents: filteredAgents.filter(a => a.category === cat.key),
  })).filter(cat => cat.agents.length > 0)

  // 点击智能体卡片 -> 创建对话并跳转
  const handleSelectAgent = async (agent) => {
    navigate(`/chat/new`, { state: { agentId: agent.id, agentName: agent.name } })
  }

  return (
    <main
      className="flex-1 pt-24 pb-10 px-4 md:px-10 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-64px)] transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 头部搜索区 */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 mb-10 py-8">
        <h2
          className="text-2xl md:text-3xl font-bold transition-colors duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
        >
          发现理想的 AI 助手
        </h2>
        <p
          className="text-sm max-w-2xl mx-auto transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          浏览我们的智能体市场，寻找能提升您测试工作效率的专属助手。
        </p>

        {/* 搜索框 */}
        <div
          className="w-full max-w-2xl rounded-full flex items-center px-5 py-3 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] focus-within:ring-2 transition-all duration-200"
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
        </div>
      </div>

      {/* 分类卡片网格 */}
      <div className="space-y-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="animate-spin w-10 h-10 border-3 rounded-full"
              style={{
                borderColor: 'var(--color-surface-variant)',
                borderTopColor: 'var(--color-primary)',
              }}
            ></div>
          </div>
        ) : groupedAgents.length === 0 ? (
          <div
            className="text-center py-20 transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            未找到匹配的智能体
          </div>
        ) : (
          groupedAgents.map(category => (
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
              </div>

              {/* 卡片网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.agents.map(agent => {
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
                      {/* 图标 */}
                      <div
                        className="rounded-lg flex items-center justify-center w-14 h-14 mb-4 transition-colors duration-200"
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
          ))
        )}
      </div>
    </main>
  )
}
