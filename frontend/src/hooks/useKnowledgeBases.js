import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * 知识库管理 Hook
 * 知识库列表 CRUD 操作
 */
function useKnowledgeBases() {
  const [knowledgeBases, setKnowledgeBases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取知识库列表
  const fetchKnowledgeBases = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/knowledge-bases')
      setKnowledgeBases(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.message)
      console.error('获取知识库列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 新建知识库
  const createKnowledgeBase = async (data) => {
    try {
      const res = await api.post('/knowledge-bases', data)
      setKnowledgeBases((prev) => [...prev, res.data])
      return res.data
    } catch (err) {
      console.error('新建知识库失败:', err)
      throw err
    }
  }

  // 编辑知识库
  const updateKnowledgeBase = async (id, data) => {
    try {
      const res = await api.put(`/knowledge-bases/${id}`, data)
      setKnowledgeBases((prev) =>
        prev.map((kb) => (kb.id === id ? res.data : kb))
      )
      return res.data
    } catch (err) {
      console.error('编辑知识库失败:', err)
      throw err
    }
  }

  // 删除知识库
  const deleteKnowledgeBase = async (id) => {
    try {
      await api.del(`/knowledge-bases/${id}`)
      setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id))
    } catch (err) {
      console.error('删除知识库失败:', err)
      throw err
    }
  }

  // 初始化时加载知识库列表
  useEffect(() => {
    fetchKnowledgeBases()
  }, [])

  return {
    knowledgeBases,
    loading,
    error,
    fetchKnowledgeBases,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
  }
}

export default useKnowledgeBases
