/**
 * Toast 提示组件
 *
 * Props:
 *   message  : string
 *   type     : 'info' | 'success' | 'error' | 'warning'
 *   duration : number (ms) - 自动关闭时间
 *   onDone   : () => void  - 自动关闭时回调
 */
import React, { useEffect } from 'react'

const ICON_MAP = {
  info:    'info',
  success: 'check_circle',
  error:   'error',
  warning: 'warning',
}

const COLOR_MAP = {
  info:    'var(--color-primary)',
  success: 'var(--color-primary)',
  error:   'var(--color-error)',
  warning: 'var(--color-tertiary)',
}

export default function Toast({ message, type = 'info', duration = 2200, onDone }) {
  useEffect(() => {
    if (!duration) return
    const t = setTimeout(() => onDone?.(), duration)
    return () => clearTimeout(t)
  }, [duration, onDone])

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        color: 'var(--color-on-surface)',
        border: '1px solid var(--color-outline-variant)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        animation: 'toast-pop-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
      role="status"
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ color: COLOR_MAP[type] || COLOR_MAP.info }}
      >
        {ICON_MAP[type] || ICON_MAP.info}
      </span>
      <span>{message}</span>
    </div>
  )
}
