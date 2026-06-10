/**
 * 智能体选择弹窗
 *
 * Props:
 *   open     : boolean
 *   onClose  : () => void
 *   onConfirm: (agent) => void
 *   agents   : Agent[]
 */
import React, { useState, useMemo } from 'react'
import { CATEGORIES } from '../data/seedSkills'

export default function AgentPickerModal({ open, onClose, onConfirm, agents = [] }) {
  const [keyword, setKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return agents.filter((a) => {
      if (activeCategory !== 'all' && a.category !== activeCategory) return false
      if (!k) return true
      return (
        a.name.toLowerCase().includes(k) ||
        (a.description || '').toLowerCase().includes(k)
      )
    })
  }, [agents, keyword, activeCategory])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            placeholder="搜索智能体名称…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-on-surface)' }}
          />
        </div>

        {/* 分类芯片 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1">
          {CATEGORIES.map((c) => {
            const active = c.key === activeCategory
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className="px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors duration-200"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
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

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1 mt-2">
          {filtered.length === 0 ? (
            <div
              className="text-center py-10 text-sm"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {keyword ? `未找到「${keyword}」相关智能体` : '该分类下暂无智能体'}
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
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: a.iconBg || 'var(--color-primary)' }}
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">
                      {a.icon || 'smart_toy'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      {a.name}
                    </p>
                    <p
                      className="text-[10px] line-clamp-2 mt-0.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >
                      {a.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={onClose}
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
