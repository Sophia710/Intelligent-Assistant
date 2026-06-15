/**
 * 专栏列表/详情 Hook
 *
 * 提供：
 *   - columns  全部启用专栏(已 decorate 包含 article_count 与 is_subscribed)
 *   - loading  加载状态
 *   - error    错误对象
 *   - fetchColumns(topic?)
 *   - getColumn(id)  →  异步获取单个专栏
 *   - refresh()      强制刷新
 *
 * 与 useColumnSubscriptions 配合:订阅关系变化时,本 Hook 应被调用方重新拉取以更新 is_subscribed。
 */

import { useState, useEffect, useCallback } from 'react'
import mockColumnApi from '../services/mockColumnApi'

function useColumns() {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchColumns = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await mockColumnApi.listColumns(params)
      setColumns(data)
    } catch (e) {
      setError(e)
      console.error('[useColumns] 获取专栏列表失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const getColumn = useCallback(async (id) => {
    try {
      return await mockColumnApi.getColumn(id)
    } catch (e) {
      console.error('[useColumns] 获取专栏详情失败:', e)
      return null
    }
  }, [])

  // 初次加载
  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  return {
    columns,
    loading,
    error,
    fetchColumns,
    getColumn,
    refresh: () => fetchColumns(),
  }
}

export default useColumns
export { useColumns }
