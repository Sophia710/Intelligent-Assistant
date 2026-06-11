import React, { useState } from 'react'

/**
 * 新建智能体 — 模态框
 *
 * Props:
 *   open    : boolean
 *   onClose : () => void
 *   onSubmit: (draft) => void
 */
function CreateAgentModal({ open, onClose, onSubmit }) {
  /* ========== 表单状态 ========== */
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('custom')
  const [icon, setIcon] = useState('smart_toy')
  const [triggerCommand, setTriggerCommand] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  /* ========== 选项常量 ========== */
  const CATEGORY_OPTIONS = [
    { key: 'custom',     label: '通用自定义', icon: 'smart_toy' },
    { key: 'office',     label: '办公效率',   icon: 'work' },
    { key: 'dev',        label: '研发辅助',   icon: 'code' },
    { key: 'test',       label: '测试工具',   icon: 'bug_report' },
    { key: 'ops',        label: '运维工具',   icon: 'settings' },
    { key: 'operation',  label: '运营工具',   icon: 'campaign' },
  ]

  const ICON_OPTIONS = [
    'smart_toy', 'auto_awesome', 'edit', 'description', 'slideshow',
    'table_chart', 'palette', 'language', 'code', 'analytics',
    'podcasts', 'forum', 'campaign', 'insights', 'auto_stories',
    'support_agent', 'psychology', 'travel_explore', 'science',
    'monitor_heart', 'rocket_launch', 'shield', 'workspace_premium',
  ]

  const BG_OPTIONS = [
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ]

  if (!open) return null

  /* ========== 行为 ========== */
  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const reset = () => {
    setName('')
    setDescription('')
    setCategory('custom')
    setIcon('smart_toy')
    setTriggerCommand('')
    setSystemPrompt('')
    setWelcomeMessage('')
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = '请输入智能体名称'
    if (name.trim().length > 30) e.name = '名称不能超过 30 字'
    if (!description.trim()) e.description = '请输入智能体简介'
    if (description.trim().length > 120) e.description = '简介不能超过 120 字'
    if (systemPrompt && systemPrompt.length > 2000) e.systemPrompt = '人设不能超过 2000 字'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      // 模拟异步保存 (后续可对接后端)
      await new Promise((r) => setTimeout(r, 200))
      const idx = ICON_OPTIONS.indexOf(icon)
      const iconBg = BG_OPTIONS[Math.max(0, idx) % BG_OPTIONS.length]
      onSubmit?.({
        name,
        description,
        category,
        icon,
        iconBg,
        systemPrompt,
        triggerCommand,
        welcomeMessage,
        colorTheme: 'primary',
      })
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  /* ========== 渲染 ========== */
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
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ color: 'var(--color-primary)' }}
            >
              add_circle
            </span>
            <h2
              className="text-lg font-semibold transition-colors duration-200"
              style={{ color: 'var(--color-on-surface)' }}
            >
              新建智能体
            </h2>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              自定义
            </span>
          </div>
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
          {/* 预览卡片 */}
          <AgentPreview
            name={name}
            description={description}
            icon={icon}
            category={category}
          />

          {/* 名称 + 分类 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="智能体名称"
              required
              error={errors.name}
              htmlFor="agent-name"
              counter={`${name.length}/30`}
            >
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：周报生成助手"
                maxLength={30}
                className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm"
                style={inputStyle(errors.name)}
              />
            </Field>

            <Field label="所属分类" htmlFor="agent-category">
              <select
                id="agent-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm appearance-none cursor-pointer"
                style={{
                  ...inputStyle(),
                  backgroundImage:
                    'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23999\'><path d=\'M7 10l5 5 5-5z\'/></svg>")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '20px',
                  paddingRight: '32px',
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* 简介 */}
          <Field
            label="功能简介"
            required
            error={errors.description}
            htmlFor="agent-desc"
            counter={`${description.length}/120`}
          >
            <textarea
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话说明这个智能体能解决什么问题"
              maxLength={120}
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm resize-none"
              style={inputStyle(errors.description)}
            />
          </Field>

          {/* 图标选择 */}
          <Field label="选择图标" htmlFor="agent-icon">
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
          <Field
            label="触发命令（可选）"
            htmlFor="agent-cmd"
            hint="在聊天输入框中以 /xxx 形式快速调用"
          >
            <div className="flex items-center">
              <span
                className="px-3 py-2.5 rounded-l-lg text-sm font-mono"
                style={{
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRight: 'none',
                }}
              >
                /
              </span>
              <input
                id="agent-cmd"
                type="text"
                value={triggerCommand}
                onChange={(e) => setTriggerCommand(e.target.value.replace(/[\s/]/g, ''))}
                placeholder="mybot"
                maxLength={20}
                className="flex-1 rounded-r-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--color-surface-container)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-outline-variant)',
                }}
              />
            </div>
          </Field>

          {/* 人设 / 系统提示词 */}
          <Field
            label="人设 / 系统提示词（可选）"
            htmlFor="agent-prompt"
            hint="定义智能体的角色定位、回答风格、注意事项等"
            error={errors.systemPrompt}
            counter={`${systemPrompt.length}/2000`}
          >
            <textarea
              id="agent-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`你是一位专业的 [角色]，擅长 [领域]…\n回答要求：\n1. ...\n2. ...`}
              rows={5}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-xs font-mono resize-none"
              style={inputStyle(errors.systemPrompt)}
            />
          </Field>

          {/* 欢迎语 */}
          <Field
            label="欢迎语（可选）"
            htmlFor="agent-welcome"
            hint="用户首次与该智能体对话时展示的开场白"
          >
            <textarea
              id="agent-welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="你好！我是你的 [角色]，可以帮你 …"
              rows={2}
              maxLength={200}
              className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 transition-all duration-200 text-sm resize-none"
              style={inputStyle()}
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
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
            )}
            {submitting ? '创建中…' : '创建智能体'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ===== 实时预览卡片 ===== */
function AgentPreview({ name, description, icon, category }) {
  const idx = ['smart_toy', 'auto_awesome', 'edit', 'description', 'slideshow',
    'table_chart', 'palette', 'language', 'code', 'analytics',
    'podcasts', 'forum', 'campaign', 'insights', 'auto_stories',
    'support_agent', 'psychology', 'travel_explore', 'science',
    'monitor_heart', 'rocket_launch', 'shield', 'workspace_premium',
  ].indexOf(icon)
  const BG_OPTIONS = [
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ]
  const iconBg = BG_OPTIONS[Math.max(0, idx) % BG_OPTIONS.length]
  const CATEGORY_LABELS = {
    custom: '通用自定义', office: '办公效率', dev: '研发辅助',
    test: '测试工具', ops: '运维工具', operation: '运营工具',
  }

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        backgroundColor: 'var(--color-surface-container)',
        border: '1px dashed var(--color-outline-variant)',
      }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        预览
      </span>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <span className="material-symbols-outlined text-[22px] text-white">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {name || '未命名智能体'}
        </p>
        <p
          className="text-[11px] truncate"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {description || '一句话说明这个智能体能解决什么问题'}
        </p>
      </div>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          color: 'var(--color-primary)',
        }}
      >
        {CATEGORY_LABELS[category] || '通用自定义'}
      </span>
    </div>
  )
}

/* ===== Field 通用容器 ===== */
function Field({ label, required, error, htmlFor, children, counter, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-xs font-medium transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
        {counter && (
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {counter}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <span
          className="text-[11px] transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)', opacity: 0.75 }}
        >
          {hint}
        </span>
      )}
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

/* ===== input 通用样式 ===== */
function inputStyle(hasError) {
  return {
    backgroundColor: 'var(--color-surface-container)',
    color: 'var(--color-on-surface)',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-outline-variant)'}`,
  }
}

export default CreateAgentModal
