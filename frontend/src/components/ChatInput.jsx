/**
 * 增强型对话输入框
 *
 * 设计规范（对齐高保真图）：
 *  - 圆角矩形容器（非胶囊），沉底式工具栏
 *  - 自适应高度 textarea：默认 3 行 → 最多 10 行 → 超过后内部滚动
 *  - 工具栏沉底：附件 / 快速 / PPT / 图像 / 深入研究 / 编程 / 翻译 / 更多 / 语音(→发送)
 *  - 顶部胶囊：显示已上传文件、已加载技能、已加载智能体
 *  - 文件/技能/智能体加载均带进度状态与成功失败反馈
 *
 * Props:
 *  onSend       : (payload) => void
 *                  payload = { text, files:[{id,name,size,status}], skills:[...], agents:[...] }
 *  disabled     : boolean
 *  streaming    : boolean - 是否处于流式输出阶段（控制"停止"按钮）
 *  onStop       : () => void
 *  maxWidth     : string - Tailwind 最大宽度类
 *  availableSkills: Skill[] - 可加载的技能列表（来自 useSkills）
 *  availableAgents: Agent[] - 可加载的智能体列表
 */
import React, { useState, useRef, useCallback, useEffect } from 'react'
import FileUploadModal from './FileUploadModal'
import SkillPickerModal from './SkillPickerModal'
import AgentPickerModal from './AgentPickerModal'
import Toast from './Toast'

/* textarea 行高：22px */
const LINE_HEIGHT = 22
const MIN_ROWS = 3
const MAX_ROWS = 10

