import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * 智能体数据管理 Hook
 * 获取智能体列表、按分类筛选等
 */
function useAgents() {
  const [agents, setAgents] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取智能体列表
  const fetchAgents = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/agents', params)
      // 后端返回格式: { list: Agent[], categories: [], total: number }
      const responseData = res.data || {}
      const data = Array.isArray(responseData.list) ? responseData.list : Array.isArray(resData) ? resData : []
      setAgents(data)
      // 提取分类列表（去重）
      const uniqueCategories = [...new Set(data.map((a) => a.category))]
      setCategories(uniqueCategories)
    } catch (err) {
      setError(err.message)
      console.error('获取智能体列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 根据分类筛选智能体
  const getAgentsByCategory = (category) => {
    if (!category) return agents
    return agents.filter((a) => a.category === category)
  }

  // 使用指定智能体创建新对话
  const startChatWithAgent = async (agentId) => {
    try {
      const res = await api.post('/conversations', {
        agent_id: agentId,
      })
      return res.data
    } catch (err) {
      console.error('使用智能体创建对话失败:', err)
      throw err
    }
  }

  // 初始化时加载智能体列表
  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    categories,
    loading,
    error,
    fetchAgents,
    getAgentsByCategory,
    startChatWithAgent,
  }
}

export default useAgents
