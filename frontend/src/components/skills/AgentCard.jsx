import React from 'react'

/**
 * 智能体卡片
 *
 * Props:
 *   agent    : { id, name, description, category, icon, iconBg, addCount, isHot }
 *   isAdded  : boolean
 *   onAdd    : (agent) => void
 *   onUse    : (agent) => void
 *   onClick  : (agent) => void
 */
function AgentCard({ agent, isAdded = false, onAdd, onUse, onClick }) {
  return (
    <div
      onClick={() => onClick?.(agent)}
      className="skill-card-hover group relative rounded-2xl p-4 flex flex-col gap-3 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 8px 24px color-mix(in srgb, var(--color-on-surface) 10%, transparent)'
        e.currentTarget.style.borderColor =
          'color-mix(in srgb, var(--color-primary) 40%, var(--color-outline-variant))'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
        e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* 热门标签 */}
      {agent.isHot && (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
          style={{
            backgroundColor: 'var(--color-tertiary-container)',
            color: 'var(--color-on-tertiary-container)',
          }}
        >
          <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
          热门
        </span>
      )}

      {/* 头部：缩略图 + 名称 */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
          style={{
            background: agent.iconBg,
            boxShadow: '0 2px 6px color-mix(in srgb, var(--color-on-surface) 8%, transparent)',
          }}
        >
          <span className="material-symbols-outlined text-[24px] text-white">
            {agent.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0 pr-12">
          <h3
            className="text-sm font-semibold truncate transition-colors duration-200"
            style={{ color: 'var(--color-on-surface)' }}
            title={agent.name}
          >
            {agent.name}
          </h3>
          <p
            className="text-[11px] mt-0.5 transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            <span className="material-symbols-outlined text-[12px] align-text-bottom mr-0.5">person</span>
            {formatAddCount(agent.addCount || 0)} 人已添加
          </p>
        </div>
      </div>

      {/* 功能简介：≤3 行 */}
      <p
        className="text-xs leading-relaxed line-clamp-3 transition-colors duration-200 min-h-[3.6em]"
        style={{ color: 'var(--color-on-surface-variant)' }}
        title={agent.description}
      >
        {agent.description}
      </p>

      {/* 底部：分类标签 + 添加/已添加 按钮 */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2">
        <CategoryBadge category={agent.category} />

        {isAdded ? (
          // 已添加状态：disabled 视觉反馈
          <button
            disabled
            aria-disabled="true"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all duration-200 cursor-default"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: 'var(--color-primary)',
              border: '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)',
            }}
            title="已添加到「我的技能」"
          >
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            已添加
          </button>
        ) : (
          // 未添加状态：可点击
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd?.(agent)
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              boxShadow: '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="添加到我的技能"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            添加
          </button>
        )}
      </div>
    </div>
  )
}

/* ===== 分类徽章 ===== */
const CATEGORY_META = {
  office:    { label: '办公效率', color: '#4facfe' },
  dev:       { label: '研发辅助', color: '#a18cd1' },
  test:      { label: '测试工具', color: '#43e97b' },
  ops:       { label: '运维工具', color: '#f5576c' },
  operation: { label: '运营工具', color: '#ff9a9e' },
}

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || { label: category, color: '#999' }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors duration-200"
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        color: meta.color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  )
}

/* ===== 数字格式化：12345 → 1.2w ===== */
function formatAddCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

export default AgentCard
