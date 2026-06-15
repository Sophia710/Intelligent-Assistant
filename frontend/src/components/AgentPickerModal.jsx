/**
 * 智能体选择弹窗
 *
 * 支持系统内置 + 用户自定义智能体的混合展示，并在每张卡片上显示类型徽章。
 *
 * Props:
 *   open     : boolean
 *   onClose  : () => void
 *   onConfirm: (agent) => void
 *   agents   : Agent[]   - 已合并好的智能体列表（每条带 type 字段 'builtin' | 'custom'）
 */
import React, { useState, useMemo } from 'react'
import AgentTypeBadge from './agents/AgentTypeBadge'

// 适配弹窗的精简分类 — 仅包含 "全部 / 内置 / 自定义" 三档
const QUICK_FILTERS = [
  { key: 'all',     label: '全部',         icon: 'apps' },
  { key: 'builtin', label: '系统内置',     icon: 'verified' },
  { key: 'custom',  label: '我的自定义',   icon: 'person' },
]

// 智能体业务分类标签（与 AgentCenterPage 保持一致）
const CATEGORY_LABELS = {
  terminal: '用户终端',
  network: '星地网络',
  payload: '卫星载荷',
  e2e: '端到端',
  office: '办公效率',
  dev: '研发辅助',
  test: '测试工具',
  ops: '运维工具',
  operation: '运营工具',
  custom: '通用自定义',
}

// 与 AgentCenterPage 同步的图标主题映射（color_theme 字段）
const ICON_BG_MAP = {
  primary:   { bgVar: '--color-primary',           iconColorVar: '--color-primary' },
  tertiary:  { bgVar: '--color-tertiary',          iconColorVar: '--color-tertiary' },
  variant:   { bgVar: '--color-surface-container', iconColorVar: '--color-on-surface' },
  error:     { bgVar: '--color-error-container',   iconColorVar: '--color-error' },
}

/**
 * 解析主题:seed 数据中 color_theme 可能是命名键(builtin 中心渲染时使用)
 * 也可能是 hex 字符串(由后端原始返回)。统一回退到 primary。
 */
function resolveTheme(agent) {
  if (agent?.type === 'custom') return null // 自定义智能体使用自己的 iconBg 渐变
  return ICON_BG_MAP[agent?.color_theme] || ICON_BG_MAP.primary
}

/**
 * 状态徽章:与 seed 数据中 status 字段对齐(active / maintenance)
 */
function StatusBadge({ status }) {
  if (!status || status === 'active') return null
  const isMaint = status === 'maintenance'
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded font-semibold whitespace-nowrap text-[9px] px-1 py-0.5"
      style={{
        backgroundColor: isMaint
          ? 'color-mix(in srgb, var(--color-error) 14%, transparent)'
          : 'var(--color-surface-container-high)',
        color: isMaint ? 'var(--color-error)' : 'var(--color-on-surface-variant)',
        border: isMaint
          ? '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)'
          : '1px solid var(--color-outline-variant)',
      }}
      title={isMaint ? '维护中,功能暂不可用' : status}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '9px' }}>
        {isMaint ? 'build' : 'info'}
      </span>
      {isMaint ? '维护中' : status}
    </span>
  )
}

