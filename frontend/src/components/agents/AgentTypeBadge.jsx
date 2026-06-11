import React from 'react'

/**
 * 智能体类型徽章 — 用于区分「系统内置」与「我的自定义」
 *
 * Props:
 *   type: 'builtin' | 'custom'
 *   size: 'sm' | 'xs'    — 默认 sm
 */
function AgentTypeBadge({ type = 'builtin', size = 'sm' }) {
  const isCustom = type === 'custom'
  const sizeCls = size === 'xs' ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'

  if (isCustom) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded font-semibold whitespace-nowrap ${sizeCls}`}
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
          color: 'var(--color-primary)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}
        title="用户自定义智能体"
      >
        <span className="material-symbols-outlined" style={{ fontSize: size === 'xs' ? '9px' : '10px' }}>
          person
        </span>
        我的自定义
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded font-semibold whitespace-nowrap ${sizeCls}`}
      style={{
        backgroundColor: 'var(--color-surface-container-high)',
        color: 'var(--color-on-surface-variant)',
        border: '1px solid var(--color-outline-variant)',
      }}
      title="系统内置智能体"
    >
      <span className="material-symbols-outlined" style={{ fontSize: size === 'xs' ? '9px' : '10px' }}>
        verified
      </span>
      系统内置
    </span>
  )
}

export default AgentTypeBadge
