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
import { CATEGORIES } from '../data/seedSkills'
import AgentTypeBadge from './agents/AgentTypeBadge'

// 适配弹窗的精简分类 — 仅包含 "全部 / 内置 / 自定义" 三档
const QUICK_FILTERS = [
  { key: 'all',     label: '全部',         icon: 'apps' },
  { key: 'builtin', label: '系统内置',     icon: 'verified' },
  { key: 'custom',  label: '我的自定义',   icon: 'person' },
]

export default function AgentPickerModal({ open, onClose, onConfirm, agents = [] }) {
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')    // builtin 业务分类
  const [typeFilter, setTypeFilter] = useState('all')           // all/builtin/custom

  /**
   * 过滤
   *  - typeFilter 控制类型
   *  - activeCategory 控制系统内置的子分类（仅当 typeFilter 含 builtin 时生效）
   *  - keyword 模糊匹配名称/描述
   */
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return agents.filter((a) => {
      if (typeFilter === 'builtin' && a.type !== 'builtin') return false
      if (typeFilter === 'custom' && a.type !== 'custom') return false
      if (typeFilter !== 'custom' && activeCategory !== 'all' && a.type === 'builtin' && a.category !== activeCategory) {
        return false
      }
      if (!k) return true
      return (
        (a.name || '').toLowerCase().includes(k) ||
        (a.description || '').toLowerCase().includes(k)
      )
    })
  }, [agents, keyword, activeCategory, typeFilter])

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
    setActiveCategory('all')
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

        {/* 内置业务分类（仅在选中/包含内置时显示） */}
        {typeFilter !== 'custom' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1">
            {CATEGORIES.map((c) => {
              const active = c.key === activeCategory
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className="px-2.5 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors duration-200"
                  style={
                    active
                      ? {
                          backgroundColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                          color: 'var(--color-primary)',
                          border: '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)',
                        }
                      : {
                          backgroundColor: 'var(--color-surface-container)',
                          color: 'var(--color-on-surface-variant)',
                          border: '1px solid var(--color-outline-variant)',
                        }
                  }
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        )}

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
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onConfirm?.(a)}
                  className="text-left flex items-start gap-2.5 p-2.5 rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    border: a.type === 'custom'
                      ? '1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-outline-variant))'
                      : '1px solid var(--color-outline-variant)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = a.type === 'custom'
                      ? 'color-mix(in srgb, var(--color-primary) 35%, var(--color-outline-variant))'
                      : 'var(--color-outline-variant)'
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: a.iconBg || 'var(--color-primary)' }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">
                      {a.icon || 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p
                        className="text-[13px] font-semibold truncate flex-1"
                        style={{ color: 'var(--color-on-surface)' }}
                      >
                        {a.name}
                      </p>
                      <AgentTypeBadge type={a.type} size="xs" />
                    </div>
                    <p
                      className="text-[10px] line-clamp-2"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >
                      {a.description || '（暂无简介）'}
                    </p>
                    {a.type === 'custom' && a.triggerCommand && (
                      <code
                        className="inline-block mt-1 text-[9px] px-1 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: 'var(--color-surface-container)',
                          color: 'var(--color-on-surface-variant)',
                        }}
                      >
                        /{a.triggerCommand}
                      </code>
                    )}
                  </div>
                </button>
              ))}
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
