import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * 自定义智能体数据管理 Hook
 *
 * 与 useSkills.customSkills 完全独立 — 不共享数据，不共享 localStorage key。
 * 智能体中心 (Agent Center) 的新建功能使用此 hook。
 *
 * 持久化: localStorage['user:agents:custom:v1']
 * 默认值 : 空数组 — 首次进入无任何自定义智能体
 *
 * 字段约定 (Agent):
 *   id            : string  - 'custom-<timestamp>'
 *   type          : 'custom'
 *   name          : string
 *   description   : string
 *   category      : 'office' | 'dev' | 'test' | 'ops' | 'operation' | 'custom'
 *   icon          : string  - Material Symbols 名称
 *   iconBg        : string  - CSS 渐变
 *   systemPrompt  : string  - 智能体人设 / 系统提示词
 *   triggerCommand: string  - 可选, 触发命令 (如 /mybot)
 *   welcomeMessage: string  - 可选, 首次对话欢迎语
 *   colorTheme    : 'primary' | 'tertiary' | 'variant' | 'error'
 *   createdAt     : ISO 字符串
 */
const STORAGE_KEY = 'user:agents:custom:v1'

/* ===== localStorage 读写 ===== */
function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function useCustomAgents() {
  const [list, setList] = useState(() => readJSON(STORAGE_KEY, []))

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      /* 容量异常时静默忽略 */
    }
  }, [list])

  // 跨 Tab 同步: 监听 storage 事件
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      try {
        const next = e.newValue ? JSON.parse(e.newValue) : []
        setList(Array.isArray(next) ? next : [])
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* ---------- 操作 ---------- */
  const addAgent = useCallback((draft) => {
    const id = `custom-agent-${Date.now()}`
    const newAgent = {
      id,
      type: 'custom',
      name: draft.name?.trim() || '未命名智能体',
      description: draft.description?.trim() || '',
      category: draft.category || 'custom',
      icon: draft.icon || 'smart_toy',
      iconBg: draft.iconBg || 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      systemPrompt: draft.systemPrompt || '',
      triggerCommand: draft.triggerCommand || '',
      welcomeMessage: draft.welcomeMessage || '',
      colorTheme: draft.colorTheme || 'primary',
      addCount: 0,
      createdAt: new Date().toISOString(),
    }
    setList((prev) => [newAgent, ...prev])
    return newAgent
  }, [])

  const updateAgent = useCallback((id, patch) => {
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const removeAgent = useCallback((id) => {
    setList((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const getAgent = useCallback((id) => list.find((a) => a.id === id), [list])

  /* ---------- 派生 ---------- */
  // 按 category 分组
  const grouped = useMemo(() => {
    const map = new Map()
    list.forEach((a) => {
      if (!map.has(a.category)) map.set(a.category, [])
      map.get(a.category).push(a)
    })
    return map
  }, [list])

  return {
    list,                // 全部自定义智能体 (扁平数组, 已含 type='custom')
    grouped,             // 按 category 分组
    addAgent,
    updateAgent,
    removeAgent,
    getAgent,
    count: list.length,
  }
}

export default useCustomAgents
