/**
 * 我的订阅页 (10)
 *
 * 路由: /columns/my-subscriptions
 *
 * 功能:
 *   - 双 Tab: [订阅的专栏] [更新流]
 *   - 三种排序:最近更新 / 订阅时间 / 专栏名称
 *   - 订阅卡:退订/查看/跳转到文章详情
 *   - 更新流:按时间倒序展示所有订阅专栏的文章
 *   - 空状态:引导到专栏市场
 */

import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useColumnSubscriptions from '../hooks/useColumnSubscriptions'
import MyColumnSubscriptionCard from '../components/columns/MyColumnSubscriptionCard'
import NewBadge from '../components/columns/NewBadge'
import { useToast } from '../contexts/ToastContext'
import { useColumnNotification } from '../contexts/ColumnNotificationContext'

const SORT_OPTIONS = [
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

function MyColumnSubscriptionsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { subscriptions, loading, unsubscribe } = useColumnSubscriptions()
  const { feed: notifFeed } = useColumnNotification()
  const [tab, setTab] = useState('subscribed') // 'subscribed' | 'feed'
  const [sortKey, setSortKey] = useState('latest')

  // 排序
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

  // 退订
  const handleUnsubscribe = async (sub) => {
    try {
      await unsubscribe(sub.column_id)
      toast.info(`已退订「${sub.column?.name}」`)
    } catch {
      toast.error('退订失败,请重试')
    }
  }

  return (
    <main className="flex-1 p-8 mt-16 transition-colors duration-200" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto">
        {/* 面包屑 */}
        <div className="flex items-center gap-2 text-[12px] mb-4" style={{ color: 'var(--color-on-surface-variant)' }}>
          <Link to="/knowledge-base" className="hover:text-[var(--color-primary)]">知识库</Link>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span style={{ color: 'var(--color-on-surface)' }}>我的订阅</span>
        </div>

        {/* 标题 */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              我的订阅
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
              管理已订阅的专栏,优先查看更新流。
            </p>
          </div>

          {/* 排序 */}
          {tab === 'subscribed' && subscriptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>排序:</span>
              <div
                className="flex items-center gap-1 rounded-lg p-1"
                style={{ backgroundColor: 'var(--color-surface-container-low)' }}
              >
                {SORT_OPTIONS.map((opt) => {
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
        </div>

        {/* Tab 切换 */}
        <div
          className="flex items-center gap-6 border-b mb-5"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <TabButton
            active={tab === 'subscribed'}
            onClick={() => setTab('subscribed')}
            badge={subscriptions.length}
          >
            订阅的专栏
          </TabButton>
          <TabButton
            active={tab === 'feed'}
            onClick={() => setTab('feed')}
            badge={notifFeed.filter((a) => a.is_new).length}
            badgeColor="error"
          >
            更新流
          </TabButton>
        </div>

        {/* 加载中 */}
        {loading ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--color-on-surface-variant)' }}>progress_activity</span>
          </div>
        ) : tab === 'subscribed' ? (
          // 订阅列表
          sorted.length === 0 ? (
            <EmptyState onBrowse={() => navigate('/columns')} />
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
        ) : (
          // 更新流
          notifFeed.length === 0 ? (
            <FeedEmpty onBrowse={() => navigate('/columns')} />
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
          )
        )}
      </div>
    </main>
  )
}

function TabButton({ active, onClick, badge, badgeColor = 'primary', children }) {
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

function EmptyState({ onBrowse }) {
  return (
    <div
      className="rounded-2xl py-16 flex flex-col items-center gap-3"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-outline)' }}>
        newspaper
      </span>
      <div className="text-[15px] font-semibold" style={{ color: 'var(--color-on-surface)' }}>
        暂无订阅
      </div>
      <div className="text-[12px]" style={{ color: 'var(--color-on-surface-variant)' }}>
        去专栏市场逛逛,选择你感兴趣的主题
      </div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          boxShadow: '0 2px 6px color-mix(in srgb, var(--color-primary) 25%, transparent)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>explore</span>
        浏览专栏市场
      </button>
    </div>
  )
}

function FeedEmpty({ onBrowse }) {
  return (
    <div
      className="rounded-2xl py-12 flex flex-col items-center gap-2"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-outline)' }}>
        notifications_off
      </span>
      <div className="text-[13px]" style={{ color: 'var(--color-on-surface)' }}>
        暂无更新
      </div>
      <div className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
        订阅专栏后,新发布的文章将出现在这里
      </div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-2 text-[12px] font-medium px-3 py-1.5 rounded-lg"
        style={{ color: 'var(--color-primary)' }}
      >
        去专栏市场 →
      </button>
    </div>
  )
}

export default MyColumnSubscriptionsPage
