/**
 * 专栏 Mock API 服务
 *
 * 设计目标：
 *   模拟一组 RESTful 接口,字段形状与 PRD §4.6.6 一致。
 *   数据源:
 *     - 专栏 / 文章:静态 mock 文件(只读)
 *     - 订阅 / 已读: localStorage(可写)
 *   所有方法返回 Promise,使用 setTimeout 模拟网络延迟。
 *
 * 不使用真实的 fetch - 避免在测试中真正发起 HTTP 请求。
 */

import { MOCK_COLUMNS } from '../data/mockColumns'
import { MOCK_COLUMN_ARTICLES } from '../data/mockColumnArticles'
import {
  listMyActive as _listMyActive,
  isSubscribed as _isSubscribed,
  subscribe as _subscribe,
  unsubscribe as _unsubscribe,
} from '../data/mockColumnSubscriptions'
import {
  getReadArticleIds as _getReadArticleIds,
  markRead as _markRead,
  markManyRead as _markManyRead,
} from '../data/mockColumnReads'

const LATENCY_MS = 80 // mock 延迟

const delay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), LATENCY_MS))

/* ============================================================
 *  内部工具
 * ============================================================ */

/**
 * 聚合专栏元数据：附加 article_count 与 is_subscribed
 */
function decorateColumn(col, userSubs) {
  const articleCount = MOCK_COLUMN_ARTICLES.filter(
    (a) => a.column_id === col.id
  ).length
  return {
    ...col,
    article_count: articleCount,
    is_subscribed: userSubs.some((s) => s.column_id === col.id),
  }
}

/**
 * 判定 is_new
 *   is_new = (read_at IS NULL) AND (published_at > subscribed_at)
 */
function judgeIsNew(article, subscribedAt, readIds) {
  if (!subscribedAt) return false
  if (readIds.has(article.id)) return false
  const pub = new Date(article.published_at).getTime()
  const sub = new Date(subscribedAt).getTime()
  return pub > sub
}

/**
 * 计算专栏的未读文章数
 */
function countUnread(columnId, articles, subs, readIds) {
  const sub = subs.find((s) => s.column_id === columnId)
  if (!sub) return 0
  return articles
    .filter((a) => a.column_id === columnId)
    .filter((a) => judgeIsNew(a, sub.subscribed_at, readIds)).length
}

/* ============================================================
 *  公开 API
 * ============================================================ */

/**
 * GET /api/columns
 * @param {object} params
 *   - topic?: string  按主题过滤
 */
async function listColumns(params = {}) {
  const userSubs = _listMyActive()
  let list = MOCK_COLUMNS.filter((c) => c.is_active)
  if (params.topic) {
    list = list.filter((c) => c.topic === params.topic)
  }
  const decorated = list
    .map((c) => decorateColumn(c, userSubs))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  return delay(decorated)
}

/**
 * GET /api/columns/:id
 */
async function getColumn(id) {
  const col = MOCK_COLUMNS.find((c) => c.id === id && c.is_active)
  if (!col) {
    return delay(null)
  }
  const userSubs = _listMyActive()
  return delay(decorateColumn(col, userSubs))
}

/**
 * GET /api/columns/:id/articles
 * @param {object} params
 *   - page?: number  (默认 1)
 *   - pageSize?: number (默认 20)
 */
async function listColumnArticles(id, params = {}) {
  const col = MOCK_COLUMNS.find((c) => c.id === id)
  if (!col) return delay({ items: [], total: 0, page: 1, pageSize: 20 })
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 20))

  const all = MOCK_COLUMN_ARTICLES.filter((a) => a.column_id === id).sort(
    (a, b) => new Date(b.published_at) - new Date(a.published_at)
  )
  const start = (page - 1) * pageSize
  const items = all.slice(start, start + pageSize)

  const userSubs = _listMyActive()
  const sub = userSubs.find((s) => s.column_id === id)
  const readIds = _getReadArticleIds()
  const decorated = items.map((a) => ({
    ...a,
    is_new: sub ? judgeIsNew(a, sub.subscribed_at, readIds) : false,
  }))

  return delay({
    items: decorated,
    total: all.length,
    page,
    pageSize,
  })
}

/**
 * GET /api/columns/:id/articles/:aid
 */
async function getColumnArticle(id, aid) {
  const article = MOCK_COLUMN_ARTICLES.find(
    (a) => a.id === aid && a.column_id === id
  )
  if (!article) return delay(null)
  const userSubs = _listMyActive()
  const sub = userSubs.find((s) => s.column_id === id)
  const readIds = _getReadArticleIds()
  return delay({
    ...article,
    is_new: sub ? judgeIsNew(article, sub.subscribed_at, readIds) : false,
    column: MOCK_COLUMNS.find((c) => c.id === id) || null,
  })
}

