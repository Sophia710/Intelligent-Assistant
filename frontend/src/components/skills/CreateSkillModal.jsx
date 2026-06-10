import React, { useState } from 'react'

/**
 * 创建自定义技能 — 模态框
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onSubmit: (draft) => void
 */
function CreateSkillModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('auto_awesome')
  const [triggerCommand, setTriggerCommand] = useState('')
  const [promptTemplate, setPromptTemplate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // 常用图标候选
  const ICON_OPTIONS = [
    'auto_awesome', 'edit', 'description', 'slideshow', 'table_chart',
    'palette', 'language', 'code', 'analytics', 'podcasts',
    'forum', 'campaign', 'insights', 'auto_stories', 'support_agent',
  ]

  // 渐变色候选
  const BG_OPTIONS = [
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ]

  if (!open) return null

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const reset = () => {
    setName('')
    setDescription('')
    setIcon('auto_awesome')
    setTriggerCommand('')
    setPromptTemplate('')
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = '请输入技能名称'
    if (!description.trim()) e.description = '请输入技能简介'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const idx = ICON_OPTIONS.indexOf(icon)
      const iconBg = BG_OPTIONS[Math.max(0, idx) % BG_OPTIONS.length]
      onSubmit?.({ name, description, icon, iconBg, triggerCommand, promptTemplate })
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 tab-fade-in"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-on-surface) 60%, transparent)' }}
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b transition-colors duration-200"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <h2
            className="text-lg font-semibold transition-colors duration-200"
            style={{ color: 'var(--color-on-surface)' }}
          >
            创建自定义技能
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
              e.currentTarget.style.color = 'var(--color-on-surface)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
            }}
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* 名称 */}
          <Field
            label="技能名称"
            required
            error={errors.name}
            htmlFor="skill-name"
          >
            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：周报生成器"
              maxLength={30}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: `1px solid ${errors.name ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
              }}
            />
          </Field>

          {/* 简介 */}
          <Field
            label="技能简介"
            required
            error={errors.description}
            htmlFor="skill-desc"
          >
            <textarea
              id="skill-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话说明这个技能能做什么"
              maxLength={120}
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm resize-none"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: `1px solid ${errors.description ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
              }}
            />
          </Field>

          {/* 图标选择 */}
          <Field label="选择图标" htmlFor="skill-icon">
            <div className="flex items-center gap-2 flex-wrap">
              {ICON_OPTIONS.map((ic) => {
                const active = ic === icon
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
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
                    title={ic}
                  >
                    <span className="material-symbols-outlined text-[18px]">{ic}</span>
                  </button>
                )
              })}
            </div>
          </Field>

          {/* 触发命令 */}
          <Field label="触发命令（可选）" htmlFor="skill-cmd">
            <input
              id="skill-cmd"
              type="text"
              value={triggerCommand}
              onChange={(e) => setTriggerCommand(e.target.value)}
              placeholder="例如：/weekly（用于聊天输入时快速调用）"
              maxLength={30}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
            />
          </Field>

          {/* Prompt 模板 */}
          <Field label="Prompt 模板（可选）" htmlFor="skill-prompt">
            <textarea
              id="skill-prompt"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              placeholder="定义技能执行时使用的 Prompt 模板，可使用 {{input}} 占位符"
              rows={4}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-xs font-mono resize-none"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
              }}
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t transition-colors duration-200"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-on-surface-variant)',
              border: '1px solid var(--color-outline-variant)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'
              e.currentTarget.style.color = 'var(--color-on-surface)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
            }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {submitting && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            {submitting ? '创建中…' : '创建技能'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, error, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium transition-colors duration-200"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
      </label>
      {children}
      {error && (
        <span
          className="text-[11px] transition-colors duration-200"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default CreateSkillModal
