import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * 智能体进程 Hook
 *
 * 职责:
 *  1. 维护当前智能体的"任务进程状态" — 步骤列表、当前执行步骤、整体进度
 *  2. 维护智能体生成/管理的"文件树" — 支持增删改查(下载/重命名/删除)
 *  3. 与对话流集成 — 一轮新消息触发新流程(开始 → 步骤推进 → 结束)
 *
 * 数据流:
 *   父组件传入 agentId,当 agentId 变化或 trigger(轮次) 变化时
 *   自动生成一份初始步骤(基于智能体类型),并以 setInterval 推进。
 *
 * 字段约定:
 *   Step = {
 *     id, title, type, status, duration?, content?, codeBlock?
 *   }
 *   FileNode = {
 *     id, name, path, type: 'file' | 'folder', size?, children?: FileNode[]
 *   }
 */

const STEP_TYPES = ['thinking', 'file_read', 'file_write', 'command', 'tool', 'summary']

/* ========== 默认 mock 步骤生成 ========== */
function buildDefaultSteps(agentId) {
  // 不同 agentId 给出不同流程,提升演示真实性
  const id = agentId || 'default'
  if (id.includes('ppt') || id.includes('agt-ppt')) {
    return [
      { id: 's1', title: '正在解析任务需求…', type: 'thinking', status: 'done', duration: '7.7s',
        content: '用户希望生成 2 页 PPT,第一页为研发目标达成情况,第二页为研制任务完成情况。' },
      { id: 's2', title: '已完成文件写入: /workspace/slides/slide-targets.js', type: 'file_write', status: 'done', duration: '0.4s' },
      { id: 's3', title: '已完成文件写入: /workspace/slides/slide-tasks.js', type: 'file_write', status: 'done', duration: '0.3s' },
      { id: 's4', title: '已完成文件读取: /workspace/slides/compile.js', type: 'file_read', status: 'done', duration: '0.1s' },
      { id: 's5', title: '已完成文件写入: /workspace/slides/compile.js', type: 'file_write', status: 'done', duration: '0.3s' },
      { id: 's6', title: '已完成命令执行: cd /workspace/slides && node compile.js', type: 'command', status: 'done', duration: '12.6s' },
      { id: 's7', title: '已完成命令执行: cd /workspace/slides && npm install pptxgenjs && node compile.js', type: 'command', status: 'done', duration: '0.2s' },
    ]
  }
  // 默认 4 步流程
  return [
    { id: 's1', title: '正在理解任务目标…', type: 'thinking', status: 'done', duration: '4.2s',
      content: '根据上下文,确认用户的核心诉求并拆解为可执行的子任务。' },
    { id: 's2', title: '已完成: 工具能力匹配', type: 'tool', status: 'done', duration: '0.8s' },
    { id: 's3', title: '已完成: 数据预处理', type: 'file_read', status: 'done', duration: '1.5s' },
    { id: 's4', title: '已完成: 方案生成', type: 'summary', status: 'done', duration: '6.4s' },
  ]
}

/* ========== 默认 mock 文件树 ========== */
function buildDefaultFiles(agentId) {
  if (agentId && agentId.includes('ppt')) {
    return [
      { id: 'f1', name: 'slides', path: '/workspace/slides', type: 'folder', children: [
        { id: 'f1-1', name: 'output', path: '/workspace/slides/output', type: 'folder', children: [
          { id: 'f1-1-1', name: '研发情况.pptx', path: '/workspace/slides/output/研发情况.pptx', type: 'file', size: 136800 },
          { id: 'f1-1-2', name: '项目研制总体进展.pptx', path: '/workspace/slides/output/项目研制总体进展.pptx', type: 'file', size: 65500 },
        ] },
        { id: 'f1-2', name: 'compile.js',     path: '/workspace/slides/compile.js',     type: 'file', size: 820 },
        { id: 'f1-3', name: 'package.json',   path: '/workspace/slides/package.json',   type: 'file', size: 220 },
        { id: 'f1-4', name: 'slide-01.js',    path: '/workspace/slides/slide-01.js',    type: 'file', size: 4300 },
        { id: 'f1-5', name: 'slide-targets.js', path: '/workspace/slides/slide-targets.js', type: 'file', size: 4300 },
        { id: 'f1-6', name: 'slide-tasks.js', path: '/workspace/slides/slide-tasks.js', type: 'file', size: 5100 },
      ] },
      { id: 'f2', name: 'user_input_files', path: '/workspace/user_input_files', type: 'folder', children: [
        { id: 'f2-1', name: '项目研制...docx', path: '/workspace/user_input_files/项目研制...docx', type: 'file', size: 18600 },
        { id: 'f2-2', name: '研制报告.md',     path: '/workspace/user_input_files/研制报告.md',     type: 'file', size: 23000 },
      ] },
      { id: 'f3', name: 'read_docx.py', path: '/workspace/read_docx.py', type: 'file', size: 380 },
    ]
  }
  return [
    { id: 'f1', name: 'workspace', path: '/workspace', type: 'folder', children: [
      { id: 'f1-1', name: 'output', path: '/workspace/output', type: 'folder', children: [
        { id: 'f1-1-1', name: 'result.md', path: '/workspace/output/result.md', type: 'file', size: 4200 },
      ] },
      { id: 'f1-2', name: 'main.py', path: '/workspace/main.py', type: 'file', size: 850 },
    ] },
  ]
}

