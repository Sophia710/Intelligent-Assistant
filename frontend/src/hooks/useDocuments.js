import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * 文档管理 Hook
 * 知识库内文档的上传、删除、解析状态管理
 */
function useDocuments(knowledgeBaseId) {
  const [documents, setDocuments] = useState([])
  // 与页面解构对齐：导出为 rawStats，供页面与后续聚合统计消费
  const [rawStats, setRawStats] = useState({
    total: 0,
    completed: 0,
    parsing: 0,
    failed: 0,
    storageUsed: '0 B',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取文档列表
  const fetchDocuments = async (kbId, params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/knowledge-bases/${kbId}/documents`, params)
      // 后端约定：{ data: [...], stats: {...} }；缺省兜底为空数组
      setDocuments(Array.isArray(res?.data) ? res.data : [])
      // 更新统计数据（如果后端返回）
      if (res?.stats) {
        setRawStats(res.stats)
      }
    } catch (err) {
      setError(err.message)
      console.error('获取文档列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 上传文档
  const uploadDocument = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      // 文件上传不设置 Content-Type，让浏览器自动设置 multipart/form-data

      const res = await fetch(
        `/api/knowledge-bases/${knowledgeBaseId}/documents`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      )

      if (!res.ok) {
        throw new Error(`上传失败 (${res.status})`)
      }

      const data = await res.json()
      setDocuments((prev) => [...prev, data])
      return data
    } catch (err) {
      console.error('上传文档失败:', err)
      throw err
    }
  }

  // 删除文档
  const deleteDocument = async (docId) => {
    try {
      await api.del(`/knowledge-bases/${knowledgeBaseId}/documents/${docId}`)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
    } catch (err) {
      console.error('删除文档失败:', err)
      throw err
    }
  }

  // 重新触发文档解析
  const reparseDocument = async (docId) => {
    try {
      const res = await api.post(
        `/knowledge-bases/${knowledgeBaseId}/documents/${docId}/reparse`
      )
      // 更新本地文档状态为"解析中"
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId ? { ...d, parse_status: 'parsing' } : d
        )
      )
      return res.data
    } catch (err) {
      console.error('重新解析文档失败:', err)
      throw err
    }
  }

  // 当 knowledgeBaseId 变化时自动加载文档列表
  useEffect(() => {
    if (knowledgeBaseId) {
      fetchDocuments(knowledgeBaseId)
    }
  }, [knowledgeBaseId])

  return {
    documents,
    rawStats,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    reparseDocument,
  }
}

export default useDocuments
