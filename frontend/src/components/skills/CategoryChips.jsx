import React from 'react'

/**
 * 分类筛选 Chips — 支持角标计数
 *
 * Props:
 *   items    : [{ key, label, icon }]
 *   activeKey: string
 *   counts   : { [key]: number }  - 各分类卡片数量（用于角标）
 *   onChange : (key) => void
 */
function CategoryChips({ items, activeKey, counts = {}, onChange }) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto py-1 -mx-1 px-1"
      style={{ scrollbarWidth: 'thin' }}
    >
      {items.map((item) => {
        const active = item.key === activeKey
        const count = counts[item.key] ?? 0
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
            style={
              active
                ? {
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    boxShadow: '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
                  }
                : {
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface-variant)',
                    border: '1px solid var(--color-outline-variant)',
                  }
            }
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
                e.currentTarget.style.color = 'var(--color-on-surface)'
                e.currentTarget.style.borderColor = 'var(--color-outline)'
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
                e.currentTarget.style.color = 'var(--color-on-surface-variant)'
                e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
              }
            }}
          >
            {item.icon && (
              <span className="material-symbols-outlined text-[16px]">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            <span
              className="text-[10px] px-1.5 py-0 rounded-full font-semibold transition-colors duration-200"
              style={
                active
                  ? {
                      backgroundColor: 'var(--color-on-primary)',
                      color: 'var(--color-primary)',
                    }
                  : {
                      backgroundColor: 'var(--color-surface-container-highest)',
                      color: 'var(--color-on-surface-variant)',
                    }
              }
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryChips
