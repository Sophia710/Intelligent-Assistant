import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * 对话列表管理 Hook
 * 获取最近对话、创建新对话、删除对话等操作
 */
function useConversations() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取最近对话列表
  const fetchConversations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/conversations')
      setConversations(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.message)
      console.error('获取对话列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 创建新对话
  const createConversation = async (data) => {
    try {
      const res = await api.post('/conversations', data)
      return res.data
    } catch (err) {
      console.error('创建对话失败:', err)
      throw err
    }
  }

  // 删除对话
  const deleteConversation = async (id) => {
    try {
      await api.del(`/conversations/${id}`)
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('删除对话失败:', err)
      throw err
    }
  }

  // 初始化时加载对话列表
  useEffect(() => {
    fetchConversations()
  }, [])

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    deleteConversation,
  }
}

export default useConversations
