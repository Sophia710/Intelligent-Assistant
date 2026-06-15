/**
 * 专栏文章 Hook
 *
 * 提供：
 *   - articles        专栏内文章列表(已带 is_new 标记)
 *   - article         单篇文章(详情页)
 *   - total           文章总数
 *   - loading / error
 *   - fetchArticles(columnId, { page, pageSize })
 *   - fetchArticle(columnId, articleId)
 *   - markRead(articleId)   标记已读
 */

import { useState, useCallback } from 'react'
import mockColumnApi from '../services/mockColumnApi'

function useColumnArticles() {
  const [articles, setArticles] = useState([])
  const [article, setArticle] = useState(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchArticles = useCallback(async (columnId, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await mockColumnApi.listColumnArticles(columnId, params)
      setArticles(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e)
      console.error('[useColumnArticles] 获取文章列表失败:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchArticle = useCallback(async (columnId, articleId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await mockColumnApi.getColumnArticle(columnId, articleId)
      setArticle(data)
      return data
    } catch (e) {
      setError(e)
      console.error('[useColumnArticles] 获取文章详情失败:', e)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (articleId) => {
    try {
      await mockColumnApi.markArticleRead(articleId)
      // 同步本地状态:把已读的文章 is_new 置 false
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, is_new: false } : a))
      )
      setArticle((prev) => (prev && prev.id === articleId ? { ...prev, is_new: false } : prev))
    } catch (e) {
      console.error('[useColumnArticles] 标记已读失败:', e)
    }
  }, [])

  return {
    articles,
    article,
    total,
    loading,
    error,
    fetchArticles,
    fetchArticle,
    markRead,
  }
}

export default useColumnArticles
export { useColumnArticles }
