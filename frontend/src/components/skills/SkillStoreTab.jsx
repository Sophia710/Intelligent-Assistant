import React, { useState, useMemo } from 'react'
import { CATEGORIES } from '../../data/seedSkills'
import CategoryChips from './CategoryChips'
import AgentCard from './AgentCard'

/**
 * 技能商店 Tab — 统一智能体卡片展示
 *
 * Props:
 *   agents     : AGENTS 数组（来自 useSkills）
 *   isAdded    : (id) => boolean
 *   onAdd      : (agent) => void
 *   onUse      : (agent) => void
 *   onCreate   : () => void
 *   keyword    : string
 */
function SkillStoreTab({ agents = [], isAdded, onAdd, onUse, onCreate, keyword = '' }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const kw = keyword.trim().toLowerCase()
  const matchText = (text) => (kw ? text?.toLowerCase().includes(kw) : true)

  /* 分类 + 关键词筛选 */
  const filtered = useMemo(() => {
    return agents
      .filter((a) => (activeCategory === 'all' ? true : a.category === activeCategory))
      .filter((a) => matchText(a.name) || matchText(a.description))
  }, [agents, activeCategory, kw])

  /* 按分类分组的统计（用于分类按钮上角标） */
  const categoryCounts = useMemo(() => {
    const counts = { all: agents.length }
    for (const a of agents) {
      counts[a.category] = (counts[a.category] || 0) + 1
    }
    return counts
  }, [agents])

  return (
    <div className="flex flex-col gap-5 tab-fade-in">
      {/* ===== 分类筛选条 ===== */}
      <div>
        <CategoryChips
          items={CATEGORIES}
          activeKey={activeCategory}
          counts={categoryCounts}
          onChange={setActiveCategory}
        />
      </div>

      {/* ===== 命中统计（搜索时显示） ===== */}
      {kw && (
        <div
          className="text-xs transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          共 <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{filtered.length}</span> 个
          {CATEGORIES.find((c) => c.key === activeCategory)?.label || ''}智能体匹配「{keyword}」
        </div>
      )}

      {/* ===== 智能体网格 ===== */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isAdded={isAdded(agent.id)}
              onAdd={onAdd}
              onUse={onUse}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          keyword={keyword}
          category={CATEGORIES.find((c) => c.key === activeCategory)}
          onCreate={onCreate}
        />
      )}
    </div>
  )
}

/* ===== 空态 ===== */
function EmptyState({ keyword, category, onCreate }) {
  const hasKeyword = !!keyword?.trim()
  return (
    <div
      className="rounded-2xl py-16 px-6 flex flex-col items-center justify-center gap-3 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px dashed var(--color-outline-variant)',
        color: 'var(--color-on-surface-variant)',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: '48px', opacity: 0.5 }}
      >
        {hasKeyword ? 'search_off' : 'inbox'}
      </span>
      <div className="text-sm text-center">
        {hasKeyword ? (
          <>
            未找到名称或描述包含「
            <span style={{ color: 'var(--color-primary)' }}>{keyword}</span>
            」的
            {category?.label || ''}智能体
          </>
        ) : (
          <>该分类下暂无智能体</>
        )}
      </div>
      <button
        onClick={onCreate}
        className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      >
        <span className="material-symbols-outlined text-[14px]">add</span>
        创建自定义智能体
      </button>
    </div>
  )
}

export default SkillStoreTab
