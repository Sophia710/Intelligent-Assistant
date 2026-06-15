/**
 * 文章已读记录 Hook
 *
 * 提供：
 *   - readIds    当前用户已读文章 ID 的 Set
 *   - refresh()
 *   - markRead(articleId)
 *   - markManyRead(articleIds)
 *   - isRead(articleId)
 *
 * 变更后会向 window 派发 'column-reads-changed' 事件,
 * 供铃铛未读数 / 列表 is_new 标记等组件刷新。
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import mockColumnApi from '../services/mockColumnApi'
import { getReadArticleIds as _getReadArticleIds } from '../data/mockColumnReads'

const EVENT_NAME = 'column-reads-changed'

function emitChanged() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function useColumnReads() {
  const [readIds, setReadIds] = useState(() => _getReadArticleIds())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ids = await mockColumnApi.listMyReads()
      setReadIds(new Set(ids))
    } catch (e) {
      setError(e)
      console.error('[useColumnReads] 刷新已读记录失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (articleId) => {
    await mockColumnApi.markArticleRead(articleId)
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(articleId)
      return next
    })
    emitChanged()
  }, [])

  const markManyRead = useCallback(async (articleIds) => {
    await mockColumnApi.markArticleRead(articleIds[0]) // 内部循环
    setReadIds((prev) => {
      const next = new Set(prev)
      articleIds.forEach((id) => next.add(id))
      return next
    })
    emitChanged()
  }, [])

  const isRead = useCallback(
    (articleId) => readIds.has(articleId),
    [readIds]
  )

  // 监听外部事件,自动同步(用于多组件一致)
  useEffect(() => {
    const handler = () => setReadIds(_getReadArticleIds())
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  return useMemo(
    () => ({
      readIds,
      loading,
      error,
      refresh,
      markRead,
      markManyRead,
      isRead,
    }),
    [readIds, loading, error, refresh, markRead, markManyRead, isRead]
  )
}

export default useColumnReads
export { useColumnReads, EVENT_NAME as COLUMN_READ_EVENT }
