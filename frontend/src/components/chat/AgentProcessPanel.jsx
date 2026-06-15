/**
 * 智能体进程 / 文件管理面板(浮窗版)
 *
 * 浮窗式设计,固定在视口右下角,可展开/收起:
 *   - 收起态:右下角悬浮小气泡(智能体图标 + 状态徽标 + 进程计数)
 *   - 展开态:420 × 自适应高度的全功能浮窗(进程 / 文件两个 tab)
 *
 * Props:
 *   open           : boolean        — 是否显示(为 false 时不渲染)
 *   onClose        : () => void     — 关闭(同时卸载智能体)
 *   agent          : { id, name, icon, iconBg, type } | null
 *   processData    : useAgentProcess() 返回值
 *   defaultTab     : 'process' | 'files'   (默认 'process')
 */
import React, { useState, useRef, useEffect, useMemo } from 'react'
import StepMessage from './StepMessage'

export default function AgentProcessPanel({
  open,
  onClose,
  agent,
  processData,
  snapshot,                  // 可选:由父组件注入的消息级快照(优先于 processData)
  defaultTab = 'process',
}) {
  /* ============ State ============ */
  // 浮窗展开/收起:默认展开
  const [expanded, setExpanded] = useState(true)
  const [tab, setTab] = useState(defaultTab)

  const { steps, files, overallProgress, summary, isRunning, startRun, reset, renameFile, deleteFile, downloadFile } = processData || {}

  // 合并 snapshot 优先级: snapshot.steps > processData.steps
  const effectiveSteps = snapshot?.steps || steps || []
  const effectiveFiles = snapshot?.files || files || []
  const effectiveProcess = snapshot?.process
  const effectiveProgress = effectiveProcess?.progress ?? overallProgress
  const effectiveSummary = {
    done: (effectiveProcess?.nodes || []).filter((n) => n.status === 'done').length || effectiveSteps.filter((s) => s.status === 'done').length,
    total: (effectiveProcess?.nodes || effectiveSteps || []).length,
    percent: effectiveProcess?.progress ?? (effectiveSteps.length === 0 ? 0 : Math.round(effectiveSteps.filter((s) => s.status === 'done').length / effectiveSteps.length * 100)),
  }

  // 切换 agent 时重置 tab 与展开状态
  useEffect(() => {
    setTab(defaultTab)
    setExpanded(true)
  }, [agent?.id, defaultTab])

  if (!open || !agent) return null

  const tabProcessCount = effectiveSummary.total
  const tabFilesCount   = countFiles(effectiveFiles)

  /* ============ 收起态:右下角悬浮小气泡 ============ */
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        title={`展开 ${agent.name} 面板`}
        className="group flex items-center gap-2 pl-2.5 pr-2.5 py-2 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 tab-fade-in"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '88px',
          zIndex: 50,
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.18)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '' }}
      >
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: agent.iconBg || 'var(--color-primary)' }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>
            {agent.icon || 'smart_toy'}
          </span>
        </span>
        <span
          className="text-[12px] font-medium whitespace-nowrap max-w-[140px] truncate"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {agent.name}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
          style={{
            backgroundColor: isRunning
              ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
              : 'var(--color-surface-container-high)',
            color: isRunning ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isRunning ? 'var(--color-primary)' : 'var(--color-tertiary)' }}
          />
          {isRunning ? `${effectiveProgress}%` : `${tabProcessCount}/${tabProcessCount}`}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }}
        >
          open_in_full
        </span>
      </button>
    )
  }

  /* ============ 展开态:浮窗式全功能面板 ============ */
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden shadow-2xl tab-fade-in"
      style={{
        position: 'fixed',
        right: '20px',
        top: '80px',
        bottom: '80px',
        width: '420px',
        maxWidth: 'calc(100vw - 40px)',
        maxHeight: 'calc(100vh - 160px)',
        zIndex: 50,
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      {/* ====== Header ====== */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: agent.iconBg || 'var(--color-primary)' }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>
            {agent.icon || 'smart_toy'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-semibold truncate"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {agent.name}
          </p>
          <p
            className="text-[10px] truncate"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {isRunning ? '正在执行任务…' : '任务已完成'}
          </p>
        </div>
        {/* 收起按钮(浮窗化) */}
        <IconButton
          icon="chevron_right"
          title="收起面板"
          onClick={() => setExpanded(false)}
        />
        {/* 关闭按钮(完全卸载智能体) */}
        <IconButton
          icon="close"
          title="关闭面板"
          onClick={onClose}
        />
      </div>

      {/* ====== Tabs ====== */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <TabButton active={tab === 'process'} onClick={() => setTab('process')} icon="monitor_heart" label="当前进程" count={tabProcessCount} />
        <TabButton active={tab === 'files'}    onClick={() => setTab('files')}    icon="folder"        label="文件"    count={tabFilesCount} />
      </div>

      {/* ====== Body ====== */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'process' ? (
          <ProcessTab
            steps={effectiveSteps}
            overallProgress={effectiveProgress}
            summary={effectiveSummary}
            processData={effectiveProcess}
            isRunning={isRunning}
            onStart={startRun}
            onReset={reset}
          />
        ) : (
          <FilesTab
            files={effectiveFiles}
            onRename={renameFile}
            onDelete={deleteFile}
            onDownload={downloadFile}
          />
        )}
      </div>

      {/* ====== Footer(状态栏) ====== */}
      <div
        className="px-3 py-1.5 border-t flex items-center justify-between shrink-0"
        style={{
          borderColor: 'var(--color-outline-variant)',
          backgroundColor: 'var(--color-surface-container-low)',
        }}
      >
        <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-on-surface-variant)' }}>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isRunning ? 'var(--color-primary)' : 'var(--color-tertiary)' }}
          />
          {isRunning ? '执行中' : '已就绪'}
        </span>
        <span
          className="text-[10px] cursor-pointer flex items-center gap-0.5 transition-colors"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onClick={() => setExpanded(false)}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-on-surface)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>expand_more</span>
          收起浮窗
        </span>
      </div>
    </div>
  )
}

