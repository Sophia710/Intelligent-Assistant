/**
 * 专栏订阅页面 (整合 07 + 10)
 *
 * 路由: /columns?tab=market | /columns?tab=my-subs
 *
 * 二级 Tab 切换:
 *   - market         → 专栏市场(原 ColumnsBrowsePage)
 *   - my-subs        → 我的订阅(原 MyColumnSubscriptionsPage)
 *
 * 设计要点:
 *   - 整合"专栏市场"和"我的订阅"两套视图为单一入口
 *   - 顶部提供分段控件,URL 同步 query param,支持深链接/刷新
 *   - 复用既有的 hooks(mockColumnApi / ColumnNotificationContext)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useColumns from '../hooks/useColumns'
import useColumnSubscriptions from '../hooks/useColumnSubscriptions'
import useColumnArticles from '../hooks/useColumnArticles'
import { useToast } from '../contexts/ToastContext'
import { useColumnNotification } from '../contexts/ColumnNotificationContext'
import ColumnCard from '../components/columns/ColumnCard'
import ColumnTopicChip from '../components/columns/ColumnTopicChip'
import MyColumnSubscriptionCard from '../components/columns/MyColumnSubscriptionCard'
import NewBadge from '../components/columns/NewBadge'

const MARKET_FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'subscribed', label: '已订阅' },
  { key: 'unsubscribed', label: '未订阅' },
]

const MY_SORT_OPTIONS = [
  { key: 'latest', label: '最近更新' },
  { key: 'subscribed', label: '订阅时间' },
  { key: 'name', label: '专栏名称' },
]

function formatDate(iso) {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

function ColumnsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // 默认 tab = market,可通过 ?tab= 切换
  const tab = searchParams.get('tab') === 'my-subs' ? 'my-subs' : 'market'

  // 工具栏状态上提(为让 SegmentedTabs 与搜索/过滤同行)
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('all')

  const setTab = (next) => {
    const sp = new URLSearchParams(searchParams)
    if (next === 'market') {
      sp.delete('tab')
    } else {
      sp.set('tab', next)
    }
    setSearchParams(sp, { replace: false })
  }

  return (
    <main
      className="flex-1 p-8 mt-16 transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 顶行:分段控件 + 工具栏(搜索 / 全部-已订阅-未订阅),在桌面端同一水平行 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
          <SegmentedTabs value={tab} onChange={setTab} />
          {tab === 'market' && (
            <MarketToolbar
              keyword={keyword}
              setKeyword={setKeyword}
              filter={filter}
              setFilter={setFilter}
            />
          )}
        </div>

        {tab === 'market' ? (
          <MarketSection
            navigate={navigate}
            keyword={keyword}
            filter={filter}
          />
        ) : (
          <MySubscriptionsSection navigate={navigate} />
        )}
      </div>
    </main>
  )
}

/* ============================================================================
 * 分段控件
 * ========================================================================== */
