/**
 * 专栏详情页 (08)
 *
 * 路由: /columns/:id
 *
 * 功能:
 *   - 展示专栏元数据(封面、描述、订阅数、文章数)
 *   - 订阅/退订按钮
 *   - 文章列表(按 published_at 倒序,带 is_new 标记)
 *   - 点击文章跳转到文章详情
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useColumns from '../hooks/useColumns'
import useColumnArticles from '../hooks/useColumnArticles'
import useColumnSubscriptions from '../hooks/useColumnSubscriptions'
import ColumnSubscribeButton from '../components/columns/ColumnSubscribeButton'
import ColumnArticleListItem from '../components/columns/ColumnArticleListItem'
import { useToast } from '../contexts/ToastContext'

function ColumnDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { getColumn } = useColumns()
  const { articles, total, loading, fetchArticles } = useColumnArticles()
  const { subscribedIds, subscribe, unsubscribe } = useColumnSubscriptions()
  const [column, setColumn] = useState(null)
  const [loadingCol, setLoadingCol] = useState(true)

  useEffect(() => {
    let active = true
    setLoadingCol(true)
    getColumn(id).then((data) => {
      if (!active) return
      setColumn(data)
      setLoadingCol(false)
    })
    return () => { active = false }
  }, [id, getColumn])

  useEffect(() => {
    fetchArticles(id, { page: 1, pageSize: 50 })
  }, [id, fetchArticles])

  const isSubscribed = subscribedIds.has(id)

  const handleSubscribe = async () => {
    try {
      await subscribe(id)
      toast.success('订阅成功')
      // 触发一次重新获取以更新订阅数
      const fresh = await getColumn(id)
      if (fresh) setColumn(fresh)
    } catch {
      toast.error('订阅失败,请重试')
    }
  }
  const handleUnsubscribe = async () => {
    try {
      await unsubscribe(id)
      toast.info('已取消订阅')
      const fresh = await getColumn(id)
      if (fresh) setColumn(fresh)
    } catch {
      toast.error('取消订阅失败')
    }
  }

  if (loadingCol) {
    return (
      <main className="flex-1 p-8 mt-16" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--color-on-surface-variant)' }}>progress_activity</span>
        </div>
      </main>
    )
  }

  if (!column) {
    return (
      <main className="flex-1 p-8 mt-16" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline)' }}>search_off</span>
          <div className="text-[14px] mt-3" style={{ color: 'var(--color-on-surface)' }}>专栏不存在</div>
          <button
            type="button"
            onClick={() => navigate('/columns')}
            className="mt-4 text-[12px] font-medium px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            返回专栏市场
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-8 mt-16 transition-colors duration-200" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* 响应式: w-full 占满父容器,min-w-0 防止 flex 溢出,max-w-7xl 与专栏列表页宽度一致以减少两侧空白,px 随断点适配 */}
      <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* 头部卡片 */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
          }}
        >
          {/* 封面 */}
          <div
            className="relative h-44 flex items-center justify-center"
            style={{ background: column.cover_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 64, color: '#FFFFFF', fontVariationSettings: "'FILL' 1, 'wght' 300" }}
            >
              {column.icon || 'satellite_alt'}
            </span>
            <span
              className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: 'var(--color-on-surface)',
              }}
            >
              {column.topic}
            </span>
          </div>

          {/* 元数据 */}
          <div className="p-6">
            {/* 标题 + 返回按钮同行 — 返回按钮在标题左侧(items-center 垂直居中,gap-3 间距标准,与文章详情页保持一致) */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 active:scale-[0.97] shrink-0"
                style={{
                  color: 'var(--color-on-surface)',
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  boxShadow: '0 1px 2px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)'
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                  e.currentTarget.style.boxShadow = '0 2px 6px color-mix(in srgb, var(--color-primary) 18%, transparent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-on-surface)'
                  e.currentTarget.style.borderColor = 'var(--color-outline-variant)'
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)'
                  e.currentTarget.style.boxShadow = '0 1px 2px color-mix(in srgb, var(--color-on-surface) 4%, transparent)'
                }}
              >
                <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-translate-x-0.5">arrow_back</span>
                返回
              </button>
              <h1
                className="text-2xl font-bold flex-1 min-w-0"
                style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {column.name}
              </h1>
            </div>
            <p
              className="text-[14px] mt-2 leading-relaxed"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              {column.description}
            </p>
            <div
              className="mt-4 flex items-center gap-4 text-[12px] flex-wrap"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>label</span>
                {column.topic}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                {column.subscriber_count ?? 0} 订阅
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>article</span>
                {total ?? column.article_count ?? 0} 篇
              </span>
            </div>

            {/* 关键词 */}
            {column.topic_keywords && column.topic_keywords.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[11px]" style={{ color: 'var(--color-outline)' }}>关键词:</span>
                {column.topic_keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* 订阅按钮 */}
            <div className="mt-5">
              <ColumnSubscribeButton
                subscribed={isSubscribed}
                onSubscribe={handleSubscribe}
                onUnsubscribe={handleUnsubscribe}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-[16px] font-semibold"
              style={{ color: 'var(--color-on-surface)' }}
            >
              全部文章 ({total ?? articles.length})
            </h2>
            <span className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
              按发布时间倒序
            </span>
          </div>
          {loading ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--color-on-surface-variant)' }}>progress_activity</span>
            </div>
          ) : articles.length === 0 ? (
            <div
              className="rounded-xl py-12 text-center text-[13px]"
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              该专栏暂无文章
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {articles.map((a) => (
                <ColumnArticleListItem
                  key={a.id}
                  article={a}
                  onClick={(article) => navigate(`/columns/${id}/articles/${article.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default ColumnDetailPage
