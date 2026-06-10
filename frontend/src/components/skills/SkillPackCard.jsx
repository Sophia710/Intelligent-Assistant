import React from 'react'

/**
 * 行业技能包大卡片
 */
function SkillPackCard({ pack, onAdd, isAdded, onClick }) {
  return (
    <div
      onClick={onClick}
      className="skill-card-hover rounded-2xl p-5 flex flex-col gap-4 cursor-pointer"
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
      {/* 头部：图标 + 标题 + 一键添加按钮 */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: pack.iconBg }}
        >
          <span className="material-symbols-outlined text-[28px] text-white">
            {pack.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold truncate transition-colors duration-200"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {pack.name}
          </h3>
          <p
            className="text-xs mt-1 line-clamp-2 transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {pack.summary}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.(pack)
          }}
          disabled={isAdded}
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer disabled:cursor-default"
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
            if (!isAdded) {
              e.currentTarget.style.opacity = '0.85'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {isAdded ? '已添加' : '一键添加'}
        </button>
      </div>

      {/* 技能包元数据 */}
      <div className="flex items-center gap-3 text-xs">
        <span
          className="px-2 py-0.5 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: 'var(--color-surface-container)',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          技能包
        </span>
        <span
          className="inline-flex items-center gap-1 transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          <span className="material-symbols-outlined text-[14px]">person</span>
          {pack.usage}w
        </span>
      </div>

      {/* 包含技能标签 */}
      <div
        className="pt-3 border-t transition-colors duration-200"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <p
          className="text-[11px] mb-2 transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          包含以下技能
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {pack.subSkills.map((sub) => (
            <span
              key={sub.name}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span className="material-symbols-outlined text-[12px]">{sub.icon}</span>
              {sub.name}
            </span>
          ))}
          <span
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] cursor-pointer transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
            }}
          >
            查看更多 <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default SkillPackCard