export default function useAgentProcess({ agentId, agentType } = {}) {
  /* ====== 状态 ====== */
  const [steps, setSteps] = useState(() => buildDefaultSteps(agentId))
  const [files, setFiles] = useState(() => buildDefaultFiles(agentId))
  const [overallProgress, setOverallProgress] = useState(100)        // 0~100
  const [currentStepId, setCurrentStepId] = useState(null)            // 当前正在执行的步骤
  const [isRunning, setIsRunning] = useState(false)                   // 是否正在运行

  /* ====== 当 agentId 变化时,重置 ====== */
  useEffect(() => {
    if (!agentId) return
    setSteps(buildDefaultSteps(agentId))
    setFiles(buildDefaultFiles(agentId))
    setOverallProgress(100)
    setCurrentStepId(null)
    setIsRunning(false)
  }, [agentId])

  /* ====== 启动一次"智能体任务"流程(模拟) ====== */
  const startRun = useCallback(() => {
    if (isRunning) return
    setIsRunning(true)
    setOverallProgress(0)

    // 把所有步骤置为 pending,除了第一个 running
    setSteps((prev) => prev.map((s, i) => ({ ...s, status: i === 0 ? 'running' : 'pending', duration: undefined })))
    setCurrentStepId((prev) => null)

    let i = 0
    const total = steps.length
    const tick = () => {
      if (i >= total) {
        setIsRunning(false)
        setOverallProgress(100)
        setCurrentStepId(null)
        return
      }
      const start = Date.now()
      setCurrentStepId(steps[i]?.id)
      setOverallProgress(Math.round(((i + 1) / total) * 100))
      // 模拟每个步骤耗时 600~1500ms
      const dt = 600 + Math.random() * 900
      setTimeout(() => {
        const dur = ((Date.now() - start) / 1000).toFixed(1) + 's'
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'done', duration: dur } : s))
        )
        i += 1
        tick()
      }, dt)
    }
    tick()
  }, [isRunning, steps])

  /* ====== 重置流程 ====== */
  const reset = useCallback(() => {
    setSteps(buildDefaultSteps(agentId))
    setFiles(buildDefaultFiles(agentId))
    setOverallProgress(0)
    setCurrentStepId(null)
    setIsRunning(false)
  }, [agentId])

  /* ====== 文件操作 ====== */
  /* 递归查找节点 */
  const findNode = useCallback((nodes, id) => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children) {
        const r = findNode(n.children, id)
        if (r) return r
      }
    }
    return null
  }, [])

  const renameFile = useCallback((id, newName) => {
    if (!newName?.trim()) return
    setFiles((prev) => {
      const clone = (arr) => arr.map((n) => {
        if (n.id === id) {
          return { ...n, name: newName.trim(), path: n.path.replace(/[^/]+$/, newName.trim()) }
        }
        if (n.children) return { ...n, children: clone(n.children) }
        return n
      })
      return clone(prev)
    })
  }, [])

  const deleteFile = useCallback((id) => {
    setFiles((prev) => {
      const remove = (arr) => arr.filter((n) => {
        if (n.id === id) return false
        if (n.children) n.children = remove(n.children)
        return true
      })
      return remove(prev)
    })
  }, [])

  const downloadFile = useCallback((node) => {
    if (node.type !== 'file') return
    // 构造一个简单的文本内容,实际项目中可对接后端
    const content = `// ${node.path}\n// (mock 文件内容,实际项目中通过后端接口获取)\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = node.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  /* ====== 派生数据 ====== */
  const summary = useMemo(() => {
    const done = steps.filter((s) => s.status === 'done').length
    const total = steps.length
    return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
  }, [steps])

  return {
    steps,
    files,
    overallProgress,
    currentStepId,
    isRunning,
    summary,
    /* 操作 */
    startRun,
    reset,
    renameFile,
    deleteFile,
    downloadFile,
  }
}