export default function AgentPickerModal({ open, onClose, onConfirm, agents = [] }) {
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')           // all/builtin/custom

  /**
   * 过滤
   *  - typeFilter 控制类型
   *  - keyword 模糊匹配名称/描述
   */
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return agents.filter((a) => {
      if (typeFilter === 'builtin' && a.type !== 'builtin') return false
      if (typeFilter === 'custom' && a.type !== 'custom') return false
      if (!k) return true
      return (
        (a.name || '').toLowerCase().includes(k) ||
        (a.description || '').toLowerCase().includes(k)
      )
    })
  }, [agents, keyword, typeFilter])

  // 统计
  const counts = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return agents.filter((a) =>
      !k ||
      (a.name || '').toLowerCase().includes(k) ||
      (a.description || '').toLowerCase().includes(k)
    ).reduce(
      (acc, a) => {
        if (a.type === 'builtin') acc.builtin += 1
        if (a.type === 'custom') acc.custom += 1
        return acc
      },
      { builtin: 0, custom: 0 }
    )
  }, [agents, keyword])

  if (!open) return null

  const handleClose = () => {
    setKeyword('')
    setTypeFilter('all')
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ color: 'var(--color-primary)' }}
          >
            smart_toy
          </span>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            加载智能体
          </h3>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-semibold ml-1"
            style={{
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            {filtered.length}
          </span>
        </div>

        {/* 搜索 */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3"
          style={{
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            search
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索智能体名称或简介…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-on-surface)' }}
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ color: 'var(--color-on-surface-variant)' }}
              aria-label="清空"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* 类型筛选（内置 / 自定义） */}
        <div className="flex items-center gap-1.5 mb-2">
          {QUICK_FILTERS.map((f) => {
            const active = f.key === typeFilter
            const count = f.key === 'all'
              ? counts.builtin + counts.custom
              : f.key === 'builtin' ? counts.builtin : counts.custom
            return (
              <button
                key={f.key}
                onClick={() => setTypeFilter(f.key)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1 transition-colors duration-200"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-container-lowest)',
                        color: 'var(--color-on-surface-variant)',
                        border: '1px solid var(--color-outline-variant)',
                      }
                }
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                  {f.icon}
                </span>
                {f.label}
                <span
                  className="text-[9px] px-1 rounded font-semibold"
                  style={{
                    backgroundColor: active
                      ? 'color-mix(in srgb, var(--color-on-primary) 25%, transparent)'
                      : 'var(--color-surface-container-high)',
                    color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1 mt-2">
          {filtered.length === 0 ? (
            <div
              className="text-center py-10 text-sm"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              <span
                className="material-symbols-outlined block mb-1"
                style={{ fontSize: '32px', opacity: 0.4 }}
              >
                {keyword ? 'search_off' : 'smart_toy'}
              </span>
              {keyword ? `未找到「${keyword}」相关智能体` : '该筛选下暂无智能体'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((a) => {
                const isCustom = a.type === 'custom'
                const theme = resolveTheme(a)
                const categoryLabel = CATEGORY_LABELS[a.category]
                return (
                <button
                  key={a.id}
                  onClick={() => onConfirm?.(a)}
                  className="text-left flex items-start gap-2.5 p-2.5 rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    border: isCustom
                      ? '1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-outline-variant))'
                      : '1px solid var(--color-outline-variant)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = isCustom
                      ? 'color-mix(in srgb, var(--color-primary) 35%, var(--color-outline-variant))'
                      : 'var(--color-outline-variant)'
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={
                      isCustom
                        ? { background: a.iconBg || 'var(--color-primary)' }
                        : {
                            backgroundColor: `color-mix(in srgb, var(${theme.bgVar}) 20%, transparent)`,
                          }
                    }
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ color: isCustom ? '#fff' : `var(${theme.iconColorVar})` }}
                    >
                      {a.icon || 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <p
                        className="text-[13px] font-semibold truncate flex-1 min-w-0"
                        style={{ color: 'var(--color-on-surface)' }}
                      >
                        {a.name}
                      </p>
                      <AgentTypeBadge type={a.type} size="xs" />
                      <StatusBadge status={a.status} />
                    </div>
                    <p
                      className="text-[10px] line-clamp-2"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >
                      {a.description || '（暂无简介）'}
                    </p>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {categoryLabel && (
                        <span
                          className="text-[9px] px-1 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: 'var(--color-surface-container)',
                            color: 'var(--color-on-surface-variant)',
                          }}
                        >
                          {categoryLabel}
                        </span>
                      )}
                      {isCustom && a.triggerCommand && (
                        <code
                          className="text-[9px] px-1 py-0.5 rounded font-mono"
                          style={{
                            backgroundColor: 'var(--color-surface-container)',
                            color: 'var(--color-on-surface-variant)',
                          }}
                        >
                          /{a.triggerCommand}
                        </code>
                      )}
                    </div>
                  </div>
                </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
