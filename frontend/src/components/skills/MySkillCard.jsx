import React, { useState, useRef, useEffect } from 'react'

/**
 * 我的技能卡片（"立即使用" 风格）
 *
 * Props:
 *   skill       : Skill
 *   onUse       : (skill) => void
 *   onRemove    : (skill) => void
 *   onEdit?     : (skill) => void  - 仅自定义技能
 */
function MySkillCard({ skill, onUse, onRemove, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // 点击外部关闭菜单
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const isCustom = skill.type === 'custom'

  return (
    <div
      className="skill-card-hover rounded-2xl p-4 flex flex-col gap-3"
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
      {/* 头部：图标 + 标题 + 菜单 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: skill.iconBg }}
          >
            <span className="material-symbols-outlined text-[22px] text-white">
              {skill.icon}
            </span>
          </div>
          <div className="min-w-0">
            <h4
              className="text-sm font-semibold truncate transition-colors duration-200"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {skill.name}
            </h4>
            {isCustom && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded transition-colors duration-200 inline-block mt-0.5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                自定义
              </span>
            )}
          </div>
        </div>

        {/* 菜单按钮 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="更多操作"
            aria-label="更多操作"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-9 z-20 w-32 rounded-lg overflow-hidden shadow-lg tab-fade-in"
              style={{
                backgroundColor: 'var(--color-surface-container-highest)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              {isCustom && onEdit && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(skill)
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors duration-150 cursor-pointer"
                  style={{ color: 'var(--color-on-surface)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  编辑
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onRemove?.(skill)
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors duration-150 cursor-pointer"
                style={{ color: 'var(--color-error)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-error) 8%, transparent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                移除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 描述 */}
      <p
        className="text-xs line-clamp-2 transition-colors duration-200 min-h-[2.5em]"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {skill.description || '暂无描述'}
      </p>

      {/* 立即使用 */}
      <button
        onClick={() => onUse?.(skill)}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'var(--color-on-surface)',
          color: 'var(--color-surface)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      >
        立即使用
      </button>
    </div>
  )
}

export default MySkillCard
