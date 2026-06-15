/**
 * 专栏文章详情页 (09)
 *
 * 路由: /columns/:id/articles/:aid
 *
 * 功能:
 *   - 展示单篇文章(标题/发布时间/摘要/正文/来源)
 *   - 进入即标记已读
 *   - 提供"关联阅读"列表
 *   - 面包屑导航
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useColumnArticles from '../hooks/useColumnArticles'
import NewBadge from '../components/columns/NewBadge'
import { MOCK_COLUMN_ARTICLES } from '../data/mockColumnArticles'

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

function ColumnArticleDetailPage() {
  const { id, aid } = useParams()
  const navigate = useNavigate()
  const { article, loading, fetchArticle, markRead } = useColumnArticles()
  const [related, setRelated] = useState([])

  useEffect(() => {
    let active = true
    fetchArticle(id, aid).then((data) => {
      if (!active) return
      if (data) {
        // 标记已读
        markRead(aid)
        // 计算关联阅读
        const list = MOCK_COLUMN_ARTICLES.filter(
          (a) => a.column_id === id && a.id !== aid
        )
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(0, 4)
        setRelated(list)
      }
    })
    return () => { active = false }
  }, [id, aid, fetchArticle, markRead])

  if (loading || !article) {
    return (
      <main className="flex-1 p-8 mt-16" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
          {loading ? (
            <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--color-on-surface-variant)' }}>progress_activity</span>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-outline)' }}>search_off</span>
              <div className="text-[14px] mt-3" style={{ color: 'var(--color-on-surface)' }}>文章不存在</div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-4 text-[12px] font-medium px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              >
                返回
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-8 mt-16 transition-colors duration-200" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* 响应式: w-full 占满父容器,min-w-0 防止 flex 溢出,max-w-7xl 与专栏列表/详情页宽度一致以减少两侧空白,px 随断点适配 */}
      <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* 文章主体 */}
        <article
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: '0 1px 3px color-mix(in srgb, var(--color-on-surface) 4%, transparent)',
          }}
        >
          {/* 标题 + 返回按钮同行 — 返回按钮在标题左侧(items-center 垂直居中,gap-3 间距标准) */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
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
            {article.is_new && <NewBadge size="md" />}
            <h1
              className="text-2xl font-bold flex-1 min-w-0"
              style={{ color: 'var(--color-on-surface)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {article.title}
            </h1>
          </div>
          <div
            className="text-[12px] flex items-center gap-3 flex-wrap mb-6 pb-6 border-b"
            style={{
              color: 'var(--color-on-surface-variant)',
              borderColor: 'var(--color-outline-variant)',
            }}
          >
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
              {formatDate(article.published_at)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
              {article.read_minutes ?? 5} min read
            </span>
            {article.source && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>source</span>
                  {article.source}
                </span>
              </>
            )}
          </div>

          {/* 正文 */}
          <div
            className="text-[14px] leading-relaxed"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {/* 摘要 */}
            <div
              className="p-4 rounded-lg mb-6"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface-variant)',
                fontStyle: 'normal',
                borderLeft: '3px solid var(--color-primary)',
              }}
            >
              <div className="text-[11px] font-semibold mb-1.5 tracking-wider uppercase" style={{ color: 'var(--color-primary)' }}>
                摘要
              </div>
              {article.summary}
            </div>

            {/* 模拟正文 (扩展摘要为多个段落,营造阅读体验) */}
            <div className="flex flex-col gap-4">
              <p>{article.summary}</p>
              <p>
                在本专题中,我们将系统性地探讨该主题的研究现状、关键技术与工程实践。
                文中观点来自平台专题库及编辑团队的整理,供工程师与研究人员参考。
              </p>
              <h2 className="text-[18px] font-semibold mt-4" style={{ color: 'var(--color-on-surface)' }}>
                一、背景与意义
              </h2>
              <p>
                随着卫星互联网星座规模不断扩大,相关技术也在持续演进。
                围绕主题「{article.column?.topic || '该领域'}」的研究,近年来涌现出大量新方法与新工具。
                把握这些趋势,对测试与运维工作具有重要价值。
              </p>
              <h2 className="text-[18px] font-semibold mt-4" style={{ color: 'var(--color-on-surface)' }}>
                二、关键方法
              </h2>
              <p>
                本文将围绕「{article.title}」展开,重点介绍几种主流方法的适用场景与工程权衡。
                建议结合自身业务需求,选择最适合的技术路线。
              </p>
              <h2 className="text-[18px] font-semibold mt-4" style={{ color: 'var(--color-on-surface)' }}>
                三、总结与展望
              </h2>
              <p>
                综上,该方向仍有许多值得探索的空间。后续我们将持续关注相关进展,
                推出更多专题文章,敬请期待。
              </p>
            </div>
          </div>

          {/* 反馈 */}
          <div
            className="mt-8 pt-6 flex items-center gap-3 border-t"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
              有用
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
              收藏
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>share</span>
              分享
            </button>
          </div>
        </article>

        {/* 关联阅读 */}
        {related.length > 0 && (
          <section className="mt-8">
            <h2
              className="text-[14px] font-semibold mb-3 tracking-wider uppercase"
              style={{ color: 'var(--color-outline)' }}
            >
              关联阅读
            </h2>
            <ul className="flex flex-col gap-2">
              {related.map((r) => (
                <li
                  key={r.id}
                  onClick={() => navigate(`/columns/${id}/articles/${r.id}`)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface-container-lowest)',
                    border: '1px solid var(--color-outline-variant)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-lowest)' }}
                >
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>article</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-on-surface)' }}
                    >{r.title}</div>
                    <div className="text-[11px]" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {formatDate(r.published_at)} · {r.read_minutes ?? 5} min read
                    </div>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: 18 }}>chevron_right</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}

export default ColumnArticleDetailPage