function SegmentedTabs({ value, onChange }) {
  const tabs = [
    { key: 'market', label: '专栏市场', icon: 'storefront' },
    { key: 'my-subs', label: '我的订阅', icon: 'bookmarks' },
  ]
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-xl shrink-0"
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      {tabs.map((t) => {
        const active = value === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
            style={{
              backgroundColor: active ? 'var(--color-surface-container-lowest)' : 'transparent',
              color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              boxShadow: active ? '0 1px 3px color-mix(in srgb, var(--color-on-surface) 10%, transparent)' : 'none',
            }}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ============================================================================
 * 工具栏(搜索 + 全部/已订阅/未订阅)— 与 SegmentedTabs 同行
 * ========================================================================== */
function MarketToolbar({ keyword, setKeyword, filter, setFilter }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[260px] max-w-md">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg"
          style={{ color: 'var(--color-outline)' }}
        >search</span>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索专栏名称、描述、关键词..."
          className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-variant)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)'
            e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>
      <div
        className="flex items-center gap-1 rounded-lg p-1 shrink-0"
        style={{ backgroundColor: 'var(--color-surface-container-low)' }}
      >
        {MARKET_FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
              style={{
                backgroundColor: active ? 'var(--color-surface-container-lowest)' : 'transparent',
                color: active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                boxShadow: active ? '0 1px 3px color-mix(in srgb, var(--color-on-surface) 10%, transparent)' : 'none',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================================
 * 子组件 1: 专栏市场
 * ========================================================================== */
function MarketSection({ navigate, keyword, filter }) {
  const toast = useToast()
  const { columns, loading } = useColumns()
  const { subscribedIds, subscribe, unsubscribe } = useColumnSubscriptions()
  const [topic, setTopic] = useState(null)

  const topics = useMemo(() => {
    const set = new Set(columns.map((c) => c.topic).filter(Boolean))
    return Array.from(set)
  }, [columns])

  const filtered = useMemo(() => {
    let list = columns
    if (topic) list = list.filter((c) => c.topic === topic)
    if (filter === 'subscribed') list = list.filter((c) => subscribedIds.has(c.id))
    if (filter === 'unsubscribed') list = list.filter((c) => !subscribedIds.has(c.id))
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(k) ||
          (c.description || '').toLowerCase().includes(k) ||
          (c.topic_keywords || []).some((kw) => kw.toLowerCase().includes(k))
      )
    }
    return list
  }, [columns, keyword, filter, topic, subscribedIds])

  const decorated = useMemo(
    () => filtered.map((c) => ({ ...c, is_subscribed: subscribedIds.has(c.id) })),
    [filtered, subscribedIds]
  )

  const handleSubscribe = async (col) => {
    try {
      await subscribe(col.id)
      toast.success(`已订阅「${col.name}」`)
    } catch {
      toast.error('订阅失败,请重试')
    }
  }
  const handleUnsubscribe = async (col) => {
    try {
      await unsubscribe(col.id)
      toast.info(`已取消订阅「${col.name}」`)
    } catch {
      toast.error('取消订阅失败')
    }
  }

  return (
    <div>
      {/* 主题筛选行(工具栏已上提) */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>主题:</span>
        <ColumnTopicChip
          topic="全部"
          active={!topic}
          onClick={() => setTopic(null)}
        />
        {topics.map((t) => (
          <ColumnTopicChip
            key={t}
            topic={t}
            active={topic === t}
            onClick={() => setTopic(topic === t ? null : t)}
          />
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <div
          className="rounded-2xl py-16 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            加载专栏中...
          </div>
        </div>
      ) : decorated.length === 0 ? (
        <div
          className="rounded-2xl py-16 flex flex-col items-center gap-3"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline)' }}>search_off</span>
          <div className="text-[14px]" style={{ color: 'var(--color-on-surface)' }}>没有匹配的专栏</div>
          <button
            type="button"
            onClick={() => { setKeyword(''); setFilter('all'); setTopic(null) }}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {decorated.map((col) => (
            <ColumnCard
              key={col.id}
              column={col}
              onClick={(c) => navigate(`/columns/${c.id}`)}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * 子组件 2: 我的订阅
 * ========================================================================== */
function MySubscriptionsSection({ navigate }) {
  const toast = useToast()
  const { subscriptions, loading, unsubscribe } = useColumnSubscriptions()
  const { feed: notifFeed } = useColumnNotification()
  const { markRead: markOneRead } = useColumnArticles() // 占位,真实标记走 useColumnReads
  const [subTab, setSubTab] = useState('list') // 'list' | 'feed'
  const [sortKey, setSortKey] = useState('latest')

  const sorted = useMemo(() => {
    const list = [...subscriptions]
    if (sortKey === 'latest') {
      list.sort((a, b) => new Date(b.latest_published_at) - new Date(a.latest_published_at))
    } else if (sortKey === 'subscribed') {
      list.sort((a, b) => new Date(b.subscribed_at) - new Date(a.subscribed_at))
    } else if (sortKey === 'name') {
      list.sort((a, b) => (a.column?.name || '').localeCompare(b.column?.name || '', 'zh-Hans'))
    }
    return list
  }, [subscriptions, sortKey])

  const handleUnsubscribe = async (sub) => {
    try {
      await unsubscribe(sub.column_id)
      toast.info(`已退订「${sub.column?.name}」`)
    } catch {
      toast.error('退订失败,请重试')
    }
  }

  return (
    <div>
      {/* 子 Tab:订阅列表 / 更新流 */}
      <div
        className="flex items-center gap-6 border-b mb-4"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      >
        <SubTabButton
          active={subTab === 'list'}
          onClick={() => setSubTab('list')}
          badge={subscriptions.length}
        >
          订阅列表
        </SubTabButton>
        <SubTabButton
          active={subTab === 'feed'}
          onClick={() => setSubTab('feed')}
          badge={notifFeed.filter((a) => a.is_new).length}
          badgeColor="error"
        >
          近期更新
        </SubTabButton>
      </div>

      {/* 排序条 */}
      {subTab === 'list' && subscriptions.length > 0 && (
        <div className="flex items-center justify-end gap-2 mb-3">
          <span className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>排序:</span>
          <div className="flex items-center gap-1 rounded-lg p-1"
            style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            {MY_SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortKey(opt.key)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                  style={{
                    backgroundColor: active ? 'var(--color-surface-container-lowest)' : 'transparent',
                    color: active ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    boxShadow: active ? '0 1px 3px color-mix(in srgb, var(--color-on-surface) 10%, transparent)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 加载 */}
      {loading ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--color-on-surface-variant)' }}>progress_activity</span>
        </div>
      ) : subTab === 'list' ? (
        sorted.length === 0 ? (
          <EmptyBrowse onBrowse={() => setSubTab('list')} />
        ) : (
          <div className="flex flex-col gap-4">
            {sorted.map((sub) => (
              <MyColumnSubscriptionCard
                key={sub.id}
                subscription={sub}
                onViewColumn={() => navigate(`/columns/${sub.column_id}`)}
                onUnsubscribe={() => handleUnsubscribe(sub)}
                onReadArticle={(a) => navigate(`/columns/${sub.column_id}/articles/${a.id}`)}
              />
            ))}
          </div>
        )
      ) : notifFeed.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="flex flex-col gap-3">
          {notifFeed.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/columns/${a.column?.id}/articles/${a.id}`)}
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-primary-container)' }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--color-on-primary-container)', fontSize: 18 }}>article</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] mb-1 flex-wrap" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {a.is_new && <NewBadge size="sm" />}
                  {a.column && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'var(--color-surface-container-high)',
                        color: 'var(--color-on-surface)',
                      }}
                    >
                      {a.column.name}
                    </span>
                  )}
                  <span>{formatDate(a.published_at)}</span>
                </div>
                <div
                  className="text-[14px] font-semibold leading-snug"
                  style={{ color: 'var(--color-on-surface)' }}
                >{a.title}</div>
                <div
                  className="text-[12px] mt-1 line-clamp-2"
                  style={{
                    color: 'var(--color-on-surface-variant)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >{a.summary}</div>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: 18 }}>chevron_right</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubTabButton({ active, onClick, badge, badgeColor = 'primary', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center gap-1.5 pb-3 text-[14px] font-medium transition-colors"
      style={{ color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
    >
      {children}
      {badge > 0 && (
        <span
          className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
          style={{
            backgroundColor: badgeColor === 'error' ? 'var(--color-error)' : 'var(--color-surface-container-high)',
            color: badgeColor === 'error' ? '#FFFFFF' : 'var(--color-on-surface-variant)',
          }}
        >
          {badge}
        </span>
      )}
      {active && (
        <span
          className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      )}
    </button>
  )
}

function EmptyBrowse({ onBrowse }) {
  return (
    <div
      className="rounded-2xl py-16 flex flex-col items-center gap-3"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-outline)' }}>newspaper</span>
      <div className="text-[15px] font-semibold" style={{ color: 'var(--color-on-surface)' }}>暂无订阅</div>
      <div className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>
        切换到上方「专栏市场」标签,选择你感兴趣的主题
      </div>
    </div>
  )
}

function EmptyFeed() {
  return (
    <div
      className="rounded-2xl py-12 flex flex-col items-center gap-2"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>notifications_off</span>
      <div className="text-[13px]" style={{ color: 'var(--color-on-surface)' }}>暂无更新</div>
      <div className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>订阅专栏后,新发布的文章将出现在这里</div>
    </div>
  )
}

export default ColumnsPage
