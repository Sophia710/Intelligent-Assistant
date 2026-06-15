/**
 * 专栏订阅关系 - 持久化工具（localStorage）
 *
 * Key:  'user:column:subs:v1'
 * Value: Subscription[] (数组,JSON 序列化)
 *
 * Subscription 字段（与 PRD §4.6.4 表 3 对齐）：
 *   id, user_id, column_id, status, subscribed_at, updated_at
 *
 * 注意：本期为纯前端 mock,所有用户共用一个 user_id('user-001')。
 * 多用户场景下应改为在 storage key 中拼接 user_id。
 */

const STORAGE_KEY = 'user:column:subs:v1'
const CURRENT_USER_ID = 'user-001'

/**
 * 读取全部订阅记录
 */
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.warn('[mockColumnSubscriptions] 读取 localStorage 失败', e)
    return []
  }
}

/**
 * 写入全部订阅记录
 */
function writeAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('[mockColumnSubscriptions] 写入 localStorage 失败', e)
  }
}

/**
 * 生成简单 ID
 */
function genId() {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 获取当前用户的 active 订阅列表
 * @returns {Array<{id, user_id, column_id, status, subscribed_at, updated_at}>}
 */
function listMyActive() {
  return readAll().filter(
    (s) => s.user_id === CURRENT_USER_ID && s.status === 'active'
  )
}

/**
 * 判断当前用户是否订阅了某专栏
 */
function isSubscribed(columnId) {
  return readAll().some(
    (s) => s.user_id === CURRENT_USER_ID && s.column_id === columnId && s.status === 'active'
  )
}

/**
 * 订阅
 */
function subscribe(columnId) {
  const all = readAll()
  // 已存在 active 记录直接返回
  const existed = all.find(
    (s) => s.user_id === CURRENT_USER_ID && s.column_id === columnId
  )
  if (existed && existed.status === 'active') {
    return existed
  }
  const now = new Date().toISOString()
  if (existed) {
    // 之前取消过,重新激活
    existed.status = 'active'
    existed.subscribed_at = now
    existed.updated_at = now
    writeAll(all)
    return existed
  }
  const sub = {
    id: genId(),
    user_id: CURRENT_USER_ID,
    column_id: columnId,
    status: 'active',
    subscribed_at: now,
    updated_at: now,
  }
  all.push(sub)
  writeAll(all)
  return sub
}

/**
 * 取消订阅
 */
function unsubscribe(columnId) {
  const all = readAll()
  const existed = all.find(
    (s) => s.user_id === CURRENT_USER_ID && s.column_id === columnId
  )
  if (!existed) return { success: true }
  existed.status = 'unsubscribed'
  existed.updated_at = new Date().toISOString()
  writeAll(all)
  return { success: true }
}

/**
 * 清除当前用户的所有订阅（用于测试 / 重置）
 */
function clearAll() {
  writeAll([])
}

export {
  STORAGE_KEY,
  CURRENT_USER_ID,
  listMyActive,
  isSubscribed,
  subscribe,
  unsubscribe,
  clearAll,
  readAll,
}