export default function ChatInput({
  onSend,
  disabled = false,
  streaming = false,
  onStop,
  maxWidth = 'max-w-[800px]',
  availableSkills = [],
  availableAgents = [],
  onLoadedAgentsChange,    // 智能体加载状态变化回调(供父组件判断是否切换布局)
}) {
  /* ========== 状态 ========== */
  const [value, setValue] = useState('')
  const [files, setFiles] = useState([])      // [{ id, name, size, status: 'uploading'|'success'|'error', progress }]
  const [skills, setSkills] = useState([])    // [{ id, name, icon, status: 'loading'|'ready' }]
  const [agents, setAgents] = useState([])    // [{ id, name, icon, iconBg, status: 'loading'|'ready' }]

  /* ========== 副作用:智能体列表变化时,通知父组件 ========== */
  useEffect(() => {
    if (typeof onLoadedAgentsChange === 'function') {
      onLoadedAgentsChange(agents)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents])

  /* 弹窗 */
  const [fileModalOpen, setFileModalOpen] = useState(false)
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [agentModalOpen, setAgentModalOpen] = useState(false)

  /* Toast */
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() })
  }

  /* textarea 引用 */
  const textareaRef = useRef(null)

  /* ========== 自适应高度 ========== */
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    // 重置 → 读真实高度
    ta.style.height = 'auto'
    const scrollH = ta.scrollHeight
    const minH = LINE_HEIGHT * MIN_ROWS + 20 // padding 10*2
    const maxH = LINE_HEIGHT * MAX_ROWS + 20
    const next = Math.max(minH, Math.min(scrollH, maxH))
    ta.style.height = next + 'px'
    // 超过最大 → 内部滚动
    ta.style.overflowY = scrollH > maxH ? 'auto' : 'hidden'
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  /* ========== 操作：发送 ========== */
  const handleSubmit = () => {
    const text = value.trim()
    if (!text && files.length === 0 && skills.length === 0 && agents.length === 0) return
    if (disabled) return
    onSend?.({
      text,
      files: files.filter((f) => f.status !== 'error'),
      skills: skills.filter((s) => s.status === 'ready'),
      agents: agents.filter((a) => a.status === 'ready'),
    })
    setValue('')
    setFiles([])
    setSkills([])
    setAgents([])
  }

  const handleStopClick = () => onStop?.()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  /* ========== 附件：模拟上传流程 ========== */
  const handleFilesSelected = (fileList) => {
    if (!fileList?.length) return
    const newFiles = fileList.map((f) => ({
      id: 'f-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: f.name,
      size: f.size,
      status: 'uploading',
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])

    // 模拟进度
    newFiles.forEach((nf) => {
      let p = 0
      const tick = setInterval(() => {
        p += Math.random() * 35
        if (p >= 100) {
          p = 100
          clearInterval(tick)
          setFiles((prev) =>
            prev.map((x) =>
              x.id === nf.id
                ? { ...x, progress: 100, status: Math.random() < 0.95 ? 'success' : 'error' }
                : x
            )
          )
        } else {
          setFiles((prev) =>
            prev.map((x) => (x.id === nf.id ? { ...x, progress: p } : x))
          )
        }
      }, 220)
    })

    showToast(`已添加 ${fileList.length} 个文件`, 'success')
  }

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  /* ========== 技能加载 ========== */
  const handleLoadSkill = (skill) => {
    const id = skill.id
    if (skills.some((s) => s.id === id)) {
      showToast(`「${skill.name}」已加载`, 'info')
      return
    }
    setSkills((prev) => [
      ...prev,
      { id, name: skill.name, icon: skill.icon || 'auto_awesome', status: 'loading' },
    ])
    setSkillModalOpen(false)

    // 模拟加载
    setTimeout(() => {
      setSkills((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'ready' } : s))
      )
      showToast(`技能「${skill.name}」已就绪`, 'success')
    }, 800)
  }

  const removeSkill = (id) => setSkills((prev) => prev.filter((s) => s.id !== id))

  /* ========== 智能体加载 ========== */
  const handleLoadAgent = (agent) => {
    const id = agent.id
    if (agents.some((a) => a.id === id)) {
      showToast(`「${agent.name}」已加载`, 'info')
      return
    }
    setAgents((prev) => [
      ...prev,
      {
        id,
        name: agent.name,
        icon: agent.icon || 'smart_toy',
        iconBg: agent.iconBg,
        status: 'loading',
      },
    ])
    setAgentModalOpen(false)

    setTimeout(() => {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ready' } : a))
      )
      showToast(`智能体「${agent.name}」已就绪`, 'success')
    }, 800)
  }

  const removeAgent = (id) => setAgents((prev) => prev.filter((a) => a.id !== id))

  /* ========== 渲染 ========== */
  const hasContent = value.trim().length > 0

  return (
    <div className={`w-full ${maxWidth}`}>
      {/* ===== 容器 ===== */}
      <div
        className="rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-surface-variant)',
        }}
      >
        {/* ====== 顶部：附件/技能/智能体胶囊 ====== */}
        {(files.length > 0 || skills.length > 0 || agents.length > 0) && (
          <div
            className="flex flex-wrap items-center gap-2 px-3 pt-3 pb-1"
            style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)' }}
          >
            {files.map((f) => (
              <FileChip key={f.id} file={f} onRemove={() => removeFile(f.id)} />
            ))}
            {skills.map((s) => (
              <SkillChip key={s.id} skill={s} onRemove={() => removeSkill(s.id)} />
            ))}
            {agents.map((a) => (
              <AgentChip key={a.id} agent={a} onRemove={() => removeAgent(a.id)} />
            ))}
          </div>
        )}

        {/* ====== 中部：textarea ====== */}
        <div className="px-4 pt-3 pb-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发消息..."
            disabled={disabled}
            rows={MIN_ROWS}
            className="w-full bg-transparent border-none outline-none resize-none text-[14px] leading-[22px] transition-colors duration-200"
            style={{
              color: 'var(--color-on-surface)',
              fontFamily: 'Inter, sans-serif',
              minHeight: `${LINE_HEIGHT * MIN_ROWS}px`,
            }}
          />
        </div>

        {/* ====== 底部：沉底工具栏 ====== */}
        <div
          className="flex items-center gap-1 px-2 py-2"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-outline-variant) 40%, transparent)' }}
        >
          {/* 附件 + */}
          <ToolbarButton
            icon="add"
            title="上传附件"
            onClick={() => setFileModalOpen(true)}
          />

          {/* 分隔 */}
          <Divider />

          {/* 快速 */}
          <ToolbarAction icon="bolt" label="快速" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请快速给出结论：')
            textareaRef.current?.focus()
          }} />

          {/* PPT */}
          <ToolbarAction icon="slideshow" label="PPT生成" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请帮我生成一份关于【xxx】的PPT大纲：')
            textareaRef.current?.focus()
          }} />

          {/* 图像 */}
          <ToolbarAction icon="image" label="图像生成" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请生成一张【xxx】的图片：')
            textareaRef.current?.focus()
          }} />

          {/* 深入研究 */}
          <ToolbarAction icon="travel_explore" label="深入研究" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请深入研究以下主题：')
            textareaRef.current?.focus()
          }} />

          {/* 编程 */}
          <ToolbarAction icon="code" label="编程" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请用代码实现以下需求：')
            textareaRef.current?.focus()
          }} />

          {/* 翻译 */}
          <ToolbarAction icon="translate" label="翻译" onClick={() => {
            setValue((v) => (v ? v + ' ' : '') + '请将以下内容翻译为【目标语言】：')
            textareaRef.current?.focus()
          }} />

          {/* 更多 */}
          <ToolbarAction
            icon="apps"
            label="更多"
            onClick={() => {
              setSkillModalOpen(true)
            }}
            moreMenu={[
              { key: 'skill', label: '加载技能', icon: 'auto_awesome' },
              { key: 'agent', label: '加载智能体', icon: 'smart_toy' },
            ]}
            onMoreSelect={(k) => {
              if (k === 'skill') setSkillModalOpen(true)
              if (k === 'agent') setAgentModalOpen(true)
            }}
          />

          {/* 占位 spacer */}
          <div className="flex-1" />

          {/* 右侧：语音 / 发送 */}
          {streaming ? (
            <button
              onClick={handleStopClick}
              className="text-white px-3 h-9 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all flex-shrink-0"
              style={{ backgroundColor: 'var(--color-error)' }}
              title="停止生成"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">stop_circle</span>
              <span className="text-[13px] font-medium">停止</span>
            </button>
          ) : hasContent ? (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => {
                if (!disabled) e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
              title="发送"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-white">arrow_upward</span>
            </button>
          ) : (
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-surface-container-high)',
                color: 'var(--color-on-surface-variant)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-on-surface-variant)'
              }}
              title="语音输入"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </div>
      </div>

      {/* ===== 弹窗 ===== */}
      <FileUploadModal
        open={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        onConfirm={handleFilesSelected}
      />
      <SkillPickerModal
        open={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        onConfirm={handleLoadSkill}
        skills={availableSkills}
      />
      <AgentPickerModal
        open={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        onConfirm={handleLoadAgent}
        agents={availableAgents}
      />

      {/* ===== Toast ===== */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}

/* ============================ 子组件 ============================ */

/* —— 工具栏：纯图标按钮（+，分隔） —— */
function ToolbarButton({ icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
      style={{ color: 'var(--color-on-surface-variant)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-primary)'
        e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-on-surface-variant)'
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  )
}

/* —— 工具栏：图标 + 文字动作（"⚡ 快速"等） —— */
function ToolbarAction({ icon, label, onClick, moreMenu, onMoreSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          if (moreMenu?.length) setOpen((o) => !o)
          else onClick?.()
        }}
        type="button"
        className="h-9 px-2.5 rounded-full flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
        style={{ color: 'var(--color-on-surface-variant)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-on-surface)'
          e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-on-surface-variant)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title={label}
      >
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="text-[13px] font-medium">{label}</span>
        {moreMenu?.length > 0 && (
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        )}
      </button>

      {moreMenu?.length > 0 && open && (
        <div
          className="absolute bottom-full mb-1 left-0 min-w-[140px] rounded-lg overflow-hidden shadow-lg z-10"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          {moreMenu.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                onMoreSelect?.(m.key)
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 text-[13px] transition-colors duration-150"
              style={{ color: 'var(--color-on-surface)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-primary)' }}>
                {m.icon}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* —— 分隔条 —— */
function Divider() {
  return (
    <div
      className="w-px h-5 mx-1"
      style={{ backgroundColor: 'var(--color-outline-variant)' }}
    />
  )
}

/* —— 附件胶囊 —— */
function FileChip({ file, onRemove }) {
  const isUploading = file.status === 'uploading'
  const isError = file.status === 'error'
  return (
    <div
      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md text-[12px] transition-colors duration-200"
      style={{
        backgroundColor: isError
          ? 'color-mix(in srgb, var(--color-error) 10%, transparent)'
          : 'var(--color-surface-container-low)',
        color: isError ? 'var(--color-error)' : 'var(--color-on-surface)',
        border: '1px solid var(--color-outline-variant)',
        minWidth: '120px',
        maxWidth: '220px',
      }}
      title={`${file.name} · ${formatSize(file.size)}`}
    >
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ color: isError ? 'var(--color-error)' : 'var(--color-primary)' }}
      >
        {isError ? 'error' : isUploading ? 'cloud_upload' : 'description'}
      </span>
      <span className="truncate flex-1">{file.name}</span>
      {isUploading && (
        <span className="text-[10px] opacity-70">{Math.round(file.progress)}%</span>
      )}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-150"
        style={{ color: 'var(--color-on-surface-variant)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="移除"
        type="button"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  )
}

/* —— 技能胶囊 —— */
function SkillChip({ skill, onRemove }) {
  const isLoading = skill.status === 'loading'
  return (
    <div
      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md text-[12px] transition-colors duration-200"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        color: 'var(--color-on-surface)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)',
      }}
      title={`技能：${skill.name}`}
    >
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ color: 'var(--color-primary)' }}
      >
        {isLoading ? 'progress_activity' : 'auto_awesome'}
      </span>
      <span className="font-medium">{skill.name}</span>
      {isLoading && (
        <span
          className="w-3 h-3 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
      )}
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-150"
        style={{ color: 'var(--color-on-surface-variant)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="移除技能"
        type="button"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  )
}

/* —— 智能体胶囊 —— */
function AgentChip({ agent, onRemove }) {
  const isLoading = agent.status === 'loading'
  return (
    <div
      className="inline-flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-md text-[12px] transition-colors duration-200"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-tertiary) 12%, transparent)',
        color: 'var(--color-on-surface)',
        border: '1px solid color-mix(in srgb, var(--color-tertiary) 35%, transparent)',
      }}
      title={`智能体：${agent.name}`}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center"
        style={{
          background: agent.iconBg || 'var(--color-primary)',
        }}
      >
        <span className="material-symbols-outlined text-[12px] text-white">
          {isLoading ? 'progress_activity' : (agent.icon || 'smart_toy')}
        </span>
      </div>
      <span className="font-medium">{agent.name}</span>
      <button
        onClick={onRemove}
        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-150"
        style={{ color: 'var(--color-on-surface-variant)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title="移除智能体"
        type="button"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  )
}

/* —— 工具函数 —— */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}
