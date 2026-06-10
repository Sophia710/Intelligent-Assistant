/**
 * 对话输入框组件
 *
 * 功能：
 * - 圆角胶囊形容器
 * - 附件按钮（add_circle）
 * - 文本输入框（支持 Enter 发送，Shift+Enter 换行）
 * - 语音按钮（mic，仅 sm 以上屏幕可见）
 * - 发送按钮（圆形紫色按钮）
 * - 停止按钮（流式输出/思考阶段时显示，红色停止图标）
 *
 * Props:
 * @param {function} onSend - 发送消息回调，参数为输入文本
 * @param {boolean} disabled - 是否禁用
 * @param {string} maxWidth - 最大宽度类名（默认 max-w-[800px]）
 * @param {boolean} streaming - 是否处于流式输出/思考阶段（用于切换为"停止"按钮）
 * @param {function} onStop - 停止按钮回调
 */
import React, { useState, useRef } from 'react'

export default function ChatInput({ onSend, disabled = false, maxWidth = 'max-w-[800px]', streaming = false, onStop }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleStopClick = () => {
    if (typeof onStop === 'function') {
      onStop()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`w-full ${maxWidth}`}>
      {/* 容器 - 圆角胶囊 / surface 背景 / 阴影 / 边框 / 8px 内边距 / 4px 右侧内边距（对齐高保真设计稿 p-sm pr-xs） */}
      <div
        className="rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center p-2 pr-1 relative transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-surface-variant)',
        }}
      >
        {/* 附件按钮 - 8px 内边距 / 灰色默认 / primary 色 hover（对齐高保真 p-sm） */}
        <button
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--color-on-surface-variant)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)'
            e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-on-surface-variant)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          title="添加附件"
          type="button"
        >
          <span className="material-symbols-outlined">add_circle</span>
        </button>

        {/* 文本输入框 - 16px 水平内边距 / 14px Inter / on-surface 文字 / on-surface-variant 占位符（对齐高保真 px-md text-body-md） */}
        <input
          ref={inputRef}
          className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] leading-[1.5] font-normal font-['Inter',sans-serif] placeholder:text-[14px] placeholder:font-normal px-4 h-full outline-none transition-colors duration-200"
          style={{ color: 'var(--color-on-surface)' }}
          placeholder="输入消息给数字专家…"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        <div className="flex items-center gap-1">
          {/* 语音按钮 - 8px 内边距 / sm 以上可见（对齐高保真 p-sm hidden sm:block） */}
          <button
            className="p-2 rounded-full transition-colors hidden sm:block"
            style={{ color: 'var(--color-on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)'
              e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-on-surface-variant)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="语音输入"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          {/* 发送 / 停止 按钮 - 圆形 40x40 primary（对齐高保真 w-10 h-10 bg-primary ml-sm） */}
          {streaming ? (
            <button
              onClick={handleStopClick}
              className="text-white px-4 h-10 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-all ml-2 shadow-sm flex-shrink-0"
              style={{ backgroundColor: 'var(--color-error)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-error) 85%, black)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error)'}
              title="停止生成"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">stop_circle</span>
              <span className="font-label-md text-label-md pr-1">停止</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className="text-white w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ml-2 shadow-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => { if (!disabled && value.trim()) e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 90%, black)' }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
              title="发送"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
