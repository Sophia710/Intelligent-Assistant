import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  AGENTS,
  SKILLS,
  DEFAULT_ADDED_SKILL_IDS,
  DEFAULT_ENABLED_SKILL_IDS,
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

  // 已启用的技能 ID（我的技能模块中可被"启用开关"控制）
  const [enabledIds, setEnabledIds] = useState(() => {
    const stored = readJSON(STORAGE_KEYS.ENABLED, null)
    return stored === null ? new Set(DEFAULT_ENABLED_SKILL_IDS) : new Set(stored)
  })

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

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ENABLED,
        JSON.stringify(Array.from(enabledIds))
      )
    } catch {
      /* ignore */
    }
  }, [enabledIds])

  /* ---------- 派生数据 ---------- */
  // 我的技能 = 已添加的内置技能 + 自定义技能
  const mySkills = useMemo(() => {
    const builtin = SKILLS.filter((s) => addedIds.has(s.id))
    return [...builtin, ...customSkills]
  }, [addedIds, customSkills])

  /**
   * 为 mySkills 注入 enabled 字段
   *  - 自定义技能：默认 enabled=true（首次添加即启用）
   *  - 内置技能：从 enabledIds 集合中读取
   */
  const mySkillsWithEnabled = useMemo(() => {
    return mySkills.map((s) => {
      if (s.type === 'custom') {
        return { ...s, enabled: enabledIds.has(s.id) }
      }
      return { ...s, enabled: enabledIds.has(s.id) }
    })
  }, [mySkills, enabledIds])

  /** 仅启用的"我的技能" - 用于聊天输入框"加载技能" */
  const enabledSkills = useMemo(
    () => mySkillsWithEnabled.filter((s) => s.enabled),
    [mySkillsWithEnabled]
  )

  /* ---------- 操作 ---------- */
  const addSkill = useCallback((skillId) => {
    setAddedIds((prev) => {
      if (prev.has(skillId)) return prev
      const next = new Set(prev)
      next.add(skillId)
      return next
    })
    // 新添加的技能默认启用
    setEnabledIds((prev) => {
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
    // 移除时同步清理 enabled
    setEnabledIds((prev) => {
      if (!prev.has(skillId)) return prev
      const next = new Set(prev)
      next.delete(skillId)
      return next
    })
  }, [])

  const isAdded = useCallback((skillId) => addedIds.has(skillId), [addedIds])

  /**
   * 切换"启用"状态
   *
   * 关键修复：之前通过 setState 回调的闭包副作用回填 result，在 React 18 严格模式/
   * 并发渲染下不稳定，导致启用已停用技能时返回值错误地回退为 false。
   * 现在改为：基于当前 enabledIds + next 参数同步、确定地计算目标态，
   * 再独立触发 setEnabledIds 更新，二者完全解耦。
   *
   * @param {string} skillId
   * @param {boolean} [next] - 指定目标值；不传则取反
   * @returns {boolean} 切换后的最终状态
   */
  const toggleEnabled = useCallback((skillId, next) => {
    // 1) 同步、确定地计算目标态（不依赖 setState 副作用）
    const want =
      typeof next === 'boolean' ? next : !enabledIds.has(skillId)

    // 2) 触发实际状态更新
    setEnabledIds((prev) => {
      const set = new Set(prev)
      if (want) set.add(skillId)
      else set.delete(skillId)
      return set
    })

    // 3) 立即返回确定的目标态给调用方
    return want
  }, [enabledIds])

  const isEnabled = useCallback((skillId) => enabledIds.has(skillId), [enabledIds])

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
      enabled: true,           // 自定义技能默认启用
      createdAt: new Date().toISOString(),
    }
    setCustomSkills((prev) => [newSkill, ...prev])
    // 同步写入 enabledIds
    setEnabledIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    return newSkill
  }, [])

  const deleteCustomSkill = useCallback((skillId) => {
    setCustomSkills((prev) => prev.filter((s) => s.id !== skillId))
    setEnabledIds((prev) => {
      if (!prev.has(skillId)) return prev
      const next = new Set(prev)
      next.delete(skillId)
      return next
    })
  }, [])

  /* ---------- 搜索 ---------- */
  const searchSkills = useCallback(
    (keyword) => {
      const k = keyword?.trim().toLowerCase()
      if (!k) return mySkillsWithEnabled
      return mySkillsWithEnabled.filter(
        (s) =>
          s.name.toLowerCase().includes(k) ||
          s.description?.toLowerCase().includes(k)
      )
    },
    [mySkillsWithEnabled]
  )

  return {
    // 静态数据（内置）— 统一智能体
    agents: AGENTS,
    skillPacks: AGENTS,        // 向后兼容旧字段
    datasets: [],              // 向后兼容旧字段
    builtinSkills: SKILLS,
    // 用户数据
    addedIds,
    enabledIds,
    mySkills: mySkillsWithEnabled,    // 已含 enabled 字段
    enabledSkills,                    // 仅启用的我的技能
    customSkills,
    // 操作
    addSkill,
    removeSkill,
    isAdded,
    toggleEnabled,
    isEnabled,
    createCustomSkill,
    deleteCustomSkill,
    searchSkills,
  }
}

export default useSkills