/* ============ Icon Button ============ */
function IconButton({ icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-200"
      style={{ color: 'var(--color-on-surface-variant)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'
        e.currentTarget.style.color = 'var(--color-on-surface)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = 'var(--color-on-surface-variant)'
      }}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  )
}

/* ============ Resource Stat ============ */
function ResourceStat({ label, value, icon }) {
  return (
    <div
      className="rounded-lg p-2"
      style={{ backgroundColor: 'var(--color-surface-container-high)' }}
    >
      <div className="flex items-center gap-1 mb-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
        <span className="text-[10px]">{label}</span>
      </div>
      <div className="text-[12px] font-mono font-medium tabular-nums" style={{ color: 'var(--color-on-surface)' }}>{value}</div>
    </div>
  )
}

/* ============ Tab Button ============ */
function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 px-3 py-1.5 rounded-md text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer"
      style={
        active
          ? {
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
              color: 'var(--color-primary)',
            }
          : { color: 'var(--color-on-surface-variant)' }
      }
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{icon}</span>
      {label}
      {typeof count === 'number' && (
        <span
          className="text-[9px] px-1 rounded font-semibold"
          style={{
            backgroundColor: active
              ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)'
              : 'var(--color-surface-container-high)',
            color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

/* ============ Process Tab ============ */
function ProcessTab({ steps, overallProgress, summary, processData, isRunning, onStart, onReset }) {
  const hasSnapshot = !!processData
  return (
    <div className="p-4">
      {/* 进度卡片 */}
      <div
        className="rounded-xl p-3 mb-3"
        style={{
          backgroundColor: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: isRunning ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
            >
              {isRunning ? 'progress_activity' : 'check_circle'}
            </span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--color-on-surface)' }}>
              整体进度
            </span>
          </div>
          <span
            className="text-[12px] font-semibold tabular-nums"
            style={{ color: isRunning ? 'var(--color-primary)' : 'var(--color-on-surface)' }}
          >
            {overallProgress}%
          </span>
        </div>
        {/* 进度条 */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-outline-variant)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>
            已完成 {summary.done} / {summary.total} 步
          </span>
          {!hasSnapshot && (
            <div className="flex items-center gap-1">
              <button
                onClick={onStart}
                disabled={isRunning}
                className="text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 transition-colors duration-200 disabled:opacity-50"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>play_arrow</span>
                {isRunning ? '运行中' : '运行'}
              </button>
              <button
                onClick={onReset}
                className="text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 transition-colors duration-200"
                style={{ color: 'var(--color-on-surface-variant)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>refresh</span>
                重置
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 资源占用(快照模式) */}
      {hasSnapshot && processData.resources && (
        <div
          className="rounded-xl p-3 mb-4"
          style={{
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>memory</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-on-surface)' }}>资源占用</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ResourceStat label="CPU"   value={processData.resources.cpu}    icon="speed" />
            <ResourceStat label="内存"  value={processData.resources.memory} icon="database" />
            <ResourceStat label="网络"  value={processData.resources.network} icon="lan" />
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px dashed var(--color-outline-variant)' }}>
            <span className="text-[10px]" style={{ color: 'var(--color-on-surface-variant)' }}>运行时长</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-on-surface)' }}>{processData.runtime}</span>
          </div>
        </div>
      )}

      {/* 步骤列表 */}
      <div className="space-y-0">
        {steps.map((s, i) => (
          <StepMessage key={s.id || i} step={s} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  )
}

/* ============ Files Tab ============ */
function FilesTab({ files, onRename, onDelete, onDownload }) {
  const [keyword, setKeyword] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [renamingValue, setRenamingValue] = useState('')
  const renameInputRef = useRef(null)

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const startRename = (node) => {
    setRenamingId(node.id)
    setRenamingValue(node.name)
  }

  const commitRename = () => {
    if (renamingId && renamingValue.trim()) {
      onRename?.(renamingId, renamingValue)
    }
    setRenamingId(null)
    setRenamingValue('')
  }

  return (
    <div className="p-3 flex flex-col gap-2 h-full">
      {/* 搜索 */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
        style={{
          backgroundColor: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}
        >
          search
        </span>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索文件…"
          className="flex-1 bg-transparent outline-none text-[12px]"
          style={{ color: 'var(--color-on-surface)' }}
        />
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto">
        <FileTree
          nodes={files}
          depth={0}
          keyword={keyword}
          renamingId={renamingId}
          renamingValue={renamingValue}
          onRenameValueChange={setRenamingValue}
          onStartRename={startRename}
          onCommitRename={commitRename}
          onCancelRename={() => setRenamingId(null)}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      </div>
    </div>
  )
}

/* ============ File Tree ============ */
function FileTree({
  nodes, depth, keyword,
  renamingId, renamingValue, onRenameValueChange,
  onStartRename, onCommitRename, onCancelRename,
  onDelete, onDownload,
}) {
  const filtered = useMemo(() => {
    if (!keyword?.trim()) return nodes
    const k = keyword.toLowerCase()
    return filterTree(nodes, k)
  }, [nodes, keyword])

  if (!filtered?.length) {
    return (
      <div
        className="text-center py-6 text-[12px]"
        style={{ color: 'var(--color-on-surface-variant)' }}
      >
        {keyword ? '未找到匹配文件' : '暂无文件'}
      </div>
    )
  }

  return (
    <div>
      {filtered.map((n) => (
        <FileTreeItem
          key={n.id}
          node={n}
          depth={depth}
          keyword={keyword}
          renamingId={renamingId}
          renamingValue={renamingValue}
          onRenameValueChange={onRenameValueChange}
          onStartRename={onStartRename}
          onCommitRename={onCommitRename}
          onCancelRename={onCancelRename}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </div>
  )
}

function filterTree(nodes, k) {
  const out = []
  for (const n of nodes) {
    if (n.type === 'folder') {
      const children = n.children ? filterTree(n.children, k) : []
      if (n.name.toLowerCase().includes(k) || children.length > 0) {
        out.push({ ...n, children })
      }
    } else if (n.name.toLowerCase().includes(k)) {
      out.push(n)
    }
  }
  return out
}

function FileTreeItem({
  node, depth, keyword,
  renamingId, renamingValue, onRenameValueChange,
  onStartRename, onCommitRename, onCancelRename,
  onDelete, onDownload,
}) {
  const [open, setOpen] = useState(true)
  const renameInputRef = useRef(null)
  const indent = depth * 14
  const isFolder = node.type === 'folder'
  const isRenaming = renamingId === node.id

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  if (isFolder) {
    return (
      <div>
        <div
          className="group flex items-center gap-1.5 py-1 rounded-md cursor-pointer transition-colors duration-150"
          style={{ paddingLeft: `${indent + 6}px` }}
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}
          >
            {open ? 'expand_more' : 'chevron_right'}
          </span>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', color: 'var(--color-primary)' }}
          >
            {open ? 'folder_open' : 'folder'}
          </span>
          <span
            className="text-[12px] font-medium truncate flex-1"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {node.name}
          </span>
        </div>
        {open && node.children && (
          <FileTree
            nodes={node.children}
            depth={depth + 1}
            keyword={keyword}
            renamingId={renamingId}
            renamingValue={renamingValue}
            onRenameValueChange={onRenameValueChange}
            onStartRename={onStartRename}
            onCommitRename={onCommitRename}
            onCancelRename={onCancelRename}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="group flex items-center gap-1.5 py-1 rounded-md transition-colors duration-150"
      style={{ paddingLeft: `${indent + 24}px`, paddingRight: '6px' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <span
        className="material-symbols-outlined shrink-0"
        style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}
      >
        description
      </span>
      {isRenaming ? (
        <input
          ref={renameInputRef}
          value={renamingValue}
          onChange={(e) => onRenameValueChange(e.target.value)}
          onBlur={onCommitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitRename()
            if (e.key === 'Escape') onCancelRename()
          }}
          className="flex-1 px-1 py-0 rounded text-[12px] outline-none"
          style={{
            backgroundColor: 'var(--color-surface-container-high)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-primary)',
          }}
        />
      ) : (
        <span
          className="text-[12px] truncate flex-1"
          style={{ color: 'var(--color-on-surface)' }}
          title={node.path}
        >
          {node.name}
        </span>
      )}
      {node.size != null && !isRenaming && (
        <span
          className="text-[10px] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          {formatSize(node.size)}
        </span>
      )}
      {/* 操作按钮(hover 出现) */}
      {!isRenaming && (
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <FileAction
            icon="download"
            title="下载"
            onClick={() => onDownload?.(node)}
          />
          <FileAction
            icon="edit"
            title="重命名"
            onClick={() => onStartRename?.(node)}
          />
          <FileAction
            icon="delete"
            title="删除"
            danger
            onClick={() => {
              if (window.confirm(`确定要删除「${node.name}」吗？`)) {
                onDelete?.(node.id)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ============ File Action ============ */
function FileAction({ icon, title, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-5 h-5 rounded flex items-center justify-center transition-colors duration-150"
      style={{ color: danger ? 'var(--color-error)' : 'var(--color-on-surface-variant)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = danger
          ? 'color-mix(in srgb, var(--color-error) 14%, transparent)'
          : 'var(--color-surface-container-high)'
      }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{icon}</span>
    </button>
  )
}

/* ============ Utils ============ */
function countFiles(nodes) {
  let n = 0
  for (const x of nodes) {
    if (x.type === 'file') n += 1
    else if (x.children) n += countFiles(x.children)
  }
  return n
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}
