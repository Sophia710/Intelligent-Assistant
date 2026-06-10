import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SkillStoreTab from '../components/skills/SkillStoreTab'
import MySkillsTab from '../components/skills/MySkillsTab'
import CreateSkillModal from '../components/skills/CreateSkillModal'
import useSkills from '../hooks/useSkills'
import { useToast } from '../contexts/ToastContext'

/**
 * 技能中心主页面
 *
 * 头部布局（参考设计稿）：
 *   [内置技能] [我的技能]  ........  [创建新技能] [搜索框]
 *
 * URL 同步：
 *   /skills?tab=store|mine
 */
function SkillsCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  // URL 控制 Tab，初次进入为 store
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'mine' ? 'mine' : 'store')

  // 搜索关键词（页面级 state，两个 Tab 共享）
  const [keyword, setKeyword] = useState('')

  // 当 URL 变化时同步 Tab
  useEffect(() => {
    const t = searchParams.get('tab')
    setActiveTab(t === 'mine' ? 'mine' : 'store')
  }, [searchParams])

  const switchTab = (key) => {
    setActiveTab(key)
    setSearchParams({ tab: key }, { replace: true })
    // 切换 Tab 时清空搜索，避免 A Tab 的关键词污染 B Tab 结果
    setKeyword('')
  }

  // 模态框状态
  const [createOpen, setCreateOpen] = useState(false)

  // 数据
  const {
    agents,
    skillPacks,
    datasets,
    mySkills,
    addSkill,
    removeSkill,
    isAdded,
    createCustomSkill,
    deleteCustomSkill,
  } = useSkills()

  /* ---------- 业务回调 ---------- */
  const handleAdd = (item) => {
    addSkill(item.id)
    toast.success(`已添加「${item.name}」`)
  }

  const handleRemove = (skill) => {
    if (skill.type === 'custom') {
      deleteCustomSkill(skill.id)
      toast.success(`已删除自定义技能「${skill.name}」`)
    } else {
      removeSkill(skill.id)
      toast.success(`已从我的技能中移除「${skill.name}」`)
    }
  }

  const handleUse = (skill) => {
    if (skill.type === 'custom' && skill.triggerCommand) {
      toast.info(`已在输入框中插入 ${skill.triggerCommand}`)
    } else {
      toast.info(`正在使用「${skill.name}」…`)
    }
    const cmd = skill.triggerCommand || `/${skill.id}`
    navigate(`/chat/new?skill=${encodeURIComponent(cmd)}`)
  }

  const handleCreateSubmit = (draft) => {
    try {
      const created = createCustomSkill(draft)
      toast.success(`自定义技能「${created.name}」创建成功`)
      setCreateOpen(false)
      // 自动切到"我的技能" Tab 让用户立即看到
      switchTab('mine')
    } catch (e) {
      toast.error('创建失败，请重试')
    }
  }

  // 占位符随 Tab 变化
  const searchPlaceholder = activeTab === 'mine' ? '搜索我的技能' : '搜索更多技能'

  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ====== 页面标题区（确保用户能看到本模块） ====== */}
        <div className="mb-5">
          <h1
            className="text-2xl font-bold transition-colors duration-200"
            style={{ color: 'var(--color-on-surface)' }}
          >
            技能中心
          </h1>
        </div>

        {/* ====== 头部：Tab + 创建新技能 + 搜索框 ====== */}
        <header
          className="flex items-center justify-between gap-4 flex-wrap pb-4 mb-6"
          style={{ borderBottom: '1px solid var(--color-outline-variant)' }}
        >
          {/* 左侧：Tab 切换 */}
          <div className="flex items-center gap-6">
            <TabButton
              active={activeTab === 'store'}
              onClick={() => switchTab('store')}
            >
              内置技能
            </TabButton>
            <TabButton
              active={activeTab === 'mine'}
              onClick={() => switchTab('mine')}
            >
              我的技能
              {mySkills.length > 0 && (
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors duration-200"
                  style={{
                    backgroundColor: activeTab === 'mine'
                      ? 'var(--color-on-primary)'
                      : 'var(--color-primary)',
                    color: activeTab === 'mine'
                      ? 'var(--color-primary)'
                      : 'var(--color-on-primary)',
                  }}
                >
                  {mySkills.length}
                </span>
              )}
            </TabButton>
          </div>

          {/* 右侧：创建新技能 + 搜索框 */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--color-primary) 35%, transparent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)'
              }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              创建新技能
            </button>

            <SearchBox
              value={keyword}
              onChange={setKeyword}
              placeholder={searchPlaceholder}
            />
          </div>
        </header>

        {/* ====== Tab 内容区 ====== */}
        <main>
          {activeTab === 'store' ? (
            <SkillStoreTab
              agents={agents}
              isAdded={isAdded}
              onAdd={handleAdd}
              onUse={handleUse}
              onCreate={() => setCreateOpen(true)}
              keyword={keyword}
            />
          ) : (
            <MySkillsTab
              mySkills={mySkills}
              onUse={handleUse}
              onRemove={handleRemove}
              onCreate={() => setCreateOpen(true)}
              keyword={keyword}
            />
          )}
        </main>
      </div>

      {/* ====== 创建技能模态框 ====== */}
      <CreateSkillModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}

/**
 * 头部 Tab 按钮 — 选中态带下划线 + 字色加深
 */
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="relative pb-2 text-base font-semibold transition-colors duration-200 cursor-pointer"
      style={{ color: active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-on-surface)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--color-on-surface-variant)'
      }}
    >
      <span className="inline-flex items-center">{children}</span>
      {active && (
        <span
          className="absolute -bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      )}
    </button>
  )
}

/**
 * 头部搜索框 — 支持清空按钮 + focus 视觉反馈
 */
function SearchBox({ value, onChange, placeholder }) {
  const [focused, setFocused] = React.useState(false)

  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg w-72 transition-all duration-200"
      style={{
        backgroundColor: focused
          ? 'var(--color-surface-container-lowest)'
          : 'var(--color-surface-container)',
        border: `1px solid ${focused ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
        boxShadow: focused
          ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)'
          : 'none',
      }}
    >
      <span
        className="material-symbols-outlined text-[20px] transition-colors duration-200"
        style={{ color: focused ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
      >
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: 'var(--color-on-surface)' }}
        aria-label="搜索技能"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="transition-colors duration-200 cursor-pointer"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-on-surface)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-on-surface-variant)'
          }}
          aria-label="清空搜索"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  )
}

export default SkillsCenterPage
