import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AGENTS,
  SKILLS,
  DEFAULT_ADDED_SKILL_IDS,
  STORAGE_KEYS,
} from '../data/seedSkills'

/**
 * 读取并解析 localStorage 中的 JSON 数组
 */
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

/**
 * 技能中心数据管理 Hook
 *
 * 提供：
 *  - 内置技能列表
 *  - 用户已添加技能 ID 集合（持久化）
 *  - 自定义技能列表（持久化）
 *  - 添加 / 移除 / 创建 / 搜索
 */
function useSkills() {
  // 已添加的内置技能 ID
  const [addedIds, setAddedIds] = useState(() => {
    const stored = readJSON(STORAGE_KEYS.ADDED, null)
    return stored === null ? new Set(DEFAULT_ADDED_SKILL_IDS) : new Set(stored)
  })

  // 自定义技能
  const [customSkills, setCustomSkills] = useState(() => readJSON(STORAGE_KEYS.CUSTOMS, []))

  /* ---------- 持久化 ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ADDED,
        JSON.stringify(Array.from(addedIds))
      )
    } catch {
      /* 忽略容量异常 */
    }
  }, [addedIds])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMS, JSON.stringify(customSkills))
    } catch {
      /* ignore */
    }
  }, [customSkills])

  /* ---------- 派生数据 ---------- */
  // 我的技能 = 已添加的内置技能 + 自定义技能
  const mySkills = useMemo(() => {
    const builtin = SKILLS.filter((s) => addedIds.has(s.id))
    return [...builtin, ...customSkills]
  }, [addedIds, customSkills])

  /* ---------- 操作 ---------- */
  const addSkill = useCallback((skillId) => {
    setAddedIds((prev) => {
      if (prev.has(skillId)) return prev
      const next = new Set(prev)
      next.add(skillId)
      return next
    })
  }, [])

  const removeSkill = useCallback((skillId) => {
    setAddedIds((prev) => {
      if (!prev.has(skillId)) return prev
      const next = new Set(prev)
      next.delete(skillId)
      return next
    })
  }, [])

  const isAdded = useCallback((skillId) => addedIds.has(skillId), [addedIds])

  const createCustomSkill = useCallback((draft) => {
    // draft: { name, description, icon, iconBg, triggerCommand, promptTemplate }
    const id = `custom-${Date.now()}`
    const newSkill = {
      id,
      type: 'custom',
      name: draft.name?.trim() || '未命名技能',
      description: draft.description?.trim() || '',
      icon: draft.icon || 'auto_awesome',
      iconBg: draft.iconBg || 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      triggerCommand: draft.triggerCommand || '',
      promptTemplate: draft.promptTemplate || '',
      category: 'custom',
      createdAt: new Date().toISOString(),
    }
    setCustomSkills((prev) => [newSkill, ...prev])
    return newSkill
  }, [])

  const deleteCustomSkill = useCallback((skillId) => {
    setCustomSkills((prev) => prev.filter((s) => s.id !== skillId))
  }, [])

  /* ---------- 搜索 ---------- */
  const searchSkills = useCallback(
    (keyword) => {
      const k = keyword?.trim().toLowerCase()
      if (!k) return mySkills
      return mySkills.filter(
        (s) =>
          s.name.toLowerCase().includes(k) ||
          s.description?.toLowerCase().includes(k)
      )
    },
    [mySkills]
  )

  return {
    // 静态数据（内置）— 统一智能体
    agents: AGENTS,
    skillPacks: AGENTS,        // 向后兼容旧字段
    datasets: [],              // 向后兼容旧字段
    builtinSkills: SKILLS,
    // 用户数据
    addedIds,
    mySkills,
    customSkills,
    // 操作
    addSkill,
    removeSkill,
    isAdded,
    createCustomSkill,
    deleteCustomSkill,
    searchSkills,
  }
}

export default useSkills
