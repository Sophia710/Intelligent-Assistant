/**
 * 专栏通知全局 Context
 *
 * 职责:
 *   - 维护全局未读数 totalUnread
 *   - 维护通知流(最多 20 条) notificationFeed
 *   - 监听订阅/已读变化,自动重算
 *   - 提供 refresh() / markAllRead() 等操作
 *
 * 用法:
 *   1) 入口处用 <ColumnNotificationProvider> 包裹
 *   2) TopBar 内 <ColumnNotificationBell> 读取 useColumnNotification()
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import mockColumnApi from '../services/mockColumnApi'

const ColumnNotificationContext = createContext(null)

export function ColumnNotificationProvider({ children }) {
  const [totalUnread, setTotalUnread] = useState(0)
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(false)
  // 用 ref 防止初次 mount 与事件触发时双重刷新
  const initedRef = useRef(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [unread, items] = await Promise.all([
        mockColumnApi.getTotalUnreadCount(),
        mockColumnApi.getNotificationFeed(20),
      ])
      setTotalUnread(unread)
      setFeed(items)
    } catch (e) {
      console.error('[ColumnNotification] 刷新失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 标记所有未读文章为已读
   */
  const markAllRead = useCallback(async () => {
    const ids = feed.filter((a) => a.is_new).map((a) => a.id)
    await Promise.all(ids.map((id) => mockColumnApi.markArticleRead(id)))
    await refresh()
  }, [feed, refresh])

  /**
   * 标记单条已读
   */
  const markOneRead = useCallback(
    async (articleId) => {
      await mockColumnApi.markArticleRead(articleId)
      await refresh()
    },
    [refresh]
  )

  // 初次加载
  useEffect(() => {
    if (initedRef.current) return
    initedRef.current = true
    refresh()
  }, [refresh])

  // 订阅/已读事件触发时,自动刷新
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('column-subscriptions-changed', handler)
    window.addEventListener('column-reads-changed', handler)
    return () => {
      window.removeEventListener('column-subscriptions-changed', handler)
      window.removeEventListener('column-reads-changed', handler)
    }
  }, [refresh])

  // 跨 Tab 同步:监听 storage 事件
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === 'user:column:subs:v1' ||
        e.key === 'user:column:reads:v1'
      ) {
        refresh()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refresh])

  const value = useMemo(
    () => ({
      totalUnread,
      feed,
      loading,
      refresh,
      markAllRead,
      markOneRead,
    }),
    [totalUnread, feed, loading, refresh, markAllRead, markOneRead]
  )

  return (
    <ColumnNotificationContext.Provider value={value}>
      {children}
    </ColumnNotificationContext.Provider>
  )
}

export function useColumnNotification() {
  const ctx = useContext(ColumnNotificationContext)
  if (!ctx) {
    // 容错:未包裹 Provider 时使用 noop,避免崩溃
    return {
      totalUnread: 0,
      feed: [],
      loading: false,
      refresh: async () => {},
      markAllRead: async () => {},
      markOneRead: async () => {},
    }
  }
  return ctx
}

export default ColumnNotificationContext
