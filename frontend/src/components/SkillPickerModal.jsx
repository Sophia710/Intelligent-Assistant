/**
 * 技能选择弹窗
 *
 * Props:
 *   open     : boolean
 *   onClose  : () => void
 *   onConfirm: (skill) => void
 *   skills   : Skill[]
 */
import React, { useState, useMemo } from 'react'

export default function SkillPickerModal({ open, onClose, onConfirm, skills = [] }) {
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    if (!k) return skills
    return skills.filter(
      (s) => s.name.toLowerCase().includes(k) || (s.description || '').toLowerCase().includes(k)
    )
  }, [skills, keyword])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 shadow-2xl max-h-[80vh] flex flex-col"
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
            auto_awesome
          </span>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-on-surface)' }}>
            加载技能
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
            placeholder="搜索技能名称…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-on-surface)' }}
          />
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {filtered.length === 0 ? (
            <div
              className="text-center py-10 px-4 text-sm flex flex-col items-center gap-2"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ opacity: 0.5 }}
              >
                extension_off
              </span>
              <p>
                {keyword
                  ? `未找到「${keyword}」相关技能`
                  : '暂无可加载的已启用技能'}
              </p>
              {!keyword && (
                <p className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.8 }}>
                  请前往「技能中心」→「我的技能」开启启用开关
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onConfirm?.(s)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors duration-200"
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
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: s.iconBg || 'var(--color-primary)',
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-white">
                      {s.icon || 'auto_awesome'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      {s.name}
                    </p>
                    <p
                      className="text-[11px] line-clamp-2 mt-0.5"
                      style={{ color: 'var(--color-on-surface-variant)' }}
                    >
                      {s.description}
                    </p>
                  </div>
                  <span
                    className="material-symbols-outlined text-[18px] shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    add_circle
                  </span>
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
