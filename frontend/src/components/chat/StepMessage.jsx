/**
 * 步骤化消息组件
 *
 * 当对话过程中加载了智能体,AI 输出的内容会被解析成多个"步骤",
 * 每个步骤有标题、耗时(可选)、详细内容。
 *
 * Props:
 *   step: {
 *     id: string,
 *     title: string,
 *     duration?: string,         // 例如 "7.7s"
 *     content?: string,          // 步骤内的补充内容(可包含代码块/纯文本)
 *     status: 'pending' | 'running' | 'done' | 'error',
 *     type: 'thinking' | 'file_read' | 'file_write' | 'command' | 'tool' | 'summary' | 'other'
 *   }
 *   isLast: boolean             // 是否最后一步(影响连接线高度)
 */
import React from 'react'

const TYPE_META = {
  thinking:   { icon: 'psychology',       color: 'var(--color-primary)' },
  file_read:  { icon: 'file_open',        color: 'var(--color-tertiary)' },
  file_write: { icon: 'edit_document',    color: 'var(--color-primary)' },
  command:    { icon: 'terminal',         color: 'var(--color-on-surface-variant)' },
  tool:       { icon: 'build_circle',     color: 'var(--color-primary)' },
  summary:    { icon: 'task_alt',         color: 'var(--color-primary)' },
  other:      { icon: 'radio_button_unchecked', color: 'var(--color-outline)' },
}

function getMeta(type, status) {
  if (status === 'running') {
    return { icon: 'progress_activity', color: 'var(--color-primary)' }
  }
  if (status === 'error') {
    return { icon: 'error', color: 'var(--color-error)' }
  }
  return TYPE_META[type] || TYPE_META.other
}

export default function StepMessage({ step, isLast = false }) {
  const meta = getMeta(step.type, step.status)
  const isRunning = step.status === 'running'
  const isError = step.status === 'error'

  return (
    <div className="flex gap-3 relative">
      {/* 左侧:图标 + 连接线 */}
      <div className="flex flex-col items-center shrink-0" style={{ width: '20px' }}>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${isRunning ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: isError
              ? 'color-mix(in srgb, var(--color-error) 14%, transparent)'
              : isRunning
                ? 'color-mix(in srgb, var(--color-primary) 16%, transparent)'
                : 'var(--color-surface-container)',
          }}
        >
          <span
            className={`material-symbols-outlined ${isRunning ? 'animate-spin' : ''}`}
            style={{ fontSize: '12px', color: meta.color, fontVariationSettings: "'FILL' 1" }}
          >
            {meta.icon}
          </span>
        </div>
        {!isLast && (
          <div
            className="flex-1 w-px mt-1"
            style={{
              backgroundColor: 'var(--color-outline-variant)',
              minHeight: '12px',
            }}
          />
        )}
      </div>

      {/* 右侧:标题 + 耗时 + 内容 */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
        {/* 标题行 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[13px] font-medium leading-snug"
            style={{ color: 'var(--color-on-surface)' }}
          >
            {step.title}
          </span>
          {step.duration && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'monospace',
              }}
            >
              {step.duration}
            </span>
          )}
          {isRunning && (
            <span
              className="text-[10px] inline-flex items-center gap-1"
              style={{ color: 'var(--color-primary)' }}
            >
              <span
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              进行中
            </span>
          )}
        </div>

        {/* 详细内容(可选) */}
        {step.content && (
          <div
            className="mt-1.5 text-[12px] leading-relaxed whitespace-pre-wrap"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            {step.content}
          </div>
        )}

        {/* 子代码块(可选) */}
        {step.codeBlock && (
          <pre
            className="mt-2 rounded-md p-2.5 text-[11px] font-mono overflow-x-auto"
            style={{
              backgroundColor: 'var(--color-inverse-surface)',
              color: 'var(--color-inverse-on-surface)',
            }}
          >
            <code>{step.codeBlock}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
