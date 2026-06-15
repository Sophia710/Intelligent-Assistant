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
 *
 * 响应式策略：
 *   - 桌面端 (>= md): 居中容器 max-w-[800px],左右内边距 40px
 *   - 平板   (sm):     容器宽度自动收窄,左右内边距 24px
 *   - 移动端 (< sm):   容器铺满父级(扣除侧栏),左右内边距 16px
 *   - 输入栏与欢迎区共享同一容器宽度,完全对齐
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatInput from '../components/ChatInput'
import useConversations from '../hooks/useConversations'
import useSkills from '../hooks/useSkills'
import useCustomAgents from '../hooks/useCustomAgents'

export default function NewChatPage() {
  const navigate = useNavigate()
  const { createConversation } = useConversations()
  const { enabledSkills, agents: builtinAgents } = useSkills()
  const { list: customAgents } = useCustomAgents()
  const [loading, setLoading] = useState(false)

  /**
   * 合并内置 + 自定义智能体,每条注入 type 字段
   *  - 自定义智能体在前面 (新创建优先曝光)
   *  - ChatInput 通过 availableAgents 传给 AgentPickerModal
   */
  const allAgents = useMemo(() => {
    const customs = customAgents.map((a) => ({ ...a, type: 'custom' }))
    const builtins = (builtinAgents || []).map((a) => ({ ...a, type: 'builtin' }))
    return [...customs, ...builtins]
  }, [builtinAgents, customAgents])

  // 发送消息 -> 创建新对话 -> 跳转到对话详情页
  // payload: { text, files, skills, agents } - ChatInput 增强版传入
  const handleSendMessage = async (payload) => {
    const text = typeof payload === 'string' ? payload : payload?.text || ''
    setLoading(true)
    try {
      // 将附加内容并入首条消息中（保持后端 createConversation 兼容性）
      const parts = []
      if (text) parts.push(text)
      if (typeof payload === 'object') {
        if (payload.agents?.length) {
          parts.push(`[已加载智能体: ${payload.agents.map((a) => a.name).join('、')}]`)
        }
        if (payload.skills?.length) {
          parts.push(`[已加载技能: ${payload.skills.map((s) => s.name).join('、')}]`)
        }
        if (payload.files?.length) {
          parts.push(`[附件: ${payload.files.map((f) => f.name).join('、')}]`)
        }
      }
      const merged = parts.join('\n')
      const conv = await createConversation(merged.trim() || '(空消息)')
      navigate(`/chat/${conv.id}`)
    } catch (error) {
      console.error('创建对话失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="mt-16 relative h-[calc(100vh-64px)] transition-colors duration-200 overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      {/* 居中外层容器
          —— 解决 flex column 容器内 margin:auto 无法居中交叉轴的问题 ——
          关键:把 <main> 改为普通块级容器,把居中交给一个 max-width + margin-auto 的块级 wrapper,
               wrapper 内部再用 flex column 安排垂直布局(flex-1 欢迎区 + shrink-0 输入栏)。
          这种结构下:
            1) wrapper 用 width:100% + max-width:800px + margin:0 auto 在 <main> 中精确居中
            2) wrapper 内部用 flex column 排版,不再需要 align-self
            3) wrapper 自身位置居中后,内部的 welcome/input 自动跟着居中
          注:sidebar 偏移(280px)已由 Layout 的 ml-[280px] 统一处理,本组件不再重复 margin-left。 */}
      <div
        className="w-full mx-auto flex flex-col h-full box-border"
        style={{
          maxWidth: '800px',
          paddingLeft: 'clamp(16px, 4vw, 40px)',
          paddingRight: 'clamp(16px, 4vw, 40px)',
        }}
      >
        {/* 中央空白占位区 — flex-1 撑满中间剩余空间 */}
        <div
          className="flex-1 flex flex-col items-center justify-center min-w-0"
          style={{
            paddingTop: 'clamp(32px, 6vh, 64px)',
            paddingBottom: 'clamp(96px, 14vh, 112px)',
            textAlign: 'center',
          }}
        >
          {/* 卫星图标 */}
          <div
            className="rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
            style={{
              backgroundColor: 'var(--color-surface-container)',
              width: 'clamp(48px, 8vw, 64px)',
              height: 'clamp(48px, 8vw, 64px)',
              marginBottom: 'clamp(16px, 2vw, 24px)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                color: 'var(--color-primary)',
                fontSize: 'clamp(26px, 4vw, 32px)',
              }}
            >
              satellite_alt
            </span>
          </div>

          {/* 引导标题 */}
          <h2
            className="font-semibold transition-colors duration-200 break-words w-full"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--color-on-surface)',
              fontSize: 'clamp(20px, 2.4vw, 24px)',
              marginBottom: 'clamp(12px, 1.6vw, 16px)',
            }}
          >
            今天有什么可以帮您的吗？
          </h2>

          {/* 引导副标题 */}
          <p
            className="leading-relaxed transition-colors duration-200 break-words w-full"
            style={{
              color: 'var(--color-on-surface-variant)',
              fontSize: 'clamp(12px, 1.4vw, 14px)',
              maxWidth: '448px', // 等价 max-w-md
            }}
          >
            开启新对话，即可开展卫星测试数据分析、测试任务规划及技术文档查阅工作。
          </p>
        </div>

        {/* 底部输入栏 — 与欢迎区在同一个居中 wrapper 内,边沿严格对齐 */}
        <div className="shrink-0" style={{ paddingBottom: 'clamp(16px, 2vw, 24px)' }}>
          <ChatInput
            onSend={handleSendMessage}
            disabled={loading}
            availableSkills={enabledSkills}
            availableAgents={allAgents}
          />
          <p
            className="text-center mt-2 transition-colors duration-200 break-words"
            style={{
              color: 'var(--color-on-surface-variant)',
              fontSize: '11px',
            }}
          >
            AI 可能会产生不准确信息，请核实重要内容。
          </p>
        </div>
      </div>
    </main>
  )
}
