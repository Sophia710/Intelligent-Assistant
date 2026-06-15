import { useState, useCallback, useLayoutEffect } from 'react'
import api from '../services/api'
import {
  MOCK_CONVERSATION_DATASETS,
  getConversationMeta,
  getConversationMessages,
} from '../data/mockConversations'

// 重新导出,供其他模块使用
export { getConversationMeta, getConversationMessages }

/**
 * 消息管理 Hook
 * 提供：发送消息、获取历史消息、提交反馈、重新生成
 */

/* 模拟数据集已迁移至 `data/mockConversations.js`,此处保留 hook 即可
 * 失败消息的字段约定(向后兼容):
 *   status: 'failed'                 // 触发失败状态 UI
 *   content: '...'                   // 失败提示文本(用户可读)
 *   error: '...'                     // 失败原因(细颗粒度)
 *   retry_content: '...'             // 点击「重试」时使用的成功内容
 * ============================================================== */

function useMessages(conversationId) {
  // 初始状态：按 conversationId 命中 mock，否则返回空数组（强制首轮用户发起）
  const [messages, setMessages] = useState(() => getConversationMessages(conversationId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取指定对话的消息历史
  // 关键修复:每次 conversationId 变化时,先**同步**把 mock 数据灌入 state,
  // 保证 UI 立即显示该会话的内容,再尝试调用后端 API 覆盖(后端不可用时保留 mock)。
  // 对已知 mock 会话,直接使用本地数据,跳过网络请求以提升加载速度与稳定性。
  const fetchMessages = async (convId) => {
    if (!convId) {
      setMessages([])
      return
    }
    // 1) 同步把 mock 数据写入 state(此时 React 还没 render,所以渲染用的就是新数据)
    setMessages(getConversationMessages(convId))
    // 已知 mock 对话:无需再调后端,直接返回(后端真实接通后会扩展为「优先 mock → 再尝试后端」)
    if (MOCK_CONVERSATION_DATASETS[convId]) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/conversations/${convId}/messages`)
      // 后端返回非空数组时覆盖默认 mock；返回空数组则保留默认数据
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMessages(res.data)
      }
    } catch (err) {
      // 后端不可用时保留 mock 数据，不向用户暴露错误
      console.warn('获取消息历史失败，使用默认模拟数据:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  // 当 conversationId 变化时,立即同步灌入 mock,再异步尝试拉后端数据
  // 使用 useLayoutEffect 避免首帧仍显示旧对话的 messages,造成视觉抖动
  useLayoutEffect(() => {
    if (conversationId) {
      setMessages(getConversationMessages(conversationId))
      fetchMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId])

  // 发送消息
  const sendMessage = useCallback(async (content) => {
    if (!conversationId || !content.trim()) return

    // 先乐观更新 UI：添加用户消息
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        content: content.trim(),
      })
      // 追加 AI 回复
      if (res.data) {
        setMessages((prev) => [...prev, res.data])
      }
    } catch (err) {
      setError(err.message)
      console.error('发送消息失败:', err)
      // 移除临时用户消息
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  // 对消息进行反馈（点赞/踩）
  const submitFeedback = async (messageId, feedback) => {
    try {
      await api.put(`/messages/${messageId}/feedback`, { feedback })
      // 更新本地状态
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback } : m
        )
      )
    } catch (err) {
      console.error('提交反馈失败:', err)
    }
  }

  // 重新生成某条 AI 回复
  const regenerateMessage = async (messageId) => {
    // 清除失败态标记：进入 regen 流程后，消息应恢复为正常气泡
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, status: undefined } : m
      )
    )
    try {
      const res = await api.post(`/messages/${messageId}/regenerate`)
      if (res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? res.data : m))
        )
      }
    } catch (err) {
      console.error('重新生成回复失败:', err)
    }
  }

  return {
    messages,
    setMessages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    submitFeedback,
    regenerateMessage,
  }
}

export default useMessages
