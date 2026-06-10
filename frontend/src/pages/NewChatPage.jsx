/**
 * 新建对话页面 (01-新建对话)
 *
 * 功能：作为用户开启新对话的起始页面，提供空白的对话画布和输入引导。
 * 路由：/chat/new
 *
 * 页面结构：
 * - 中央占位区：卫星图标(64x64) + 引导标题"今天有什么可以帮您的吗？" + 副标题
 * - 底部固定输入栏：附件按钮 + 文本输入框 + 语音按钮 + 发送按钮
 * - AI 免责声明文字
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import useConversations from '../hooks/useConversations'

export default function NewChatPage() {
  const navigate = useNavigate()
  const { createConversation } = useConversations()
  const [loading, setLoading] = useState(false)

  // 发送消息 -> 创建新对话 -> 跳转到对话详情页
  const handleSendMessage = async (content) => {
    setLoading(true)
    try {
      const conv = await createConversation(content.trim())
      // 跳转到新创建的对话详情页
      navigate(`/chat/${conv.id}`)
    } catch (error) {
      console.error('创建对话失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex-1 ml-[280px] mt-16 flex flex-col items-center justify-center relative h-[calc(100vh-64px)] transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 中央空白占位区 */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[800px] px-10 text-center pb-24">
        {/* 卫星图标 */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
          style={{ backgroundColor: 'var(--color-surface-container)' }}
        >
          <span
            className="material-symbols-outlined text-[32px]"
            style={{ color: 'var(--color-primary)' }}
          >
            satellite_alt
          </span>
        </div>

        {/* 引导标题 */}
        <h2
          className="text-2xl font-semibold mb-4 transition-colors duration-200"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--color-on-surface)' }}
        >
          今天有什么可以帮您的吗？
        </h2>

        {/* 引导副标题 */}
        <p
          className="text-sm max-w-md leading-relaxed transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          开启新对话，即可开展卫星测试数据分析、测试任务规划及技术文档查阅工作。
        </p>
      </div>

      {/* 底部固定的输入栏区域 */}
      <div className="w-full max-w-[800px] px-10 pb-6 fixed bottom-0">
        <ChatInput onSend={handleSendMessage} disabled={loading} />
        <p
          className="text-[11px] text-center mt-2 transition-colors duration-200"
          style={{ color: 'var(--color-on-surface-variant)' }}
        >
          AI 可能会产生不准确信息，请核实重要内容。
        </p>
      </div>
    </main>
  )
}
