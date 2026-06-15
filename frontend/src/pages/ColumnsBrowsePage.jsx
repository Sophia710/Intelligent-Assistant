/**
 * 专栏市场页面 (07)
 *
 * 路由: /columns
 *
 * 功能:
 *   - 展示所有启用专栏,支持搜索、主题过滤、订阅状态过滤
 *   - 点击卡片进入专栏详情
 *   - 订阅/退订按钮(接入 useColumnSubscriptions)
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useColumns from '../hooks/useColumns'
import useColumnSubscriptions from '../hooks/useColumnSubscriptions'
import ColumnCard from '../components/columns/ColumnCard'
import ColumnTopicChip from '../components/columns/ColumnTopicChip'
import { useToast } from '../contexts/ToastContext'

const FILTER_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'subscribed', label: '已订阅' },
  { key: 'unsubscribed', label: '未订阅' },
]

function ColumnsBrowsePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { columns, loading } = useColumns()
  const { subscribedIds, subscribe, unsubscribe } = useColumnSubscriptions()
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState('all')
  const [topic, setTopic] = useState(null)

  // 计算主题列表(从 columns 派生)
  const topics = useMemo(() => {
    const set = new Set(columns.map((c) => c.topic).filter(Boolean))
    return Array.from(set)
  }, [columns])

  // 过滤 + 搜索
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

  // 列表变化时同步 is_subscribed
  const decorated = useMemo(
    () =>
      filtered.map((c) => ({
        ...c,
        is_subscribed: subscribedIds.has(c.id),
      })),
    [filtered, subscribedIds]
  )

  const handleSubscribe = async (col) => {
    try {
      await subscribe(col.id)
      toast.success(`已订阅「${col.name}」`)
    } catch (e) {
      toast.error('订阅失败,请重试')
    }
  }

  const handleUnsubscribe = async (col) => {
    try {
      await unsubscribe(col.id)
      toast.info(`已取消订阅「${col.name}」`)
    } catch (e) {
      toast.error('取消订阅失败')
    }
  }

  return (
    <main
      className="flex-1 p-8 mt-16 transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 标题 + 面包屑 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] mb-2" style={{ color: 'var(--color-on-surface-variant)' }}>
            <span>知识库</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            <span style={{ color: 'var(--color-on-surface)' }}>专栏市场</span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            专栏市场
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
            探索系统精选的卫星互联网主题专栏,订阅感兴趣的主题,获取专业更新。
          </p>
        </div>

        {/* 搜索 + 过滤 */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* 搜索框 */}
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
            {/* 状态过滤 */}
            <div className="flex items-center gap-1 rounded-lg p-1"
              style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              {FILTER_OPTIONS.map((opt) => {
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

          {/* 主题 chips */}
          <div className="flex items-center gap-2 flex-wrap">
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
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline)' }}>
              search_off
            </span>
            <div className="text-[14px]" style={{ color: 'var(--color-on-surface)' }}>
              没有匹配的专栏
            </div>
            <button
              type="button"
              onClick={() => { setKeyword(''); setFilter('all'); setTopic(null) }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
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
    </main>
  )
}

export default ColumnsBrowsePage
