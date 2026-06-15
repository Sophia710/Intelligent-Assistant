/* 共享:流式输出闪烁光标 */
import React from 'react'

export default function BlinkingCaret({ className = '', style = {} }) {
  return (
    <span
      className={`inline-block w-1.5 h-3.5 align-middle ml-0.5 animate-pulse ${className}`}
      style={{ backgroundColor: 'var(--color-primary)', ...style }}
      aria-hidden="true"
    />
  )
}
