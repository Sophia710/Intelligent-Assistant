/**
 * 智能体模式下的 AI 消息组件
 *
 * 与 AIMessage 区别:
 *  - 不再展示长篇 Markdown 思考过程,而是按"逻辑步骤"分段显示
 *  - 步骤数据来自 useAgentProcess().steps(模拟智能体逐步推进)
 *  - 展示完成后,正文(answer)再以普通气泡形式呈现
 */
import React, { useEffect, useState } from 'react'
import StepMessage from './StepMessage'
import BlinkingCaret from './BlinkingCaret'

export default function AgentOutputMessage({
  message,
  steps = [],
  isThinking,
  isAnswering,
  isDone,
  answer = '',
  onFeedback,
  onRegenerate,
  beforeActionClick,
  isBusy,
}) {
  // 思考阶段自动展开所有步骤;非思考阶段默认折叠
  const [isStepsExpanded, setIsStepsExpanded] = useState(true)

  useEffect(() => {
    if (isThinking) setIsStepsExpanded(true)
  }, [isThinking])

  const doneCount = steps.filter((s) => s.status === 'done').length
  const totalCount = steps.length

  return (
    <div className="flex gap-3 max-w-[85%] self-start w-full">
      {/* 头像 */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1"
        style={{ backgroundColor: 'var(--color-primary-container)' }}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1", color: 'var(--color-on-primary-container)' }}
        >
          robot_2
        </span>
      </div>

      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 w-full max-w-[1000px] relative transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-surface-container-low)',
          color: 'var(--color-on-surface)',
          border: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)',
        }}
      >
        {/* 头部:思考/答案 阶段指示 */}
        <div className="flex items-center gap-2 mb-3 pb-2"
          style={{ borderBottom: '1px dashed color-mix(in srgb, var(--color-surface-variant) 70%, transparent)' }}
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ color: isThinking ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
          >
            {isThinking ? 'progress_activity' : 'task_alt'}
          </span>
          <span
            className="text-[12px] font-semibold flex-1"
            style={{ color: isThinking ? 'var(--color-primary)' : 'var(--color-on-surface)' }}
          >
            {isThinking ? '智能体执行中' : '智能体执行完成'}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              backgroundColor: 'var(--color-surface-container)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            {doneCount}/{totalCount}
          </span>
          {isThinking && <BlinkingCaret />}
        </div>

        {/* 步骤区 */}
        <div
          className="transition-all duration-300"
          style={{
            maxHeight: isStepsExpanded ? '1200px' : '0',
            overflow: 'hidden',
            opacity: isStepsExpanded ? 1 : 0,
          }}
        >
          <div className="py-1">
            {steps.map((s, i) => (
              <StepMessage
                key={s.id || i}
                step={s}
                isLast={i === steps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* 步骤折叠/展开按钮(仅思考阶段外显示) */}
        {!isThinking && (
          <button
            onClick={() => setIsStepsExpanded((v) => !v)}
            className="mt-1 text-[10px] inline-flex items-center gap-1 transition-colors duration-200"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-on-surface-variant)' }}
          >
            <span className="material-symbols-outlined text-[12px]">
              {isStepsExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isStepsExpanded ? '收起执行步骤' : `展开 ${totalCount} 个执行步骤`}
          </button>
        )}

        {/* 答案(正文) */}
        {(isAnswering || isDone) && (
          <div
            className="mt-4 pt-3"
            style={{ borderTop: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                description
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                输出结果
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: 'var(--color-on-surface)' }}
            >
              {answer}
              {isAnswering && <BlinkingCaret />}
            </p>
          </div>
        )}

        {/* 操作按钮栏 */}
        <div
          className="flex items-center gap-2 mt-4 pt-2"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--color-surface-variant) 50%, transparent)' }}
        >
          <button
            onClick={(e) => { beforeActionClick?.(e); onFeedback?.(message.id, 'positive') }}
            disabled={isBusy}
            className="transition-colors p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="有帮助"
          >
            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
          </button>
          <button
            onClick={(e) => { beforeActionClick?.(e); onFeedback?.(message.id, 'negative') }}
            disabled={isBusy}
            className="transition-colors p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="无帮助"
          >
            <span className="material-symbols-outlined text-[18px]">thumb_down</span>
          </button>
          <button
            onClick={(e) => { beforeActionClick?.(e); onRegenerate?.(message.id) }}
            disabled={isBusy}
            className="transition-colors p-1 rounded ml-auto flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ color: 'var(--color-outline)' }}
            onMouseEnter={(e) => { if (!isBusy) { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-container)' } }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-outline)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            title="重新生成"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span className="text-[10px]">重新生成</span>
          </button>
        </div>
      </div>
    </div>
  )
}
