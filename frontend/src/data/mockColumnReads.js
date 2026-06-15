/**
 * 专栏文章已读记录 - 持久化工具（localStorage）
 *
 * Key:  'user:column:reads:v1'
 * Value: ReadRecord[] (数组,JSON 序列化)
 *
 * ReadRecord 字段（与 PRD §4.6.4 表 4 对齐）：
 *   id, user_id, article_id, read_at
 */

const STORAGE_KEY = 'user:column:reads:v1'
const CURRENT_USER_ID = 'user-001'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[mockColumnReads] 读取 localStorage 失败', e)
    return []
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('[mockColumnReads] 写入 localStorage 失败', e)
  }
}

function genId() {
  return `read-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 获取当前用户已读文章 ID 集合
 * @returns {Set<string>}
 */
function getReadArticleIds() {
  const all = readAll().filter((r) => r.user_id === CURRENT_USER_ID)
  return new Set(all.map((r) => r.article_id))
}

/**
 * 标记文章已读（幂等）
 */
function markRead(articleId) {
  const all = readAll()
  const existed = all.find(
    (r) => r.user_id === CURRENT_USER_ID && r.article_id === articleId
  )
  if (existed) return existed
  const rec = {
    id: genId(),
    user_id: CURRENT_USER_ID,
    article_id: articleId,
    read_at: new Date().toISOString(),
  }
  all.push(rec)
  writeAll(all)
  return rec
}

/**
 * 批量标记已读
 */
function markManyRead(articleIds) {
  const all = readAll()
  const existedIds = new Set(
    all.filter((r) => r.user_id === CURRENT_USER_ID).map((r) => r.article_id)
  )
  const now = new Date().toISOString()
  articleIds.forEach((aid) => {
    if (existedIds.has(aid)) return
    all.push({
      id: genId(),
      user_id: CURRENT_USER_ID,
      article_id: aid,
      read_at: now,
    })
  })
  writeAll(all)
}

/**
 * 清除当前用户所有已读记录（用于测试 / 重置）
 */
function clearAll() {
  writeAll([])
}

export {
  STORAGE_KEY,
  CURRENT_USER_ID,
  getReadArticleIds,
  markRead,
  markManyRead,
  clearAll,
  readAll,
}
