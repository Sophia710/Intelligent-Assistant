import React, { useState, useRef, useEffect } from 'react'

/**
 * 我的技能卡片
 *
 * Props:
 *   skill        : Skill   - 已含 enabled 字段
 *   onUse        : (skill) => void
 *   onRemove     : (skill) => void
 *   onToggleEnabled : (skill, next:boolean) => void
 *   onEdit?      : (skill) => void  - 仅自定义技能
 */
function MySkillCard({ skill, onUse, onRemove, onToggleEnabled, onEdit }) {
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
  const isEnabled = skill.enabled !== false // 默认 true

  return (
    <div
      className="skill-card-hover rounded-2xl p-4 flex flex-col gap-3 relative"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
        opacity: isEnabled ? 1 : 0.65,
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
      {/* 未启用标识 */}
      {!isEnabled && (
        <span
          className="absolute top-3 right-12 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
          style={{
            backgroundColor: 'var(--color-surface-container-high)',
            color: 'var(--color-on-surface-variant)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <span className="material-symbols-outlined text-[10px]">do_not_disturb_on</span>
          已停用
        </span>
      )}

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
              className="absolute right-0 top-9 z-20 w-44 rounded-lg overflow-hidden shadow-lg tab-fade-in"
              style={{
                backgroundColor: 'var(--color-surface-container-highest)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              {/* ===== 启用开关 ===== */}
              <div
                className="w-full px-3 py-2 text-xs flex items-center justify-between gap-2"
                style={{ color: 'var(--color-on-surface)' }}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ color: isEnabled ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
                  >
                    {isEnabled ? 'toggle_on' : 'toggle_off'}
                  </span>
                  启用
                </span>
                <Switch
                  checked={isEnabled}
                  onChange={(next) => onToggleEnabled?.(skill, next)}
                />
              </div>

              <div
                className="h-px"
                style={{ backgroundColor: 'var(--color-outline-variant)' }}
              />

              {/* 自定义技能：编辑 */}
              {isCustom && onEdit && (
                <>
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
                </>
              )}

              {/* 移除 */}
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
        disabled={!isEnabled}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
        style={{
          backgroundColor: isEnabled ? 'var(--color-on-surface)' : 'var(--color-surface-container-high)',
          color: isEnabled ? 'var(--color-surface)' : 'var(--color-on-surface-variant)',
        }}
        onMouseEnter={(e) => {
          if (isEnabled) e.currentTarget.style.opacity = '0.85'
        }}
        onMouseLeave={(e) => {
          if (isEnabled) e.currentTarget.style.opacity = '1'
        }}
        title={isEnabled ? '使用此技能' : '请先启用此技能'}
      >
        {isEnabled ? '立即使用' : '已停用'}
      </button>
    </div>
  )
}

/* ===== 开关组件 ===== */
function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange?.(!checked)
      }}
      className="relative inline-flex items-center transition-colors duration-200 cursor-pointer"
      style={{
        width: '32px',
        height: '18px',
        borderRadius: '999px',
        backgroundColor: checked
          ? 'var(--color-primary)'
          : 'var(--color-surface-container-highest)',
        border: '1px solid',
        borderColor: checked
          ? 'var(--color-primary)'
          : 'var(--color-outline-variant)',
        padding: 0,
      }}
      title={checked ? '已启用 - 点击停用' : '已停用 - 点击启用'}
    >
      <span
        className="inline-block transition-transform duration-200"
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transform: `translateX(${checked ? '16px' : '2px'})`,
        }}
      />
    </button>
  )
}

export default MySkillCard