/**
 * GET /api/columns/articles/recent
 * 全部专栏最近文章(用于推送流)
 * @param {object} params
 *   - limit?: number (默认 30)
 */
async function listRecentArticles(params = {}) {
  const limit = Math.max(1, Math.min(200, Number(params.limit) || 30))
  const all = [...MOCK_COLUMN_ARTICLES].sort(
    (a, b) => new Date(b.published_at) - new Date(a.published_at)
  )
  const userSubs = _listMyActive()
  const readIds = _getReadArticleIds()
  const subByCol = userSubs.reduce((acc, s) => {
    acc[s.column_id] = s
    return acc
  }, {})
  const items = all.slice(0, limit).map((a) => {
    const sub = subByCol[a.column_id]
    const col = MOCK_COLUMNS.find((c) => c.id === a.column_id)
    return {
      ...a,
      is_new: sub ? judgeIsNew(a, sub.subscribed_at, readIds) : false,
      column: col ? { id: col.id, name: col.name, topic: col.topic } : null,
    }
  })
  return delay(items)
}

/**
 * GET /api/columns/subscriptions/me
 * 当前用户的订阅列表(含专栏信息)
 */
async function listMySubscriptions() {
  const userSubs = _listMyActive()
  const readIds = _getReadArticleIds()
  const items = userSubs
    .map((s) => {
      const col = MOCK_COLUMNS.find((c) => c.id === s.column_id)
      if (!col) return null
      const articles = MOCK_COLUMN_ARTICLES.filter(
        (a) => a.column_id === col.id
      )
      const unreadCount = countUnread(col.id, articles, userSubs, readIds)
      const sortedArticles = [...articles].sort(
        (a, b) => new Date(b.published_at) - new Date(a.published_at)
      )
      return {
        ...s,
        column: { ...col },
        unread_count: unreadCount,
        latest_articles: sortedArticles.slice(0, 3),
        latest_published_at:
          sortedArticles[0]?.published_at || s.subscribed_at,
      }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.latest_published_at) - new Date(a.latest_published_at)
    )
  return delay(items)
}

/**
 * POST /api/columns/:id/subscribe
 */
async function subscribeColumn(id) {
  const col = MOCK_COLUMNS.find((c) => c.id === id)
  if (!col) {
    return delay({ success: false, message: '专栏不存在' })
  }
  const sub = _subscribe(id)
  return delay({ success: true, subscription: sub })
}

/**
 * DELETE /api/columns/:id/subscribe
 */
async function unsubscribeColumn(id) {
  const res = _unsubscribe(id)
  return delay({ success: res.success })
}

/**
 * POST /api/columns/articles/:aid/read
 */
async function markArticleRead(aid) {
  const rec = _markRead(aid)
  return delay({ success: true, record: rec })
}

/**
 * GET /api/columns/articles/me/reads
 */
async function listMyReads() {
  return delay(Array.from(_getReadArticleIds()))
}

/**
 * 工具方法（业务层 Hook 使用）：
 *  - 计算当前用户的总未读数（用于铃铛）
 */
async function getTotalUnreadCount() {
  const subs = _listMyActive()
  const readIds = _getReadArticleIds()
  let total = 0
  subs.forEach((s) => {
    const unread = MOCK_COLUMN_ARTICLES.filter((a) => a.column_id === s.column_id)
      .filter((a) => judgeIsNew(a, s.subscribed_at, readIds)).length
    total += unread
  })
  return delay(total)
}

/**
 * 工具方法：通知流(只包含当前用户已订阅专栏的文章,按 published_at 倒序,带 is_new)
 */
async function getNotificationFeed(limit = 20) {
  const subs = _listMyActive()
  const subByCol = subs.reduce((acc, s) => {
    acc[s.column_id] = s
    return acc
  }, {})
  const readIds = _getReadArticleIds()
  const items = MOCK_COLUMN_ARTICLES
    .filter((a) => subByCol[a.column_id])
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, limit)
    .map((a) => {
      const sub = subByCol[a.column_id]
      const col = MOCK_COLUMNS.find((c) => c.id === a.column_id)
      return {
        ...a,
        is_new: judgeIsNew(a, sub.subscribed_at, readIds),
        column: col ? { id: col.id, name: col.name, topic: col.topic, icon: col.icon } : null,
      }
    })
  return delay(items)
}

/**
 * 工具方法:获取所有已订阅专栏(无订阅时返回空数组)
 */
async function getSubscribedColumnIds() {
  return delay(_listMyActive().map((s) => s.column_id))
}

const mockColumnApi = {
  listColumns,
  getColumn,
  listColumnArticles,
  getColumnArticle,
  listRecentArticles,
  listMySubscriptions,
  subscribeColumn,
  unsubscribeColumn,
  markArticleRead,
  listMyReads,
  getTotalUnreadCount,
  getNotificationFeed,
  getSubscribedColumnIds,
}

export default mockColumnApi
export { mockColumnApi }
