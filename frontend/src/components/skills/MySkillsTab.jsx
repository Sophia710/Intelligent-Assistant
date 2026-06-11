import React, { useMemo } from 'react'
import MySkillCard from './MySkillCard'

/**
 * 我的技能 Tab
 *
 * Props:
 *   mySkills        : 已添加技能列表（含 enabled 字段）
 *   onUse           : (skill) => void
 *   onRemove        : (skill) => void
 *   onToggleEnabled : (skill, next:boolean) => void
 *   onCreate        : () => void
 *   onEdit          : (skill) => void
 *   keyword         : string
 */
function MySkillsTab({
  mySkills,
  onUse,
  onRemove,
  onToggleEnabled,
  onCreate,
  onEdit,
  keyword = '',
}) {
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    if (!k) return mySkills
    return mySkills.filter(
      (s) =>
        s.name.toLowerCase().includes(k) ||
        s.description?.toLowerCase().includes(k)
    )
  }, [mySkills, keyword])

  // 启/停用 数量统计
  const enabledCount = filtered.filter((s) => s.enabled !== false).length
  const disabledCount = filtered.length - enabledCount

  return (
    <div className="flex flex-col gap-5 tab-fade-in">
      {/* 命中统计（搜索时显示） */}
      {keyword && (
        <div
          className="text-xs transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          共 <span style={{ color: 'var(--color-primary)' }}>{filtered.length}</span> 个匹配「{keyword}」的技能
        </div>
      )}

      {/* 启/停用统计 */}
      {filtered.length > 0 && (
        <div
          className="text-xs flex items-center gap-3 transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          <span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{enabledCount}</span> 个已启用
          </span>
          {disabledCount > 0 && (
            <span>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>{disabledCount}</span> 个已停用
            </span>
          )}
        </div>
      )}

      {/* 技能网格 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <MySkillCard
              key={skill.id}
              skill={skill}
              onUse={onUse}
              onRemove={onRemove}
              onToggleEnabled={onToggleEnabled}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <EmptyState keyword={keyword} onCreate={onCreate} />
      )}
    </div>
  )
}

function EmptyState({ keyword, onCreate }) {
  return (
    <div
      className="rounded-2xl py-16 flex flex-col items-center justify-center gap-4 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px dashed var(--color-outline-variant)',
        color: 'var(--color-on-surface-variant)',
      }}
    >
      <span
        className="material-symbols-outlined text-[48px]"
        style={{ opacity: 0.5 }}
      >
        {keyword ? 'search_off' : 'extension_off'}
      </span>
      <div className="text-center">
        <p
          className="text-sm font-medium transition-colors duration-200"
          style={{ color: 'var(--color-on-surface)' }}
        >
          {keyword ? '没有匹配到相关技能' : '你还没有添加任何技能'}
        </p>
        <p className="text-xs mt-1">
          {keyword ? '试试其他关键词，或去内置技能商店逛逛' : '去内置技能商店浏览丰富技能'}
        </p>
      </div>
      {!keyword && (
        <button
          onClick={onCreate}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
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
          <span className="material-symbols-outlined text-[16px]">add</span>
          创建新技能
        </button>
      )}
    </div>
  )
}

export default MySkillsTab
