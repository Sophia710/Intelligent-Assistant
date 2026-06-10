import React from 'react'

/**
 * 数据集卡片
 */
function DatasetCard({ dataset, onAdd, isAdded, onClick }) {
  const tagColorMap = {
    free:    { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',  fg: 'var(--color-primary)' },
    limited: { bg: 'color-mix(in srgb, #f59e0b 15%, transparent)',               fg: '#b45309' },
    paid:    { bg: 'color-mix(in srgb, var(--color-error) 12%, transparent)',    fg: 'var(--color-error)' },
  }
  const tagStyle = tagColorMap[dataset.tagType] || tagColorMap.free

  return (
    <div
      onClick={onClick}
      className="skill-card-hover rounded-2xl p-5 flex flex-col gap-3 cursor-pointer min-w-[280px]"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px color-mix(in srgb, var(--color-on-surface) 8%, transparent)'
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 40%, var(--color-outline-variant))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
        e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
      }}
    >
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: dataset.iconBg }}
        >
          <span className="material-symbols-outlined text-[24px] text-white">
            {dataset.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="text-sm font-semibold truncate transition-colors duration-200"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {dataset.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[11px] transition-colors duration-200"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {dataset.creator}
            </span>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded transition-colors duration-200"
              style={{ backgroundColor: tagStyle.bg, color: tagStyle.fg }}
            >
              {dataset.tag}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.(dataset)
          }}
          disabled={isAdded}
          className="px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer disabled:cursor-default"
          style={
            isAdded
              ? {
                  backgroundColor: 'var(--color-surface-container)',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid var(--color-outline-variant)',
                }
              : {
                  backgroundColor: 'var(--color-on-surface)',
                  color: 'var(--color-surface)',
                }
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = isAdded ? '1' : '0.85'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {isAdded ? '已添加' : '添加'}
        </button>
      </div>

      {/* 简介 */}
      <p
        className="text-xs line-clamp-2 transition-colors duration-200"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {dataset.summary}
      </p>
    </div>
  )
}

export default DatasetCard
