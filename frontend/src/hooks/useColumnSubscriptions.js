/**
 * 订阅关系 Hook
 *
 * 提供：
 *   - subscriptions  当前用户的订阅列表(含专栏信息、未读数、最近文章等)
 *   - subscribedIds  已订阅专栏 ID 集合(Set<string>)
 *   - loading
 *   - fetchSubscriptions()
 *   - subscribe(columnId)   订阅并刷新
 *   - unsubscribe(columnId) 取消订阅并刷新
 *   - isSubscribed(columnId)
 *
 * 变更后会向 window 派发 'column-subscriptions-changed' 事件,
 * 供 ColumnNotificationContext / TopBar 铃铛等组件监听并刷新未读数。
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import mockColumnApi from '../services/mockColumnApi'
import { isSubscribed as _isSubscribed, subscribe as _subscribe, unsubscribe as _unsubscribe } from '../data/mockColumnSubscriptions'

const EVENT_NAME = 'column-subscriptions-changed'

function emitChanged() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function useColumnSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await mockColumnApi.listMySubscriptions()
      setSubscriptions(data)
    } catch (e) {
      setError(e)
      console.error('[useColumnSubscriptions] 获取订阅列表失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初次加载
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  /**
   * 订阅
   */
  const subscribe = useCallback(
    async (columnId) => {
      const res = await mockColumnApi.subscribeColumn(columnId)
      if (res.success) {
        await fetchSubscriptions()
        emitChanged()
      }
      return res
    },
    [fetchSubscriptions]
  )

  /**
   * 取消订阅
   */
  const unsubscribe = useCallback(
    async (columnId) => {
      const res = await mockColumnApi.unsubscribeColumn(columnId)
      if (res.success) {
        await fetchSubscriptions()
        emitChanged()
      }
      return res
    },
    [fetchSubscriptions]
  )

  /**
   * 同步判断(不触发请求)
   */
  const isSubscribed = useCallback((columnId) => _isSubscribed(columnId), [])

  /**
   * 已订阅 ID 集合(派生)
   */
  const subscribedIds = useMemo(
    () => new Set(subscriptions.map((s) => s.column_id)),
    [subscriptions]
  )

  // 监听其它地方触发的事件,自动刷新(用于多个组件保持一致)
  useEffect(() => {
    const handler = () => fetchSubscriptions()
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [fetchSubscriptions])

  return {
    subscriptions,
    subscribedIds,
    loading,
    error,
    fetchSubscriptions,
    subscribe,
    unsubscribe,
    isSubscribed,
  }
}

export default useColumnSubscriptions
export { useColumnSubscriptions, EVENT_NAME as COLUMN_SUBS_EVENT }
