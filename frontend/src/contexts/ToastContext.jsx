import { createContext, useContext, useState, useCallback, useEffect } from 'react'

/**
 * 全局轻量 Toast 提示
 *
 * 用法：
 *   const toast = useToast()
 *   toast.success('添加成功')
 *   toast.error('添加失败')
 */
const ToastContext = createContext(null)

let toastIdSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'info', duration = 2400) => {
    const id = ++toastIdSeq
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const api = {
    success: (msg, dur) => push(msg, 'success', dur),
    error:   (msg, dur) => push(msg, 'error', dur),
    info:    (msg, dur) => push(msg, 'info', dur),
    warning: (msg, dur) => push(msg, 'warning', dur),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast 容器：右下角堆叠 */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ message, type }) {
  // 主题色映射
  const colorMap = {
    success: { bg: 'var(--color-primary)',          icon: 'check_circle' },
    error:   { bg: 'var(--color-error)',            icon: 'error' },
    warning: { bg: '#f59e0b',                       icon: 'warning' },
    info:    { bg: 'var(--color-surface-container-high)', icon: 'info' },
  }
  const { bg, icon } = colorMap[type] || colorMap.info
  const fg = type === 'info' ? 'var(--color-on-surface)' : 'var(--color-on-primary)'

  return (
    <div
      className="pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium toast-pop"
      style={{ backgroundColor: bg, color: fg, minWidth: 180, maxWidth: 360 }}
      role="status"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="truncate">{message}</span>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // 容错：未包裹 Provider 时使用 noop，避免崩溃
    return {
      success: () => {},
      error:   () => {},
      info:    () => {},
      warning: () => {},
    }
  }
  return ctx
}
